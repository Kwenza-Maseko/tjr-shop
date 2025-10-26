'use client';
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react"; // Icon (shadcn/lucide)
import { useFilter } from "@/components/FilterContext";

const Filter = () => {
  const { brand, color, priceRange, setBrand, setColor, setPriceRange } = useFilter();
  const [isOpen, setIsOpen] = useState(false);

  const colors = [
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#ffffff" },
    { name: "Red", hex: "#ff0000" },
    { name: "Blue", hex: "#0000ff" },
    { name: "Green", hex: "#008000" },
    { name: "Yellow", hex: "#ffff00" },
    { name: "Gray", hex: "#808080" },
    { name: "Brown", hex: "#8B4513" },
    { name: "Purple", hex: "#800080" },
  ];

  const brands = ["All", "Nike", "Adidas", "Puma", "Lacoste", "New Balance"];
  const priceRanges = ["All", "R0 - R500", "R500 - R1000", "R1000+"];

  return (
    <>
      {/* 🔘 Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-16 left-4 z-50 bg-black text-white p-2 rounded-full shadow-md"
      >
        <SlidersHorizontal className="w-5 h-5" />
      </button>

      {/* 🧭 Sidebar */}
      <aside
        className={`fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-60 bg-white border-r flex-col z-40 transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:flex`}
      >
        <div className="p-6 border-t space-y-6 overflow-y-auto h-full">
          {/* Filter by Brand */}
          <div>
            <h2 className="text-[16px] font-semibold mb-3">Filter by Brand</h2>
            <div className="space-y-2">
              {brands.map((b) => (
                <label key={b} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={brand === b || (b === "All" && !brand)}
                    onChange={() => setBrand(b === "All" ? null : b)}
                    className="w-4 h-4 accent-black"
                  />
                  <span className="text-sm text-gray-700">{b}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter by Color */}
          <div>
            <h2 className="text-[16px] font-semibold mb-3">Filter by Color</h2>
            <div className="grid grid-cols-3 gap-4">
              {colors.map((c) => (
                <div
                  key={c.name}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => setColor(color === c.name ? null : c.name)}
                >
                  <div
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      color === c.name ? "border-black scale-110" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  ></div>
                  <span
                    className={`text-xs mt-1 ${
                      color === c.name ? "text-black font-semibold" : "text-gray-600"
                    }`}
                  >
                    {c.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Filter by Price */}
          <div>
            <h2 className="text-[16px] font-semibold mb-3">Filter by Price Range</h2>
            <div className="space-y-2">
              {priceRanges.map((r) => (
                <label key={r} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={priceRange === r || (r === "All" && !priceRange)}
                    onChange={() => setPriceRange(r === "All" ? null : r)}
                    className="w-4 h-4 accent-black"
                  />
                  <span className="text-sm text-gray-700">{r}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* 🕶 Overlay when open (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Filter;
