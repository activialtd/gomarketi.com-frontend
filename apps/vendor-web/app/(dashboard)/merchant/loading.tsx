export default function DashboardLoading() {
  return (
    <>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, height: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          background: "#1A7A42",
          boxShadow: "0 0 10px rgba(26,122,66,0.6)",
          animation: "navSlide 1.2s ease-in-out infinite",
        }} />
        <style>{`@keyframes navSlide{0%{width:0%;margin-left:0}60%{width:70%;margin-left:15%}100%{width:0%;margin-left:100%}}`}</style>
      </div>
      <div className="p-6 lg:p-8 space-y-5 animate-pulse">
        <div style={{ height: 28, width: 180, background: "#e2e8f0", borderRadius: 8 }} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} style={{ height: 88, background: "#f1f5f9", borderRadius: 12 }} />)}
        </div>
        <div style={{ height: 220, background: "#f1f5f9", borderRadius: 14 }} />
        <div style={{ height: 160, background: "#f1f5f9", borderRadius: 14 }} />
      </div>
    </>
  );
}
