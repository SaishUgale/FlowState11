"use client";

import { SpreadsheetTopBar } from "./SpreadsheetTopBar";
import { SpreadsheetGrid } from "./SpreadsheetGrid";
import { SpreadsheetSheetTabs } from "./SpreadsheetSheetTabs";

export const SpreadsheetEditor = ({ spreadsheetId }: { spreadsheetId: string }) => {
  return (
    <div className="flex flex-col h-screen w-full bg-zinc-50 dark:bg-zinc-950">
      <SpreadsheetTopBar spreadsheetId={spreadsheetId} />
      
      <div className="flex-1 overflow-hidden flex flex-col relative">
        <SpreadsheetGrid />
        
        <SpreadsheetSheetTabs />
      </div>
    </div>
  );
};
