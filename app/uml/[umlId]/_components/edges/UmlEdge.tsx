import { EdgeProps, getBezierPath, getStraightPath, getSmoothStepPath, BaseEdge, EdgeLabelRenderer } from "reactflow";
import { UmlEdgeData } from "@/liveblocks.config";

export const UmlEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style,
  selected,
}: EdgeProps<UmlEdgeData>) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const { type, label, strokeStyle, color, animated, sourceArrow, targetArrow } = data || {};

  const edgeStyle = {
    ...style,
    stroke: selected ? "#3b82f6" : color || "#000000",
    strokeWidth: selected ? 2 : 1,
    strokeDasharray: strokeStyle === "dashed" ? "5 5" : strokeStyle === "dotted" ? "2 2" : "none",
  };

  // We map the targetArrow correctly to SVG markers which we will define in the Canvas
  const markerEndId = targetArrow !== "none" ? `url(#${targetArrow})` : markerEnd;
  const markerStartId = sourceArrow !== "none" ? `url(#${sourceArrow}-start)` : undefined;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEndId}
        markerStart={markerStartId}
        style={edgeStyle}
        className={animated ? "react-flow__edge-path animate-pulse" : "react-flow__edge-path"}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            className="absolute bg-white dark:bg-zinc-800 px-2 py-1 rounded shadow-sm text-xs border border-zinc-200 dark:border-zinc-700 nodrag nopan"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
