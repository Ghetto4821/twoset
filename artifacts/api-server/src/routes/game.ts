import { Router } from "express";
import { db, playersTable, giftsTable, spinsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

const SYMBOLS = ["💎", "🌟", "🎰", "🔮", "💰", "👑", "🎁", "🍀", "🚀", "🦄"];

const GIFT_CATALOG = [
  { name: "Cosmic Diamond", rarity: "Legendary", emoji: "💎", value: 500 },
  { name: "Golden Crown", rarity: "Epic", emoji: "👑", value: 200 },
  { name: "Magic Crystal", rarity: "Rare", emoji: "🔮", value: 75 },
  { name: "Lucky Clover", rarity: "Uncommon", emoji: "🍀", value: 25 },
  { name: "Star Token", rarity: "Common", emoji: "🌟", value: 10 },
  { name: "Moon Rock", rarity: "Rare", emoji: "🚀", value: 80 },
  { name: "Unicorn Horn", rarity: "Epic", emoji: "🦄", value: 180 },
  { name: "Treasure Chest", rarity: "Uncommon", emoji: "💰", value: 30 },
  { name: "Mystery Gift", rarity: "Common", emoji: "🎁", value: 12 },
];

function spinReels(): string[] {
  return [
    SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
  ];
}

function calculateWin(reels: string[], betAmount: number): { isWin: boolean; winAmount: number; multiplier: number; combo: string | null; giftChance: number } {
  const [a, b, c] = reels;

  if (a === b && b === c) {
    const multiplier = 10;
    return { isWin: true, winAmount: betAmount * multiplier, multiplier, combo: "JACKPOT", giftChance: 0.6 };
  }
  if (a === b || b === c || a === c) {
    const multiplier = 3;
    return { isWin: true, winAmount: betAmount * multiplier, multiplier, combo: "PAIR", giftChance: 0.15 };
  }
  if (["💎", "👑", "🦄"].includes(a) && ["💎", "👑", "🦄"].includes(b) && ["💎", "👑", "🦄"].includes(c)) {
    const multiplier = 5;
    return { isWin: true, winAmount: betAmount * multiplier, multiplier, combo: "PREMIUM", giftChance: 0.35 };
  }

  return { isWin: false, winAmount: 0, multiplier: 0, combo: null, giftChance: 0.03 };
}

function pickGift(rarity?: string): typeof GIFT_CATALOG[0] {
  if (rarity === "Legendary") {
    return GIFT_CATALOG.find(g => g.rarity === "Legendary") ?? GIFT_CATALOG[0];
  }
  const rarityWeights: Record<string, number> = {
    Legendary: 2,
    Epic: 8,
    Rare: 20,
    Uncommon: 35,
    Common: 35,
  };
  const pool: typeof GIFT_CATALOG = [];
  for (const gift of GIFT_CATALOG) {
    const weight = rarityWeights[gift.rarity] ?? 1;
    for (let i = 0; i < weight; i++) pool.push(gift);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

router.get("/player/:userId", async (req, res) => {
  const { userId } = req.params;
  const players = await db.select().from(playersTable).where(eq(playersTable.userId, userId)).limit(1);
  if (players.length === 0) {
    return res.status(404).json({ error: "Player not found" });
  }
  const p = players[0];
  return res.json({
    id: String(p.id),
    userId: p.userId,
    username: p.username,
    balance: p.balance,
    totalSpins: p.totalSpins,
    totalWon: p.totalWon,
    totalLost: p.totalLost,
    createdAt: p.createdAt.toISOString(),
  });
});

router.post("/player", async (req, res) => {
  const { userId, username } = req.body;
  if (!userId || !username) {
    return res.status(400).json({ error: "userId and username required" });
  }

  const existing = await db.select().from(playersTable).where(eq(playersTable.userId, userId)).limit(1);
  if (existing.length > 0) {
    const p = existing[0];
    return res.json({
      id: String(p.id),
      userId: p.userId,
      username: p.username,
      balance: p.balance,
      totalSpins: p.totalSpins,
      totalWon: p.totalWon,
      totalLost: p.totalLost,
      createdAt: p.createdAt.toISOString(),
    });
  }

  const [newPlayer] = await db.insert(playersTable).values({ userId, username, balance: 1000 }).returning();
  return res.json({
    id: String(newPlayer.id),
    userId: newPlayer.userId,
    username: newPlayer.username,
    balance: newPlayer.balance,
    totalSpins: newPlayer.totalSpins,
    totalWon: newPlayer.totalWon,
    totalLost: newPlayer.totalLost,
    createdAt: newPlayer.createdAt.toISOString(),
  });
});

router.post("/spin", async (req, res) => {
  const { userId, betAmount } = req.body;
  if (!userId || !betAmount || betAmount <= 0) {
    return res.status(400).json({ error: "Invalid spin request" });
  }

  const players = await db.select().from(playersTable).where(eq(playersTable.userId, userId)).limit(1);
  if (players.length === 0) return res.status(404).json({ error: "Player not found" });

  const player = players[0];
  if (player.balance < betAmount) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  const reels = spinReels();
  const { isWin, winAmount, multiplier, combo, giftChance } = calculateWin(reels, betAmount);

  const netChange = isWin ? winAmount - betAmount : -betAmount;
  const newBalance = player.balance + netChange;
  const newTotalWon = player.totalWon + (isWin ? winAmount : 0);
  const newTotalLost = player.totalLost + (isWin ? 0 : betAmount);
  const newBiggestWin = Math.max(player.biggestWin, winAmount);

  await db.update(playersTable).set({
    balance: newBalance,
    totalSpins: player.totalSpins + 1,
    totalWon: newTotalWon,
    totalLost: newTotalLost,
    biggestWin: newBiggestWin,
  }).where(eq(playersTable.userId, userId));

  await db.insert(spinsTable).values({
    userId,
    betAmount,
    reels: reels.join(","),
    isWin: isWin ? 1 : 0,
    winAmount,
  });

  let giftWon = null;
  if (Math.random() < giftChance) {
    const giftTemplate = combo === "JACKPOT" ? pickGift("Legendary") : pickGift();
    const [savedGift] = await db.insert(giftsTable).values({
      userId,
      name: giftTemplate.name,
      rarity: giftTemplate.rarity,
      emoji: giftTemplate.emoji,
      value: giftTemplate.value,
    }).returning();
    giftWon = {
      id: String(savedGift.id),
      name: savedGift.name,
      rarity: savedGift.rarity,
      emoji: savedGift.emoji,
      value: savedGift.value,
      wonAt: savedGift.wonAt.toISOString(),
      userId: savedGift.userId,
    };
  }

  return res.json({
    reels,
    isWin,
    winAmount,
    newBalance,
    giftWon,
    multiplier,
    combo,
  });
});

router.get("/gifts/:userId", async (req, res) => {
  const { userId } = req.params;
  const gifts = await db.select().from(giftsTable).where(eq(giftsTable.userId, userId)).orderBy(desc(giftsTable.wonAt));
  return res.json(gifts.map(g => ({
    id: String(g.id),
    name: g.name,
    rarity: g.rarity,
    emoji: g.emoji,
    value: g.value,
    wonAt: g.wonAt.toISOString(),
    userId: g.userId,
  })));
});

router.get("/stats/:userId", async (req, res) => {
  const { userId } = req.params;
  const players = await db.select().from(playersTable).where(eq(playersTable.userId, userId)).limit(1);
  if (players.length === 0) return res.status(404).json({ error: "Player not found" });

  const player = players[0];
  const gifts = await db.select().from(giftsTable).where(eq(giftsTable.userId, userId));
  const rareGifts = gifts.filter(g => ["Rare", "Epic", "Legendary"].includes(g.rarity)).length;
  const winRate = player.totalSpins > 0
    ? (await db.select({ count: sql<number>`count(*)` }).from(spinsTable).where(sql`user_id = ${userId} AND is_win = 1`))[0].count / player.totalSpins
    : 0;

  return res.json({
    totalSpins: player.totalSpins,
    totalWon: player.totalWon,
    totalLost: player.totalLost,
    biggestWin: player.biggestWin,
    winRate: Number(winRate),
    giftsCollected: gifts.length,
    rareGifts,
  });
});

router.get("/recent-wins", async (req, res) => {
  const recentGifts = await db.select({
    userId: giftsTable.userId,
    name: giftsTable.name,
    rarity: giftsTable.rarity,
    emoji: giftsTable.emoji,
    value: giftsTable.value,
    wonAt: giftsTable.wonAt,
  }).from(giftsTable).orderBy(desc(giftsTable.wonAt)).limit(20);

  const results = await Promise.all(recentGifts.map(async (g) => {
    const players = await db.select({ username: playersTable.username }).from(playersTable).where(eq(playersTable.userId, g.userId)).limit(1);
    const username = players[0]?.username ?? "Unknown";
    return {
      username,
      giftName: g.name,
      giftEmoji: g.emoji,
      winAmount: g.value,
      rarity: g.rarity,
      wonAt: g.wonAt.toISOString(),
    };
  }));

  return res.json(results);
});

export default router;
