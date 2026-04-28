"use client";

import Link from "next/link";
import { Overlay } from "./Overlay";

import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@clerk/nextjs";
import { Footer } from "./Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Actions } from "@/components/ui/actions";
import { MoreHorizontal, FileText, LayoutTemplate, Network, Table } from "lucide-react";
import { useApiMutation } from "@/hooks/useApiMutation";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface BoardCardProps {
  id: string;
  title: string;
  imageUrl: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  orgId: string;
  isFavorite: boolean;
  type?: string;
}

const BoardCard = ({
  id,
  title,
  authorId,
  authorName,
  createdAt,
  orgId,
  isFavorite,
  type = "board",
}: BoardCardProps) => {
  const { userId } = useAuth();
  const authorLabel = userId === authorId ? "You" : authorName;
  const createdLabel = formatDistanceToNow(createdAt, { addSuffix: true });

  const { mutate: onFavorite, pending: pendingFavorite } = useApiMutation(
    api.board.favorite
  );
  const { mutate: onUnfavorite, pending: pendingUnfavorite } = useApiMutation(
    api.board.unfavorite
  );

  const toggleFavorite = () => {
    if (isFavorite) {
      onUnfavorite({ id }).catch(() => {
        toast.error("Failed to unfavorite");
      });
    } else {
      onFavorite({ id, orgId }).catch(() => {
        toast.error("Failed to favorite");
      });
    }
  };

  const href = type === "document" ? `/document/${id}` : type === "uml" ? `/uml/${id}` : type === "spreadsheet" ? `/spreadsheet/${id}` : `/board/${id}`;

  return (
    <Link href={href}>
      <div className="group aspect-[100/120] border border-zinc-300/50 dark:border-white/20 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-lg flex flex-col justify-between overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02]">
        <div className="relative flex-1 bg-transparent overflow-hidden">
          {type === "document" ? (
            // Document Icon View (Blue Theme)
            <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50/50 to-blue-100/50 dark:from-blue-950/30 dark:to-indigo-900/30 transition-all group-hover:scale-110 duration-500">
              <FileText className="h-16 w-16 text-indigo-500/80 dark:text-indigo-400/80 drop-shadow-sm" strokeWidth={1.5} />
            </div>
          ) : type === "uml" ? (
            // UML Icon View (Purple Theme)
            <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-fuchsia-50/50 to-purple-100/50 dark:from-purple-950/30 dark:to-fuchsia-900/30 transition-all group-hover:scale-110 duration-500">
              <Network className="h-16 w-16 text-purple-500/80 dark:text-purple-400/80 drop-shadow-sm" strokeWidth={1.5} />
            </div>
          ) : type === "spreadsheet" ? (
            // Spreadsheet Icon View (Emerald/Green Theme)
            <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50/50 to-teal-100/50 dark:from-emerald-950/30 dark:to-teal-900/30 transition-all group-hover:scale-110 duration-500">
              <Table className="h-16 w-16 text-emerald-500/80 dark:text-emerald-400/80 drop-shadow-sm" strokeWidth={1.5} />
            </div>
          ) : (
            // Board Icon View (Amber/Orange Theme)
            <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50/50 to-orange-100/50 dark:from-amber-950/30 dark:to-orange-900/30 transition-all group-hover:scale-110 duration-500">
              <LayoutTemplate className="h-16 w-16 text-amber-600/80 dark:text-amber-500/80 drop-shadow-sm" strokeWidth={1.5} />
            </div>
          )}
          
          <Overlay />
          
          <Actions id={id} title={title} type={type} side="right">
            <button className="absolute z-50 top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="text-black dark:text-white drop-shadow-md" />
            </button>
          </Actions>
        </div>
        
        <Footer
          isFavorite={isFavorite}
          title={title}
          authorLabel={authorLabel}
          createdLabel={createdLabel}
          onClick={toggleFavorite}
          disabled={pendingFavorite || pendingUnfavorite}
          type={type}
        />
      </div>
    </Link>
  );
};

BoardCard.Skeleton = function BoardCardSkeleton() {
  return (
    <div className="group aspect-[100/120] rounded-lg overflow-hidden border border-zinc-300/50 dark:border-white/20 bg-white/20 backdrop-blur-sm">
      <Skeleton className="w-full h-full bg-white/40 dark:bg-white/10" />
    </div>
  );
};

export default BoardCard;