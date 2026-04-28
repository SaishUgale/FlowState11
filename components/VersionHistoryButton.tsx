"use client";

import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { VersionHistoryPanel } from "./VersionHistoryPanel";

interface VersionHistoryButtonProps {
  roomId: string;
  roomType: "document" | "uml" | "spreadsheet";
}

export const VersionHistoryButton = ({ roomId, roomType }: VersionHistoryButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="gap-2 text-zinc-600 dark:text-zinc-300"
      >
        <History className="h-4 w-4" />
        <span className="hidden sm:inline">Version History</span>
      </Button>

      {isOpen && (
        <VersionHistoryPanel 
          roomId={roomId} 
          roomType={roomType} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  );
};
