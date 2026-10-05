import { apiFetch } from "@/lib/api/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { TestimonialManager } from "@/components/testimonials/TestimonialManager";
import type { Testimonial } from "@/lib/api/testimonials";

export default async function TestimonialsPage() {
  const testimonials = await apiFetch<Testimonial[]>("/api/v1/testimonials");

  return (
    <>
      <PageHeader
        eyebrow="Social proof"
        title="Testimonials"
        description="Client reviews displayed on the storefront. Approve before publishing."
      />
      <TestimonialManager initial={testimonials} />
    </>
  );
}