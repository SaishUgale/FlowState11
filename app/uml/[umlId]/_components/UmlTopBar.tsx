"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Network } from "lucide-react";
import { VersionHistoryButton } from "@/components/VersionHistoryButton";

interface UmlTopBarProps {
  umlId: string;
}

export const UmlTopBar = ({ umlId }: UmlTopBarProps) => {
  const uml = useQuery(api.board.get, { id: umlId as any });

  if (uml === undefined) {
    return (
      <div className="absolute top-4 left-4 right-4 h-12 flex items-center justify-between px-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-xl border border-zinc-200 dark:border-white/10 shadow-sm z-50">
        <Skeleton className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  if (uml === null) {
    return null;
  }

  return (
    <div className="absolute top-4 left-4 right-4 h-14 flex items-center justify-between px-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-xl border border-zinc-200 dark:border-white/10 shadow-sm z-50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Network className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{uml.title}</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">UML Diagram</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* We will add Version History Button here later */}
        <VersionHistoryButton roomId={umlId} roomType="uml" />
      </div>
    </div>
  );
};
