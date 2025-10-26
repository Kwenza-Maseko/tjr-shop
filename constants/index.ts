import {
  Home,
  Users,
  Package,
  ShoppingCart,
  Megaphone,
  PieChartIcon,
  BarChart2,
  BoxIcon,
  Settings2Icon
} from "lucide-react";

export const FIELD_NAMES = {
  fullName: "Full Name",
  email: "Email Address",
  password: "Password",
};

export const FIELD_TYPE = {
  fullName: "text",
  email: "email",
  password: "password",
};


export const storeNavLinks = [
  {
    urlName: "docs",
    url: "/store/docs"
  },
  {
    urlName: "pricing",
    url: "/store/pricing"
  },
  {
    urlName: "contact",
    url: "/store/contact"
  },

];

export const YourStoreNavLinks = [
  {
    urlName: "overview",
    path: "/admin",   // instead of ""
    icon: Home,
  },
  {
    urlName: "Products",
    path: "/admin/products",
    icon: Package,
  },
  {
    urlName: "Analytics",
    path: "/admin/analytics",
    icon: PieChartIcon,
  },
  {
    urlName: "Inventory",
    path: "/admin/inventory",
    icon: BoxIcon,
  },
  {
    urlName: "orders",
    path: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    urlName: "Sales",
    path: "/admin/sales",
    icon: BarChart2,
  },
  {
    urlName: "Customers",
    path: "/admin/customers",
    icon: Users,
  },
  {
    urlName: "announcement",
    path: "/admin/announcements",
    icon: Megaphone,
  },
  {
    urlName: "settings",
    path: "/admin/settings",
    icon: Settings2Icon,
  },
];


export const settings = [
  {
    name: "General",
    description: "Manage basic settings like store name, currency, and regional preferences.",
    path: "general"
  },
  {
    name: "Store",
    description: "Control store-level settings including branding, business info, and contact details.",
    path: "store"
  },
  {
    name: "Products",
    description: "Add, edit, and organize the products available in your store catalog.",
    path: "products"
  },
  {
    name: "Orders",
    description: "View and manage customer orders, track statuses, and handle returns or refunds.",
    path: "orders"
  },
  {
    name: "Users",
    description: "Manage store staff and customer accounts, roles, and permissions.",
    path: "users"
  },
];

export const storeSideBar = [
  {
    name: "banner"
  },
  {
    name: "store headline"
  },
  {
    name: "product details"
  },
  {
    name: "store contact details"
  },
  {
    name: "working hours"
  }
];


export const navitems = [
  {
    name: "Kids",
    subItems: [
      {
        name: "Clothing",
        subSubItems: [
          "All Clothes",
          "Top & T-shirt",
          "Hoodies and Sweatshirts",
          "Tracksuits",
          "Shorts",
          "Trousers and Leggings",
          "Jackets",
          "Sports Bras",
          "Accessories"
        ],
        url: "kids"
      },
      {
        name: "Shoes",
        subSubItems: ["All Shoes", "Sneakers", "Trainers", "Sandals", "Boots"],
        url: "kids"
      },
      {
        name: "Kids By Age",
        subSubItems: [
          "Teens (13 - 17 years)",
          "Older Kids (7 - 12 years)",
          "Younger Kids (3 - 7 years)",
          "Baby & Toddler (0 - 3 years)"
        ],
        url: "kids"
      },
      {
        name: "Brand",
        subSubItems: [
          "Nike",
          "Adidas",
          "Lacoste",
          "Puma",
          "New Balance",
        ],
        url: "kids"
      }
    ],
  },


  {
    name: "Women",
    subItems: [
      {
        name: "Clothing",
        subSubItems: [
          "All Clothing",
          "Tops and T- Shirts",
          "Hoodies and Sweatshirts",
          "Shorts",
          "Leggings",
          "Trousers",
          "Matching Sets",
          "Jackets",
          "Accessories"
        ],
        url: "women"
      },
      {
        name: "Shoes",
        subSubItems: [
          "All Shoes",
          "Heels",
          "Flats",
          "Sneakers",
          "Boots",],
        url: "women"
      },
      {
        name: "Brand",
        subSubItems: [
          "Nike",
          "Adidas",
          "Lacoste",
          "Puma",
          "New Balance",],
        url: "women"
      }
    ]
  },


  {
    name: "Men",
    subItems: [
      {
        name: "Clothing",
        subSubItems: [
          "All Clothing",
          "Tops and T- Shirts",
          "Hoodies and Sweatshirts",
          "Shorts",
          "Trousers",
          "Matching Sets",
          "Jackets",
          "Accessories"
        ],
        url: "men"
      },
      {
        name: "Shoes",
        subSubItems: [
          "All Shoes",
          "Sneakers",
          "Trainers",
          "Formal Shoes"
        ],
        url: "men"
      },
      {
        name: "Brand",
        subSubItems: [
          "Nike",
          "Adidas",
          "Lacoste",
          "Puma",
          "New Balance",]
        ,
        url: "men"
      }
    ],
  },
  {
    name: "Sport",
    subItems: [
      {
        name: "Running",
        subSubItems: [
          "All Running",
          "Shoes",
          "Clothing",
          "Accessories",
        ],
        url: "sport"
      },
      {
        name: "Football",
        subSubItems: [
          "All Football",
          "Shoes",
          "Clothing",
          "Accessories",
        ],
        url: "sport"
      },
      {
        name: "Training & Gym",
        subSubItems: [
          "All Training & Gym",
          "Shoes",
          "Clothing",
          "Accessories",
        ],
        url: "sport"
      },
    ],
  },
];


