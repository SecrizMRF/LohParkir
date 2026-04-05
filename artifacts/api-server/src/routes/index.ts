import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import officersRouter from "./officers";
import qrRouter from "./qr";
import reportsRouter from "./reports";
import paymentsRouter from "./payments";
import dashboardRouter from "./dashboard";
import seedRouter from "./seed";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(officersRouter);
router.use(qrRouter);
router.use(reportsRouter);
router.use(paymentsRouter);
router.use(dashboardRouter);
router.use(seedRouter);

export default router;
