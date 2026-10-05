import { apiFetch } from "@/lib/api/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { OfferManager } from "@/components/offers/OfferManager";
import type { Offer } from "@/lib/api/offers";
import type { Product } from "@/lib/api/products";

export default async function OffersPage() {
  const [offers, productsData] = await Promise.all([
    apiFetch<Offer[]>("/api/v1/offers"),
    apiFetch<{ items: Product[] }>(
      "/api/v1/products?page=1&page_size=200",
    ),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Promotions"
        title="Offers"
        description="Scheduled promotions that apply a discount to selected products for a set period."
      />
      <OfferManager initial={offers} products={productsData.items} />
    </>
  );
}