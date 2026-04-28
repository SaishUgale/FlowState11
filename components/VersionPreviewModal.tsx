import { useEffect, useState, useMemo } from "react";
import { X, Loader2, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

// UML Node Types for Preview
import { ClassNode } from "@/app/uml/[umlId]/_components/nodes/ClassNode";
import { ActorNode } from "@/app/uml/[umlId]/_components/nodes/ActorNode";
import { UseCaseNode } from "@/app/uml/[umlId]/_components/nodes/UseCaseNode";
import { NoteNode } from "@/app/uml/[umlId]/_components/nodes/NoteNode";
import { DecisionNode } from "@/app/uml/[umlId]/_components/nodes/DecisionNode";
import { DatabaseNode } from "@/app/uml/[umlId]/_components/nodes/DatabaseNode";
import { ComponentNode } from "@/app/uml/[umlId]/_components/nodes/ComponentNode";
import { PackageNode } from "@/app/uml/[umlId]/_components/nodes/PackageNode";
import { LifelineNode } from "@/app/uml/[umlId]/_components/nodes/LifelineNode";
import { ActivationBarNode } from "@/app/uml/[umlId]/_components/nodes/ActivationBarNode";
import { GenericShapeNode } from "@/app/uml/[umlId]/_components/nodes/GenericShapeNode";

const nodeTypes = {
  class: ClassNode,
  actor: ActorNode,
  useCase: UseCaseNode,
  note: NoteNode,
  decision: DecisionNode,
  database: DatabaseNode,
  component: ComponentNode,
  package: PackageNode,
  lifeline: LifelineNode,
  activationBar: ActivationBarNode,
  shape: GenericShapeNode,
};

interface Version {
  id: string;
  createdAt: string;
  name?: string;
}

interface VersionPreviewModalProps {
  roomId: string;
  roomType: "document" | "uml" | "spreadsheet";
  version: Version;
  onClose: () => void;
  onRestore?: () => void;
}

export const VersionPreviewModal = ({ roomId, roomType, version, onClose, onRestore }: VersionPreviewModalProps) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/liveblocks-versions/preview?roomId=${roomId}&versionId=${version.id}`);
        if (res.ok) {
          const snapshot = await res.json();
          setData(snapshot);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPreview();
  }, [roomId, version.id]);

  const umlNodes = useMemo(() => {
    if (roomType !== "uml" || !data?.nodes) return [];
    return Object.entries(data.nodes).map(([id, node]: [string, any]) => ({
      id,
      type: node.type || "class",
      position: { x: node.x || 0, y: node.y || 0 },
      data: { ...node },
    }));
  }, [data, roomType]);

  const umlEdges = useMemo(() => {
    if (roomType !== "uml" || !data?.edges) return [];
    return Object.entries(data.edges).map(([id, edge]: [string, any]) => ({
      id,
      ...edge,
    }));
  }, [data, roomType]);

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-zinc-950 flex flex-col animate-in fade-in duration-300">
      <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg">{version.name || "Auto-saved Version"}</h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">Preview</span>
            </div>
            <p className="text-xs text-zinc-500 font-medium">{new Date(version.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
          {onRestore && (
            <Button onClick={onRestore} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg shadow-blue-500/20">
              <RotateCcw className="h-4 w-4" /> Restore This Version
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-zinc-50 dark:bg-zinc-900/50">
        {loading ? (
          <div className="flex h-full items-center justify-center flex-col gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="text-sm font-medium text-zinc-400">Loading snapshot...</p>
          </div>
        ) : (
          <div className="h-full w-full">
            {roomType === "document" && (
              <div className="h-full overflow-auto p-12">
                <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-12 min-h-[1000px]">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-xs font-mono text-zinc-400 mb-8 border-b pb-4">DOCUMENT_SNAPSHOT_V1</p>
                    <pre className="text-xs bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-100 dark:border-zinc-800 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
                  </div>
                </div>
              </div>
            )}
            
            {roomType === "uml" && (
              <div className="h-full w-full relative">
                <ReactFlow
                  nodes={umlNodes}
                  edges={umlEdges}
                  nodeTypes={nodeTypes}
                  fitView
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable={false}
                  panOnDrag={true}
                >
                  <Background color="#94a3b8" gap={20} />
                  <Controls />
                </ReactFlow>
                <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg text-[10px] font-bold text-zinc-500 uppercase tracking-widest z-10">
                  Read Only Preview
                </div>
              </div>
            )}
            
            {roomType === "spreadsheet" && (
              <div className="h-full overflow-auto p-8">
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col h-full">
                  <div className="h-10 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Sheet Snapshot</span>
                  </div>
                  <div className="flex-1 overflow-auto p-4">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="w-10 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 h-8" />
                          {Array.from({ length: 10 }).map((_, i) => (
                            <th key={i} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold text-zinc-500 w-32 h-8">
                              {String.fromCharCode(65 + i)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 20 }).map((_, r) => (
                          <tr key={r}>
                            <td className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold text-zinc-500 text-center h-7">
                              {r + 1}
                            </td>
                            {Array.from({ length: 10 }).map((_, c) => {
                              const cellId = `${r},${c}`;
                              const cell = data?.sheets?.[Object.keys(data?.sheets || {})[0]]?.cells?.[cellId];
                              return (
                                <td key={c} className="border border-zinc-200 dark:border-zinc-800 p-1 h-7 text-xs overflow-hidden truncate max-w-[128px]">
                                  {cell?.value || ""}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-8 text-center">
                      <p className="text-xs text-zinc-400 font-medium italic">Showing first 20 rows and 10 columns of snapshot</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
