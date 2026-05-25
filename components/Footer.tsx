"use client"

import {
  useEffect,
  useState,
} from "react";

import { StoreDetailsParams } from "@/types";
import {
  Building2Icon,
  Landmark,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { getContactDetailsByStoreId } from "@/lib/store/store-contact-details";
import { help, navitems } from "@/constants";
import Link from "next/link";
import Image from 'next/image'


const FOOTER_LINKS = [
  {
    target: 'men',
  },
  {
    target: 'women',
  },
  {
    target: 'kids',
  },
  {
    target: 'sport',
  },
]

const Footer = () => {
  const [storeContactDetails, setStoreContactDetails] = useState<StoreDetailsParams[]>();

  useEffect(() => {
    const fetchContactDetails = async () => {
      const details = await getContactDetailsByStoreId();
      setStoreContactDetails(details);
    };

    fetchContactDetails();

  }, []);

  return (
    <div
      className="border-t px-6 md:px-8 py-16 mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
      <div>
        <Image
          src={"/assets/tjr-logo-removebg-preview.png"}
          width={100}
          height={100}
          alt='logo'
        />
      </div>
      {storeContactDetails?.length && (
        <div className="space-y-4 text-zinc-700">
          <p className='font-semibold text-lg mb-6'>Address</p>
          {storeContactDetails.map((contact) => (
            <div className="space-y-4 w-full text-zinc-500"
              key={contact.id}>
              <div className="flex items-center gap-2">
                <Landmark size={18} />
                <p className="">{contact.province}</p>
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

      <div className="space-y-4 text-zinc-700">
        <p className="font-semibold text-lg mb-6">Help</p>

        <ul className="space-y-3">
          {help.map((item) => (
            <li key={item.id}>
              <Link
                href={item.url}
                className="text-zinc-500 hover:underline cursor-pointer block"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4 text-zinc-700">
        <p className='font-semibold text-lg mb-6'>Quick Links</p>
        <ul className="space-y-4 w-full">
          {FOOTER_LINKS.map((item) => (
            <li key={item.target} className="">
              <Link href={`/store/${item.target}/all`} className="text-zinc-500 hover:underline cursor-pointer capitalize">
                {item.target}
              </Link>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}


export default Footer;