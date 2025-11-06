import { getProductsAction } from "@/app/actions/products"
import { CreateReturnClientPage } from "./client-page"

export default async function CreateReturnPage() {
  const { products, error } = await getProductsAction()

  if (error) {
    console.error("Failed to fetch products for return form:", error)
  }

  return <CreateReturnClientPage products={products || []} />
}