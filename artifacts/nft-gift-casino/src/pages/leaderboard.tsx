import { motion } from "framer-motion";
import { useGetLeaderboard, getGetLeaderboardQueryKey } from "@workspace/api-client-react";
import { usePlayerContext } from "@/components/player-provider";

const RANK_COLORS = ["#f59e0b", "#9ca3af", "#cd7f32", "#a855f7", "#06b6d4"];
const RANK_LABELS = ["1st", "2nd", "3rd", "4th", "5th"];
const RANK_EMOJI = ["👑", "🥈", "🥉", "🎯", "⭐"];

export default function LeaderboardPage() {
  const { userId } = usePlayerContext();
  const { data: leaderboard, isLoading } = useGetLeaderboard(
    { limit: 20 },
    {
      query: {
        queryKey: getGetLeaderboardQueryKey({ limit: 20 }),
      },
    }
  );

  const myRank = leaderboard?.find(e => e.userId === userId);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Hall of Fame</div>
        <div className="text-2xl font-black glow-text">Leaderboard</div>
      </div>

      {/* Top 3 podium */}
      {!isLoading && leaderboard && leaderboard.length >= 3 && (
        <div className="px-4 mb-6">
          <div className="flex items-end justify-center gap-2">
            {/* 2nd place */}
            <motion.div
              className="flex-1 rounded-t-xl pt-4 pb-3 px-2 text-center"
              style={{
                background: "linear-gradient(180deg, hsl(240 10% 10%) 0%, hsl(240 10% 7%) 100%)",
                border: "1px solid #9ca3af40",
                minHeight: "100px",
              }}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-2xl mb-1">🥈</div>
              <div className="text-sm font-bold text-white truncate">{leaderboard[1].username}</div>
              <div className="text-xs text-yellow-400 font-bold">{leaderboard[1].totalWon.toFixed(0)} TON</div>
            </motion.div>

            {/* 1st place */}
            <motion.div
              className="flex-1 rounded-t-xl pt-5 pb-3 px-2 text-center"
              style={{
                background: "linear-gradient(180deg, hsl(45 60% 12%) 0%, hsl(240 10% 7%) 100%)",
                border: "1px solid #f59e0b60",
                boxShadow: "0 0 20px #f59e0b30",
                minHeight: "130px",
              }}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="text-3xl mb-1">👑</div>
              <div className="text-sm font-bold text-white truncate">{leaderboard[0].username}</div>
              <div className="text-xs font-bold" style={{ color: "#f59e0b" }}>{leaderboard[0].totalWon.toFixed(0)} TON</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{leaderboard[0].giftsCollected} gifts</div>
            </motion.div>

            {/* 3rd place */}
            <motion.div
              className="flex-1 rounded-t-xl pt-4 pb-3 px-2 text-center"
              style={{
                background: "linear-gradient(180deg, hsl(240 10% 10%) 0%, hsl(240 10% 7%) 100%)",
                border: "1px solid #cd7f3240",
                minHeight: "85px",
              }}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-2xl mb-1">🥉</div>
              <div className="text-sm font-bold text-white truncate">{leaderboard[2].username}</div>
              <div className="text-xs text-yellow-400 font-bold">{leaderboard[2].totalWon.toFixed(0)} TON</div>
            </motion.div>
          </div>
        </div>
      )}

      {/* My rank banner */}
      {myRank && (
        <div className="mx-4 mb-3 px-4 py-2.5 rounded-xl flex items-center justify-between" style={{ background: "hsl(280 80% 60% / 0.12)", border: "1px solid hsl(280 80% 60% / 0.3)" }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{RANK_EMOJI[myRank.rank - 1] ?? "🎮"}</span>
            <div>
              <div className="text-xs text-muted-foreground">Your Rank</div>
              <div className="text-sm font-bold text-white">#{myRank.rank} — {myRank.username}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-yellow-400">{myRank.totalWon.toFixed(0)} TON</div>
            <div className="text-xs text-muted-foreground">{myRank.giftsCollected} gifts</div>
          </div>
        </div>
      )}

      {/* Full list */}
      <div className="px-4 pb-6 flex flex-col gap-2">
        {isLoading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-card border border-border animate-pulse" />
          ))
        ) : (leaderboard ?? []).map((entry, i) => {
          const isMe = entry.userId === userId;
          const rankColor = RANK_COLORS[i] ?? "#6b7280";
          return (
            <motion.div
              key={entry.userId}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: isMe ? "hsl(280 80% 60% / 0.08)" : "hsl(240 10% 6%)",
                border: isMe ? "1px solid hsl(280 80% 60% / 0.4)" : "1px solid hsl(240 10% 12%)",
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                style={{ background: `${rankColor}20`, color: rankColor, border: `1px solid ${rankColor}40` }}>
                {entry.rank <= 3 ? RANK_EMOJI[entry.rank - 1] : entry.rank}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm text-white truncate">{entry.username}</span>
                  {isMe && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-bold flex-shrink-0">YOU</span>}
                </div>
                <div className="text-xs text-muted-foreground">{entry.giftsCollected} gifts • biggest: {entry.biggestWin.toFixed(0)} TON</div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-sm font-black text-yellow-400">{entry.totalWon.toFixed(0)}</div>
                <div className="text-[10px] text-muted-foreground">TON won</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
