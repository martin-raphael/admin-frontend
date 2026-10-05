import { apiBrowser } from "./browser";

export type Testimonial = {
  id: string;
  name: string;
  text: string;
  rating: number;
  approved: boolean;
  source: "manual" | "google";
  created_at: string;
};

export type TestimonialInput = {
  name: string;
  text: string;
  rating: number;
  approved: boolean;
  source: "manual" | "google";
};

export async function listTestimonials(): Promise<Testimonial[]> {
  return apiBrowser<Testimonial[]>("/api/v1/testimonials");
}

export async function createTestimonial(
  payload: TestimonialInput,
): Promise<Testimonial> {
  return apiBrowser<Testimonial>("/api/v1/testimonials", {
    method: "POST",
    json: payload,
  });
}

export async function updateTestimonial(
  id: string,
  payload: TestimonialInput,
): Promise<Testimonial> {
  return apiBrowser<Testimonial>(`/api/v1/testimonials/${id}`, {
    method: "PATCH",
    json: payload,
  });
}

export async function deleteTestimonial(id: string): Promise<void> {
  await apiBrowser(`/api/v1/testimonials/${id}`, { method: "DELETE" });
}