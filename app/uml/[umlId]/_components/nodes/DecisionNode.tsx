import { Handle, Position, NodeProps, NodeResizer } from "reactflow";
import { UmlNodeData } from "@/liveblocks.config";
import { cn } from "@/lib/utils";

export const DecisionNode = ({ data, selected }: NodeProps<UmlNodeData>) => {
  const { label, width, height, color, borderColor, textColor, fontSize, opacity } = data;

  return (
    <>
      <NodeResizer 
        minWidth={60} 
        minHeight={60} 
        isVisible={selected} 
        lineClassName="border-blue-500" 
      />
      <div 
        className={cn(
          "flex items-center justify-center p-4 relative",
          selected ? "ring-2 ring-blue-500 ring-offset-8 rounded-full" : ""
        )}
        style={{
          width: width || 80,
          height: height || 80,
          opacity: opacity || 1,
        }}
      >
        <div 
          className="absolute inset-0 border-2 rotate-45"
          style={{
            backgroundColor: color || "#ffffff",
            borderColor: borderColor || "#333333",
          }}
        />
        <span 
          className="relative z-10 text-center break-words max-w-[80%]"
          style={{
            color: textColor || "#000000",
            fontSize: `${fontSize || 12}px`,
          }}
        >
          {label}
        </span>
      </div>

      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      <Handle type="target" position={Position.Left} className="!bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
      <Handle type="source" position={Position.Right} className="!bg-blue-500" />
    </>
  );
};
