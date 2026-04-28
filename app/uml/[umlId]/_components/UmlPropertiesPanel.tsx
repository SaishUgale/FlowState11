import { useState, useEffect } from "react";
import { useMutation } from "@liveblocks/react/suspense";
import { Node, Edge } from "reactflow";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Layers, ArrowUp, ArrowDown, Type, Palette, Move } from "lucide-react";

interface UmlPropertiesPanelProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
}

export const UmlPropertiesPanel = ({ selectedNode, selectedEdge }: UmlPropertiesPanelProps) => {
  const [label, setLabel] = useState("");
  const [color, setColor] = useState("#ffffff");
  
  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data?.label || "");
      setColor(selectedNode.data?.color || "#ffffff");
    } else if (selectedEdge) {
      setLabel(selectedEdge.data?.label || "");
      setColor(selectedEdge.data?.color || "#000000");
    }
  }, [selectedNode, selectedEdge]);

  const updateNode = useMutation(({ storage }, id: string, updates: any) => {
    const node = storage.get("nodes").get(id);
    if (node) node.update(updates);
  }, []);

  const updateEdge = useMutation(({ storage }, id: string, updates: any) => {
    const edge = storage.get("edges").get(id);
    if (edge) edge.update(updates);
  }, []);

  if (!selectedNode && !selectedEdge) return null;

  return (
    <div className="absolute right-4 top-24 bottom-4 w-72 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl z-50 p-5 flex flex-col gap-6 overflow-y-auto hidden-scrollbar">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
          {selectedNode ? <Layers size={18} /> : <Move size={18} />}
        </div>
        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
          {selectedNode ? "Node Properties" : "Edge Properties"}
        </h3>
      </div>

      <Separator className="opacity-50" />

      {/* Label Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          <Type size={14} /> Basic Info
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-zinc-500">Label</Label>
          <Input 
            className="h-9 text-sm focus-visible:ring-blue-500"
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              if (selectedNode) updateNode(selectedNode.id, { label: e.target.value });
              if (selectedEdge) updateEdge(selectedEdge.id, { label: e.target.value });
            }}
          />
        </div>
        {selectedNode?.data?.type === "class" && (
          <div className="space-y-1.5">
            <Label className="text-[11px] text-zinc-500">Stereotype</Label>
            <Input 
              className="h-9 text-sm italic"
              placeholder="<<interface>>"
              value={selectedNode.data?.stereotype || ""}
              onChange={(e) => updateNode(selectedNode.id, { stereotype: e.target.value })}
            />
          </div>
        )}
      </div>

      {/* Style Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          <Palette size={14} /> Appearance
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-zinc-500">Color</Label>
            <div className="flex items-center gap-2 p-1 border rounded-md dark:border-zinc-800">
              <input 
                type="color" 
                className="w-8 h-8 rounded border-0 cursor-pointer p-0 bg-transparent"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  if (selectedNode) updateNode(selectedNode.id, { color: e.target.value });
                  if (selectedEdge) updateEdge(selectedEdge.id, { color: e.target.value });
                }}
              />
              <span className="text-[10px] font-mono text-zinc-400">{color.toUpperCase()}</span>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-[11px] text-zinc-500">Text Color</Label>
            <div className="flex items-center gap-2 p-1 border rounded-md dark:border-zinc-800">
              <input 
                type="color" 
                className="w-8 h-8 rounded border-0 cursor-pointer p-0 bg-transparent"
                value={selectedNode?.data?.textColor || selectedEdge?.data?.color || "#000000"}
                onChange={(e) => {
                  if (selectedNode) updateNode(selectedNode.id, { textColor: e.target.value });
                  if (selectedEdge) updateEdge(selectedEdge.id, { color: e.target.value });
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-zinc-500">Font Size</Label>
            <Input 
              type="number"
              className="h-9 text-sm"
              value={selectedNode?.data?.fontSize || selectedEdge?.data?.fontSize || 14}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (selectedNode) updateNode(selectedNode.id, { fontSize: val });
                if (selectedEdge) updateEdge(selectedEdge.id, { fontSize: val });
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-zinc-500">Opacity</Label>
            <Input 
              type="number"
              step="0.1"
              min="0"
              max="1"
              className="h-9 text-sm"
              value={selectedNode?.data?.opacity || selectedEdge?.data?.opacity || 1}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (selectedNode) updateNode(selectedNode.id, { opacity: val });
                if (selectedEdge) updateEdge(selectedEdge.id, { opacity: val });
              }}
            />
          </div>
        </div>
      </div>

      {/* Class specific: Attributes & Methods */}
      {selectedNode?.data?.type === "class" && (
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-zinc-500 font-semibold uppercase">Attributes</Label>
            <textarea
              className="w-full text-sm p-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px] resize-none"
              value={(selectedNode.data?.attributes || []).join("\n")}
              onChange={(e) => updateNode(selectedNode.id, { attributes: e.target.value.split("\n") })}
              placeholder="+ attr: type"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-zinc-500 font-semibold uppercase">Methods</Label>
            <textarea
              className="w-full text-sm p-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px] resize-none"
              value={(selectedNode.data?.methods || []).join("\n")}
              onChange={(e) => updateNode(selectedNode.id, { methods: e.target.value.split("\n") })}
              placeholder="+ method()"
            />
          </div>
        </div>
      )}

      {/* Edge specific styles */}
      {selectedEdge && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-zinc-500">Line Style</Label>
            <select 
              className="w-full h-9 text-sm px-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 outline-none focus:ring-1 focus:ring-blue-500"
              value={selectedEdge.data?.strokeStyle || "solid"}
              onChange={(e) => updateEdge(selectedEdge.id, { strokeStyle: e.target.value })}
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] text-zinc-500">Target Arrow</Label>
              <select 
                className="w-full h-9 text-sm px-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 outline-none"
                value={selectedEdge.data?.targetArrow || "none"}
                onChange={(e) => updateEdge(selectedEdge.id, { targetArrow: e.target.value })}
              >
                <option value="none">None</option>
                <option value="arrow">Arrow</option>
                <option value="hollow">Hollow</option>
                <option value="diamond">Diamond</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  checked={!!selectedEdge.data?.animated}
                  onChange={(e) => updateEdge(selectedEdge.id, { animated: e.target.checked })}
                />
                <span className="text-xs font-medium text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">Animated</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
