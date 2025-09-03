"use client"

import {
  useEffect,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { StoreDetailsParams } from "@/types";
import {
  Building2Icon,
  Landmark,
  Loader2,
  LocationEdit,
  Mail,
  MapPin,
  Phone,
  Trash
} from "lucide-react";
import EditAndupdateAddress from "./EditAndupdateAddress";
import { deleteStoreDetail, getContactDetailsByStoreId } from "@/lib/store/store-contact-details";

const  ContactDetails = () => {
  const [storeContactDetails, setStoreContactDetails] = useState<StoreDetailsParams[]>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isOpened, setIsOpened] = useState(false);
  const [selectedContact, setSelectedContact] = useState<StoreDetailsParams | null>(null);

  useEffect(() => {
    const fetchContactDetails = async () => {
      const details = await getContactDetailsByStoreId();
      setStoreContactDetails(details);
    };

    fetchContactDetails();

  }, []);

  const handleDelete = async (id: string | "") => {
    setDeletingId(id);
    try {
      const result = await deleteStoreDetail(id);

      if (result) {
        toast.success("Store location deleted successfully");
        setStoreContactDetails((prev) =>
          prev?.filter((item) => item.id !== id)
        );
      } else {
        toast.error("Failed to delete store location");
      }

    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An unexpected error occurred while deleting");

    } finally {
      setDeletingId(null);

    }
  };

  const handleFormSuccess = (newContact: StoreDetailsParams, action: "create" | "update") => {
    setStoreContactDetails((prev) => {
      if (!prev) return [newContact];

      if (action === "create") {
        return [...prev, newContact];
      }

      // update
      return prev.map((item) => (item.id === newContact.id ? newContact : item));
    });

    setIsOpened(false); // close form
    setSelectedContact(null); // clear form state
  };


  return (
    <div
      className="w-full px-4 flex flex-col gap-16 text-sm">

      {storeContactDetails?.length ? (
        <div className="flex flex-wrap gap-6">
          {storeContactDetails.map((contact) => (
            <div className="border-2 rounded-md w-full md:w-96 flex flex-col gap-4 teal-shadow-box bg-white"
              key={contact.id}>
              <div className="flex justify-between gap-2 border-b mb-4 py-4 px-6">
                <div className="rounde text-gray-500 w-fit flex items-center gap-2">
                  <Landmark size={18} />
                  <p className="font-bold text-md">{contact.province}</p>
                </div>
                <Button
                  type="button"
                  aria-label="Delete store contact detail"
                  className="text-white bg-red-500 hover:bg-red-600 border border-red-300"
                  disabled={deletingId === contact.id}
                  onClick={() => {
                    if (contact.id) {
                      handleDelete(contact.id);
                    } else {
                      toast.error("Missing contact ID. Cannot delete.");
                    }
                  }}
                >
                  {deletingId === contact.id ? (
                    <Loader2 size={18} className="animate-spin text-white" />
                  ) : (
                    <Trash size={18} />
                  )}
                </Button>
              </div>

              <div className="text-gray-500 flex flex-col gap-2 px-6">
                <div className="p-4 rounded bg-gray-100 flex flex-col gap-2 ">
                  <div className="flex items-center gap-2">
                    <MapPin size={15} />
                    <p className="truncate">{contact.streetAddress}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2Icon size={15} />
                    <p className="truncate">{contact.town}</p>
                  </div>
                </div>

                <div className="p-4 rounded bg-gray-100 flex flex-col gap-2 ">
                  <div className="flex items-center gap-2">
                    <Phone size={15} />
                    <p className="truncate">{contact.storeTelNumber}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail size={15} />
                    <p className="truncate">{contact.storeEmail}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 p-6">
                <Button
                  className="text-white bg-green-400 hover:bg-green-500 w-full py-6"
                  onClick={() => {
                    setSelectedContact(contact);
                    setIsOpened(true);
                  }}
                >
                  Update Store Location
                </Button>

              </div>
            </div>
          ))}

          <div
            className="w-full md:w-96 h-96 flex flex-col gap-4 items-center teal-shadow-box rounded-lg justify-center text-gray-400 cursor-pointer bg-white"
            onClick={() => setIsOpened((prev) => !prev)}
          >
            <LocationEdit size={60} />
            <p>Add new store address.</p>
          </div>
        </div>
      ) : (
        <div className="w-full md:w-96 h-96 flex flex-col gap-4 items-center teal-shadow-box rounded-lg justify-center text-gray-400 cursor-pointer bg-white"
          onClick={() => setIsOpened((prev) => !prev)}
        >
          <LocationEdit size={60} />
          <p>Add new address.</p>
        </div>
      )}

      {isOpened && (
        <div className="absolute top-0 h-screen right-0 bg-black/40 left-0 p-4">
          <div className="flex justify-end mb-6">
            <Button
              className="border bg-gray-200 hover:bg-gray-50 text-gray-600"
              onClick={() => setIsOpened(false)}
            >
              x
            </Button>
          </div>
          <div className="flex justify-center items-center">
            <EditAndupdateAddress
              contactToEdit={selectedContact || undefined}
              mode={selectedContact ? "update" : "create"}
              onSuccess={handleFormSuccess}
            />
          </div>

        </div>

      )}
    </div>
  );
}


export default ContactDetails;