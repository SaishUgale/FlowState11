"use client";

import React, { useMemo, useState, useRef, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useStorage, useMutation, useUpdateMyPresence } from "@liveblocks/react/suspense";
import { LiveObject, LiveMap } from "@liveblocks/client";
import { SpreadsheetToolbar } from "./SpreadsheetToolbar";
import { SpreadsheetContextMenu } from "./SpreadsheetContextMenu";
import { useSpreadsheetFormulas } from "@/hooks/useSpreadsheetFormulas";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const colIndexToLabel = (index: number) => {
  let label = "";
  let temp = index;
  while (temp >= 0) {
    label = String.fromCharCode((temp % 26) + 65) + label;
    temp = Math.floor(temp / 26) - 1;
  }
  return label;
};

export const SpreadsheetGrid = () => {
  const rowsCount = 1000;
  const colsCount = 100;
  
  const parentRef = useRef<HTMLDivElement>(null);
  const { evaluateFormula } = useSpreadsheetFormulas();
  
  const [activeCell, setActiveCell] = useState<{row: number, col: number} | null>(null);
  const [editValue, setEditValue] = useState("");
  const updateMyPresence = useUpdateMyPresence();

  const activeSheetId = useStorage((root) => root.activeSheetId);
  const sheets = useStorage((root) => root.sheets);
  const currentSheet = (activeSheetId && sheets) 
    ? (typeof (sheets as any).get === "function" 
        ? (sheets as any).get(activeSheetId) 
        : (sheets as any)[activeSheetId]) 
    : null;
  const cells = currentSheet?.cells;
  const columnWidths = currentSheet?.columnWidths;
  const rowHeights = currentSheet?.rowHeights;

  const rowVirtualizer = useVirtualizer({
    count: rowsCount,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => {
      const height = (rowHeights as any)?.get ? (rowHeights as any).get(i.toString()) : (rowHeights as any)?.[i.toString()];
      return height || 24;
    },
    overscan: 10,
  });

  const colVirtualizer = useVirtualizer({
    horizontal: true,
    count: colsCount,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => {
      const label = colIndexToLabel(i);
      const width = (columnWidths as any)?.get ? (columnWidths as any).get(label) : (columnWidths as any)?.[label];
      return width || 100;
    },
    overscan: 5,
  });

  const updateCell = useMutation(({ storage }, row: number, col: number, value: string) => {
    const activeId = storage.get("activeSheetId");
    const sheet = storage.get("sheets").get(activeId);
    if (!sheet) return;
    
    let cells = sheet.get("cells");
    if (!cells || typeof cells.set !== "function") {
       sheet.set("cells", new LiveMap());
       cells = sheet.get("cells");
    }

    const cellId = `${row},${col}`;
    const existingCell = cells.get(cellId);

    if (existingCell) {
      existingCell.update({ value });
    } else {
      cells.set(cellId, new LiveObject({
        value,
        format: {
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          fontSize: 14,
          fontFamily: "Arial",
          color: "#000000",
          backgroundColor: "#ffffff",
          align: "left",
          verticalAlign: "middle",
          wrapText: false,
          numberFormat: "general",
          decimalPlaces: 2
        }
      }));
    }
  }, []);

  const updateColumnWidth = useMutation(({ storage }, colLabel: string, width: number) => {
    const activeId = storage.get("activeSheetId");
    const sheet = storage.get("sheets").get(activeId);
    if (sheet) {
      let widths = sheet.get("columnWidths");
      if (!widths || typeof widths.set !== "function") {
        sheet.set("columnWidths", new LiveMap());
        widths = sheet.get("columnWidths");
      }
      widths.set(colLabel, width);
    }
  }, []);

  const handleFormatChange = useMutation(({ storage }, key: string, value: any) => {
    if (!activeCell) return;
    const activeId = storage.get("activeSheetId");
    const sheet = storage.get("sheets").get(activeId);
    const cells = sheet?.get("cells");
    const cellId = `${activeCell.row},${activeCell.col}`;
    const cell = cells?.get(cellId);
    if (cell) {
      const currentFormat = cell.get("format") as any;
      cell.update({
        format: {
          ...currentFormat,
          [key]: value
        }
      });
    }
  }, [activeCell]);

  const activeFormat = useMemo(() => {
    if (!activeCell || !cells) return null;
    const cellId = `${activeCell.row},${activeCell.col}`;
    const cell = (cells as any).get ? (cells as any).get(cellId) : (cells as any)[cellId];
    return cell?.format || null;
  }, [activeCell, cells]);

  const getCellValue = useCallback((row: number, col: number) => {
    const cellId = `${row},${col}`;
    const cell = (cells as any)?.get ? (cells as any).get(cellId) : (cells as any)?.[cellId];
    if (!cell) return 0;
    const val = cell.value;
    if (val?.startsWith("=")) {
      // Avoid circular references by not evaluating recursively here for now
      return parseFloat(val.substring(1)) || 0; 
    }
    return parseFloat(val) || 0;
  }, [cells]);

  const handleCellClick = (row: number, col: number) => {
    setActiveCell({ row, col });
    const cellId = `${row},${col}`;
    const cell = (cells as any)?.get ? (cells as any).get(cellId) : (cells as any)?.[cellId];
    setEditValue(cell?.value || "");
    updateMyPresence({ cursor: { row, col: colIndexToLabel(col) } });
  };

  const handleResize = (index: number, size: number, type: "col" | "row") => {
    if (type === "col") {
      updateColumnWidth(colIndexToLabel(index), size);
    }
  };

  const handleAction = (action: string) => {
    toast.info(`Action ${action} triggered`);
  };

  return (
    <div className="flex-1 w-full h-full overflow-hidden flex flex-col bg-white dark:bg-zinc-950 relative">
      <SpreadsheetToolbar onFormatChange={handleFormatChange} activeFormat={activeFormat} />
      
      <div className="h-10 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 shrink-0">
        <div className="text-xs font-mono text-zinc-500 mr-4 w-10 text-center">
          {activeCell ? `${colIndexToLabel(activeCell.col)}${activeCell.row + 1}` : "fx"}
        </div>
        <input 
          className="flex-1 bg-transparent text-sm focus:outline-none" 
          placeholder="Formula bar"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => activeCell && updateCell(activeCell.row, activeCell.col, editValue)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && activeCell) {
              updateCell(activeCell.row, activeCell.col, editValue);
              (e.target as HTMLInputElement).blur();
            }
          }}
          disabled={!activeCell}
        />
      </div>

      <SpreadsheetContextMenu onAction={handleAction}>
        <div ref={parentRef} className="flex-1 w-full overflow-auto relative">
          <div style={{ width: colVirtualizer.getTotalSize() + 40, height: rowVirtualizer.getTotalSize() + 32, position: "relative" }}>
            
            {/* Headers Corner */}
            <div className="sticky top-0 left-0 z-40 bg-zinc-100 dark:bg-zinc-800 border-b border-r border-zinc-300 dark:border-zinc-700 w-10 h-8 flex items-center justify-center shrink-0" />
            
            {/* Sticky Column Headers */}
            <div className="sticky top-0 z-30 flex">
              {colVirtualizer.getVirtualItems().map((v) => (
                <div key={v.index} className={cn(
                  "absolute bg-zinc-100 dark:bg-zinc-800 border-b border-r border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-xs font-medium select-none transition-colors",
                  activeCell?.col === v.index ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : "text-zinc-500"
                )}
                  style={{ left: v.start + 40, width: v.size, height: 32 }}>
                  {colIndexToLabel(v.index)}
                  {/* Resize handle */}
                  <div 
                    className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors" 
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      const startX = e.clientX;
                      const startWidth = v.size;
                      const onMouseMove = (e: MouseEvent) => {
                        const newWidth = Math.max(40, startWidth + (e.clientX - startX));
                        handleResize(v.index, newWidth, "col");
                      };
                      const onMouseUp = () => {
                        window.removeEventListener("mousemove", onMouseMove);
                        window.removeEventListener("mouseup", onMouseUp);
                      };
                      window.addEventListener("mousemove", onMouseMove);
                      window.addEventListener("mouseup", onMouseUp);
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Sticky Row Headers */}
            <div className="sticky left-0 z-30">
              {rowVirtualizer.getVirtualItems().map((v) => (
                <div key={v.index} className={cn(
                  "absolute bg-zinc-100 dark:bg-zinc-800 border-b border-r border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-xs font-medium select-none transition-colors",
                  activeCell?.row === v.index ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : "text-zinc-500"
                )}
                  style={{ top: v.start + 32, left: 0, width: 40, height: v.size }}>
                  {v.index + 1}
                </div>
              ))}
            </div>

            {/* Cells */}
            {rowVirtualizer.getVirtualItems().map((vRow) => (
              <React.Fragment key={vRow.index}>
                {colVirtualizer.getVirtualItems().map((vCol) => {
                  const cellId = `${vRow.index},${vCol.index}`;
                  const cell = (cells as any)?.get ? (cells as any).get(cellId) : (cells as any)?.[cellId];
                  const isActive = activeCell?.row === vRow.index && activeCell?.col === vCol.index;
                  
                  return (
                    <div
                      key={cellId}
                      onClick={() => handleCellClick(vRow.index, vCol.index)}
                      className={cn(
                        "absolute border-b border-r border-zinc-200 dark:border-zinc-800 px-2 flex items-center text-sm truncate",
                        isActive && "ring-2 ring-blue-500 z-10 bg-blue-50/10",
                        !isActive && (activeCell?.row === vRow.index || activeCell?.col === vCol.index) && "bg-zinc-50/50 dark:bg-zinc-800/20"
                      )}
                      style={{
                        top: vRow.start + 32,
                        left: vCol.start + 40,
                        width: vCol.size,
                        height: vRow.size,
                        backgroundColor: cell?.format?.backgroundColor,
                        color: cell?.format?.color,
                        fontWeight: cell?.format?.bold ? "bold" : "normal",
                        fontStyle: cell?.format?.italic ? "italic" : "normal",
                        textDecoration: `${cell?.format?.underline ? "underline " : ""}${cell?.format?.strikethrough ? "line-through" : ""}`,
                        textAlign: cell?.format?.align || "left",
                      }}
                    >
                      {isActive ? (
                        <input
                          className="w-full h-full bg-transparent outline-none"
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => updateCell(vRow.index, vCol.index, editValue)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              updateCell(vRow.index, vCol.index, editValue);
                              setActiveCell({ row: vRow.index + 1, col: vCol.index });
                            }
                          }}
                        />
                      ) : (
                        <span className="truncate w-full">
                          {cell?.value?.startsWith("=") 
                            ? evaluateFormula(cell.value, getCellValue) 
                            : cell?.value}
                        </span>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </SpreadsheetContextMenu>
    </div>
  );
};
