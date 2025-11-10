import express from "express";
import { executeAuthorizedTransfer , checkBalanceMeme , checkBalanceUser } from "../controllers/Mintx402.js";

const router = express.Router();

router.get("/hello", (req, res) => {
    res.send("Hello World");
  });
  router.post("/executeAuthorizedTransfer",executeAuthorizedTransfer);
  router.get("/checkBalanceMeme",checkBalanceMeme);
  router.post("/checkBalanceUser", checkBalanceUser);

export default router;
