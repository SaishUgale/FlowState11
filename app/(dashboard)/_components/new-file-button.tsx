"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Plus, LayoutTemplate, FileText, ChevronLeft, Loader2, X, Network, Table } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewFileButtonProps {
  orgId: string;
  disabled?: boolean;
}

export const NewFileButton = ({
  orgId,
  disabled,
}: NewFileButtonProps) => {
  const router = useRouter();
  const create = useMutation(api.board.create);
  const [pending, setPending] = useState(false);

  // State for Popup and Wizard Steps
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"select" | "name">("select");
  const [selectedType, setSelectedType] = useState<"board" | "document" | "uml" | "spreadsheet" | null>(null);
  const [title, setTitle] = useState("");
  
  const popupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        resetAndClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      if (step === "name" && inputRef.current) inputRef.current.focus();
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, step]);

  const resetAndClose = () => {
    if (pending) return;
    setIsOpen(false);
    setTimeout(() => {
      setStep("select");
      setSelectedType(null);
      setTitle("");
    }, 200);
  };

  const handleCreate = async () => {
    if (!selectedType || !title.trim()) return;
    setPending(true);
    try {
      const id = await create({ orgId, title: title.trim(), type: selectedType });
      toast.success(`${selectedType === "board" ? "Board" : selectedType === "document" ? "Document" : selectedType === "uml" ? "UML Diagram" : "Spreadsheet"} created`);
      resetAndClose();
      router.push(selectedType === "board" ? `/board/${id}` : selectedType === "document" ? `/document/${id}` : selectedType === "uml" ? `/uml/${id}` : `/spreadsheet/${id}`);
    } catch {
      toast.error("Failed to create");
    } finally {
      setPending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && title.trim()) handleCreate();
  };

  return (
    <div className="relative col-span-1" ref={popupRef}>
      {/* Trigger Button - White Background, Blue Text, Minimal Icon */}
      <button
        disabled={pending || disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "col-span-1 aspect-[100/127] w-full rounded-xl flex flex-col items-center justify-center py-6 transition-all duration-300 group",
          // Base: White bg, subtle border
          "bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10",
          // Hover: Blue border, shadow, slight lift
          "hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 hover:shadow-blue-500/10",
          // Disabled/Pending state
          (pending || disabled) && "opacity-75 cursor-not-allowed hover:translate-y-0 hover:shadow-none hover:border-zinc-200"
        )}
      >
        {pending ? (
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        ) : (
          <>
            {/* Icon Container: Blue background circle that expands on hover */}
            <div className="h-14 w-14 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-blue-600 group-hover:scale-110">
              <Plus className={cn(
                "h-8 w-8 text-blue-600 group-hover:text-white transition-all duration-300",
                isOpen && "rotate-45"
              )} />
            </div>
            
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
              Create New
            </p>
          </>
        )}
      </button>

      {/* Popup Menu */}
      {isOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute top-0 left-[105%] z-50 w-[300px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl shadow-2xl p-4 animate-in fade-in slide-in-from-left-5 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 dark:border-white/5">
            <h3 className="font-semibold text-sm text-zinc-700 dark:text-zinc-200">
              {step === "select" ? "Create New" : `Name your ${selectedType}`}
            </h3>
            <button onClick={resetAndClose} disabled={pending} className="text-zinc-400 hover:text-zinc-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* STEP 1: Select Type */}
          {step === "select" && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setSelectedType("board"); setStep("name"); }}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all group"
              >
                <LayoutTemplate className="h-8 w-8 text-zinc-500 group-hover:text-blue-600" />
                <span className="text-xs font-medium">Board</span>
              </button>
              
              <button
                onClick={() => { setSelectedType("document"); setStep("name"); }}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all group"
              >
                <FileText className="h-8 w-8 text-zinc-500 group-hover:text-blue-600" />
                <span className="text-xs font-medium">Document</span>
              </button>

              <button
                onClick={() => { setSelectedType("uml"); setStep("name"); }}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all group"
              >
                <Network className="h-8 w-8 text-zinc-500 group-hover:text-blue-600" />
                <span className="text-xs font-medium">UML Diagram</span>
              </button>

              <button
                onClick={() => { setSelectedType("spreadsheet"); setStep("name"); }}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all group"
              >
                <Table className="h-8 w-8 text-zinc-500 group-hover:text-blue-600" />
                <span className="text-xs font-medium">Spreadsheet</span>
              </button>
            </div>
          )}

          {/* STEP 2: Name Input */}
          {step === "name" && (
            <div className="space-y-4">
              <Input
                ref={inputRef}
                autoFocus
                placeholder={`Untitled ${selectedType}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={onKeyDown}
                maxLength={60}
                disabled={pending}
                className="bg-zinc-50 dark:bg-zinc-800/50 focus-visible:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => { setStep("select"); setTitle(""); }} disabled={pending} className="text-zinc-500">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <Button size="sm" onClick={handleCreate} disabled={pending || !title.trim()} className="bg-blue-600 hover:bg-blue-700 text-white ml-auto">
                  {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Create"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};