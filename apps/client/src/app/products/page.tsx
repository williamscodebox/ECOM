import ProductList from "@/components/ProductList";
import { auth } from "@clerk/nextjs/server";

const ProductsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ category: string }>;
}) => {
  const category = (await searchParams).category;

  const { getToken } = await auth();
  const token = await getToken();

  console.log(token);

  const resProduct = await fetch("http://localhost:8000/products", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const dataProduct = await resProduct.json();

  console.log("Product Service Response:", dataProduct);

  return (
    <div className="">
      <ProductList category={category} params="products" />
    </div>
  );
};

export default ProductsPage;
