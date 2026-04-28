import { Database, User, Package, Component, StickyNote, BoxSelect, Maximize2, Share2, Workflow } from "lucide-react";
import { UmlNodeData } from "@/liveblocks.config";

export const UmlToolbar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string, defaultData: Partial<UmlNodeData>) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.setData("application/reactflow-data", JSON.stringify(defaultData));
    event.dataTransfer.effectAllowed = "move";
  };

  const NodeItem = ({ type, data, icon: Icon, label }: { type: string, data: Partial<UmlNodeData>, icon: any, label: string }) => (
    <div 
      className="flex flex-col items-center justify-center p-3 gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-grab hover:border-blue-500 hover:text-blue-500 transition-colors shadow-sm"
      draggable
      onDragStart={(e) => onDragStart(e, type, data)}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );

  return (
    <div className="absolute left-4 top-24 bottom-4 w-32 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-white/10 rounded-xl shadow-lg z-50 flex flex-col py-4 overflow-y-auto hidden-scrollbar select-none">
      <div className="flex flex-col gap-6 px-3">
        {/* Basic Shapes */}
        <section>
          <h3 className="text-[10px] font-bold text-zinc-400 mb-3 uppercase tracking-widest px-1">Shapes</h3>
          <div className="grid grid-cols-2 gap-2">
            <NodeItem type="shape" label="Rect" icon={BoxSelect} data={{ type: "shape", shape: "rectangle", label: "" }} />
            <NodeItem type="shape" label="Circle" icon={Workflow} data={{ type: "shape", shape: "ellipse", label: "" }} />
            <NodeItem type="decision" label="Diamond" icon={Maximize2} data={{ type: "decision", label: "" }} />
            <NodeItem type="database" label="DB" icon={Database} data={{ type: "database", label: "DB" }} />
          </div>
        </section>

        {/* UML Class */}
        <section>
          <h3 className="text-[10px] font-bold text-zinc-400 mb-3 uppercase tracking-widest px-1">UML Class</h3>
          <div className="flex flex-col gap-2">
            <NodeItem type="class" label="Class" icon={BoxSelect} data={{ type: "class", label: "ClassName", attributes: ["+ attr: type"], methods: ["+ method()"] }} />
            <NodeItem type="package" label="Package" icon={Package} data={{ type: "package", label: "Package" }} />
          </div>
        </section>

        {/* UML Behavior */}
        <section>
          <h3 className="text-[10px] font-bold text-zinc-400 mb-3 uppercase tracking-widest px-1">Behavior</h3>
          <div className="grid grid-cols-2 gap-2">
            <NodeItem type="actor" label="Actor" icon={User} data={{ type: "actor", label: "Actor" }} />
            <NodeItem type="useCase" label="Use Case" icon={Workflow} data={{ type: "useCase", label: "Use Case" }} />
            <NodeItem type="note" label="Note" icon={StickyNote} data={{ type: "note", label: "Note", color: "#fef3c7" }} />
            <NodeItem type="component" label="Comp" icon={Component} data={{ type: "component", label: "Component" }} />
          </div>
        </section>

        {/* UML Sequence */}
        <section>
          <h3 className="text-[10px] font-bold text-zinc-400 mb-3 uppercase tracking-widest px-1">Sequence</h3>
          <div className="flex flex-col gap-2">
            <NodeItem type="lifeline" label="Lifeline" icon={Share2} data={{ type: "lifeline", label: "Object", height: 300 }} />
            <NodeItem type="activationBar" label="Activation" icon={Maximize2} data={{ type: "activationBar", label: "", width: 16, height: 100 }} />
          </div>
        </section>
      </div>
    </div>
  );
};
