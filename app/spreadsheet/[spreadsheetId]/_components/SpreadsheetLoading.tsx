import { Loader2 } from "lucide-react";

export const SpreadsheetLoading = () => {
  return (
    <div className="h-full w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
    </div>
  );
};
