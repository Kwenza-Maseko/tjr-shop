'use client';

import React, { createContext, useContext, useState } from 'react';

type FilterState = {
  brand: string | null;
  color: string | null;
  priceRange: string | null;
  setBrand: (brand: string | null) => void;
  setColor: (color: string | null) => void;
  setPriceRange: (range: string | null) => void;
};

const FilterContext = createContext<FilterState | undefined>(undefined);

export const FilterProvider = ({ children }: { children: React.ReactNode }) => {
  const [brand, setBrand] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<string | null>(null);

  return (
    <FilterContext.Provider
      value={{ brand, color, priceRange, setBrand, setColor, setPriceRange }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) throw new Error('useFilter must be used within a FilterProvider');
  return context;
};
