"use client";

import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Highlighter,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Code2,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  CheckSquare,
  Type,
  Underline as UnderlineIcon,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Paintbrush,
  RemoveFormatting,
  Table as TableIcon,
  TableCellsMerge,
  Plus,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdownMenu";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useCallback } from "react";

interface ToolbarProps {
  editor: Editor | null;
}

const ToolbarButton = ({
  onClick,
  isActive,
  icon: Icon,
  label,
  disabled,
}: {
  onClick: () => void;
  isActive?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  label: string;
  disabled?: boolean;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClick}
          disabled={disabled}
          className={`h-8 w-8 p-0 ${isActive ? "bg-accent text-accent-foreground" : ""}`}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const FONT_FAMILIES = [
  { label: "Default (Sans)", value: "Inter, sans-serif" },
  { label: "Serif", value: "'Palatino Linotype', serif" },
  { label: "Monospace", value: "'Courier New', monospace" },
  { label: "Comic Sans", value: "'Comic Sans MS', cursive" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
];

export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) {
    return null;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const addImage = useCallback(() => {
    const url = window.prompt("URL");

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const currentFontFamily = editor.getAttributes("textStyle").fontFamily || "";
  const currentFontLabel = FONT_FAMILIES.find(f => currentFontFamily.includes(f.value.split(",")[0].replace(/'/g, "")))?.label || "Font";

  return (
    <div className="flex flex-wrap items-center gap-1 border-b bg-white px-2 py-1 sticky top-0 z-20">
      {/* History */}
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} icon={Undo} label="Undo (Ctrl+Z)" />
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} icon={Redo} label="Redo (Ctrl+Y)" />
      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Font Family */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs min-w-[90px] justify-between">
            <span className="truncate max-w-[70px]">{currentFontLabel}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-60 overflow-y-auto">
          <DropdownMenuLabel>Font Family</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {FONT_FAMILIES.map((font) => (
            <DropdownMenuItem
              key={font.value}
              onClick={() => editor.chain().focus().setFontFamily(font.value).run()}
              className="cursor-pointer"
              style={{ fontFamily: font.value }}
            >
              {font.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => editor.chain().focus().unsetFontFamily().run()}
            className="cursor-pointer text-muted-foreground"
          >
            Reset to Default
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Headings */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1">
            <Type className="h-4 w-4" />
            <span className="text-sm">Heading</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1 Heading</DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2 Heading</DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3 Heading</DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}>H4 Heading</DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}>H5 Heading</DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}>H6 Heading</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>Paragraph</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Basic Formatting */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} icon={Bold} label="Bold (Ctrl+B)" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} icon={Italic} label="Italic (Ctrl+I)" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} icon={UnderlineIcon} label="Underline (Ctrl+U)" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} icon={Strikethrough} label="Strikethrough" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive("code")} icon={Code} label="Inline Code" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} isActive={editor.isActive("subscript")} icon={SubscriptIcon} label="Subscript" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} isActive={editor.isActive("superscript")} icon={SuperscriptIcon} label="Superscript" />
      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Text Color */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex h-8 items-center gap-1 rounded-md border px-1">
              <Paintbrush className="h-4 w-4 text-muted-foreground" />
              <Input
                type="color"
                value={editor.getAttributes("textStyle").color || "#000000"}
                onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                className="h-6 w-8 p-0 border-none"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>Text Color</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Highlight Color */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex h-8 items-center gap-1 rounded-md border px-1">
              <Highlighter className="h-4 w-4 text-muted-foreground" />
              <Input
                type="color"
                value={editor.getAttributes("highlight").color || "#ffff00"}
                onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()}
                className="h-6 w-8 p-0 border-none"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>Highlight Color</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Clear Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        icon={RemoveFormatting}
        label="Clear Formatting"
      />

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Alignment */}
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} isActive={editor.isActive({ textAlign: "left" })} icon={AlignLeft} label="Align Left" />
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} isActive={editor.isActive({ textAlign: "center" })} icon={AlignCenter} label="Align Center" />
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} isActive={editor.isActive({ textAlign: "right" })} icon={AlignRight} label="Align Right" />
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("justify").run()} isActive={editor.isActive({ textAlign: "justify" })} icon={AlignJustify} label="Justify" />
      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Lists & Advanced Blocks */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} icon={List} label="Bullet List" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} icon={ListOrdered} label="Ordered List" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive("taskList")} icon={CheckSquare} label="Task List" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} icon={Quote} label="Blockquote" />
      
      {/* Code Block & Separator */}
      <ToolbarButton 
        onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
        isActive={editor.isActive("codeBlock")} 
        icon={Code2} 
        label="Code Block" 
      />
      <ToolbarButton 
        onClick={() => editor.chain().focus().setHorizontalRule().run()} 
        icon={Minus} 
        label="Insert Horizontal Separator" 
      />

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Link & Image */}
      <ToolbarButton onClick={setLink} isActive={editor.isActive("link")} icon={LinkIcon} label="Add Link" />
      <ToolbarButton onClick={addImage} icon={ImageIcon} label="Add Image" />

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Table */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1">
            <TableIcon className="h-4 w-4" />
            <span className="text-sm">Table</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Insert Table</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
            <Plus className="h-4 w-4 mr-2" /> 3×3 Table
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().insertTable({ rows: 4, cols: 4, withHeaderRow: true }).run()}>
            <Plus className="h-4 w-4 mr-2" /> 4×4 Table
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().insertTable({ rows: 5, cols: 5, withHeaderRow: true }).run()}>
            <Plus className="h-4 w-4 mr-2" /> 5×5 Table
          </DropdownMenuItem>

          {editor.isActive("table") && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Rows</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => editor.chain().focus().addRowBefore().run()}>
                Add Row Before
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().addRowAfter().run()}>
                Add Row After
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().deleteRow().run()} className="text-red-600">
                Delete Row
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Columns</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => editor.chain().focus().addColumnBefore().run()}>
                Add Column Before
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().addColumnAfter().run()}>
                Add Column After
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().deleteColumn().run()} className="text-red-600">
                Delete Column
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Merge</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => editor.chain().focus().mergeCells().run()}>
                <TableCellsMerge className="h-4 w-4 mr-2" /> Merge Cells
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().splitCell().run()}>
                Split Cell
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => editor.chain().focus().deleteTable().run()} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" /> Delete Table
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}