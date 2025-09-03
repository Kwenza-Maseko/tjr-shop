'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createOrUpdateAnnouncement, deleteAnnouncement, getAnnouncements } from '@/lib/store/announcement';
import { Loader2, Megaphone, Trash2, Pencil } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const Announcements = () => {
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<{ id: string; announcement: string; createdAt: Date | null }[]>([]);
  const [announcementText, setAnnouncementText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null); // <-- separate editing mode

  // fetch announcements
  useEffect(() => {
    const fetchAnnouncement = async () => {
      const result = await getAnnouncements();
      if (result) setAnnouncements(result);
    };
    fetchAnnouncement();
  }, []);

  // save (create or update)
  const handleSave = async () => {
    if (!announcementText.trim()) return;

    setLoading(true);
    const result = await createOrUpdateAnnouncement(
      announcementText,
      editingId || null
    );
    setLoading(false);

    if (result.success && result.data) {
      toast(result.action === "updated" ? "Announcement updated" : "Announcement created");

      setAnnouncements((prev) => {
        if (result.action === "updated") {
          return prev.map((a) => (a.id === result.data.id ? result.data : a));
        }
        return [...prev, result.data]; // new insert
      });

      // reset
      setAnnouncementText("");
      setEditingId(null);
    } else {
      toast("Failed to save announcement");
    }
  };

  // delete
  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    const result = await deleteAnnouncement(id);
    setDeleteLoading(false);

    if (result.success) {
      toast("Announcement deleted");
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setAnnouncementText("");
      }
    } else {
      toast("Failed to delete announcement");
    }
  };

  return (
    <div className="p-6">
      <div className="space-y-4">
        <div className="bg-green-200 rounded py-1 px-3 flex gap-1 items-center w-fit">
          <p>Announcements</p>
          <Megaphone className="w-4 h-4" />
        </div>

        <p className="text-gray-400">Public announcements for customers:</p>

        {/* Input form */}
        <div className="flex gap-2 border border-gray-200 p-3 rounded-lg">
          <Input
            value={announcementText}
            className="text-lg border-none shadow-none outline-none flex-1"
            placeholder="Type your store headline"
            onChange={(e) => setAnnouncementText(e.target.value)}
          />
          <Button
            className="text-white bg-green-400 hover:bg-green-500"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : editingId ? "Update" : "Publish"}
          </Button>
        </div>

        {/* List of announcements */}
        <div className="space-y-3">
          {announcements.length > 0 ? (
            announcements.map((a) => (
              <div className="space-y-1 bg-white border custom-light-shadow-box rounded-md p-3 " key={a.id}>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center text-gray-700">
                    <Megaphone className="w-4 h-4" />
                    <p>{a.announcement}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingId(a.id);
                        setAnnouncementText(a.announcement);
                      }}
                    >
                      <Pencil className="h-5 w-5 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(a.id)}
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? (
                        <Loader2 className="animate-spin h-5 w-5" />
                      ) : (
                        <Trash2 className="h-5 w-5 text-red-500" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className='py-1 px-3 rounded bg-green-100 text-green-900 w-fit'>
                  <p className="text-xs mt-1">
                    Published: {a.createdAt ? new Date(a.createdAt).toLocaleString() : "-"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No announcements yet.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default Announcements;
