import { LegalLayout, PolicySection } from "@/components/LegalSection";

export const metadata = {
  title: "Privacy Policy · GoMarketi",
  description:
    "How GoMarketi collects, uses, stores, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="POLICIES"
      title="Privacy Policy"
      intro="What data we collect, why we collect it, how we protect it, and the rights you have over your information."
      updatedAt="15 August 2026"
      toc={[
        { id: "collect", label: "What we collect" },
        { id: "use", label: "How we use it" },
        { id: "share", label: "Who we share it with" },
        { id: "storage", label: "How long we keep it" },
        { id: "security", label: "Security" },
        { id: "rights", label: "Your rights" },
        { id: "cookies", label: "Cookies & tracking" },
        { id: "children", label: "Children" },
        { id: "changes", label: "Changes to this policy" },
        { id: "contact", label: "Contact us" },
      ]}
    >
      <PolicySection id="collect" title="What we collect">
        <p>To operate GoMarketi we collect the following categories of data:</p>
        <ul>
          <li>
            <strong>Account information:</strong> name, email, phone number,
            password (stored hashed, never in plain text).
          </li>
          <li>
            <strong>Delivery information:</strong> addresses you save, delivery
            preferences, and recipient details.
          </li>
          <li>
            <strong>Order data:</strong> what you buy, from which vendors, how
            much you pay, and delivery status.
          </li>
          <li>
            <strong>Payment data:</strong> handled by our payment processor
            (Paystack). We store only the last four digits of cards for your
            reference — full card details never touch our servers.
          </li>
          <li>
            <strong>Device & location:</strong> device type, operating system,
            IP address, and — with your permission — your approximate location
            to show nearby vendors.
          </li>
          <li>
            <strong>Support interactions:</strong> messages, screenshots, and
            call recordings you share when contacting support.
          </li>
        </ul>
      </PolicySection>

      <PolicySection id="use" title="How we use it">
        <ul>
          <li>To create and secure your account</li>
          <li>To match you with vendors near you and process your orders</li>
          <li>To process payments and issue refunds</li>
          <li>
            To send order updates, receipts, and important service notices
          </li>
          <li>To improve GoMarketi — analytics, bug fixes, and new features</li>
          <li>To detect and prevent fraud and abuse of the platform</li>
          <li>
            To send promotional messages, only if you've opted in (you can opt
            out at any time)
          </li>
        </ul>
      </PolicySection>

      <PolicySection id="share" title="Who we share it with">
        <p>We share personal data only when necessary to operate GoMarketi:</p>
        <ul>
          <li>
            <strong>Vendors</strong> receive your name, delivery address, phone
            number, and order details so they can fulfill your order.
          </li>
          <li>
            <strong>Couriers</strong> receive your name, delivery address, and
            phone number so they can deliver your order.
          </li>
          <li>
            <strong>Paystack</strong> handles all payment processing under their
            own privacy policy.
          </li>
          <li>
            <strong>Service providers</strong> (cloud hosting, transactional
            email, analytics) that help us operate the platform, under strict
            data-processing agreements.
          </li>
          <li>
            <strong>Regulators or law enforcement</strong> when required by
            valid legal process.
          </li>
        </ul>
        <p>
          <strong>We do not sell your personal data</strong> to third parties.
        </p>
      </PolicySection>

      <PolicySection id="storage" title="How long we keep it">
        <p>
          We retain personal data for as long as your account is active, plus a
          period afterwards required for tax records, dispute resolution, and
          regulatory obligations (typically 6 years for financial transactions
          under Nigerian tax law).
        </p>
        <p>
          You can request account deletion at any time from Settings → Privacy.
          Deletion removes your profile and order history. Some records must be
          retained beyond deletion where the law requires — for example,
          invoices for completed transactions.
        </p>
      </PolicySection>

      <PolicySection id="security" title="Security">
        <p>
          We protect your data with industry-standard measures: TLS in transit,
          encryption at rest for sensitive fields, hashed passwords, access
          controls, and regular security audits. No system is perfectly secure —
          if we ever become aware of a breach affecting your data, we'll notify
          you promptly as required by Nigerian data protection law.
        </p>
      </PolicySection>

      <PolicySection id="rights" title="Your rights">
        <p>
          Under the Nigeria Data Protection Regulation (NDPR), you have the
          right to:
        </p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Correct inaccurate or incomplete data</li>
          <li>
            Request deletion of your data (subject to the retention rules above)
          </li>
          <li>Object to certain types of processing (like marketing)</li>
          <li>Withdraw consent where processing is based on consent</li>
          <li>Lodge a complaint with the Nigeria Data Protection Commission</li>
        </ul>
        <p>
          To exercise any of these rights, contact us at{" "}
          <a href="mailto:privacy@gomarketi.com">privacy@gomarketi.com</a>. We
          respond within 30 days.
        </p>
      </PolicySection>

      <PolicySection id="cookies" title="Cookies & tracking">
        <p>
          Our website uses essential cookies to keep you signed in and remember
          your cart. We also use analytics cookies to understand how the site is
          used — you can opt out via your browser settings without affecting
          core functionality. The mobile app does not use cookies but does
          collect anonymised usage analytics.
        </p>
      </PolicySection>

      <PolicySection id="children" title="Children">
        <p>
          GoMarketi is not intended for anyone under 16. We don't knowingly
          collect data from children under 16. If you believe a child has
          provided us data, contact us and we'll delete it.
        </p>
      </PolicySection>

      <PolicySection id="changes" title="Changes to this policy">
        <p>
          We may update this policy as GoMarketi evolves or as regulations
          change. The "Last updated" date at the top of this page reflects the
          most recent change. Material changes will be communicated by email and
          in-app notice before they take effect.
        </p>
      </PolicySection>

      <PolicySection id="contact" title="Contact us">
        <p>
          For any privacy question, contact our Data Protection Officer at{" "}
          <a href="mailto:privacy@gomarketi.com">privacy@gomarketi.com</a>. For
          general support, reach us through the app or at{" "}
          <a href="mailto:support@gomarketi.com">support@gomarketi.com</a>.
        </p>
      </PolicySection>
    </LegalLayout>
  );
}
