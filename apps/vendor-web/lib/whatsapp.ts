/**
 * A wa.me link with the message already written, or null when there is no
 * usable number.
 *
 * Numbers arrive in whatever shape the buyer typed — "0801 234 5678",
 * "+234 801...", or the "234..." the storefront normalises to — and a local
 * one passed through unchanged produces a link that opens to nothing.
 */
export function whatsappLink(phone: string | undefined, text: string): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return null;
  let intl = digits;
  if (digits.startsWith("0")) intl = "234" + digits.slice(1);
  else if (!digits.startsWith("234") && digits.length === 10) intl = "234" + digits;
  if (intl.length < 11) return null;
  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
}
