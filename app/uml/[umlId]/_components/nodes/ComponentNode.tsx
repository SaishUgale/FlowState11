import { Handle, Position, NodeProps, NodeResizer } from "reactflow";
import { UmlNodeData } from "@/liveblocks.config";
import { Component } from "lucide-react";
import { cn } from "@/lib/utils";

export const ComponentNode = ({ data, selected }: NodeProps<UmlNodeData>) => {
  const { label, width, height, color, borderColor, textColor, fontSize, opacity } = data;

  return (
    <>
      <NodeResizer minWidth={100} minHeight={60} isVisible={selected} />
      <div 
        className={cn(
          "flex items-center justify-center p-3 shadow-md border bg-white dark:bg-zinc-800 relative",
          selected ? "ring-2 ring-blue-500 ring-offset-2" : ""
        )}
        style={{
          width: width || 150,
          height: height || 80,
          backgroundColor: color || "#ffffff",
          borderColor: borderColor || "#333333",
          opacity: opacity || 1,
        }}
      >
        {/* Component "teeth" */}
        <div className="absolute -left-3 top-4 flex flex-col gap-2">
          <div className="w-6 h-3 border bg-inherit" style={{ borderColor: borderColor || "#333333" }} />
          <div className="w-6 h-3 border bg-inherit" style={{ borderColor: borderColor || "#333333" }} />
        </div>
        
        <div className="flex items-center gap-2">
          <Component size={16} style={{ color: textColor || "inherit" }} />
          <span className="font-bold truncate" style={{ color: textColor || "inherit", fontSize: `${fontSize || 14}px` }}>
            {label}
          </span>
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      <Handle type="target" position={Position.Left} className="!bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
      <Handle type="source" position={Position.Right} className="!bg-blue-500" />
    </>
  );
};
