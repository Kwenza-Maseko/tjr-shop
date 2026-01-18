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
import { deleteStoreDetail, getContactDetailsByStoreId } from "@/lib/store/store-contact-details";
import { help, navitems } from "@/constants";
import Link from "next/link";

const Footer = () => {
  const [storeContactDetails, setStoreContactDetails] = useState<StoreDetailsParams[]>();
  const [isOpened, setIsOpened] = useState(false);
  const [selectedContact, setSelectedContact] = useState<StoreDetailsParams | null>(null);

  useEffect(() => {
    const fetchContactDetails = async () => {
      const details = await getContactDetailsByStoreId();
      setStoreContactDetails(details);
    };

    fetchContactDetails();

  }, []);

  return (
    <div
      className="bg-white px-6 md:px-8 py-16 mt-16 grid grid-cols-1 md:grid-cols-4 gap-6 font-semibold">
      <div>
        <p className='font-black text-xl'>TJR.<span className='text-md text-purple-600'>ONLINE</span></p>
      </div>
      {storeContactDetails?.length && (
        <div className="space-y-4 text-gray-800">
          <p className='font-black text-lg'>Address</p>
          {storeContactDetails.map((contact) => (
            <div className="space-y-4 w-full text-gray-700"
              key={contact.id}>
              <div className="flex items-center gap-2">
                <Landmark size={18} />
                <p className="font-bold text-md">{contact.province}</p>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={15} />
                <p className="truncate">{contact.streetAddress}</p>
              </div>
              <div className="flex items-center gap-2">
                <Building2Icon size={15} />
                <p className="truncate">{contact.town}</p>
              </div>

              <div className="flex items-center gap-2">
                <Mail size={15} />
                <p className="truncate">{contact.storeEmail}</p>
              </div>

              <div className="flex items-center gap-2 text-lg font-bold">
                <Phone size={15} />
                <p className="truncate">{contact.storeTelNumber}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4 text-gray-800">
        <p className="font-black text-lg">Help</p>

        <ul className="space-y-3 text-gray-700">
          {help.map((item) => (
            <li key={item.id}>
              <Link
                href={item.url}
                className="text-gray-700 hover:text-gray-600 cursor-pointer block"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4 text-gray-800">
        <p className='font-black text-lg'>Quick Links</p>
        <ul className="space-y-4 w-full text-gray-700">
          {navitems.map((item) => (
            <li key={item.name} className="">
              <button className="text-gray-700 hover:text-gray-600 cursor-pointer">
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}


export default Footer;