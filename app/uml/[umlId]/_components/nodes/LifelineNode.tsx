import { Handle, Position, NodeProps, NodeResizer } from "reactflow";
import { UmlNodeData } from "@/liveblocks.config";
import { cn } from "@/lib/utils";

export const LifelineNode = ({ data, selected }: NodeProps<UmlNodeData>) => {
  const { label, width, height, color, borderColor, textColor, fontSize, opacity } = data;

  return (
    <>
      <NodeResizer minWidth={80} minHeight={200} isVisible={selected} />
      <div className="flex flex-col items-center h-full group" style={{ opacity: opacity || 1 }}>
        {/* Head */}
        <div 
          className={cn(
            "p-3 border-2 bg-white dark:bg-zinc-800 text-center font-bold z-10 shrink-0 shadow-sm",
            selected ? "ring-2 ring-blue-500 ring-offset-2" : ""
          )}
          style={{
            width: width || 100,
            backgroundColor: color || "#ffffff",
            borderColor: borderColor || "#333333",
            color: textColor || "#000000",
            fontSize: `${fontSize || 14}px`,
          }}
        >
          {label}
        </div>
        {/* Line */}
        <div 
          className="flex-1 w-[2px] border-l-2 border-dashed border-zinc-400 dark:border-zinc-500 -mt-[2px]"
          style={{ height: (height || 300) - 50 }}
        />
      </div>
      {/* Handles for messages */}
      <Handle type="target" position={Position.Left} className="!bg-blue-500" />
      <Handle type="source" position={Position.Right} className="!bg-blue-500" />
    </>
  );
};
