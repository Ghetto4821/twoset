import { Link, useLocation } from "wouter";
import { LayoutGrid, Gift, Trophy, BarChart3 } from "lucide-react";
import { usePlayerContext } from "./player-provider";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isLoading } = usePlayerContext();

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse" style={{ textShadow: "0 0 10px hsl(280 80% 60% / 0.5)" }}>
            TopGift is loading...
          </p>
        </div>
      </div>
    );
  }

  const isHome = location === "/";
  const isPlay = location === "/play";
  const isGifts = location === "/gifts";
  const isLeaderboard = location === "/leaderboard";
  const isStats = location === "/stats";

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col relative bg-background/95 shadow-2xl shadow-primary/5">

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-[76px] no-scrollbar">
          {children}
        </main>

        {/* Bottom Nav */}
        <nav
          className="absolute bottom-0 left-0 right-0 h-[76px] flex items-center z-50"
          style={{
            background: "linear-gradient(180deg, transparent 0%, hsl(240 10% 4% / 0.95) 20%)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid hsl(240 10% 12%)",
          }}
        >
          {/* Left tabs */}
          <div className="flex flex-1 items-center justify-around">
            <NavTab href="/" icon={<LayoutGrid className="w-5 h-5" />} label="Games" active={isHome} />
            <NavTab href="/leaderboard" icon={<Trophy className="w-5 h-5" />} label="Top" active={isLeaderboard} />
          </div>

          {/* Center play button */}
          <div className="flex flex-col items-center justify-center px-4">
            <Link href="/play">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-200 active:scale-95"
                style={{
                  background: isPlay
                    ? "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)"
                    : "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
                  boxShadow: isPlay
                    ? "0 0 24px rgba(168,85,247,0.7), 0 0 48px rgba(168,85,247,0.3)"
                    : "0 0 14px rgba(124,58,237,0.4)",
                  transform: isPlay ? "translateY(-4px)" : "translateY(-6px)",
                }}
              >
                🎰
              </div>
              <div
                className="text-[10px] font-black text-center mt-1 tracking-wider"
                style={{ color: isPlay ? "hsl(280 80% 70%)" : "hsl(240 5% 55%)" }}
              >
                SPIN
              </div>
            </Link>
          </div>

          {/* Right tabs */}
          <div className="flex flex-1 items-center justify-around">
            <NavTab href="/gifts" icon={<Gift className="w-5 h-5" />} label="Vault" active={isGifts} />
            <NavTab href="/stats" icon={<BarChart3 className="w-5 h-5" />} label="Stats" active={isStats} />
          </div>
        </nav>
      </div>
    </div>
  );
}

function NavTab({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-0.5 py-2 px-4 transition-colors duration-150"
      style={{ color: active ? "hsl(280 80% 70%)" : "hsl(240 5% 50%)" }}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      {active && (
        <span
          className="absolute bottom-2 rounded-full"
          style={{
            width: 4, height: 4,
            background: "hsl(280 80% 70%)",
            boxShadow: "0 0 8px 2px hsl(280 80% 60% / 0.6)",
          }}
        />
      )}
    </Link>
  );
}
