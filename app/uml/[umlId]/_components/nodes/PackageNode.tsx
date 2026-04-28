import { Handle, Position, NodeProps, NodeResizer } from "reactflow";
import { UmlNodeData } from "@/liveblocks.config";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

export const PackageNode = ({ data, selected }: NodeProps<UmlNodeData>) => {
  const { label, width, height, color, borderColor, textColor, fontSize, opacity } = data;

  return (
    <>
      <NodeResizer minWidth={100} minHeight={80} isVisible={selected} />
      <div className="flex flex-col group" style={{ opacity: opacity || 1 }}>
        {/* Tab */}
        <div 
          className="w-16 h-6 border-t border-l border-r rounded-t-md shrink-0 ml-1" 
          style={{ 
            backgroundColor: color || "#ffffff", 
            borderColor: borderColor || "#333333",
            borderWidth: "1px"
          }} 
        />
        {/* Body */}
        <div 
          className={cn(
            "flex-1 p-3 border shadow-md bg-white dark:bg-zinc-800 -mt-[1px] min-h-[50px] rounded-b-md rounded-tr-md",
            selected ? "ring-2 ring-blue-500 ring-offset-2" : ""
          )}
          style={{
            width: width || 180,
            height: height || 120,
            backgroundColor: color || "#ffffff",
            borderColor: borderColor || "#333333",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Package size={16} style={{ color: textColor || "inherit" }} />
            <span className="font-bold truncate" style={{ color: textColor || "inherit", fontSize: `${fontSize || 14}px` }}>
              {label}
            </span>
          </div>
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      <Handle type="target" position={Position.Left} className="!bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
      <Handle type="source" position={Position.Right} className="!bg-blue-500" />
    </>
  );
};
