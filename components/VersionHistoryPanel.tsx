"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSelf } from "@liveblocks/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { VersionPreviewModal } from "./VersionPreviewModal";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface Version {
  id: string;
  createdAt: string;
  name?: string;
  authorId?: string;
}

interface VersionHistoryPanelProps {
  roomId: string;
  roomType: "document" | "uml" | "spreadsheet";
  onClose: () => void;
}

export const VersionHistoryPanel = ({ roomId, roomType, onClose }: VersionHistoryPanelProps) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newVersionName, setNewVersionName] = useState("");
  const [previewVersion, setPreviewVersion] = useState<Version | null>(null);

  const self = useSelf();
  const isAdmin = self?.info?.isAdmin;

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/liveblocks-versions?roomId=${roomId}`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [roomId]);

  const handleSaveVersion = async () => {
    if (!newVersionName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/liveblocks-versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, name: newVersionName, roomType }),
      });
      if (res.ok) {
        toast.success("Version saved");
        setShowSaveDialog(false);
        setNewVersionName("");
        fetchVersions();
      } else {
        const errorText = await res.text();
        toast.error(errorText || "Failed to save version");
      }
    } catch (e) {
      toast.error("Error saving version");
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (versionId: string) => {
    try {
      const res = await fetch("/api/liveblocks-versions/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, versionId }),
      });
      if (res.ok) {
        toast.success("Restored successfully");
        window.location.reload();
      } else {
        toast.error("Failed to restore");
      }
    } catch (e) {
      toast.error("Error restoring version");
    }
  };

  return (
    <>
      <div className="fixed top-0 right-0 h-full w-[320px] bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <span role="img" aria-label="clock">🕰️</span> Version History
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          {isAdmin ? (
            <Button className="w-full gap-2" onClick={() => setShowSaveDialog(true)}>
              <Save className="h-4 w-4" /> Save Current Version
            </Button>
          ) : (
            <p className="text-sm text-zinc-500 text-center">View-only access</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : versions.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">No versions saved yet.</p>
          ) : (
            versions.map((v, i) => (
              <div key={v.id} className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">
                      {v.name || (i === 0 ? "Current Version" : "Auto-saved")}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(v.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={() => setPreviewVersion(v)}>
                    Preview
                  </Button>
                  {isAdmin && (
                    <ConfirmModal
                      header="Restore Version"
                      description="Restore to this version? Current state will be overwritten."
                      disabled={false}
                      onConfirm={() => handleRestore(v.id)}
                    >
                      <Button variant="outline" size="sm" className="h-7 text-xs flex-1 text-red-600 hover:text-red-700">
                        Restore
                      </Button>
                    </ConfirmModal>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Name this version</DialogTitle>
            <DialogDescription>
              Provide a descriptive name to easily identify this version in the history.
            </DialogDescription>
          </DialogHeader>
          <Input 
            value={newVersionName} 
            onChange={(e) => setNewVersionName(e.target.value)} 
            placeholder="e.g., Before refactor"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveVersion} disabled={saving || !newVersionName.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {previewVersion && (
        <VersionPreviewModal
          roomId={roomId}
          roomType={roomType}
          version={previewVersion}
          onClose={() => setPreviewVersion(null)}
          onRestore={isAdmin ? () => handleRestore(previewVersion.id) : undefined}
        />
      )}
    </>
  );
};
