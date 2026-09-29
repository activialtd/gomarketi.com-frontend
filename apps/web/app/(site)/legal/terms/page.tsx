import { LegalLayout, PolicySection } from "@/components/LegalSection";

export const metadata = {
  title: "Terms of Service · GoMarketi",
  description:
    "The rules that govern how you use GoMarketi as a customer, vendor, or courier.",
};

export default function TermsPage() {
  return (
    <LegalLayout
      eyebrow="POLICIES"
      title="Terms of Service"
      intro="The agreement between you and GoMarketi. By using the platform, you agree to these terms."
      updatedAt="15 August 2026"
      toc={[
        { id: "accepting", label: "Accepting these terms" },
        { id: "account", label: "Your account" },
        { id: "using", label: "Using GoMarketi" },
        { id: "roles", label: "Customers, vendors, couriers" },
        { id: "content", label: "Content you post" },
        { id: "payments", label: "Payments & fees" },
        { id: "prohibited", label: "Prohibited conduct" },
        { id: "termination", label: "Termination" },
        { id: "liability", label: "Liability & disclaimers" },
        { id: "law", label: "Governing law" },
        { id: "changes", label: "Changes to these terms" },
      ]}
    >
      <PolicySection id="accepting" title="Accepting these terms">
        <p>
          These terms form a binding agreement between you and GoMarketi Limited
          ("GoMarketi", "we", "us"). By creating an account or using any part of
          the platform — the mobile app, vendor dashboard, or storefronts hosted
          at <strong>*.gomarketi.com</strong> — you accept these terms in full.
        </p>
        <p>
          If you do not agree, please do not use GoMarketi. You must be at least
          16 to hold a customer account, and at least 18 to operate as a vendor
          or courier.
        </p>
      </PolicySection>

      <PolicySection id="account" title="Your account">
        <p>
          You are responsible for keeping your login credentials secure and for
          all activity that happens on your account. If you suspect unauthorized
          access, change your password immediately and contact support.
        </p>
        <p>
          You must provide accurate information when signing up and keep it
          current. We may suspend accounts with materially false information.
        </p>
      </PolicySection>

      <PolicySection id="using" title="Using GoMarketi">
        <p>
          GoMarketi is a marketplace that connects customers with independent
          vendors and courier partners. We provide the technology, payments
          infrastructure, and support that makes those transactions possible —
          we do not manufacture or sell the products offered on our platform.
        </p>
        <p>
          Availability of products, delivery times, and pricing are set by the
          vendors themselves and may change at any time.
        </p>
      </PolicySection>

      <PolicySection id="roles" title="Customers, vendors, couriers">
        <ul>
          <li>
            <strong>Customers</strong> browse, place orders, and pay through the
            platform. When you place an order, you enter a contract with the
            vendor for the sale of goods and — if delivery is arranged through
            GoMarketi — with the courier partner for delivery.
          </li>
          <li>
            <strong>Vendors</strong> list products, set prices, fulfill orders,
            and are responsible for the accuracy of their listings and the
            quality of goods sold. Vendors agree to our separate vendor
            agreement in addition to these terms.
          </li>
          <li>
            <strong>Couriers</strong> deliver orders on behalf of vendors and
            are bound by their own courier agreement.
          </li>
        </ul>
      </PolicySection>

      <PolicySection id="content" title="Content you post">
        <p>
          You retain ownership of the content you post to GoMarketi — reviews,
          product images, store profiles. By posting, you grant GoMarketi a
          non-exclusive, worldwide licence to host, display, and distribute that
          content on the platform for as long as you keep it published.
        </p>
        <p>
          You are solely responsible for what you post and must not upload
          content you don't have the right to share.
        </p>
      </PolicySection>

      <PolicySection id="payments" title="Payments & fees">
        <p>
          Payments are processed by our payment partner (Paystack). By paying on
          GoMarketi, you also agree to their terms of service.
        </p>
        <p>
          Customer prices include all applicable taxes. GoMarketi charges
          vendors a platform fee on each transaction — the exact rate is set out
          in the vendor agreement and may vary by category.
        </p>
      </PolicySection>

      <PolicySection id="prohibited" title="Prohibited conduct">
        <p>You must not:</p>
        <ul>
          <li>Use GoMarketi for anything illegal or fraudulent</li>
          <li>Sell counterfeit, stolen, or restricted goods</li>
          <li>Interfere with the platform's operation or security</li>
          <li>Scrape or harvest data from GoMarketi without permission</li>
          <li>Impersonate anyone or misrepresent your affiliation</li>
          <li>Harass, threaten, or abuse other users, vendors, or couriers</li>
        </ul>
      </PolicySection>

      <PolicySection id="termination" title="Termination">
        <p>
          You may close your account at any time from Settings. We may suspend
          or terminate accounts that breach these terms, with notice where
          practicable and immediately where a serious breach or legal
          requirement makes notice impossible.
        </p>
      </PolicySection>

      <PolicySection id="liability" title="Liability & disclaimers">
        <p>
          GoMarketi provides the platform on an "as is" basis. We work hard to
          keep it running smoothly but do not warrant that it will be
          uninterrupted or free from errors. Where the law allows, our total
          liability for any claim relating to your use of GoMarketi is limited
          to the fees you paid us in the 12 months before the claim arose.
        </p>
        <p>
          Nothing in these terms limits liability for death, personal injury
          caused by negligence, fraud, or anything else that cannot lawfully be
          excluded.
        </p>
      </PolicySection>

      <PolicySection id="law" title="Governing law">
        <p>
          These terms are governed by the laws of the Federal Republic of
          Nigeria. Disputes will be resolved in the courts of Lagos, Nigeria,
          unless we mutually agree to alternative dispute resolution.
        </p>
      </PolicySection>

      <PolicySection id="changes" title="Changes to these terms">
        <p>
          We may update these terms as GoMarketi evolves. The "Last updated"
          date reflects the most recent change. Continued use of the platform
          after changes means you accept the new terms — material changes will
          be flagged in-app and by email before they take effect.
        </p>
      </PolicySection>
    </LegalLayout>
  );
}
