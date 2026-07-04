import type { Metadata } from "next";
import EkoLayout from "@/components/storefront/eko/EkoLayout";
import LagosLayout from "@/components/storefront/lagos/LagosLayout";
import type { ThemeConfig } from "./page";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function getStore(slug: string) {
  try {
    const res = await fetch(`${API_URL}/v1/storefront/public/stores/${slug}`,
      { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json() as { id: string; name: string; tagline?: string; theme_config?: string };
  } catch { return null; }
}

async function getCollectionsCount(storeId: string): Promise<number> {
  try {
    const res = await fetch(
      `${API_URL}/v1/catalogue/public/collections?store_id=${storeId}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return 0;
    const data = await res.json() as { collections?: unknown[] };
    return data.collections?.length ?? 0;
  } catch { return 0; }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStore(slug);
  if (!store) return { title: "Store not found" };

  let seo: { metaTitle?: string; metaDescription?: string } | undefined;
  if (store.theme_config) {
    try {
      const cfg = JSON.parse(store.theme_config) as { seo?: typeof seo };
      seo = cfg.seo;
    } catch {}
  }

  const storeName = seo?.metaTitle || store.name;
  const description = seo?.metaDescription || store.tagline;

  return {
    title: {
      template: `%s | ${storeName}`,
      default: storeName,
    },
    ...(description ? { description } : {}),
  };
}

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStore(slug);

  if (!store) return <>{children}</>;

  let themeConfig: ThemeConfig | null = null;
  if (store.theme_config) {
    try { themeConfig = JSON.parse(store.theme_config) as ThemeConfig; } catch {}
  }

  const hasCollections = (await getCollectionsCount(store.id)) > 0;

  const template = themeConfig?.template ?? "eko";
  const colors   = themeConfig?.colors;
  const sec      = themeConfig?.sections;
  const navItems = sec?.nav?.items?.map((i) => ({ label: i.label, url: i.url }));
  const logoUrl  = sec?.header?.logoUrl ?? undefined;

  const cssVars = {
    "--store-primary":   colors?.primary   ?? "#1A7A42",
    "--store-secondary": colors?.secondary ?? "#0A4D2A",
    "--store-bg":        colors?.bg        ?? "#F0FAF3",
    "--store-text":      colors?.text      ?? "#1C1C1C",
  } as React.CSSProperties;

  const social = sec?.footer?.social ?? {};
  const contact = sec?.footer?.contact ?? {};

  if (template === "lagos" || template === "abuja") {
    return (
      <div style={cssVars}>
        <LagosLayout
          storeName={store.name}
          slug={slug}
          primary={colors?.primary}
          tagline={sec?.footer?.tagline}
          whatsapp={contact.whatsapp}
          instagram={social.instagram}
          twitter={social.twitter}
          facebook={social.facebook}
          tiktok={social.tiktok}
          youtube={social.youtube}
          email={contact.email}
          phone={contact.phone}
          address={contact.address}
          navItems={navItems}
          logoUrl={logoUrl}
          hasCollections={hasCollections}
        >
          {children}
        </LagosLayout>
      </div>
    );
  }

  return (
    <div style={cssVars}>
      <EkoLayout
        storeName={store.name}
        slug={slug}
        primary={colors?.primary}
        secondary={colors?.secondary}
        tagline={sec?.footer?.tagline}
        whatsapp={contact.whatsapp}
        instagram={social.instagram}
        twitter={social.twitter}
        facebook={social.facebook}
        tiktok={social.tiktok}
        youtube={social.youtube}
        email={contact.email}
        phone={contact.phone}
        address={contact.address}
        navItems={navItems}
        logoUrl={logoUrl}
        hasCollections={hasCollections}
      >
        {children}
      </EkoLayout>
    </div>
  );
}
