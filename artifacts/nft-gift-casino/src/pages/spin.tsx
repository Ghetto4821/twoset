import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetPlayer, useSpin, useGetRecentWins, getGetPlayerQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { usePlayerContext } from "@/components/player-provider";

const SYMBOLS = ["💎", "🌟", "🎰", "🔮", "💰", "👑", "🎁", "🍀", "🚀", "🦄"];
const BET_OPTIONS = [1, 5, 10, 25, 50];

const RARITY_COLOR: Record<string, string> = {
  Legendary: "#f59e0b",
  Epic: "#a855f7",
  Rare: "#06b6d4",
  Uncommon: "#10b981",
  Common: "#9ca3af",
};

function ReelStrip({ spinning, finalSymbol, delay }: { spinning: boolean; finalSymbol: string; delay: number }) {
  const [displaySymbol, setDisplaySymbol] = useState(finalSymbol);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startSpin = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDisplaySymbol(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    }, 80);
  }, []);

  const stopSpin = useCallback((symbol: string) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setDisplaySymbol(symbol);
  }, []);

  if (spinning) {
    startSpin();
  } else {
    if (intervalRef.current) {
      stopSpin(finalSymbol);
    } else {
      if (displaySymbol !== finalSymbol) {
        setDisplaySymbol(finalSymbol);
      }
    }
  }

  return (
    <motion.div
      className="relative w-24 h-24 rounded-xl bg-black/50 border border-border flex items-center justify-center overflow-hidden"
      style={{
        boxShadow: spinning
          ? "0 0 20px hsl(280 80% 60% / 0.6), inset 0 0 10px hsl(280 80% 60% / 0.2)"
          : "0 0 8px hsl(280 80% 60% / 0.2)",
      }}
      animate={spinning ? { borderColor: ["hsl(280 80% 60%)", "hsl(190 90% 50%)", "hsl(280 80% 60%)"] } : {}}
      transition={{ repeat: Infinity, duration: 0.5 }}
    >
      <motion.span
        className="text-5xl select-none"
        animate={spinning ? { y: [0, -10, 10, 0], opacity: [1, 0.6, 1] } : { y: 0, opacity: 1 }}
        transition={spinning ? { repeat: Infinity, duration: 0.15 } : { duration: 0.3 }}
      >
        {displaySymbol}
      </motion.span>
      {spinning && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none" />
      )}
    </motion.div>
  );
}

