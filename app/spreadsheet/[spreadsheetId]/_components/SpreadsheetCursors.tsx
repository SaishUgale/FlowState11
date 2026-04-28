import { useOthers } from "@liveblocks/react/suspense";

const COLORS = [
  "#E57373", "#9575CD", "#4FC3F7", "#81C784", "#FFF176", "#FF8A65", "#F06292", "#7986CB"
];

export const SpreadsheetCursors = ({ 
  colVirtualizer, 
  rowVirtualizer, 
  scrollElement 
}: { 
  colVirtualizer: any, 
  rowVirtualizer: any,
  scrollElement: HTMLElement | null
}) => {
  const others = useOthers();

  if (!scrollElement) return null;

  return (
    <>
      {others.map((other) => {
        if (!other.presence || !other.presence.cursor) return null;
        
        const { row, col } = other.presence.cursor;
        const color = other.presence.color || COLORS[other.connectionId % COLORS.length];
        
        // Find virtual items for row and col
        const virtualRow = rowVirtualizer.getVirtualItems().find((vr: any) => vr.index === row);
        const virtualCol = colVirtualizer.getVirtualItems().find((vc: any) => vc.index === parseInt(col));
        
        if (!virtualRow || !virtualCol) return null;

        return (
          <div
            key={other.connectionId}
            className="absolute border-2 pointer-events-none z-30 transition-all duration-100 ease-out"
            style={{
              top: virtualRow.start + 32,
              left: virtualCol.start + 40,
              width: virtualCol.size,
              height: virtualRow.size,
              borderColor: color,
            }}
          >
            <div 
              className="absolute -top-5 -right-1 px-2 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap shadow-sm"
              style={{ backgroundColor: color }}
            >
              {other.info?.name || other.presence.name || `User ${other.connectionId}`}
            </div>
          </div>
        );
      })}
    </>
  );
};
