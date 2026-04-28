"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Table } from "lucide-react";
import { VersionHistoryButton } from "@/components/VersionHistoryButton";

interface SpreadsheetTopBarProps {
  spreadsheetId: string;
}

export const SpreadsheetTopBar = ({ spreadsheetId }: SpreadsheetTopBarProps) => {
  const spreadsheet = useQuery(api.board.get, { id: spreadsheetId as any });

  if (spreadsheet === undefined) {
    return (
      <div className="h-14 flex items-center justify-between px-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-white/10 shrink-0">
        <Skeleton className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  if (spreadsheet === null) {
    return null;
  }

  return (
    <div className="h-14 flex items-center justify-between px-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-white/10 shrink-0">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <Table className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h1 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{spreadsheet.title}</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Spreadsheet</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <VersionHistoryButton roomId={spreadsheetId} roomType="spreadsheet" />
      </div>
    </div>
  );
};
