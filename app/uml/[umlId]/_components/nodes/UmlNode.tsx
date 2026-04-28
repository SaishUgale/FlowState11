import { Handle, Position, NodeProps } from "reactflow";
import { UmlNodeData } from "@/liveblocks.config";
import { Database, User, Package, Component, StickyNote } from "lucide-react";

export const UmlNode = ({ data, selected }: NodeProps<UmlNodeData>) => {
  const {
    type, label, width, height, color, borderColor, textColor, fontSize,
    attributes, methods, stereotype, opacity
  } = data;

  const style = {
    width: width || 150,
    minHeight: height || 50,
    backgroundColor: color || "#ffffff",
    borderColor: selected ? "#3b82f6" : borderColor || "#000000",
    borderWidth: selected ? 2 : 1,
    color: textColor || "#000000",
    fontSize: `${fontSize || 14}px`,
    opacity: opacity || 1,
  };

  const renderContent = () => {
    switch (type) {
      case "class":
        return (
          <div className="flex flex-col w-full h-full bg-white dark:bg-zinc-800 rounded shadow-sm overflow-hidden" style={style}>
            <div className="font-bold text-center border-b border-inherit p-2 bg-zinc-50 dark:bg-zinc-900">
              {stereotype && <div className="text-xs italic">&laquo;{stereotype}&raquo;</div>}
              {label}
            </div>
            {attributes && attributes.length > 0 && (
              <div className="p-2 border-b border-inherit text-sm">
                {attributes.map((attr, i) => <div key={i}>{attr}</div>)}
              </div>
            )}
            {methods && methods.length > 0 && (
              <div className="p-2 text-sm">
                {methods.map((method, i) => <div key={i}>{method}</div>)}
              </div>
            )}
          </div>
        );
      case "actor":
        return (
          <div className="flex flex-col items-center justify-center gap-1" style={{ color: style.color, opacity: style.opacity }}>
            <User size={40} className="text-zinc-800 dark:text-zinc-200" />
            <span className="font-medium text-sm text-center">{label}</span>
          </div>
        );
      case "useCase":
        return (
          <div className="flex items-center justify-center text-center p-3 rounded-[50px] shadow-sm bg-white dark:bg-zinc-800" style={style}>
            {label}
          </div>
        );
      case "database":
        return (
          <div className="flex flex-col items-center justify-center gap-2 p-3 rounded shadow-sm bg-white dark:bg-zinc-800" style={{ ...style, borderRadius: "8px" }}>
            <Database size={24} />
            <span className="text-center font-medium">{label}</span>
          </div>
        );
      case "note":
        return (
          <div className="p-3 shadow-sm bg-yellow-100 dark:bg-yellow-900/40 text-zinc-900 dark:text-zinc-100" style={{ ...style, borderBottomRightRadius: "12px" }}>
            <div className="absolute top-0 right-0 w-4 h-4 bg-yellow-200 dark:bg-yellow-800/50" style={{ borderBottomLeftRadius: "4px" }} />
            {label}
          </div>
        );
      case "package":
        return (
          <div className="flex flex-col" style={{ opacity: style.opacity }}>
            <div className="w-1/2 h-4 border-t border-l border-r border-inherit bg-white dark:bg-zinc-800" style={{ backgroundColor: style.backgroundColor, borderColor: style.borderColor, borderWidth: style.borderWidth }}></div>
            <div className="p-2 border border-inherit bg-white dark:bg-zinc-800 shadow-sm" style={style}>
              <div className="font-bold">{label}</div>
            </div>
          </div>
        );
      case "component":
        return (
          <div className="flex items-center justify-center p-3 shadow-sm bg-white dark:bg-zinc-800 relative" style={style}>
            <div className="absolute -left-2 top-2 flex flex-col gap-2">
              <div className="w-4 h-2 border border-inherit bg-white dark:bg-zinc-800" style={{ borderColor: style.borderColor }}></div>
              <div className="w-4 h-2 border border-inherit bg-white dark:bg-zinc-800" style={{ borderColor: style.borderColor }}></div>
            </div>
            <span className="font-bold">{label}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center p-3 rounded shadow-sm bg-white dark:bg-zinc-800" style={style}>
            {label}
          </div>
        );
    }
  };

  return (
    <>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-blue-500 opacity-0 group-hover:opacity-100" />
      <Handle type="target" position={Position.Left} id="left" className="w-2 h-2 !bg-blue-500 opacity-0 group-hover:opacity-100" />
      <div className="group relative">
        {renderContent()}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-blue-500 opacity-0 group-hover:opacity-100" />
      <Handle type="source" position={Position.Right} id="right" className="w-2 h-2 !bg-blue-500 opacity-0 group-hover:opacity-100" />
    </>
  );
};
