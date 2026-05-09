'use client'
import React, { ReactNode } from "react"
import Filter from "@/components/Filter"
import { FilterProvider } from "@/components/FilterContext"

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <FilterProvider>
      <section className="flex min-h-screen bg-muted/20">
        <Filter />
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </section>
    </FilterProvider>
  )
}