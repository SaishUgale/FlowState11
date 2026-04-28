import { Handle, Position, NodeProps, NodeResizer } from "reactflow";
import { UmlNodeData } from "@/liveblocks.config";
import { cn } from "@/lib/utils";

export const ClassNode = ({ data, selected }: NodeProps<UmlNodeData>) => {
  const {
    label, width, height, color, borderColor, textColor, fontSize,
    attributes, methods, stereotype, opacity
  } = data;

  return (
    <>
      <NodeResizer 
        minWidth={150} 
        minHeight={100} 
        isVisible={selected} 
        lineClassName="border-blue-500" 
        handleClassName="h-3 w-3 bg-white border-2 border-blue-500 rounded"
      />
      <div 
        className={cn(
          "flex flex-col h-full bg-white dark:bg-zinc-800 rounded shadow-md border overflow-hidden",
          selected ? "ring-2 ring-blue-500 ring-offset-2" : ""
        )}
        style={{
          width: width || "100%",
          height: height || "100%",
          backgroundColor: color || "#ffffff",
          borderColor: borderColor || "#333333",
          color: textColor || "#000000",
          fontSize: `${fontSize || 14}px`,
          opacity: opacity || 1,
        }}
      >
        {/* Header */}
        <div className="font-bold text-center border-b border-inherit p-2 bg-zinc-50 dark:bg-zinc-900 shrink-0">
          {stereotype && <div className="text-[10px] italic leading-none mb-1 opacity-60 font-normal">&laquo;{stereotype}&raquo;</div>}
          <div className="truncate">{label}</div>
        </div>

        {/* Attributes */}
        <div className="flex-1 p-2 border-b border-inherit min-h-[20px] overflow-hidden">
          {(attributes || []).map((attr, i) => (
            <div key={i} className="truncate whitespace-nowrap">{attr}</div>
          ))}
        </div>

        {/* Methods */}
        <div className="flex-1 p-2 min-h-[20px] overflow-hidden">
          {(methods || []).map((method, i) => (
            <div key={i} className="truncate whitespace-nowrap">{method}</div>
          ))}
        </div>
      </div>

      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-blue-500" />
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-blue-500" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-blue-500" />
    </>
  );
};
