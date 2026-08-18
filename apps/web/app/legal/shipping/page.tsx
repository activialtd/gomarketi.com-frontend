import { LegalLayout, PolicySection } from "@/components/LegalSection";

export const metadata = {
  title: "Shipping Policy · GoMarketi",
  description:
    "Delivery zones, timelines, fees, and what to do if your order is delayed on GoMarketi.",
};

export default function ShippingPage() {
  return (
    <LegalLayout
      eyebrow="POLICIES"
      title="Shipping Policy"
      intro="How your GoMarketi orders get from the vendor to your doorstep — timelines, fees, and what to expect."
      updatedAt="15 August 2026"
      toc={[
        { id: "coverage", label: "Where we deliver" },
        { id: "timelines", label: "Delivery timelines" },
        { id: "fees", label: "Shipping fees" },
        { id: "tracking", label: "Tracking your order" },
        { id: "delays", label: "Delays & missed deliveries" },
        { id: "recipient", label: "Receiving your order" },
      ]}
    >
      <PolicySection id="coverage" title="Where we deliver">
        <p>
          GoMarketi currently operates across major cities in Nigeria. Delivery
          coverage varies by vendor — each store on the platform sets its own
          delivery radius from its physical location.
        </p>
        <p>
          When you enter your delivery address at checkout, only vendors that
          serve your area will be able to accept the order. If no vendors
          currently cover your location, we'll let you know at that point.
        </p>
      </PolicySection>

      <PolicySection id="timelines" title="Delivery timelines">
        <p>
          Estimated delivery windows depend on the vendor and your distance:
        </p>
        <ul>
          <li>
            <strong>Same-day (0–4 hours):</strong> most food, groceries, and
            pharmacy orders within the vendor's primary delivery zone.
          </li>
          <li>
            <strong>Next-day:</strong> orders placed after the vendor's cut-off
            time, or larger items requiring dedicated dispatch.
          </li>
          <li>
            <strong>2–5 business days:</strong> inter-city deliveries or items
            being shipped from vendors outside your immediate area.
          </li>
        </ul>
        <p>
          The estimated window shown at checkout is what the vendor commits to.
          Weather, traffic, and unforeseen events can affect delivery — see the
          Delays section below.
        </p>
      </PolicySection>

      <PolicySection id="fees" title="Shipping fees">
        <p>
          Shipping fees are set by the vendor and calculated based on distance,
          order size, and delivery type. The exact fee is shown at checkout
          before you pay — there are no hidden charges added afterward.
        </p>
        <p>
          Some vendors offer <strong>free delivery</strong> above a minimum
          order value (for example, above ₦20,000). This is displayed on the
          storefront and applied automatically at checkout when your order
          qualifies.
        </p>
      </PolicySection>

      <PolicySection id="tracking" title="Tracking your order">
        <p>
          Every order can be tracked in real time from the Orders tab in the
          GoMarketi app. Once dispatched, you'll see:
        </p>
        <ul>
          <li>The courier's live location on the map</li>
          <li>Updated ETA as they approach</li>
          <li>The courier's name and phone number for direct contact</li>
        </ul>
        <p>
          You'll also receive push notifications at each stage — order
          confirmed, being prepared, on the way, and delivered.
        </p>
      </PolicySection>

      <PolicySection id="delays" title="Delays & missed deliveries">
        <p>
          If your order is more than 30 minutes past its estimated delivery
          time, please contact support through the app (Help → Report a
          problem). We'll investigate and either escalate to the courier or
          arrange an alternative.
        </p>
        <p>
          If a delivery attempt is missed because you were unavailable, the
          courier will hold the package for up to 24 hours. During this window
          you can rearrange delivery through support. After 24 hours, the
          package is returned to the vendor and refund policies apply — see our
          Returns page.
        </p>
      </PolicySection>

      <PolicySection id="recipient" title="Receiving your order">
        <p>
          Please be available at the delivery address during your estimated
          window, and provide a phone number the courier can reach. If someone
          else will receive the package on your behalf, they'll need to confirm
          the order number with the courier.
        </p>
        <p>
          <strong>Age-restricted items</strong> (certain medications,
          alcohol-containing products) require the recipient to be 18 or older
          and to present valid ID at delivery.
        </p>
      </PolicySection>
    </LegalLayout>
  );
}
