import express from "express";
import { signTransfer } from "../controllers/test2_signMessage.js";
import { signSell } from "../controllers/test_signSell.js";

const router = express.Router();

router.get("/hello", (req, res) => {
    res.send("Hello World");
  });
  router.post("/sign-transfer", signTransfer);
  router.post("/sign-sell",signSell);

export default router;
