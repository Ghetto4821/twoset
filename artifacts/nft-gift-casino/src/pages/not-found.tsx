import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="text-6xl mb-4">🎰</div>
      <h1 className="text-2xl font-black text-white mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-6">This page doesn&apos;t exist in the vault.</p>
      <Link href="/" className="px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider" style={{ background: "hsl(280 80% 60%)", color: "white" }}>
        Back to Spin
      </Link>
    </div>
  );
}
