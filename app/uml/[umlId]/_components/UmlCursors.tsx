import { useOthers } from "@liveblocks/react/suspense";
import { memo } from "react";
import { MousePointer2 } from "lucide-react";
import { useReactFlow } from "reactflow";

const COLORS = [
  "#E57373", "#9575CD", "#4FC3F7", "#81C784", "#FFF176", "#FF8A65", "#F06292", "#7986CB"
];

const Cursor = memo(({ x, y, color, name }: { x: number, y: number, color: string, name: string }) => {
  return (
    <div
      className="pointer-events-none absolute top-0 left-0 z-50 transition-transform duration-100 ease-out"
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      <MousePointer2
        className="h-5 w-5"
        style={{ fill: color, color: color }}
      />
      <div
        className="absolute left-5 top-5 rounded-md px-1.5 py-0.5 text-xs text-white font-semibold whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </div>
  );
});
Cursor.displayName = "Cursor";

export const UmlCursors = () => {
  const others = useOthers();
  const { project } = useReactFlow();

  return (
    <>
      {others.map((other) => {
        if (!other.presence || !other.presence.cursor) return null;
        
        // Convert screen coordinates to canvas coordinates
        const { x, y } = other.presence.cursor;
        
        return (
          <Cursor
            key={other.connectionId}
            x={x}
            y={y}
            color={other.presence.color || COLORS[other.connectionId % COLORS.length]}
            name={other.info?.name || other.presence.name || `User ${other.connectionId}`}
          />
        );
      })}
    </>
  );
};
