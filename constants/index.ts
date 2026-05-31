import {
  Home,
  Users,
  Package,
  ShoppingCart,
  Megaphone,
  PieChartIcon,
  BarChart2,
  BoxIcon,
  Settings2Icon,
  ChartBarDecreasingIcon,
  ShoppingBag
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
    role: "ADMIN"
  },
  {
    urlName: "Products",
    path: "/admin/products",
    icon: Package,
    role: "ADMIN"
  },
  {
    urlName: "Analytics",
    path: "/admin/analytics",
    icon: PieChartIcon,
    role: "ADMIN"
  },
  {
    urlName: "Inventory",
    path: "/admin/inventory",
    icon: BoxIcon,
    role: "ADMIN"
  },
  {
    urlName: "cart",
    path: "/admin/cart",
    icon: ShoppingBag,
    role: "ADMIN"
  },
  {
    urlName: "orders",
    path: "/admin/orders",
    icon: ShoppingCart,
    role: "ADMIN"
  },
  {
    urlName: "Sales",
    path: "/admin/sales",
    icon: BarChart2,
    role: "SUPER ADMIN"
  },
  {
    urlName: "Customers",
    path: "/admin/customers",
    icon: Users,
    role: "SUPER ADMIN"
  },
  {
    urlName: "announcement",
    path: "/admin/announcements",
    icon: Megaphone,
    role: "SUPER ADMIN"
  },
  {
    urlName: "settings",
    path: "/admin/settings",
    icon: Settings2Icon,
    role: "SUPER ADMIN"
  },
  {
    urlName: "discount",
    path: "/admin/discount",
    icon: ChartBarDecreasingIcon,
    role: "SUPER ADMIN"
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


export const items = [
  { id: 1, name: "T-Shirt", image: "/assets/products/t-shirt.jpg",colorHex: "bg-gray-400/10"  },
  { id: 2, name: "Jersey", image: "/assets/products/jacket.webp",colorHex: "bg-gray-400/10"  },
  { id: 3, name: "Sweater", image: "/assets/products/sweater.jpg", colorHex: "bg-gray-400/10" },
  { id: 4, name: "Demin", image: "/assets/products/demin.webp", colorHex: "bg-gray-400/10" },
  { id: 5, name: "Pants", image: "/assets/products/pants.jpg", colorHex: "bg-gray-400/10" },
  { id: 6, name: "Hoodie", image: "/assets/products/hoodiee.png", colorHex: "bg-gray-400/10" },
  { id: 7, name: "Shirt", image: "/assets/products/shirts.jpg", colorHex: "bg-gray-400/10" },
];

export const help = [
  { id: 1, name: "Get Help", url: "/help" },
  { id: 2, name: "Order Status", url: "/track-order" },
  { id: 3, name: "Shipping & Delivery", url: "/shipping-and-delivery"},
  { id: 4, name: "Return", url: "/return" },
  { id: 5, name: "Payment Option", url: "/payment-option" },
];


