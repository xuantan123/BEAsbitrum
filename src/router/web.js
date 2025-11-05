import express from "express";
import { executeAuthorizedTransfer , checkBalanceMeme , checkBalanceUser } from "../controllers/test2_signMessage.js";
import { createSignaturePayload } from "../controllers/signatureController.js";

const router = express.Router();

router.get("/hello", (req, res) => {
    res.send("Hello World");
  });
  router.post("/executeAuthorizedTransfer",executeAuthorizedTransfer);
  router.get("/checkBalanceMeme",checkBalanceMeme);
  router.post("/checkBalanceUser", checkBalanceUser);
  router.post("/payload", createSignaturePayload);


export default router;
