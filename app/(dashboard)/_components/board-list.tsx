"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import BoardCard from "./BoardCard";
import { NewFileButton } from "./new-file-button";
import { LayoutTemplate, FileText, X, Network, Table } from "lucide-react";

interface BoardListProps {
  orgId: string;
  query: { search?: string; favorites?: string; };
}

const FolderCard = ({ label, icon: Icon, count, items }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Ignore clicks inside the popup itself
      if (popupRef.current && popupRef.current.contains(target)) return;
      
      // Ignore clicks inside Dropdowns/Modals (Portals)
      const isPortal = target.closest('[role="menu"]') || 
                       target.closest('[role="dialog"]') || 
                       target.closest('[role="alertdialog"]');
                       
      if (isPortal) return;

      setIsOpen(false);
    };

    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={popupRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full group relative aspect-[100/127] flex flex-col justify-between p-4 overflow-hidden rounded-lg border transition-all duration-300 text-left bg-white dark:bg-black/20 hover:shadow-lg hover:border-indigo-500/50"
      >
        <Icon className="absolute -right-8 -bottom-8 h-40 w-40 text-indigo-50/50 transition-colors" />
        <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Icon className="h-6 w-6" />
        </div>
        <div className="relative z-10">
          <p className="text-xl font-semibold">{label}</p>
          <p className="text-sm text-muted-foreground mt-1">{count} Files</p>
        </div>
      </button>

      {isOpen && (
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="absolute top-full left-0 mt-2 z-50 w-[300px] sm:w-[500px] md:w-[600px] bg-white dark:bg-zinc-900 border rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-x-2">
              <Icon className="h-5 w-5 text-indigo-600" />
              <h3 className="font-semibold text-lg">{label}</h3>
            </div>
            <X className="h-4 w-4 cursor-pointer" onClick={() => setIsOpen(false)} />
          </div>
          <div className="p-4 max-h-[400px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 custom-scrollbar">
            {items.map((item: any) => (
              <BoardCard key={item._id} {...item} id={item._id} createdAt={item._creationTime} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const BoardList = ({ orgId, query }: BoardListProps) => {
  const data = useQuery(api.boards.get, { orgId, ...query });

  // GAP FIX: Removed 'mt-8' from here to reduce the gap
  const gridClasses = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 pb-10";

  if (data === undefined) return (
    <div className={gridClasses}>
      <NewFileButton orgId={orgId} disabled />
      <BoardCard.Skeleton /><BoardCard.Skeleton /><BoardCard.Skeleton />
    </div>
  );

  const boards = data.filter((b: any) => b.type === "board");
  const documents = data.filter((b: any) => b.type === "document");
  const umls = data.filter((b: any) => b.type === "uml");
  const spreadsheets = data.filter((b: any) => b.type === "spreadsheet");

  return (
    <div className="flex flex-col gap-y-4 pb-10"> {/* Reduced gap-y from 12 to 4 */}
      
      {/* GAP FIX: Reduced margin-bottom from mb-6 to mb-4 */}
      <h2 className="text-3xl font-semibold mb-4">
        {query.favorites ? "Favorites" : "Dashboard"}
      </h2>
      
      <div className={gridClasses}>
        {!query.favorites && <NewFileButton orgId={orgId} />}
        <FolderCard label="Documents" icon={FileText} count={documents.length} items={documents} />
        <FolderCard label="Boards" icon={LayoutTemplate} count={boards.length} items={boards} />
        <FolderCard label="UML Diagrams" icon={Network} count={umls.length} items={umls} />
        <FolderCard label="Spreadsheets" icon={Table} count={spreadsheets.length} items={spreadsheets} />
      </div>
    </div>
  );
};