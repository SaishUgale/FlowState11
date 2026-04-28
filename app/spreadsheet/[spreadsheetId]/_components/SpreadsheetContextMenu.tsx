import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/contextMenu";
import { Copy, Scissors, Clipboard, Plus, Trash, Lock, Unlock, Merge } from "lucide-react";

interface SpreadsheetContextMenuProps {
  children: React.ReactNode;
  onAction: (action: string) => void;
  isAdmin?: boolean;
}

export const SpreadsheetContextMenu = ({ children, onAction, isAdmin }: SpreadsheetContextMenuProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={() => onAction("copy")}>
          <Copy className="w-4 h-4 mr-2" /> Copy
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onAction("cut")}>
          <Scissors className="w-4 h-4 mr-2" /> Cut
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onAction("paste")}>
          <Clipboard className="w-4 h-4 mr-2" /> Paste
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={() => onAction("insert-row")}>
          <Plus className="w-4 h-4 mr-2" /> Insert Row Above
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onAction("insert-col")}>
          <Plus className="w-4 h-4 mr-2" /> Insert Column Left
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={() => onAction("delete-row")} className="text-red-600">
          <Trash className="w-4 h-4 mr-2" /> Delete Row
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onAction("delete-col")} className="text-red-600">
          <Trash className="w-4 h-4 mr-2" /> Delete Column
        </ContextMenuItem>

        {isAdmin && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => onAction("lock")}>
              <Lock className="w-4 h-4 mr-2" /> Lock Cells
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onAction("merge")}>
              <Merge className="w-4 h-4 mr-2" /> Merge Cells
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};
