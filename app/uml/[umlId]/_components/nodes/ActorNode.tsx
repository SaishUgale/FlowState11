import { Handle, Position, NodeProps } from "reactflow";
import { UmlNodeData } from "@/liveblocks.config";
import { User } from "lucide-react";

export const ActorNode = ({ data, selected }: NodeProps<UmlNodeData>) => {
  const { label, color, opacity, textColor } = data;

  return (
    <div className="flex flex-col items-center justify-center gap-1 group" style={{ opacity: opacity || 1 }}>
      <div className={`p-1 rounded-full transition-all ${selected ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}>
        <User 
          size={48} 
          style={{ color: color || "currentColor" }} 
          className="dark:text-zinc-200"
        />
      </div>
      <span 
        className="font-bold text-xs text-center px-2 py-0.5 rounded bg-white/50 dark:bg-black/20 backdrop-blur-sm"
        style={{ color: textColor || "inherit" }}
      >
        {label}
      </span>

      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </div>
  );
};
