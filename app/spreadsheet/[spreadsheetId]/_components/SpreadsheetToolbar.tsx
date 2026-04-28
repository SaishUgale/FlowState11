import { Bold, Italic, Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight, PaintBucket, Type } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpreadsheetToolbarProps {
  onFormatChange: (key: string, value: any) => void;
  activeFormat?: any;
}

export const SpreadsheetToolbar = ({ onFormatChange, activeFormat }: SpreadsheetToolbarProps) => {
  const format = activeFormat || {};
  return (
    <div className="flex items-center gap-1 p-1 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-x-auto hidden-scrollbar shrink-0 h-10">
      <Button
        variant="ghost"
        size="sm"
        className={`h-7 w-7 p-0 ${format.bold ? "bg-zinc-200 dark:bg-zinc-800" : ""}`}
        onClick={() => onFormatChange("bold", !format.bold)}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`h-7 w-7 p-0 ${format.italic ? "bg-zinc-200 dark:bg-zinc-800" : ""}`}
        onClick={() => onFormatChange("italic", !format.italic)}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`h-7 w-7 p-0 ${format.underline ? "bg-zinc-200 dark:bg-zinc-800" : ""}`}
        onClick={() => onFormatChange("underline", !format.underline)}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>

      <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-700 mx-1" />

      <Button
        variant="ghost"
        size="sm"
        className={`h-7 w-7 p-0 ${format.align === "left" ? "bg-zinc-200 dark:bg-zinc-800" : ""}`}
        onClick={() => onFormatChange("align", "left")}
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`h-7 w-7 p-0 ${format.align === "center" ? "bg-zinc-200 dark:bg-zinc-800" : ""}`}
        onClick={() => onFormatChange("align", "center")}
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`h-7 w-7 p-0 ${format.align === "right" ? "bg-zinc-200 dark:bg-zinc-800" : ""}`}
        onClick={() => onFormatChange("align", "right")}
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-700 mx-1" />

      <div className="flex items-center gap-1 px-1">
        <Type className="h-4 w-4 text-zinc-500" />
        <input 
          type="color" 
          title="Text Color"
          className="w-5 h-5 p-0 border-0 bg-transparent rounded cursor-pointer"
          value={format.color || "#000000"}
          onChange={(e) => onFormatChange("color", e.target.value)}
        />
      </div>

      <div className="flex items-center gap-1 px-1">
        <PaintBucket className="h-4 w-4 text-zinc-500" />
        <input 
          type="color" 
          title="Background Color"
          className="w-5 h-5 p-0 border-0 bg-transparent rounded cursor-pointer"
          value={format.backgroundColor || "#ffffff"}
          onChange={(e) => onFormatChange("backgroundColor", e.target.value)}
        />
      </div>
    </div>
  );
};
