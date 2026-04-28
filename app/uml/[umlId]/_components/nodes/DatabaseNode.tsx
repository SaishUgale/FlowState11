import { Handle, Position, NodeProps, NodeResizer } from "reactflow";
import { UmlNodeData } from "@/liveblocks.config";
import { Database } from "lucide-react";
import { cn } from "@/lib/utils";

export const DatabaseNode = ({ data, selected }: NodeProps<UmlNodeData>) => {
  const { label, width, height, color, borderColor, textColor, fontSize, opacity } = data;

  return (
    <>
      <NodeResizer minWidth={80} minHeight={80} isVisible={selected} />
      <div 
        className={cn(
          "flex flex-col items-center justify-center gap-2 p-3 rounded-md shadow-md border bg-white dark:bg-zinc-800",
          selected ? "ring-2 ring-blue-500 ring-offset-2" : ""
        )}
        style={{
          width: width || 100,
          height: height || 100,
          backgroundColor: color || "#ffffff",
          borderColor: borderColor || "#333333",
          opacity: opacity || 1,
        }}
      >
        <Database size={32} style={{ color: textColor || "inherit" }} />
        <span className="text-center font-bold truncate w-full" style={{ color: textColor || "inherit", fontSize: `${fontSize || 12}px` }}>
          {label}
        </span>
      </div>
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </>
  );
};
