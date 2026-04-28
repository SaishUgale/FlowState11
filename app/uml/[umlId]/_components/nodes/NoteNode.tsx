import { Handle, Position, NodeProps, NodeResizer } from "reactflow";
import { UmlNodeData } from "@/liveblocks.config";
import { cn } from "@/lib/utils";

export const NoteNode = ({ data, selected }: NodeProps<UmlNodeData>) => {
  const { label, width, height, color, textColor, fontSize, opacity } = data;

  return (
    <>
      <NodeResizer 
        minWidth={100} 
        minHeight={100} 
        isVisible={selected} 
        lineClassName="border-blue-500" 
      />
      <div 
        className={cn(
          "p-4 shadow-lg relative border-l-4 overflow-hidden",
          selected ? "ring-2 ring-blue-500 ring-offset-4" : ""
        )}
        style={{
          width: width || 150,
          height: height || 150,
          backgroundColor: color || "#fef08a",
          borderColor: "#eab308",
          color: textColor || "#1c1917",
          fontSize: `${fontSize || 14}px`,
          opacity: opacity || 1,
          borderBottomRightRadius: "20px",
        }}
      >
        {/* Folded Corner Effect */}
        <div className="absolute bottom-0 right-0 w-8 h-8 bg-black/5 dark:bg-white/5" style={{ borderTopLeftRadius: "100%" }} />
        <div className="whitespace-pre-wrap break-words">{label}</div>
      </div>

      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </>
  );
};
