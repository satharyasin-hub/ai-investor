import { Router, type IRouter } from "express";
import healthRouter from "./health";
import analyzeRouter from "./analyze";
import videoRouter from "./video";

const router: IRouter = Router();

router.use(healthRouter);
router.use(analyzeRouter);
router.use(videoRouter);

export default router;
