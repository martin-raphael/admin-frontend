import { apiBrowser } from "./browser";

export type Offer = {
  id: string;
  name: string;
  description: string | null;
  banner_url: string | null;
  product_ids: string[];
  discount_percent: number | null;
  start_at: string;
  end_at: string;
  is_active: boolean;
};

export type OfferInput = {
  name: string;
  description?: string | null;
  banner_url?: string | null;
  product_ids: string[];
  discount_percent?: number | null;
  start_at: string;
  end_at: string;
  is_active: boolean;
};

export async function listOffers(): Promise<Offer[]> {
  return apiBrowser<Offer[]>("/api/v1/offers");
}

export async function createOffer(payload: OfferInput): Promise<Offer> {
  return apiBrowser<Offer>("/api/v1/offers", {
    method: "POST",
    json: payload,
  });
}

export async function updateOffer(
  id: string,
  payload: OfferInput,
): Promise<Offer> {
  return apiBrowser<Offer>(`/api/v1/offers/${id}`, {
    method: "PATCH",
    json: payload,
  });
}

export async function deleteOffer(id: string): Promise<void> {
  await apiBrowser(`/api/v1/offers/${id}`, { method: "DELETE" });
}