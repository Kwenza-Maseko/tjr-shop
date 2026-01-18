// app/products/[id]/page.tsx
import ProductClient from "@/components/ProductClient";
import { auth } from "@/userAuth";
import { redirect } from "next/navigation";

const ProductPage = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  const userId = session.user.id as string;

  return <ProductClient userId={userId} />;
};

export default ProductPage;