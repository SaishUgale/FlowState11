import { useEffect, useRef } from "react";
import { Copy, Trash, ArrowUpToLine, ArrowDownToLine } from "lucide-react";

interface UmlContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDelete: () => void;
  onCopy?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
}

export const UmlContextMenu = ({ x, y, onClose, onDelete, onCopy, onBringToFront, onSendToBack }: UmlContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg py-1 z-[100] w-48 text-sm"
      style={{ top: y, left: x }}
    >
      {onCopy && (
        <button
          className="w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
          onClick={() => { onCopy(); onClose(); }}
        >
          <Copy className="w-4 h-4" /> Duplicate
        </button>
      )}
      
      {onBringToFront && (
        <button
          className="w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
          onClick={() => { onBringToFront(); onClose(); }}
        >
          <ArrowUpToLine className="w-4 h-4" /> Bring to Front
        </button>
      )}

      {onSendToBack && (
        <button
          className="w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
          onClick={() => { onSendToBack(); onClose(); }}
        >
          <ArrowDownToLine className="w-4 h-4" /> Send to Back
        </button>
      )}

      <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />

      <button
        className="w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-red-600 hover:text-red-700"
        onClick={() => { onDelete(); onClose(); }}
      >
        <Trash className="w-4 h-4" /> Delete
      </button>
    </div>
  );
};
