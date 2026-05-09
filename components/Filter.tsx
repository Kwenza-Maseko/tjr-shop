'use client'
import { useState } from "react"
import { SlidersHorizontal, X, RotateCcw } from "lucide-react"
import { useFilter } from "@/components/FilterContext"

const COLORS = [
  { name: "Black",  hex: "#000000" },
  { name: "White",  hex: "#ffffff" },
  { name: "Red",    hex: "#ff0000" },
  { name: "Blue",   hex: "#0000ff" },
  { name: "Green",  hex: "#008000" },
  { name: "Yellow", hex: "#ffff00" },
  { name: "Gray",   hex: "#808080" },
  { name: "Brown",  hex: "#8B4513" },
  { name: "Purple", hex: "#800080" },
]

const BRANDS      = ["Nike", "Adidas", "Puma", "Lacoste", "New Balance"]
const PRICE_RANGES = ["R0 - R500", "R500 - R1000", "R1000+"]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-3">
      {children}
    </p>
  )
}

const Filter = () => {
  const { brand, color, priceRange, setBrand, setColor, setPriceRange } = useFilter()
  const [isOpen, setIsOpen] = useState(false)

  const hasFilters = !!(brand || color || priceRange)

  const clearAll = () => {
    setBrand(null)
    setColor(null)
    setPriceRange(null)
  }

  const sidebar = (
    <aside className="w-[240px] flex-shrink-0 flex flex-col bg-white border-r border-border h-[calc(100vh-56px)] sticky top-14 overflow-y-auto">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Filters
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-[10px] text-red-500 hover:text-red-600 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Clear
            </button>
          )}
          {/* Mobile close */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden w-6 h-6 flex items-center justify-center rounded-md hover:bg-muted"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 px-5 py-4 space-y-6">

        {/* Active filter pills */}
        {hasFilters && (
          <div className="flex flex-wrap gap-1.5">
            {brand && (
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-black text-white">
                {brand}
                <button onClick={() => setBrand(null)}><X className="w-2.5 h-2.5" /></button>
              </span>
            )}
            {color && (
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-black text-white">
                {color}
                <button onClick={() => setColor(null)}><X className="w-2.5 h-2.5" /></button>
              </span>
            )}
            {priceRange && (
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-black text-white">
                {priceRange}
                <button onClick={() => setPriceRange(null)}><X className="w-2.5 h-2.5" /></button>
              </span>
            )}
          </div>
        )}

        {/* Brand */}
        <div>
          <SectionLabel>Brand</SectionLabel>
          <div className="space-y-1">
            {BRANDS.map(b => (
              <button
                key={b}
                onClick={() => setBrand(brand === b ? null : b)}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors
                  ${brand === b
                    ? 'bg-black text-white font-medium'
                    : 'text-gray-700 hover:bg-muted/60'}`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Color */}
        <div>
          <SectionLabel>Color</SectionLabel>
          <div className="grid grid-cols-5 gap-2">
            {COLORS.map(c => (
              <button
                key={c.name}
                title={c.name}
                onClick={() => setColor(color === c.name ? null : c.name)}
                className={`w-8 h-8 rounded-full border-2 transition-all
                  ${color === c.name
                    ? 'border-black scale-110 shadow-md'
                    : 'border-transparent hover:border-gray-300'}`}
                style={{
                  backgroundColor: c.hex,
                  outline: c.hex === '#ffffff' ? '1px solid #e5e7eb' : undefined
                }}
              />
            ))}
          </div>
          {color && (
            <p className="text-[11px] text-muted-foreground mt-2">
              Selected: <span className="font-medium text-gray-800">{color}</span>
            </p>
          )}
        </div>

        <div className="border-t border-border" />

        {/* Price */}
        <div>
          <SectionLabel>Price Range</SectionLabel>
          <div className="space-y-1">
            {PRICE_RANGES.map(r => (
              <button
                key={r}
                onClick={() => setPriceRange(priceRange === r ? null : r)}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors
                  ${priceRange === r
                    ? 'bg-black text-white font-medium'
                    : 'text-gray-700 hover:bg-muted/60'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

      </div>
    </aside>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(true)}
        className={`md:hidden fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-colors
          ${hasFilters ? 'bg-black text-white' : 'bg-white text-black border border-border shadow-md'}`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span className="text-xs font-medium">Filter{hasFilters ? ' ·  active' : ''}</span>
      </button>

      {/* Desktop sidebar */}
      <div className="hidden md:block">{sidebar}</div>

      {/* Mobile drawer */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            {sidebar}
          </div>
        </>
      )}
    </>
  )
}

export default Filter