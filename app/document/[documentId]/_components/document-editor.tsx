"use client";

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useSelf } from "@liveblocks/react";
import { useLiveblocksExtension } from "@liveblocks/react-tiptap";
import { 
  Download, FileText, Share2, Check, Volume2, Square, Loader2, Settings2, Mic, MicOff, AlertCircle, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel
} from "@/components/ui/dropdownMenu";
import { useState, useEffect, useCallback, useRef } from "react";

// Tiptap Extensions
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import BubbleMenuExtension from "@tiptap/extension-bubble-menu";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Extension } from "@tiptap/core";

// Custom FontFamily extension (the official package is broken with this Tiptap version)
const FontFamily = Extension.create({
  name: "fontFamily",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: (element) => element.style.fontFamily?.replace(/["/]/g, "") || null,
            renderHTML: (attributes) => {
              if (!attributes.fontFamily) return {};
              return { style: `font-family: ${attributes.fontFamily}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontFamily:
        (fontFamily: string) =>
        ({ chain }: { chain: () => any }) => {
          return chain().setMark("textStyle", { fontFamily }).run();
        },
      unsetFontFamily:
        () =>
        ({ chain }: { chain: () => any }) => {
          return chain().setMark("textStyle", { fontFamily: null }).removeEmptyTextStyle().run();
        },
    };
  },
});
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";

import "@liveblocks/react-tiptap/styles.css";
import { Toolbar } from "./toolbar";

export const DocumentEditor = ({ documentId }: { documentId: string }) => {
  const _userInfo = useSelf((me) => me.info);
  const liveblocksExt = useLiveblocksExtension();
  
  const [copied, setCopied] = useState(false);
  
  // --- TTS (Read Aloud) STATE ---
  const [isReading, setIsReading] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // --- DEEPGRAM (Dictation) STATE ---
  const [isListening, setIsListening] = useState(false);
  const [sttError, setSttError] = useState(false);

  // --- GEMINI (Grammar) STATE ---
  const [isGrammarLoading, setIsGrammarLoading] = useState(false);

  // --- REFS ---
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    autofocus: true,
    extensions: [
      StarterKit.configure({ history: true, codeBlock: true, horizontalRule: true }),
      liveblocksExt,
      BubbleMenuExtension, 
      TextStyle, Color, Highlight.configure({ multicolor: true }), TaskList, TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false }), Image, TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline, Subscript, Superscript,
      FontFamily,
      Table.configure({ resizable: true }),
      TableRow, TableHeader, TableCell,
    ],
    editorProps: {
      attributes: { class: "focus:outline-none min-h-[calc(100vh-12rem)] h-full w-full" },
    },
  });

  // ------------------------------------------------------------------------
  // 1. AI GRAMMAR FIX (GEMINI)
  // ------------------------------------------------------------------------
  const fixGrammar = useCallback(async () => {
    if (!editor || isGrammarLoading) return;
    
    // Get the selected text
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, " ");
    
    if (!text || text.trim().length === 0) return;

    setIsGrammarLoading(true);

    try {
      // Send text to our API route
      const response = await fetch("/api/grammar", {
        method: "POST",
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error("Failed to correct grammar");

      const data = await response.json();
      
      if (data.improved) {
        // Replace current selection with the AI fixed version
        editor.chain().focus().insertContent(data.improved).run();
      }
    } catch (error) {
      console.error("Grammar error:", error);
      alert("Could not improve grammar. Check console for details.");
    } finally {
      setIsGrammarLoading(false);
    }
  }, [editor, isGrammarLoading]);


  // ------------------------------------------------------------------------
  // 2. DICTATION (DEEPGRAM)
  // ------------------------------------------------------------------------
  const toggleDictation = useCallback(async () => {
    // STOP Logic
    if (isListening) {
      setIsListening(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      if (socketRef.current) socketRef.current.close();
      return;
    }

    // START Logic
    try {
      setSttError(false);
      setIsListening(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Fetch Deepgram Key
      const response = await fetch("/api/deepgram");
      if (!response.ok) throw new Error("Failed to fetch API key");
      const data = await response.json();
      
      // Connect to WebSocket
      const socket = new WebSocket("wss://api.deepgram.com/v1/listen?smart_format=true&model=nova-2&language=en-US", ["token", data.key]);

      socket.onopen = () => {
        const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
        mediaRecorder.addEventListener("dataavailable", (event) => {
          if (event.data.size > 0 && socket.readyState === 1) socket.send(event.data);
        });
        mediaRecorder.start(250);
        mediaRecorderRef.current = mediaRecorder;
      };

      socket.onmessage = (message) => {
        const received = JSON.parse(message.data);
        const transcript = received.channel?.alternatives[0]?.transcript;
        if (transcript && received.is_final) {
          editor?.chain().focus().insertContent(transcript + " ").run();
        }
      };

      socket.onclose = () => { if (socketRef.current) setIsListening(false); };
      socket.onerror = (error) => { console.error("Deepgram Error", error); setSttError(true); setIsListening(false); };
      socketRef.current = socket;
    } catch (error) {
      console.error("Microphone/Network Error:", error);
      setSttError(true);
      setIsListening(false);
    }
  }, [isListening, editor]);

  // Cleanup dictation on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.close();
      if (mediaRecorderRef.current) mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ------------------------------------------------------------------------
  // 3. TEXT-TO-SPEECH (READ ALOUD)
  // ------------------------------------------------------------------------
  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
      const preferred = available.find(v => v.name.includes("Google US English") || v.name.includes("Samantha"));
      if (preferred) setSelectedVoice(preferred);
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speakSelection = useCallback(() => {
    if (!editor) return;
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, " ");
    if (!text.trim()) return;
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.onend = () => setIsReading(false);
    window.speechSynthesis.speak(utterance);
    setIsReading(true);
  }, [editor, isReading, selectedVoice]);

  // ------------------------------------------------------------------------
  // 4. UTILS
  // ------------------------------------------------------------------------
  const onShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadDocument = async (format: "text" | "html" | "pdf") => {
    if (!editor) return;
    if (format === "pdf") {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.createElement("div");
      element.innerHTML = editor.getHTML();
      element.className = "prose prose-slate max-w-none p-8";
      const opt = { margin: 0.5, filename: `doc-${documentId}.pdf`, image: { type: "jpeg", quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: "in", format: "letter", orientation: "portrait" } };
      html2pdf().set(opt).from(element).save();
      return;
    }
    const content = format === "text" ? editor.getText() : editor.getHTML();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([content], { type: format === "text" ? "text/plain" : "text/html" }));
    link.download = `doc-${documentId}.${format === "text" ? "txt" : "html"}`;
    link.click();
  };

  if (!editor || !liveblocksExt) return <div className="flex items-center justify-center h-screen bg-slate-50"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>;

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      
      {/* ----------------------
        BUBBLE MENU (Popup)
        ----------------------
      */}
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-md">
          
          {/* READ ALOUD */}
          <Button variant="ghost" size="sm" onClick={speakSelection} className={`gap-1 h-8 px-2 text-xs font-medium ${isReading ? "text-red-600 bg-red-50" : "text-slate-700"}`}>
            {isReading ? <Square className="h-3 w-3 fill-current" /> : <Volume2 className="h-3 w-3" />}
            {isReading ? "Stop" : "Read"}
          </Button>

          {/* AI GRAMMAR FIX */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fixGrammar}
            disabled={isGrammarLoading}
            className="gap-1 h-8 px-2 text-xs font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-50"
          >
            {isGrammarLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            {isGrammarLoading ? "Fixing..." : "AI Fix"}
          </Button>

          {/* VOICE SETTINGS */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Settings2 className="h-3 w-3 text-slate-400" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto z-50">
              <DropdownMenuLabel>Select Voice</DropdownMenuLabel><DropdownMenuSeparator />
              {voices.map((voice) => (
                <DropdownMenuItem key={voice.name} onClick={() => setSelectedVoice(voice)} className="text-xs cursor-pointer">
                  <span className={selectedVoice?.name === voice.name ? "font-bold text-blue-600" : ""}>{voice.name.slice(0, 30)}{voice.name.length > 30 ? "..." : ""}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </BubbleMenu>
      )}

      {/* ----------------------
        HEADER / TOOLBAR
        ----------------------
      */}
      <div className="h-14 border-b bg-white flex items-center justify-between px-6 shadow-sm z-10 relative">
        <div className="flex items-center gap-x-2 text-sm font-semibold text-slate-700">
          <FileText className="h-5 w-5 text-blue-600" />
          Realtime Document
        </div>

        <div className="flex items-center gap-x-2">
          
          {/* DICTATE BUTTON (Deepgram) */}
          <Button 
            variant={sttError ? "destructive" : (isListening ? "destructive" : "secondary")}
            size="sm"
            className={`gap-x-2 mr-2 ${isListening ? "animate-pulse" : ""}`}
            onClick={toggleDictation}
          >
            {sttError ? (
              <><AlertCircle className="h-4 w-4" /> Error (Retry)</>
            ) : isListening ? (
              <><Mic className="h-4 w-4 fill-white animate-bounce" /> Listening...</>
            ) : (
              <><MicOff className="h-4 w-4" /> Dictate</>
            )}
          </Button>

          {/* SHARE & EXPORT */}
          <Button variant="default" size="sm" className="gap-x-2 bg-blue-600 hover:bg-blue-700" onClick={onShare}>
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />} {copied ? "Copied!" : "Share"}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="gap-x-2"><Download className="h-4 w-4" /> Export</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => downloadDocument("pdf")}>Download as PDF (.pdf)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadDocument("text")}>Download as Plain Text (.txt)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadDocument("html")}>Download as Rich Text (.html)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Toolbar editor={editor} />
      <div className="flex-1 w-full overflow-y-auto py-10">
        <div className="max-w-[850px] mx-auto bg-white p-12 shadow-md border border-slate-200 relative">
          <EditorContent editor={editor} className="prose prose-slate max-w-none h-full w-full" />
        </div>
      </div>
    </div>
  );
};