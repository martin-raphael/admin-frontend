import { apiBrowser } from "./browser";

export type SiteSettings = {
  business_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  whatsapp_number: string;
  email: string;
  phone: string;
  address: string;
  socials: Record<string, string>;
  hero_headline: string;
  hero_subtext: string;
  hero_image_url: string | null;
};

export async function getSettings(): Promise<SiteSettings> {
  return apiBrowser<SiteSettings>("/api/v1/settings");
}

export async function updateSettings(
  form: FormData,
): Promise<SiteSettings> {
  return apiBrowser<SiteSettings>("/api/v1/settings", {
    method: "PATCH",
    body: form,
  });
}