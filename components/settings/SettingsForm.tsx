"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateSettings, type SiteSettings } from "@/lib/api/settings";
import { ApiError } from "@/lib/api/browser";

function SectionHeading({
  index,
  title,
}: {
  index: string;
  title: string;
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="text-[11px] font-semibold tracking-widest text-brand-600">
        {index}
      </span>
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-700">
        {title}
      </h2>
      <span className="h-px flex-1 bg-ink-300/50" />
    </div>
  );
}

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const router = useRouter();

  const [businessName, setBusinessName] = useState(initial.business_name);
  const [whatsapp, setWhatsapp] = useState(initial.whatsapp_number);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [address, setAddress] = useState(initial.address);
  const [heroHeadline, setHeroHeadline] = useState(initial.hero_headline);
  const [heroSubtext, setHeroSubtext] = useState(initial.hero_subtext);

  const [instagram, setInstagram] = useState(initial.socials.instagram ?? "");
  const [facebook, setFacebook] = useState(initial.socials.facebook ?? "");
  const [tiktok, setTiktok] = useState(initial.socials.tiktok ?? "");
  const [twitter, setTwitter] = useState(initial.socials.twitter ?? "");

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pickLogo(file: File | null) {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  }

  function pickHero(file: File | null) {
    if (heroPreview) URL.revokeObjectURL(heroPreview);
    setHeroFile(file);
    setHeroPreview(file ? URL.createObjectURL(file) : null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const fd = new FormData();
    fd.append("business_name", businessName);
    fd.append("whatsapp_number", whatsapp);
    fd.append("email", email);
    fd.append("phone", phone);
    fd.append("address", address);
    fd.append("hero_headline", heroHeadline);
    fd.append("hero_subtext", heroSubtext);

    if (logoFile) fd.append("logo", logoFile);
    if (heroFile) fd.append("hero_image", heroFile);

    if (instagram.trim()) fd.append("instagram", instagram.trim());
    if (facebook.trim()) fd.append("facebook", facebook.trim());
    if (tiktok.trim()) fd.append("tiktok", tiktok.trim());
    if (twitter.trim()) fd.append("twitter", twitter.trim());

    try {
      await updateSettings(fd);
      toast.success("Settings saved");
      router.refresh();
      setLogoFile(null);
      setHeroFile(null);
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (heroPreview) URL.revokeObjectURL(heroPreview);
      setLogoPreview(null);
      setHeroPreview(null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not save settings.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Business */}
      <section className="card-padded">
        <SectionHeading index="01" title="Business information" />
        <div className="space-y-5">
          <div>
            <label className="label">Business name</label>
            <input
              className="input"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label">WhatsApp number</label>
              <input
                className="input"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+254705244147"
              />
              <p className="hint">
                Include the country code. Used for the Order on WhatsApp button.
              </p>
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Email address</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Physical address / showroom</label>
            <textarea
              className="input min-h-[70px] resize-y"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Ngong Road, Nairobi, Kenya"
            />
          </div>
        </div>
      </section>

      {/* Branding */}
      <section className="card-padded">
        <SectionHeading index="02" title="Branding" />
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="label">Logo</label>
            <div className="flex items-center gap-4">
              {(logoPreview || initial.logo_url) && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={logoPreview ?? initial.logo_url ?? ""}
                  alt=""
                  className="h-16 w-16 rounded-lg border border-ink-300/40 bg-white object-contain p-1"
                />
              )}
              <label className="btn-secondary cursor-pointer">
                {logoFile ? "Replace" : "Choose logo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => pickLogo(e.target.files?.[0] ?? null)}
                />
              </label>
              {logoPreview && (
                <button
                  type="button"
                  onClick={() => pickLogo(null)}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="label">Hero image</label>
            <div className="flex items-center gap-4">
              {(heroPreview || initial.hero_image_url) && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={heroPreview ?? initial.hero_image_url ?? ""}
                  alt=""
                  className="h-16 w-24 rounded-lg border border-ink-300/40 object-cover"
                />
              )}
              <label className="btn-secondary cursor-pointer">
                {heroFile ? "Replace" : "Choose image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => pickHero(e.target.files?.[0] ?? null)}
                />
              </label>
              {heroPreview && (
                <button
                  type="button"
                  onClick={() => pickHero(null)}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Hero content */}
      <section className="card-padded">
        <SectionHeading index="03" title="Homepage hero" />
        <div className="space-y-5">
          <div>
            <label className="label">Headline</label>
            <input
              className="input"
              value={heroHeadline}
              onChange={(e) => setHeroHeadline(e.target.value)}
              placeholder="e.g. Premium Furniture in Kenya"
            />
          </div>
          <div>
            <label className="label">Subtext</label>
            <textarea
              className="input min-h-[70px] resize-y"
              value={heroSubtext}
              onChange={(e) => setHeroSubtext(e.target.value)}
              placeholder="One sentence describing your brand promise"
            />
          </div>
        </div>
      </section>

      {/* Socials */}
      <section className="card-padded">
        <SectionHeading index="04" title="Social links" />
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Instagram</label>
            <input
              className="input"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/yourpage"
            />
          </div>
          <div>
            <label className="label">Facebook</label>
            <input
              className="input"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="https://facebook.com/yourpage"
            />
          </div>
          <div>
            <label className="label">TikTok</label>
            <input
              className="input"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
              placeholder="https://tiktok.com/@yourpage"
            />
          </div>
          <div>
            <label className="label">X / Twitter</label>
            <input
              className="input"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="https://x.com/yourhandle"
            />
          </div>
        </div>
        <p className="hint mt-3">
          Social links are stored but not yet wired into the update endpoint
          — we&apos;ll extend the backend when the storefront needs them.
        </p>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.refresh()}
          className="btn-secondary"
          disabled={busy}
        >
          Reset
        </button>
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}