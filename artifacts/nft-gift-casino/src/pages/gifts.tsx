import { motion } from "framer-motion";
import { useGetPlayerGifts, getGetPlayerGiftsQueryKey } from "@workspace/api-client-react";
import { usePlayerContext } from "@/components/player-provider";

const RARITY_ORDER = ["Legendary", "Epic", "Rare", "Uncommon", "Common"];

const RARITY_COLOR: Record<string, string> = {
  Legendary: "45 100% 50%",
  Epic: "280 80% 60%",
  Rare: "190 90% 50%",
  Uncommon: "160 80% 50%",
  Common: "240 5% 65%",
};

export default function GiftsPage() {
  const { userId } = usePlayerContext();

  const { data: gifts, isLoading } = useGetPlayerGifts(userId ?? "", {
    query: {
      enabled: !!userId,
      queryKey: getGetPlayerGiftsQueryKey(userId ?? ""),
    },
  });

  const sorted = [...(gifts ?? [])].sort((a, b) => {
    const ra = RARITY_ORDER.indexOf(a.rarity);
    const rb = RARITY_ORDER.indexOf(b.rarity);
    return ra - rb;
  });

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Your Collection</div>
        <div className="text-2xl font-black glow-text">NFT Vault</div>
        {gifts && (
          <div className="text-sm text-muted-foreground mt-1">
            {gifts.length} gift{gifts.length !== 1 ? "s" : ""} collected
          </div>
        )}
      </div>

      {/* Rarity breakdown */}
      {gifts && gifts.length > 0 && (
        <div className="px-4 mb-4 flex gap-2 overflow-x-auto no-scrollbar">
          {RARITY_ORDER.map((rarity) => {
            const count = gifts.filter(g => g.rarity === rarity).length;
            if (count === 0) return null;
            return (
              <div
                key={rarity}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{
                  background: `hsl(${RARITY_COLOR[rarity]} / 0.15)`,
                  border: `1px solid hsl(${RARITY_COLOR[rarity]} / 0.4)`,
                  color: `hsl(${RARITY_COLOR[rarity]})`,
                }}
              >
                {count}x {rarity}
              </div>
            );
          })}
        </div>
      )}

      {/* Gift grid */}
      <div className="px-4 pb-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 rounded-xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-20 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-4">🎁</div>
            <div className="text-lg font-bold text-white mb-2">Vault is Empty</div>
            <div className="text-sm text-muted-foreground">Spin the slot machine to win NFT gifts</div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {sorted.map((gift, i) => (
              <motion.div
                key={gift.id}
                className={`rounded-xl p-4 flex flex-col items-center text-center rarity-${gift.rarity} glow-card`}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.05, type: "spring", bounce: 0.3 }}
                whileHover={{ scale: 1.03 }}
              >
                <div className="text-4xl mb-2">{gift.emoji}</div>
                <div className="text-sm font-bold text-white leading-tight mb-1">{gift.name}</div>
                <div className={`text-xs font-semibold text-rarity mb-2`}>
                  {gift.rarity}
                </div>
                <div
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: `hsl(${RARITY_COLOR[gift.rarity] ?? "240 5% 65%"} / 0.2)`,
                    color: `hsl(${RARITY_COLOR[gift.rarity] ?? "240 5% 65%"})`,
                  }}
                >
                  {gift.value} TON
                </div>
                <div className="text-[10px] text-muted-foreground mt-2">
                  {new Date(gift.wonAt).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
