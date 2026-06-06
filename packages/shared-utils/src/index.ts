export const formatKobo = (amount: number) => `₦${(amount / 100).toFixed(2)}`;
export const toKobo = (amount: number) => Math.round(amount * 100);

export const generateSlug = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};
