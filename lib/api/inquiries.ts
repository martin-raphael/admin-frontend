import { apiBrowser } from "./browser";

export type Inquiry = {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  price_at_time: number;
  channel: "whatsapp" | "email";
  created_at: string;
};

export async function listInquiries(): Promise<Inquiry[]> {
  return apiBrowser<Inquiry[]>("/api/v1/inquiries");
}