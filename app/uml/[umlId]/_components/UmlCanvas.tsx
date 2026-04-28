"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Connection,
  ReactFlowInstance,
  OnSelectionChangeParams,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { useStorage, useMutation, useSelf, useOthers, useUpdateMyPresence } from "@liveblocks/react/suspense";
import { LiveObject, LiveMap } from "@liveblocks/client";
import { nanoid } from "nanoid";

import { UmlTopBar } from "./UmlTopBar";
import { UmlToolbar } from "./UmlToolbar";
import { UmlCursors } from "./UmlCursors";
import { UmlContextMenu } from "./UmlContextMenu";
import { UmlPropertiesPanel } from "./UmlPropertiesPanel";
import { UmlNodeData, UmlEdgeData } from "@/liveblocks.config";

import { ClassNode } from "./nodes/ClassNode";
import { ActorNode } from "./nodes/ActorNode";
import { UseCaseNode } from "./nodes/UseCaseNode";
import { NoteNode } from "./nodes/NoteNode";
import { DecisionNode } from "./nodes/DecisionNode";
import { DatabaseNode } from "./nodes/DatabaseNode";
import { ComponentNode } from "./nodes/ComponentNode";
import { PackageNode } from "./nodes/PackageNode";
import { LifelineNode } from "./nodes/LifelineNode";
import { ActivationBarNode } from "./nodes/ActivationBarNode";
import { GenericShapeNode } from "./nodes/GenericShapeNode";
import { UmlEdge } from "./edges/UmlEdge";

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
const edgeTypes = { umlEdge: UmlEdge };

const UmlCanvasContent = ({ umlId }: { umlId: string }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  const [menu, setMenu] = useState<{ id: string, top: number, left: number, type: "node" | "edge" } | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  const liveNodes = useStorage((root) => root.nodes);
  const liveEdges = useStorage((root) => root.edges);

  // Derive local state from Liveblocks
  const nodes: Node[] = Array.from(liveNodes?.entries() || []).map(([id, node]: any) => ({
    id,
    type: node.type || "class",
    position: { x: node.x, y: node.y },
    data: { id, ...node },
  }));

  const edges: Edge[] = Array.from(liveEdges?.entries() || []).map(([id, edge]: any) => ({
    id,
    type: "umlEdge",
    source: edge.source,
    target: edge.target,
    data: { id, ...edge },
  }));

  // Sync node changes back to Liveblocks
  const onNodesChange = useMutation(({ storage }, changes: NodeChange[]) => {
    let nodesMap = storage.get("nodes");
    if (!nodesMap || typeof nodesMap.get !== "function") {
      storage.set("nodes", new LiveMap());
      nodesMap = storage.get("nodes");
    }
    if (!nodesMap) return;
    changes.forEach((change) => {
      if (change.type === "position" && change.position) {
        const node = nodesMap.get(change.id);
        if (node) {
          node.update({ x: change.position.x, y: change.position.y });
        }
      } else if (change.type === "remove") {
        nodesMap.delete(change.id);
      }
    });
  }, []);

  const onEdgesChange = useMutation(({ storage }, changes: EdgeChange[]) => {
    let edgesMap = storage.get("edges");
    if (!edgesMap || typeof edgesMap.delete !== "function") {
      storage.set("edges", new LiveMap());
      edgesMap = storage.get("edges");
    }
    if (!edgesMap) return;
    changes.forEach((change) => {
      if (change.type === "remove") {
        edgesMap.delete(change.id);
      }
    });
  }, []);

  const onConnect = useMutation(({ storage }, connection: Connection) => {
    let edgesMap = storage.get("edges");
    if (!edgesMap || typeof edgesMap.set !== "function") {
      storage.set("edges", new LiveMap());
      edgesMap = storage.get("edges");
    }
    if (!edgesMap) return;
    const id = nanoid();
    edgesMap.set(id, new LiveObject<UmlEdgeData>({
      source: connection.source!,
      target: connection.target!,
      type: "association",
    }));
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useMutation(({ storage }, event: React.DragEvent) => {
    event.preventDefault();

    const type = event.dataTransfer.getData("application/reactflow");
    const dataStr = event.dataTransfer.getData("application/reactflow-data");

    if (!type || !reactFlowInstance || !reactFlowWrapper.current) return;

    const data = dataStr ? JSON.parse(dataStr) : {};
    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const id = nanoid();
    let nodesMap = storage.get("nodes");
    if (!nodesMap || typeof nodesMap.set !== "function") {
      storage.set("nodes", new LiveMap());
      nodesMap = storage.get("nodes");
    }
    if (!nodesMap) return;

    nodesMap.set(id, new LiveObject<UmlNodeData>({
      ...data,
      x: position.x,
      y: position.y,
    }));
  }, [reactFlowInstance]);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setMenu({ id: node.id, top: event.clientY, left: event.clientX, type: "node" });
    },
    [setMenu]
  );

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      setMenu({ id: edge.id, top: event.clientY, left: event.clientX, type: "edge" });
    },
    [setMenu]
  );

  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  const handleDeleteContextMenu = useMutation(({ storage }, id: string, type: "node" | "edge") => {
    if (type === "node") {
      const map = storage.get("nodes");
      if (map && typeof map.delete === "function") map.delete(id);
    } else {
      const map = storage.get("edges");
      if (map && typeof map.delete === "function") map.delete(id);
    }
  }, []);

  const updateMyPresence = useUpdateMyPresence();

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!reactFlowInstance) return;
    const position = reactFlowInstance.screenToFlowPosition({
      x: e.clientX,
      y: e.clientY,
    });
    updateMyPresence({ cursor: position });
  }, [reactFlowInstance, updateMyPresence]);

  const onPointerLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    setSelectedNode(params.nodes.length > 0 ? params.nodes[0] : null);
    setSelectedEdge(params.edges.length > 0 ? params.edges[0] : null);
  }, []);

  return (
    <div 
      className="h-screen w-full relative bg-zinc-50 dark:bg-zinc-900" 
      ref={reactFlowWrapper}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <UmlTopBar umlId={umlId} />
      <UmlToolbar />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange as any}
        onEdgesChange={onEdgesChange as any}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneClick={onPaneClick}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <UmlCursors />
        <Background gap={16} />
        <Controls className="!mb-6 !mr-6" />
        <MiniMap className="!mb-6 !mr-16 rounded-xl border border-zinc-200 dark:border-zinc-800" />
      </ReactFlow>
      
      {menu && (
        <UmlContextMenu 
          x={menu.left} 
          y={menu.top} 
          onClose={() => setMenu(null)} 
          onDelete={() => handleDeleteContextMenu(menu.id, menu.type)} 
        />
      )}
      
      <UmlPropertiesPanel selectedNode={selectedNode} selectedEdge={selectedEdge} />
    </div>
  );
};

export const UmlCanvas = ({ umlId }: { umlId: string }) => {
  return (
    <ReactFlowProvider>
      <UmlCanvasContent umlId={umlId} />
    </ReactFlowProvider>
  );
};
