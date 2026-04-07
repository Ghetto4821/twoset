import { Router, type IRouter } from "express";
import healthRouter from "./health";
import gameRouter from "./game";
import leaderboardRouter from "./leaderboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/game", gameRouter);
router.use("/leaderboard", leaderboardRouter);

export default router;
