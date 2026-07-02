export default function AuthLoading() {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, height: 3, overflow: "hidden" }}>
      <div style={{
        height: "100%",
        background: "#1A7A42",
        boxShadow: "0 0 10px rgba(26,122,66,0.6)",
        animation: "navSlide 1.2s ease-in-out infinite",
      }} />
      <style>{`@keyframes navSlide{0%{width:0%;margin-left:0}60%{width:70%;margin-left:15%}100%{width:0%;margin-left:100%}}`}</style>
    </div>
  );
}
