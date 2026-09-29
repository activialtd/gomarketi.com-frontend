import { LegalLayout, PolicySection } from "@/components/LegalSection";

export const metadata = {
  title: "Cookie Policy · GoMarketi",
  description: "What cookies GoMarketi uses, why, and how to manage them.",
};

export default function CookiesPage() {
  return (
    <LegalLayout
      eyebrow="POLICIES"
      title="Cookie Policy"
      intro="What cookies and similar technologies we use on GoMarketi, why we use them, and how you can control them."
      updatedAt="15 August 2026"
      toc={[
        { id: "what", label: "What cookies are" },
        { id: "types", label: "Cookies we use" },
        { id: "third-party", label: "Third-party cookies" },
        { id: "control", label: "Managing cookies" },
        { id: "mobile", label: "The mobile app" },
        { id: "changes", label: "Changes" },
      ]}
    >
      <PolicySection id="what" title="What cookies are">
        <p>
          Cookies are small text files a website places on your device to
          remember information between visits — that you're signed in, what's in
          your cart, or which vendor page you were viewing.
        </p>
        <p>
          Some cookies are essential for the site to work. Others help us
          understand how it's used so we can improve it. You can control most
          cookies through your browser.
        </p>
      </PolicySection>

      <PolicySection id="types" title="Cookies we use">
        <p>
          <strong>Strictly necessary.</strong> Keep you signed in, remember your
          cart, and secure your session. GoMarketi cannot function without
          these. They can't be disabled from within the app.
        </p>
        <p>
          <strong>Preferences.</strong> Remember your language, saved delivery
          address, and interface choices so the site behaves consistently
          between visits.
        </p>
        <p>
          <strong>Analytics.</strong> Help us understand how visitors use
          GoMarketi in aggregate — which pages are popular, where flows break
          down, how features are performing. These do not identify you
          personally.
        </p>
        <p>
          <strong>Marketing.</strong> Used only if you've opted into marketing
          messages, to measure the effectiveness of any campaigns we run and to
          avoid showing you the same message repeatedly.
        </p>
      </PolicySection>

      <PolicySection id="third-party" title="Third-party cookies">
        <p>Some cookies on GoMarketi come from trusted third parties:</p>
        <ul>
          <li>
            <strong>Paystack</strong> — during checkout, to process your payment
            securely.
          </li>
          <li>
            <strong>Google Analytics</strong> — anonymised usage analytics.
          </li>
          <li>
            <strong>Sentry</strong> — error tracking so we can fix bugs quickly.
          </li>
        </ul>
        <p>
          Each of these providers has its own privacy and cookie policy that
          governs how they handle data they collect.
        </p>
      </PolicySection>

      <PolicySection id="control" title="Managing cookies">
        <p>
          Every modern browser lets you view, block, or delete cookies from its
          settings. Blocking essential cookies will break parts of GoMarketi —
          you won't be able to stay signed in or complete a checkout.
        </p>
        <p>
          Analytics and marketing cookies can be blocked without affecting core
          functionality. Look for "Privacy" or "Site settings" in your browser
          to manage them.
        </p>
      </PolicySection>

      <PolicySection id="mobile" title="The mobile app">
        <p>
          Our mobile app doesn't use cookies (that's a web technology) but it
          does use similar mechanisms — a secure token to keep you signed in,
          local storage for your cart and preferences, and anonymised analytics
          events. You can clear all app data at any time from your phone's app
          settings.
        </p>
      </PolicySection>

      <PolicySection id="changes" title="Changes">
        <p>
          If we add new categories of cookies or new third-party providers,
          we'll update this page. The "Last updated" date at the top reflects
          the most recent change.
        </p>
      </PolicySection>
    </LegalLayout>
  );
}
