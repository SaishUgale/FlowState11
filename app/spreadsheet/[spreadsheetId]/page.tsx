import { Room } from "@/components/Room";
import { SpreadsheetEditor } from "./_components/SpreadsheetEditor";
import { SpreadsheetLoading } from "./_components/SpreadsheetLoading";

interface SpreadsheetPageProps {
  params: Promise<{
    spreadsheetId: string;
  }>;
}

import { LiveMap, LiveObject, LiveList } from "@liveblocks/client";

export default async function SpreadsheetPage({ params }: SpreadsheetPageProps) {
  const { spreadsheetId } = await params;
  return (
    <Room 
      roomId={spreadsheetId} 
      fallback={<SpreadsheetLoading />}
      initialPresence={{
        cursor: null,
        selection: null,
        name: "",
        avatar: "",
        color: "",
        isEditing: false,
      }}
      initialStorage={{
        sheets: new LiveMap(),
        sheetOrder: new LiveList(["Sheet1"]),
        activeSheetId: "Sheet1",
        namedRanges: new LiveMap(),
      }}
    >
      <SpreadsheetEditor spreadsheetId={spreadsheetId} />
    </Room>
  );
}
