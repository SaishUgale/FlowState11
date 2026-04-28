import { Room } from "@/components/Room";
import { UmlCanvas } from "./_components/UmlCanvas";
import { UmlLoading } from "./_components/UmlLoading";

interface UmlPageProps {
  params: Promise<{
    umlId: string;
  }>;
}

import { LiveMap, LiveObject } from "@liveblocks/client";

export default async function UmlPage({ params }: UmlPageProps) {
  const { umlId } = await params;
  return (
    <Room 
      roomId={umlId} 
      fallback={<UmlLoading />}
      initialPresence={{
        cursor: null,
        selectedNodeIds: [],
        name: "",
        avatar: "",
        color: "",
      }}
      initialStorage={{
        nodes: new LiveMap(),
        edges: new LiveMap(),
      }}
    >
      <UmlCanvas umlId={umlId} />
    </Room>
  );
}
