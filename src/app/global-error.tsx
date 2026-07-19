"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f8fafc", color: "#0f172a", fontFamily: "Arial, sans-serif" }}>
        <main style={{ margin: "0 auto", maxWidth: 640, padding: "80px 24px" }}>
          <p style={{ color: "#047857", fontWeight: 700, textTransform: "uppercase", fontSize: 13 }}>Trapwise</p>
          <h1 style={{ fontSize: 32 }}>Something needs another try.</h1>
          <p style={{ lineHeight: 1.6 }}>Trapwise could not load this page. Your local study data has not been intentionally cleared.</p>
          <button type="button" onClick={reset} style={{ border: 0, borderRadius: 8, background: "#059669", color: "white", padding: "12px 16px", fontWeight: 700 }}>Try again</button>
          <button type="button" onClick={() => { window.location.href = "/"; }} style={{ marginLeft: 12, border: 0, background: "transparent", color: "#065f46", fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}>Return home</button>
        </main>
      </body>
    </html>
  );
}
