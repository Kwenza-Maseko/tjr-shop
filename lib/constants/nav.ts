// lib/constants/nav.ts  (move navItems here if not already)
export const PRODUCT_TARGETS = ['men', 'women', 'kids', 'sport'] as const

export const CATEGORIES_BY_TARGET: Record<string, string[]> = {
  men: ['Clothing', 'Shoes', 'Brand'],
  women: ['Clothing', 'Shoes', 'Brand'],
  kids: ['Clothing', 'Shoes', 'Kids By Age', 'Brand'],
  sport: ['Running', 'Football', 'Training & Gym'],
}

export const PRODUCT_TYPES_BY_CATEGORY: Record<string, string[]> = {
  Clothing: [
    'All Clothing', 'Tops and T Shirts', 'Hoodies and Sweatshirts', 'Dress',
    'Shorts', 'Trousers', 'Leggings', 'Matching Sets',
    'Tracksuits', 'Jackets', 'Sports Bras', 'Accessories',
  ],
  Shoes: ['All Shoes', 'Sneakers', 'Trainers', 'Sandals', 'Boots', 'Heels', 'Flats', 'Formal Shoes'],
  Brand: ['Nike', 'Adidas', 'Lacoste', 'Puma', 'New Balance'],
  'Kids By Age': [
    'Teens (13 to 17 years)', 'Older Kids (7 to 12 years)',
    'Younger Kids (3 to 7 years)', 'Baby & Toddler (0 to 3 years)',
  ],
  Running: ['All Running', 'Shoes', 'Clothing', 'Accessories'],
  Football: ['All Football', 'Shoes', 'Clothing', 'Accessories'],
  'Training & Gym': ['All Training & Gym', 'Shoes', 'Clothing', 'Accessories'],
}