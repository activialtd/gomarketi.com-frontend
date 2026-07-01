// Slug-level layout: fetches the store once for every page under [slug]
// and wraps all children in the correct header + footer.
// This means EkoHome, LagosHome, shop, product detail, cart, checkout etc.
// all automatically get the right header/footer without wrapping themselves.
import EkoLayout from "@/components/storefront/eko/EkoLayout";
import LagosLayout from "@/components/storefront/lagos/LagosLayout";
import type { ThemeConfig } from "./page";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function getStore(slug: string) {
  try {
    const res = await fetch(`${API_URL}/v1/storefront/public/stores/${slug}`,
      { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json() as { id: string; name: string; theme_config?: string };
  } catch { return null; }
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

  // No store → pass children through; the page will call notFound()
  if (!store) return <>{children}</>;

  let themeConfig: ThemeConfig | null = null;
  if (store.theme_config) {
    try { themeConfig = JSON.parse(store.theme_config) as ThemeConfig; } catch {}
  }

  const template = themeConfig?.template ?? "eko";
  const colors   = themeConfig?.colors;
  const sec      = themeConfig?.sections;
  const navItems = sec?.nav?.items?.map((i) => ({ label: i.label, url: i.url }));

  // Inject CSS custom properties so every child can use var(--store-primary) etc.
  const cssVars = {
    "--store-primary":   colors?.primary   ?? "#1A7A42",
    "--store-secondary": colors?.secondary ?? "#0A4D2A",
    "--store-bg":        colors?.bg        ?? "#F0FAF3",
    "--store-text":      colors?.text      ?? "#1C1C1C",
  } as React.CSSProperties;

  if (template === "lagos" || template === "abuja") {
    return (
      <div style={cssVars}>
        <LagosLayout
          storeName={store.name}
          primary={colors?.primary}
          tagline={sec?.footer?.tagline}
          whatsapp={sec?.footer?.contact?.whatsapp}
          instagram={sec?.footer?.social?.instagram}
          navItems={navItems}
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
        primary={colors?.primary}
        secondary={colors?.secondary}
        tagline={sec?.footer?.tagline}
        whatsapp={sec?.footer?.contact?.whatsapp}
        instagram={sec?.footer?.social?.instagram}
        navItems={navItems}
      >
        {children}
      </EkoLayout>
    </div>
  );
}
