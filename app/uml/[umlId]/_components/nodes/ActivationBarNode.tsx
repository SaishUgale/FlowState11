import { Handle, Position, NodeProps, NodeResizer } from "reactflow";
import { UmlNodeData } from "@/liveblocks.config";
import { cn } from "@/lib/utils";

export const ActivationBarNode = ({ data, selected }: NodeProps<UmlNodeData>) => {
  const { width, height, color, borderColor, opacity } = data;

  return (
    <>
      <NodeResizer minWidth={16} minHeight={40} isVisible={selected} />
      <div 
        className={cn(
          "h-full border-2 bg-white dark:bg-zinc-700 shadow-sm transition-all",
          selected ? "ring-2 ring-blue-500 ring-offset-2" : ""
        )}
        style={{
          width: width || 16,
          height: height || 100,
          backgroundColor: color || "#f8fafc",
          borderColor: borderColor || "#64748b",
          opacity: opacity || 1,
        }}
      />
      <Handle type="target" position={Position.Left} className="!bg-blue-500 !w-1 !h-1" />
      <Handle type="source" position={Position.Right} className="!bg-blue-500 !w-1 !h-1" />
    </>
  );
};
