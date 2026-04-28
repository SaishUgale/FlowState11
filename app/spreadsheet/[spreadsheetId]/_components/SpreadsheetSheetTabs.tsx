import { Plus, X, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { useStorage, useMutation } from "@liveblocks/react/suspense";
import { LiveObject, LiveMap, LiveList } from "@liveblocks/client";
import { cn } from "@/lib/utils";
import { nanoid } from "nanoid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdownMenu";

export const SpreadsheetSheetTabs = () => {
  const activeSheetId = useStorage((root) => root.activeSheetId);
  const sheets = useStorage((root) => root.sheets);
  const sheetOrder = useStorage((root) => root.sheetOrder);

  const updatePresence = useMutation(({ setMyPresence }, sheetId: string) => {
    setMyPresence({ activeSheetId: sheetId });
  }, []);

  const setActiveSheet = useMutation(({ storage }, sheetId: string) => {
    storage.set("activeSheetId", sheetId);
  }, []);

  const addSheet = useMutation(({ storage }) => {
    const id = nanoid();
    const sheets = storage.get("sheets");
    const order = storage.get("sheetOrder");
    
    sheets.set(id, new LiveObject({
      name: `Sheet ${order.length + 1}`,
      cells: new LiveMap(),
      columnWidths: new LiveMap(),
      rowHeights: new LiveMap(),
      frozenRows: 0,
      frozenCols: 0,
      hiddenRows: new LiveList(),
      hiddenCols: new LiveList(),
    }));
    order.push(id);
    storage.set("activeSheetId", id);
  }, []);

  const removeSheet = useMutation(({ storage }, sheetId: string) => {
    const sheets = storage.get("sheets");
    const order = storage.get("sheetOrder");
    
    if (order.length <= 1) return; // Don't delete last sheet
    
    const index = order.indexOf(sheetId);
    order.delete(index);
    sheets.delete(sheetId);
    
    if (storage.get("activeSheetId") === sheetId) {
      storage.set("activeSheetId", order.get(0));
    }
  }, []);

  const renameSheet = useMutation(({ storage }, sheetId: string, newName: string) => {
    const sheet = storage.get("sheets").get(sheetId);
    if (sheet) sheet.set("name", newName);
  }, []);

  if (!sheetOrder) return null;

  return (
    <div className="h-10 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center px-4 gap-1 z-50 shrink-0">
      <div className="flex items-center overflow-x-auto no-scrollbar max-w-full">
        {sheetOrder.map((id) => {
          const sheet = (sheets as any).get ? (sheets as any).get(id) : (sheets as any)[id];
          if (!sheet) return null;
          
          const isActive = id === activeSheetId;
          
          return (
            <div 
              key={id}
              onClick={() => setActiveSheet(id)}
              className={cn(
                "group relative flex items-center px-4 py-2 text-xs font-medium cursor-pointer transition-all border-r border-zinc-200 dark:border-zinc-800 min-w-[100px] select-none",
                isActive 
                  ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 border-b-2 border-b-blue-600" 
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
              )}
            >
              <span 
                contentEditable={isActive}
                suppressContentEditableWarning
                onBlur={(e) => renameSheet(id, e.target.innerText)}
                className="outline-none"
              >
                {sheet.name}
              </span>
              
              {sheetOrder.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={cn(
                      "ml-2 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-200 dark:hover:bg-zinc-700",
                      isActive && "opacity-100"
                    )}>
                      <Menu className="w-3 h-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem className="text-xs text-red-600" onClick={(e) => { e.stopPropagation(); removeSheet(id); }}>
                      Delete Sheet
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        })}
      </div>

      <button 
        onClick={() => addSheet()}
        className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 transition-colors ml-2"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