function WinOverlay({ result, onClose }: { result: { isWin: boolean; winAmount: number; reels: string[]; giftWon?: { name: string; emoji: string; rarity: string; value: number } | null; multiplier: number; combo?: string | null }; onClose: () => void }) {
  if (!result.isWin && !result.giftWon) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative mx-4 max-w-sm w-full rounded-2xl p-6 text-center"
        style={{
          background: "linear-gradient(135deg, hsl(240 10% 8%) 0%, hsl(280 30% 10%) 100%)",
          boxShadow: result.giftWon
            ? `0 0 40px ${RARITY_COLOR[result.giftWon.rarity] ?? "#a855f7"}80`
            : "0 0 40px hsl(280 80% 60% / 0.5)",
          border: result.giftWon
            ? `1px solid ${RARITY_COLOR[result.giftWon.rarity] ?? "#a855f7"}60`
            : "1px solid hsl(280 80% 60% / 0.5)",
        }}
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.5, y: 50 }}
        transition={{ type: "spring", bounce: 0.4 }}
        onClick={(e) => e.stopPropagation()}
      >
        {result.combo === "JACKPOT" && (
          <motion.div
            className="text-5xl mb-2"
            animate={{ scale: [1, 1.3, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: 3, duration: 0.5 }}
          >
            🎉
          </motion.div>
        )}

        <div className="text-xl font-black uppercase tracking-widest mb-1" style={{ color: "#f59e0b", textShadow: "0 0 20px #f59e0b80" }}>
          {result.combo === "JACKPOT" ? "JACKPOT!" : result.combo === "PREMIUM" ? "PREMIUM WIN!" : "WIN!"}
        </div>

        <div className="text-4xl font-black text-white mb-1">
          +{result.winAmount.toFixed(1)} <span className="text-yellow-400">TON</span>
        </div>

        {result.multiplier > 1 && (
          <div className="text-sm text-muted-foreground mb-3">{result.multiplier}x multiplier</div>
        )}

        {result.giftWon && (
          <div className="mt-3 p-3 rounded-xl" style={{ background: `${RARITY_COLOR[result.giftWon.rarity]}10`, border: `1px solid ${RARITY_COLOR[result.giftWon.rarity]}40` }}>
            <div className="text-4xl mb-1">{result.giftWon.emoji}</div>
            <div className="font-bold text-white">{result.giftWon.name}</div>
            <div className="text-sm font-semibold" style={{ color: RARITY_COLOR[result.giftWon.rarity] }}>
              {result.giftWon.rarity} NFT Gift
            </div>
            <div className="text-xs text-muted-foreground mt-1">+{result.giftWon.value} TON value</div>
          </div>
        )}

        <button
          className="mt-4 w-full py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider"
          style={{ background: "hsl(280 80% 60%)", color: "white" }}
          onClick={onClose}
        >
          Collect
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function SpinPage() {
  const { userId } = usePlayerContext();
  const queryClient = useQueryClient();
  const [betAmount, setBetAmount] = useState(5);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(["💎", "🌟", "👑"]);
  const [spinResult, setSpinResult] = useState<{
    isWin: boolean; winAmount: number; reels: string[];
    giftWon?: { name: string; emoji: string; rarity: string; value: number } | null;
    multiplier: number; combo?: string | null;
  } | null>(null);
  const [showWin, setShowWin] = useState(false);

  const { data: player, isLoading: playerLoading } = useGetPlayer(userId ?? "", {
    query: {
      enabled: !!userId,
      queryKey: getGetPlayerQueryKey(userId ?? ""),
    },
  });

  const { data: recentWins } = useGetRecentWins();

  const spinMutation = useSpin();

  const handleSpin = useCallback(async () => {
    if (!userId || spinning || (player && player.balance < betAmount)) return;

    setSpinning(true);
    setShowWin(false);
    setSpinResult(null);

    try {
      const result = await spinMutation.mutateAsync({ data: { userId, betAmount } });
      
      setTimeout(() => {
        setSpinning(false);
        setReels(result.reels);
        
        const spinResultData = {
          isWin: result.isWin,
          winAmount: result.winAmount,
          reels: result.reels,
          giftWon: result.giftWon ?? null,
          multiplier: result.multiplier,
          combo: result.combo ?? null,
        };
        setSpinResult(spinResultData);
        
        if (result.isWin || result.giftWon) {
          setTimeout(() => setShowWin(true), 300);
        }

        queryClient.invalidateQueries({ queryKey: getGetPlayerQueryKey(userId) });
      }, 1800);
    } catch {
      setSpinning(false);
    }
  }, [userId, spinning, player, betAmount, spinMutation, queryClient]);

  const balance = player?.balance ?? 0;
  const canSpin = !spinning && !playerLoading && balance >= betAmount;

  const ticker = recentWins && recentWins.length > 0
    ? recentWins.map(w => `${w.username} won ${w.giftEmoji} ${w.giftName} (${w.rarity})`).join("   •   ")
    : "Be the first to win a legendary gift!";

  return (
    <div className="flex flex-col min-h-full select-none">
      {/* Recent wins ticker */}
      <div className="bg-black/60 border-b border-border overflow-hidden py-2 px-4">
        <motion.div
          className="whitespace-nowrap text-xs text-muted-foreground"
          animate={{ x: ["100%", "-100%"] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        >
          {ticker}
        </motion.div>
      </div>

      {/* Header with balance */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">Balance</div>
          <div className="text-2xl font-black text-white">
            {playerLoading ? "—" : balance.toFixed(1)}
            <span className="text-yellow-400 ml-1.5 text-lg">TON</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">Spins</div>
          <div className="text-xl font-bold text-white">{player?.totalSpins ?? 0}</div>
        </div>
      </div>

      {/* Slot Machine */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        
        {/* Machine frame */}
        <div
          className="w-full rounded-2xl p-6"
          style={{
            background: "linear-gradient(180deg, hsl(240 10% 8%) 0%, hsl(240 10% 5%) 100%)",
            boxShadow: "0 0 30px hsl(280 80% 60% / 0.2), 0 0 60px hsl(280 80% 60% / 0.1)",
            border: "1px solid hsl(280 80% 60% / 0.3)",
          }}
        >
          {/* Title */}
          <div className="text-center mb-5">
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">NFT Gift Casino</div>
            <div className="text-sm font-black uppercase tracking-widest glow-text mt-0.5" style={{ color: "hsl(280 80% 70%)" }}>TopGift</div>
          </div>

          {/* Reels */}
          <div className="flex gap-3 justify-center mb-5">
            {[0, 1, 2].map((i) => (
              <ReelStrip
                key={i}
                spinning={spinning}
                finalSymbol={reels[i] ?? SYMBOLS[i]}
                delay={i * 0.2}
              />
            ))}
          </div>

          {/* Last result indicator */}
          <AnimatePresence>
            {spinResult && !spinning && (
              <motion.div
                className="text-center text-sm font-bold mb-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ color: spinResult.isWin ? "#f59e0b" : "hsl(240 5% 55%)" }}
              >
                {spinResult.isWin ? `+${spinResult.winAmount.toFixed(1)} TON` : "Try again"}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bet selector */}
          <div className="flex gap-1.5 justify-center mb-4">
            {BET_OPTIONS.map((bet) => (
              <button
                key={bet}
                onClick={() => setBetAmount(bet)}
                className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all duration-150"
                style={{
                  background: betAmount === bet ? "hsl(280 80% 60%)" : "hsl(240 10% 12%)",
                  color: betAmount === bet ? "white" : "hsl(240 5% 65%)",
                  border: betAmount === bet ? "1px solid hsl(280 80% 70%)" : "1px solid hsl(240 10% 20%)",
                  boxShadow: betAmount === bet ? "0 0 12px hsl(280 80% 60% / 0.4)" : "none",
                }}
              >
                {bet}
              </button>
            ))}
          </div>

          {/* Spin button */}
          <motion.button
            onClick={handleSpin}
            disabled={!canSpin}
            className="w-full py-4 rounded-xl font-black text-lg uppercase tracking-widest transition-all duration-200"
            style={{
              background: canSpin
                ? "linear-gradient(135deg, hsl(280 80% 55%) 0%, hsl(260 80% 45%) 100%)"
                : "hsl(240 10% 15%)",
              color: canSpin ? "white" : "hsl(240 5% 45%)",
              boxShadow: canSpin
                ? "0 0 20px hsl(280 80% 60% / 0.5), 0 4px 15px hsl(280 80% 60% / 0.3)"
                : "none",
            }}
            whileTap={canSpin ? { scale: 0.97 } : {}}
            animate={spinning ? { boxShadow: ["0 0 20px hsl(280 80% 60% / 0.5)", "0 0 40px hsl(280 80% 60% / 0.8)", "0 0 20px hsl(280 80% 60% / 0.5)"] } : {}}
            transition={spinning ? { repeat: Infinity, duration: 0.8 } : {}}
          >
            {spinning ? "Spinning..." : `Spin — ${betAmount} TON`}
          </motion.button>

          {balance < betAmount && !playerLoading && (
            <div className="text-center text-xs text-destructive mt-2">Insufficient balance</div>
          )}
        </div>
      </div>

      {/* Win overlay */}
      <AnimatePresence>
        {showWin && spinResult && (spinResult.isWin || spinResult.giftWon) && (
          <WinOverlay result={spinResult} onClose={() => setShowWin(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
