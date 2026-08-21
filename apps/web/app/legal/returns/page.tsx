import { LegalLayout, PolicySection } from "@/components/LegalSection";

export const metadata = {
  title: "Returns & Refunds · GoMarketi",
  description:
    "How to request a return or refund on GoMarketi — eligibility, timelines, and the process.",
};

export default function ReturnsPage() {
  return (
    <LegalLayout
      eyebrow="POLICIES"
      title="Returns & Refunds"
      intro="If something goes wrong with your order, here's how we make it right — what qualifies, how long it takes, and how to start a claim."
      updatedAt="15 August 2026"
      toc={[
        { id: "eligible", label: "What qualifies for a refund" },
        { id: "not-eligible", label: "What doesn't qualify" },
        { id: "how", label: "How to request a refund" },
        { id: "timelines", label: "Processing timelines" },
        { id: "returns", label: "Physical returns" },
        { id: "disputes", label: "Disputes" },
      ]}
    >
      <PolicySection id="eligible" title="What qualifies for a refund">
        <p>You can request a full or partial refund if:</p>
        <ul>
          <li>An item is missing from your order</li>
          <li>An item arrived damaged, broken, spoiled, or defective</li>
          <li>The wrong item was delivered</li>
          <li>Your order never arrived and can't be traced</li>
          <li>The item is materially different from what was advertised</li>
        </ul>
        <p>
          Requests should be submitted within{" "}
          <strong>48 hours of delivery</strong> for perishable goods (groceries,
          food, pharmacy) and <strong>7 days</strong> for other items. Older
          requests may still be reviewed but require additional verification.
        </p>
      </PolicySection>

      <PolicySection id="not-eligible" title="What doesn't qualify">
        <p>Refunds are not typically issued for:</p>
        <ul>
          <li>
            Change of mind on non-defective items once delivery has been
            accepted
          </li>
          <li>
            Personal-care items (undergarments, opened cosmetics) where hygiene
            makes return unsafe
          </li>
          <li>Perishables that have been consumed or partially consumed</li>
          <li>Custom or made-to-order items unless defective</li>
          <li>Digital items or services that have already been fulfilled</li>
        </ul>
      </PolicySection>

      <PolicySection id="how" title="How to request a refund">
        <p>The fastest path is through the app:</p>
        <ul>
          <li>Open Orders and tap the affected order</li>
          <li>
            Tap <strong>Report a problem</strong>
          </li>
          <li>Choose the issue that best describes what went wrong</li>
          <li>
            Add a short description — a photo of the damaged or wrong item
            speeds review significantly
          </li>
          <li>Submit</li>
        </ul>
        <p>
          Our team reviews every claim. Straightforward cases (missing item,
          clearly damaged product) are usually approved the same day.
        </p>
      </PolicySection>

      <PolicySection id="timelines" title="Processing timelines">
        <p>Once a refund is approved:</p>
        <ul>
          <li>
            <strong>Card payments:</strong> 3–7 business days back to the card,
            depending on your bank.
          </li>
          <li>
            <strong>Bank transfer:</strong> 1–3 business days to the originating
            account.
          </li>
          <li>
            <strong>GoMarketi wallet credit:</strong> instant, if you opt for
            credit instead of refund.
          </li>
        </ul>
      </PolicySection>

      <PolicySection id="returns" title="Physical returns">
        <p>
          For most refund cases you do <strong>not</strong> need to physically
          return the item — a photo through Report a problem is enough. For
          higher-value items (typically above ₦50,000) we may arrange courier
          pickup at no cost to you. If pickup is required, our team will
          coordinate directly.
        </p>
      </PolicySection>

      <PolicySection id="disputes" title="Disputes">
        <p>
          If you disagree with a refund decision, you can escalate by replying
          to the original support thread requesting a review. A different agent
          will re-examine the case, and where relevant we'll consult the vendor
          before responding.
        </p>
        <p>
          Chargebacks initiated with your bank before contacting GoMarketi will
          pause any active refund review and may extend the total resolution
          time.
        </p>
      </PolicySection>
    </LegalLayout>
  );
}
