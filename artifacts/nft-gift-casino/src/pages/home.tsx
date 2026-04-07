import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useGetPlayer, useGetRecentWins, useGetLeaderboard, getGetPlayerQueryKey, getGetLeaderboardQueryKey } from "@workspace/api-client-react";
import { usePlayerContext } from "@/components/player-provider";
import { Users, ChevronRight, Wallet, Star, TrendingUp } from "lucide-react";

const BONUS_SLIDES = [
  {
    id: 0,
    tag: "DEPOSIT BONUS",
    title: "For every deposit",
    subtitle: "you get a gift",
    tiers: [
      { label: "up to 10", unit: "TON", bonus: "+0.4 TON", color: "#10b981" },
      { label: "from 10", unit: "TON", bonus: "+1 TON", color: "#a855f7" },
    ],
    bg: "linear-gradient(135deg, #0a3d1f 0%, #0d1a0f 60%, #1a0d30 100%)",
    accent: "#10b981",
    emoji: "🌸",
  },
  {
    id: 1,
    tag: "JACKPOT WEEK",
    title: "Triple your wins",
    subtitle: "limited time offer",
    tiers: [
      { label: "Slot jackpot", unit: "", bonus: "×10", color: "#f59e0b" },
      { label: "Gift drop", unit: "", bonus: "×3", color: "#06b6d4" },
    ],
    bg: "linear-gradient(135deg, #2d1a00 0%, #1a0d00 60%, #0d1a2d 100%)",
    accent: "#f59e0b",
    emoji: "👑",
  },
  {
    id: 2,
    tag: "NFT GIFTS",
    title: "Legendary drops",
    subtitle: "every 10th spin",
    tiers: [
      { label: "Legendary", unit: "", bonus: "500 TON", color: "#f59e0b" },
      { label: "Epic", unit: "", bonus: "200 TON", color: "#a855f7" },
    ],
    bg: "linear-gradient(135deg, #1a0d30 0%, #0d1a30 60%, #0a1a1a 100%)",
    accent: "#a855f7",
    emoji: "💎",
  },
];

const GAME_CARDS = [
  {
    id: "slots",
    name: "Slots",
    href: "/play",
    description: "Spin & win NFT gifts",
    emoji: "🎰",
    liveCount: null,
    live: true,
    gradient: "linear-gradient(135deg, #280060 0%, #120030 100%)",
    border: "#a855f7",
    glow: "rgba(168,85,247,0.3)",
    badge: "PLAY NOW",
    badgeColor: "#a855f7",
  },
  {
    id: "cases",
    name: "Cases",
    href: "#",
    description: "Open mystery boxes",
    emoji: "📦",
    liveCount: 15,
    live: false,
    gradient: "linear-gradient(135deg, #003320 0%, #001a10 100%)",
    border: "#10b981",
    glow: "rgba(16,185,129,0.25)",
    badge: "SOON",
    badgeColor: "#10b981",
  },
  {
    id: "crash",
    name: "Crash",
    href: "#",
    description: "Cash out before it crashes",
    emoji: "🚀",
    liveCount: 13,
    live: false,
    gradient: "linear-gradient(135deg, #2d1500 0%, #1a0a00 100%)",
    border: "#f59e0b",
    glow: "rgba(245,158,11,0.25)",
    badge: "SOON",
    badgeColor: "#f59e0b",
  },
];

function BonusBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % BONUS_SLIDES.length), 3500);
    return () => clearInterval(t);
  }, []);

  const slide = BONUS_SLIDES[current];

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: 160 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          className="absolute inset-0 p-4 flex flex-col justify-between"
          style={{ background: slide.bg }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          {/* Top row */}
          <div className="flex items-start justify-between">
            <div>
              <div
                className="text-[10px] font-black tracking-[0.2em] px-2 py-0.5 rounded-full mb-2 inline-block"
                style={{ background: `${slide.accent}25`, color: slide.accent, border: `1px solid ${slide.accent}40` }}
              >
                {slide.tag}
              </div>
              <div className="text-xl font-black text-white leading-tight">{slide.title}</div>
              <div className="text-sm text-white/60">{slide.subtitle}</div>
            </div>
            <motion.div
              className="text-5xl mt-1 select-none"
              animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              {slide.emoji}
            </motion.div>
          </div>

          {/* Bonus tiers */}
          <div className="flex gap-2 mt-3">
            {slide.tiers.map((tier, i) => (
              <div
                key={i}
                className="flex-1 rounded-xl px-3 py-2"
                style={{ background: "rgba(0,0,0,0.35)", border: `1px solid ${tier.color}40` }}
              >
                <div className="text-[11px] text-white/50 truncate">{tier.label} {tier.unit}</div>
                <div className="text-lg font-black" style={{ color: tier.color }}>{tier.bonus}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {BONUS_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? 16 : 5,
              height: 5,
              background: i === current ? "white" : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function LiveTicker({ wins }: { wins: Array<{ username: string; giftName: string; giftEmoji: string; rarity: string }> }) {
  if (!wins || wins.length === 0) return null;

  const items = [...wins, ...wins]; // duplicate for seamless loop

  return (
    <div
      className="rounded-xl overflow-hidden flex items-center gap-0"
      style={{ background: "hsl(240 10% 7%)", border: "1px solid hsl(240 10% 14%)" }}
    >
      <div
        className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest px-3 py-2.5 border-r border-white/10"
        style={{ background: "hsl(280 80% 60% / 0.15)", color: "hsl(280 80% 70%)" }}
      >
        Live
      </div>
      <div className="overflow-hidden flex-1">
        <motion.div
          className="flex gap-6 whitespace-nowrap py-2.5 px-3 text-xs text-muted-foreground"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
        >
          {items.map((w, i) => (
            <span key={i} className="flex items-center gap-1.5 flex-shrink-0">
              <span>{w.giftEmoji}</span>
              <span className="text-white/70 font-medium">{w.username}</span>
              <span>won</span>
              <span className="font-semibold text-white/90">{w.giftName}</span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function GameCard({ card, activePlayers }: { card: typeof GAME_CARDS[0]; activePlayers?: number }) {
  const inner = (
    <motion.div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: card.gradient,
        border: `1px solid ${card.border}40`,
        boxShadow: card.live ? `0 0 20px ${card.glow}, 0 0 40px ${card.glow}` : `0 0 10px ${card.glow}`,
        minHeight: 120,
      }}
      whileTap={card.live ? { scale: 0.97 } : {}}
      whileHover={card.live ? { scale: 1.02 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Live pulse for active games */}
      {card.live && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{ border: `1px solid ${card.border}60` }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}

      <div className="p-4 flex flex-col h-full justify-between" style={{ minHeight: 120 }}>
        <div className="flex items-start justify-between">
          <div>
            {/* Badge */}
            <div
              className="text-[9px] font-black tracking-[0.15em] px-2 py-0.5 rounded-full mb-2 inline-block"
              style={{
                background: `${card.badgeColor}20`,
                color: card.badgeColor,
                border: `1px solid ${card.badgeColor}50`,
              }}
            >
              {card.badge}
            </div>
            <div className="text-lg font-black text-white">{card.name}</div>
            <div className="text-xs text-white/50 mt-0.5">{card.description}</div>
          </div>
          <motion.div
            className="text-4xl select-none"
            animate={card.live ? { rotate: [0, -5, 5, 0] } : {}}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          >
            {card.emoji}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: card.live ? "#10b981" : card.badgeColor }} />
            <span className="text-[11px] text-white/50">
              {activePlayers !== undefined ? `${activePlayers} playing` : card.live ? "Online" : "Coming soon"}
            </span>
          </div>
          {card.live && (
            <div className="flex items-center gap-1" style={{ color: card.border }}>
              <span className="text-xs font-bold">Play</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (card.live) {
    return <Link href={card.href}>{inner}</Link>;
  }
  return inner;
}

export default function HomePage() {
  const { userId } = usePlayerContext();

  const { data: player } = useGetPlayer(userId ?? "", {
    query: { enabled: !!userId, queryKey: getGetPlayerQueryKey(userId ?? "") },
  });

  const { data: recentWins } = useGetRecentWins();

  const { data: leaderboard } = useGetLeaderboard({ limit: 3 }, {
    query: { queryKey: getGetLeaderboardQueryKey({ limit: 3 }) },
  });

  const balance = player?.balance ?? 0;
  const totalPlayers = (leaderboard?.length ?? 0) + 4;

  return (
    <div className="flex flex-col min-h-full select-none">

      {/* ── Header ─────────────────────────────────── */}
      <div
        className="px-4 pt-5 pb-4"
        style={{ background: "linear-gradient(180deg, hsl(240 10% 5%) 0%, transparent 100%)" }}
      >
        <div className="flex items-center justify-between">
          {/* TopGift logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xl font-black flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
                boxShadow: "0 0 15px rgba(168,85,247,0.5)",
              }}
            >
              🎁
            </div>
            <div>
              <div className="text-base font-black text-white leading-none tracking-tight">TopGift</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                {totalPlayers} online
              </div>
            </div>
          </div>

          {/* Wallet / balance */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "hsl(240 10% 8%)", border: "1px solid hsl(240 10% 16%)" }}
          >
            <Wallet className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm font-black text-white">{balance.toFixed(1)}</div>
            <div className="text-xs font-bold text-yellow-400">TON</div>
          </div>
        </div>
      </div>

      {/* ── Scrollable content ──────────────────────── */}
      <div className="flex flex-col gap-4 px-4 pb-6">

        {/* Bonus banner */}
        <BonusBanner />

        {/* Live ticker */}
        {recentWins && recentWins.length > 0 && (
          <LiveTicker wins={recentWins} />
        )}

        {/* Section header */}
        <div className="flex items-center justify-between mt-1">
          <div className="text-base font-black text-white">Games</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Top picks</span>
          </div>
        </div>

        {/* Game cards — big featured Slots card */}
        <GameCard card={GAME_CARDS[0]} activePlayers={player?.totalSpins ?? 1} />

        {/* Grid for the coming-soon games */}
        <div className="grid grid-cols-2 gap-3">
          <GameCard card={GAME_CARDS[1]} activePlayers={15} />
          <GameCard card={GAME_CARDS[2]} activePlayers={13} />
        </div>

        {/* Quick stats row */}
        {player && (
          <motion.div
            className="rounded-xl p-4 flex gap-0"
            style={{ background: "hsl(240 10% 6%)", border: "1px solid hsl(240 10% 12%)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex-1 text-center border-r border-border">
              <div className="text-xs text-muted-foreground mb-0.5">Spins</div>
              <div className="text-lg font-black text-white">{player.totalSpins}</div>
            </div>
            <div className="flex-1 text-center border-r border-border">
              <div className="text-xs text-muted-foreground mb-0.5">Won</div>
              <div className="text-lg font-black text-emerald-400">{(player.totalWon ?? 0).toFixed(0)}</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-xs text-muted-foreground mb-0.5">Best</div>
              <div className="text-lg font-black text-yellow-400">{(player.biggestWin ?? 0).toFixed(0)}</div>
            </div>
          </motion.div>
        )}

        {/* Top players teaser */}
        {leaderboard && leaderboard.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-black text-white flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-400" />
                Top Players
              </div>
              <Link href="/leaderboard" className="text-xs text-primary font-semibold flex items-center gap-0.5">
                All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {leaderboard.slice(0, 3).map((entry, i) => {
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <motion.div
                    key={entry.userId}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    style={{ background: "hsl(240 10% 6%)", border: "1px solid hsl(240 10% 11%)" }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    <span className="text-xl flex-shrink-0">{medals[i]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate">{entry.username}</div>
                      <div className="text-xs text-muted-foreground">{entry.giftsCollected} gifts</div>
                    </div>
                    <div className="text-sm font-black text-yellow-400">{entry.totalWon.toFixed(0)} TON</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Referral CTA */}
        <motion.div
          className="rounded-2xl p-4 flex items-center gap-4"
          style={{
            background: "linear-gradient(135deg, hsl(280 50% 10%) 0%, hsl(240 10% 7%) 100%)",
            border: "1px solid hsl(280 80% 60% / 0.25)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-4xl flex-shrink-0">🤝</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-black text-white">Invite friends</div>
            <div className="text-xs text-muted-foreground mt-0.5">Earn 10% of their wins forever</div>
          </div>
          <div
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: "hsl(280 80% 60% / 0.2)", color: "hsl(280 80% 70%)", border: "1px solid hsl(280 80% 60% / 0.3)" }}
          >
            <Users className="w-3.5 h-3.5" />
            Invite
          </div>
        </motion.div>
      </div>
    </div>
  );
}
