import { Handle, Position, NodeProps, NodeResizer } from "reactflow";
import { UmlNodeData } from "@/liveblocks.config";
import { cn } from "@/lib/utils";

export const GenericShapeNode = ({ data, selected }: NodeProps<UmlNodeData>) => {
  const { label, width, height, color, borderColor, textColor, fontSize, opacity, shape } = data;

  const renderShape = () => {
    switch (shape) {
      case "ellipse":
        return "rounded-[50%]";
      case "diamond":
        return "rotate-45";
      case "triangle":
        return "clip-path-triangle"; // Needs custom CSS
      case "cylinder":
        return "rounded-t-[20px] rounded-b-[20px]";
      default:
        return "rounded-sm";
    }
  };

  return (
    <>
      <NodeResizer minWidth={40} minHeight={40} isVisible={selected} />
      <div 
        className={cn(
          "flex items-center justify-center text-center p-3 border-2 shadow-sm transition-all",
          renderShape(),
          selected ? "ring-2 ring-blue-500 ring-offset-4" : ""
        )}
        style={{
          width: width || 100,
          height: height || 100,
          backgroundColor: color || "#ffffff",
          borderColor: borderColor || "#333333",
          opacity: opacity || 1,
        }}
      >
        <span 
          className={cn("truncate max-w-full", shape === "diamond" ? "-rotate-45" : "")}
          style={{ color: textColor || "#000000", fontSize: `${fontSize || 14}px` }}
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
