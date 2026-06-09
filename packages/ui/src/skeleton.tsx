export default function Skeleton({
  className = "",
  style = {},
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`animate-pulse rounded-[6px] ${className}`}
      style={{
        background:
          "linear-gradient(90deg, #f1f5f9 25%, #e8f0ec 50%, #f1f5f9 75%)",
        backgroundSize: "400px 100%",
        animation:
          "skeleton-shimmer 1.4s infinite linear, pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
        ...style,
      }}
    />
  );
}
