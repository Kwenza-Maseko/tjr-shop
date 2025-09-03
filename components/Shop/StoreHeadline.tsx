'use client';

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { createOrUpdateHeadline, deleteStoreId, getStoreHeadLine } from "@/lib/store/storeheadline";
import ColorPicker from "../ColorPicker";

const StoreHeadline = () => {

  const [headline, setHeadline] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [storeheadlineId, setStoreheadlineId] = useState<string>('');
  const [isColorPickerOpened, setIsColorPickerOpened] = useState(false);
  const [textColor, setTextColor] = useState("#000000");

  useEffect(() => {
    const fetchHeadline = async () => {

      const result = await getStoreHeadLine();

      if (result) {
        setHeadline(result.headline);
        setIsBold(result.textBold === "YES");
        setIsItalic(result.textItalic === "YES");
        setTextColor(result.colorHex);
        setStoreheadlineId(result.id);
      }
    };
    fetchHeadline();
  }, []);


  const handleSave = async () => {
    setLoading(true);
    const result = await createOrUpdateHeadline(
      headline,
      isBold ? "YES" : "NO",
      isItalic ? "YES" : "NO",
      textColor
    );
    setLoading(false);

    if (result.success && result.data && result.data.id) {
      toast("Store Headline created successfully");
      setStoreheadlineId(result.data.id);
    } else {
      toast("Failed to create Store Headline for you store")
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    const deleteExistingStorheadline = await deleteStoreId(storeheadlineId);
    setDeleteLoading(false);

    if (deleteExistingStorheadline.success) {
      toast("Deleted successfully");
      setHeadline("");
      setStoreheadlineId("");
      setIsBold(false);
      setIsItalic(false);
      setTextColor("#000000");
    } else {
      toast("Failed to delete store headline");
    }
  }

  const toggleBold = () => setIsBold(prev => !prev);
  const toggleItalic = () => setIsItalic(prev => !prev);
  const toggleColorPicker = () => setIsColorPickerOpened(prev => !prev);

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 border border-gray-200 p-3 rounded-lg">
        {
          isColorPickerOpened && (
            <ColorPicker
              value={textColor}
              onPickerChange={(color) => setTextColor(color)}
            />
          )
        }
        <div className="flex gap-4 items-center bg-gray-100 p-2 rounded-md">
          <Button
            className={`font-bold bg-white text-gray-600 border border-gray-400 hover:bg-gray-400 ${isBold ? 'bg-gray-300' : ''}`}
            onClick={toggleBold}
          >
            B
          </Button>
          <Button
            className={`italic bg-white text-gray-600 border border-gray-400 hover:bg-gray-400 ${isItalic ? 'bg-gray-300' : ''}`}
            onClick={toggleItalic}
          >
            I
          </Button>
          <div
            className="rounded-full w-9 h-9 cursor-pointer"
            style={{ backgroundColor: textColor }}
            onClick={toggleColorPicker}
          />
        </div>
        <Input
          className={`text-lg border-none shadow-none outline-none 
            ${isBold ? 'font-bold' : ''} 
            ${isItalic ? 'italic' : ''}`}
          style={{ color: textColor }}
          placeholder="Type your store headline"
          required
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
        />
      </div>

      <div className="fixed bottom-4 right-4">
        {!headline ? (
          <div></div>
        ) : (
          <div className="flex gap-4">
            <Button
              className="text-white bg-green-400 hover:bg-green-500"
              onClick={handleSave}
              disabled={loading}
            >
              <div className="flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Save"}
              </div>

            </Button>
            {storeheadlineId !== "" && (
              <Button
                className="bg-red-500 hover:bg-red-600"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                <div className="flex items-center justify-center gap-2">

                  {deleteLoading ? <Loader2 className="animate-spin h-5 w-5" /> :
                    (<div className="flex items-center gap-2">
                      <Trash2 className="h-5 w-5" />
                      <p>Delete</p>
                    </div>)
                  }
                </div>
              </Button>
            )}
          </div>

        )
        }

      </div>
    </div>
  );
};

export default StoreHeadline;
