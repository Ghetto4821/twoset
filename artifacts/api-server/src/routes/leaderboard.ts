import { Router } from "express";
import { db, playersTable, giftsTable } from "@workspace/db";
import { desc, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 50);

  const topPlayers = await db
    .select()
    .from(playersTable)
    .orderBy(desc(playersTable.totalWon))
    .limit(limit);

  const results = await Promise.all(
    topPlayers.map(async (p, index) => {
      const giftCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(giftsTable)
        .where(sql`user_id = ${p.userId}`);

      return {
        rank: index + 1,
        userId: p.userId,
        username: p.username,
        totalWon: p.totalWon,
        giftsCollected: Number(giftCount[0]?.count ?? 0),
        biggestWin: p.biggestWin,
      };
    })
  );

  return res.json(results);
});

export default router;
