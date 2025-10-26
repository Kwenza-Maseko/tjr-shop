'use client'
import React, { ReactNode } from "react";
import Filter from "@/components/Filter";
import { FilterProvider } from "@/components/FilterContext";


export default function CategoryLayout({ children }: { children: ReactNode }) {
  return (
    <FilterProvider>
      <section className="flex">
        {/* Sidebar filter (fixed) */}
        <Filter />

        {/* Main content */}
        <div className="flex-1 md:ml-[240px]">
          <div className="">{children}</div>
        </div>
      </section>
    </FilterProvider>
  );
}
