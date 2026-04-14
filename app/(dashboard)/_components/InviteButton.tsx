"use client";

import { UserPlus } from "lucide-react";
import { OrganizationProfile } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const InviteButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative group">
          {/* Circular Button */}
          <Button 
            variant="outline"
            className={cn(
              "h-8 w-8 rounded-full p-0 flex items-center justify-center transition-all duration-300",
              // Glass/Gradient Style
              "bg-indigo-600/10 border border-indigo-500/20 text-indigo-600",
              "hover:bg-indigo-600 hover:text-white hover:border-indigo-600",
              // Shadow Effects
              "hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]",
              // Dark mode adjustments
              "dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-400/30",
              "dark:hover:bg-indigo-500 dark:hover:text-white dark:hover:border-indigo-500"
            )}
          >
            <UserPlus className="h-5 w-5" />
          </Button>

          {/* Floating Label (Tooltip) */}
          <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-[10px] font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap backdrop-blur-sm z-50">
            Invite members
          </span>
        </div>
      </DialogTrigger>
      <DialogContent className="p-0 bg-transparent border-none max-w-[880px]">
        <DialogTitle className="sr-only">Invite Members</DialogTitle>
        <OrganizationProfile routing="hash" />
      </DialogContent>
    </Dialog>
  );
};