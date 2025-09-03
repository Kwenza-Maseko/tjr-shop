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
    path: "",
    icon: Home,
  },
  {
    urlName: "Products",
    path: "products",
    icon: Package,
  },
  {
    urlName: "Analytics",
    path: "analytics",
    icon: PieChartIcon,
  },
  {
    urlName: "Inventory",
    path: "inventory",
    icon: BoxIcon,
  },
  {
    urlName: "orders",
    path: "orders",
    icon: ShoppingCart,
  },
  {
    urlName: "Sales",
    path: "sales",
    icon: BarChart2,
  },
  {
    urlName: "Customers",
    path: "customers",
    icon: Users,
  },
  {
    urlName: "announcement",
    path: "announcements",
    icon: Megaphone,
  },
  {
    urlName: "settings",
    path: "settings",
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
]
