import { motion } from "framer-motion";
import { useGetPlayerStats, useGetPlayer, getGetPlayerStatsQueryKey, getGetPlayerQueryKey } from "@workspace/api-client-react";
import { usePlayerContext } from "@/components/player-provider";

function StatCard({ label, value, sub, color, delay }: { label: string; value: string | number; sub?: string; color?: string; delay?: number }) {
  return (
    <motion.div
      className="rounded-xl p-4"
      style={{
        background: "hsl(240 10% 6%)",
        border: `1px solid ${color ? `${color}30` : "hsl(240 10% 12%)"}`,
        boxShadow: color ? `0 0 10px ${color}15` : "none",
      }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay ?? 0, type: "spring", bounce: 0.2 }}
    >
      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-black" style={{ color: color ?? "white" }}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </motion.div>
  );
}

function WinRateBar({ rate }: { rate: number }) {
  const pct = Math.round(rate * 100);
  return (
    <motion.div
      className="rounded-xl p-4"
      style={{ background: "hsl(240 10% 6%)", border: "1px solid hsl(240 10% 12%)" }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Win Rate</div>
        <div className="text-lg font-black" style={{ color: pct >= 50 ? "#10b981" : pct >= 30 ? "#f59e0b" : "#ef4444" }}>{pct}%</div>
      </div>
      <div className="h-2 rounded-full bg-black/50 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: pct >= 50 ? "#10b981" : pct >= 30 ? "#f59e0b" : "#ef4444" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

export default function StatsPage() {
  const { userId } = usePlayerContext();

  const { data: stats, isLoading: statsLoading } = useGetPlayerStats(userId ?? "", {
    query: {
      enabled: !!userId,
      queryKey: getGetPlayerStatsQueryKey(userId ?? ""),
    },
  });

  const { data: player, isLoading: playerLoading } = useGetPlayer(userId ?? "", {
    query: {
      enabled: !!userId,
      queryKey: getGetPlayerQueryKey(userId ?? ""),
    },
  });

  const isLoading = statsLoading || playerLoading;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Performance</div>
        <div className="text-2xl font-black glow-text">My Stats</div>
        {player && (
          <div className="text-sm text-muted-foreground mt-1">
            Player: <span className="text-white font-semibold">{player.username}</span>
          </div>
        )}
      </div>

      <div className="px-4 pb-6 flex flex-col gap-3">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-card border border-border animate-pulse" />
          ))
        ) : stats ? (
          <>
            {/* Balance */}
            <motion.div
              className="rounded-xl p-4 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, hsl(280 60% 12%) 0%, hsl(240 10% 6%) 100%)",
                border: "1px solid hsl(280 80% 60% / 0.4)",
                boxShadow: "0 0 20px hsl(280 80% 60% / 0.15)",
              }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Current Balance</div>
              <div className="text-3xl font-black text-white">
                {player?.balance.toFixed(2)} <span className="text-yellow-400 text-xl">TON</span>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-10">💎</div>
            </motion.div>

            {/* Win rate bar */}
            <WinRateBar rate={stats.winRate} />

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Total Spins" value={stats.totalSpins.toLocaleString()} delay={0.05} />
              <StatCard label="Biggest Win" value={`${stats.biggestWin.toFixed(1)} TON`} color="#f59e0b" delay={0.1} />
              <StatCard label="Total Won" value={`${stats.totalWon.toFixed(1)} TON`} color="#10b981" delay={0.15} />
              <StatCard label="Total Lost" value={`${stats.totalLost.toFixed(1)} TON`} color="#ef4444" delay={0.2} />
            </div>

            {/* Gifts stats */}
            <motion.div
              className="rounded-xl p-4"
              style={{ background: "hsl(240 10% 6%)", border: "1px solid hsl(240 10% 12%)" }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Gift Collection</div>
              <div className="flex gap-4">
                <div className="text-center flex-1">
                  <div className="text-3xl mb-1">🎁</div>
                  <div className="text-xl font-black text-white">{stats.giftsCollected}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div className="w-px bg-border" />
                <div className="text-center flex-1">
                  <div className="text-3xl mb-1">💎</div>
                  <div className="text-xl font-black" style={{ color: "#a855f7" }}>{stats.rareGifts}</div>
                  <div className="text-xs text-muted-foreground">Rare+</div>
                </div>
              </div>
            </motion.div>

            {/* Net balance */}
            {(() => {
              const net = stats.totalWon - stats.totalLost;
              const isPositive = net >= 0;
              return (
                <StatCard
                  label="Net Balance"
                  value={`${isPositive ? "+" : ""}${net.toFixed(1)} TON`}
                  color={isPositive ? "#10b981" : "#ef4444"}
                  delay={0.35}
                />
              );
            })()}

            {/* Member since */}
            {player && (
              <motion.div
                className="text-center text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Member since {new Date(player.createdAt).toLocaleDateString()}
              </motion.div>
            )}
          </>
        ) : (
          <div className="text-center text-muted-foreground py-10">No stats available yet. Start spinning!</div>
        )}
      </div>
    </div>
  );
}
