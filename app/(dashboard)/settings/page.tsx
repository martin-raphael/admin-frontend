import { apiFetch } from "@/lib/api/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsForm } from "@/components/settings/SettingsForm";
import type { SiteSettings } from "@/lib/api/settings";

export default async function SettingsPage() {
  const settings = await apiFetch<SiteSettings>("/api/v1/settings");

  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Business information, branding, and storefront content."
      />
      <div className="mx-auto max-w-3xl">
        <SettingsForm initial={settings} />
      </div>
    </>
  );
}