import { createClient } from "@liveblocks/client";
import { LiveList, LiveMap, LiveObject } from "@liveblocks/client";
import { Layer, Color } from "@/types/canvas";

const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
  throttle: 16,
});

export type Presence = {
  cursor: { x: number; y: number } | null;
  selection: string[];
  pencilDraft: [x: number, y: number, pressure: number][] | null;
  penColor: Color | null;
};

export type Storage = {
  layers: LiveMap<string, LiveObject<Layer>>;
  layerIds: LiveList<string>;
  
  // UML
  nodes?: LiveMap<string, LiveObject<UmlNodeData>>;
  edges?: LiveMap<string, LiveObject<UmlEdgeData>>;
  canvasSettings?: LiveObject<{
    background: "dots" | "lines" | "cross" | "none";
    snapToGrid: boolean;
    gridSize: number;
    zoom: number;
    panX: number;
    panY: number;
    diagramType: "class" | "sequence" | "usecase" | "er" | "flowchart" | "free";
    title: string;
  }>;

  // Spreadsheet
  sheets?: LiveMap<string, LiveObject<SheetData>>;
  sheetOrder?: LiveList<string>;
  activeSheetId?: string;
  namedRanges?: LiveMap<string, string>;
};

export type UserMeta = {
  id: string;
  info: {
    name?: string;
    picture?: string;
    isAdmin?: boolean;
  };
};

export type UmlNodeData = {
  type: "class" | "actor" | "useCase" | "note" | "decision" | "database"
       | "component" | "package" | "lifeline" | "activationBar" | "shape";
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  borderColor: string;
  textColor: string;
  fontSize: number;
  attributes?: string[];
  methods?: string[];
  stereotype?: string;
  shape?: "rectangle" | "ellipse" | "diamond" | "triangle" | "cylinder";
  opacity?: number;
  locked?: boolean;
};

export type UmlEdgeData = {
  source: string;
  target: string;
  type: "association" | "dependency" | "inheritance" | "composition"
       | "aggregation" | "realization" | "message" | "custom";
  label?: string;
  labelX?: number;
  labelY?: number;
  sourceArrow?: "none" | "arrow" | "diamond" | "openDiamond";
  targetArrow?: "none" | "arrow" | "hollow" | "diamond" | "openDiamond";
  strokeStyle?: "solid" | "dashed" | "dotted";
  color?: string;
  animated?: boolean;
};

export type UmlPresence = {
  cursor: { x: number; y: number } | null;
  selectedNodeIds: string[];
  name: string;
  avatar: string;
  color: string;
};

export type UmlStorage = {
  nodes: LiveMap<string, LiveObject<UmlNodeData>>;
  edges: LiveMap<string, LiveObject<UmlEdgeData>>;
  canvasSettings: LiveObject<{
    background: "dots" | "lines" | "cross" | "none";
    snapToGrid: boolean;
    gridSize: number;
    zoom: number;
    panX: number;
    panY: number;
    diagramType: "class" | "sequence" | "usecase" | "er" | "flowchart" | "free";
    title: string;
  }>;
};

export type CellData = {
  value: string;
  computed?: string;
  format: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    fontSize: number;
    fontFamily: string;
    color: string;
    backgroundColor: string;
    align: "left" | "center" | "right";
    verticalAlign: "top" | "middle" | "bottom";
    wrapText: boolean;
    numberFormat: "general" | "number" | "currency" | "percentage" | "date" | "time";
    decimalPlaces: number;
  };
  comment?: string;
  locked?: boolean;
  merged?: {
    isMaster: boolean;
    masterRow: number;
    masterCol: number;
    rowSpan: number;
    colSpan: number;
  };
};

export type SheetData = {
  name: string;
  cells: LiveMap<string, LiveObject<CellData>>;
  columnWidths: LiveMap<string, number>;
  rowHeights: LiveMap<string, number>;
  frozenRows: number;
  frozenCols: number;
  hiddenRows: LiveList<number>;
  hiddenCols: LiveList<string>;
};

export type SpreadsheetStorage = {
  sheets: LiveMap<string, LiveObject<SheetData>>;
  sheetOrder: LiveList<string>;
  activeSheetId: string;
  namedRanges: LiveMap<string, string>;
};

export type SpreadsheetPresence = {
  cursor: { row: number; col: string } | null;
  selection: {
    startRow: number; startCol: string;
    endRow: number; endCol: string;
  } | null;
  name: string;
  avatar: string;
  color: string;
  isEditing: boolean;
};

export { client };