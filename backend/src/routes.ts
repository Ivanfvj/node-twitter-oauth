import { Router, Request, Response } from "express";

import TwitterRouter from "@src/lib/twitter/router";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Twitter service running");
});
router.use("/", TwitterRouter);

export default router;
