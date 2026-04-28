import { Handle, Position, NodeProps, NodeResizer } from "reactflow";
import { UmlNodeData } from "@/liveblocks.config";
import { cn } from "@/lib/utils";

export const UseCaseNode = ({ data, selected }: NodeProps<UmlNodeData>) => {
  const { label, width, height, color, borderColor, textColor, fontSize, opacity } = data;

  return (
    <>
      <NodeResizer 
        minWidth={100} 
        minHeight={60} 
        isVisible={selected} 
        lineClassName="border-blue-500" 
      />
      <div 
        className={cn(
          "flex items-center justify-center text-center p-4 rounded-[50%] shadow-md border",
          selected ? "ring-2 ring-blue-500 ring-offset-2" : ""
        )}
        style={{
          width: width || 120,
          height: height || 70,
          backgroundColor: color || "#ffffff",
          borderColor: borderColor || "#333333",
          color: textColor || "#000000",
          fontSize: `${fontSize || 14}px`,
          opacity: opacity || 1,
        }}
      >
        <span className="truncate max-w-full p-2">{label}</span>
      </div>

      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      <Handle type="target" position={Position.Left} className="!bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
      <Handle type="source" position={Position.Right} className="!bg-blue-500" />
    </>
  );
};
