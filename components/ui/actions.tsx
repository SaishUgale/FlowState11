"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Link2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; // Import useRouter
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdownMenu";
import { ConfirmModal } from "./confirm-modal";
import { Button } from "./button";
import { useRenameModal } from "@/store/useRenameModal";

interface ActionsProps {
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  id: string;
  title: string;
  type?: string;
}

export const Actions = ({
  children,
  side,
  sideOffset,
  id,
  title,
  type = "board",
}: ActionsProps) => {
  const router = useRouter(); // Initialize router
  const { onOpen } = useRenameModal();
  const [pending, setPending] = useState(false);
  const remove = useMutation(api.board.deleteById);

  const onCopyLink = () => {
    const route = type === "document" ? "document" : type === "uml" ? "uml" : type === "spreadsheet" ? "spreadsheet" : "board";
    navigator.clipboard
      .writeText(`${window.location.origin}/${route}/${id}`)
      .then(() => toast.success("Link copied"))
      .catch(() => toast.error("Failed to copy link"));
  };

  const onDelete = async () => {
    setPending(true);
    try {
      await remove({ id: id as any });
      toast.success("Board deleted");
      
      // Check if we are currently viewing the board being deleted
      // If the current URL contains the board ID, redirect to home
      if (window.location.href.includes(id)) {
        router.push("/");
      }
    } catch (error) {
      toast.error("Failed to delete board");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {children}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          onClick={(e) => e.stopPropagation()}
          side={side}
          sideOffset={sideOffset}
          className="w-60 dark:bg-gray-500 border-none"
        >
          <DropdownMenuItem 
            onClick={onCopyLink} 
            className="p-3 cursor-pointer"
          >
            <Link2 className="h-4 w-4 mr-2" />
            Copy Board Link
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => onOpen(id, title)} 
            className="p-3 cursor-pointer"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Rename
          </DropdownMenuItem>

          <ConfirmModal
            header="Delete board?"
            description="This will delete the board and all of its contents."
            disabled={pending}
            onConfirm={onDelete}
          >
            <Button
              variant="ghost"
              disabled={pending}
              className="w-full p-3 cursor-pointer text-sm justify-start font-normal text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </ConfirmModal>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};