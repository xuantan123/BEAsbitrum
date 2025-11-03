import { ethers } from "ethers";
import dotenv from "dotenv";
import { abi_Meme } from "../config/abi_Meme.js";
import { getTransferAuthorizationSignatureMeme_USDC } from "../services/signatureServiceMeme_USDC.js";
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.URL);
const admin = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const sender = new ethers.Wallet(process.env.SENDER, provider);

const TokenAddress = "0x5f909E1f2b77C1F77a01cE49452b4c72766C0FEf";

const Token = new ethers.Contract(TokenAddress, abi_Meme, admin);

export const signSell = async (req, res) => {
    try {
        const { value , execute } = req.body;
        const to = "0xed06b186590c0ceac417b70fd29bff35f6ec9694";
        if (!value) return res.status(400).json({ success: false, error: "Missing 'value'" });

        const transferAmount = ethers.parseUnits(value.toString(), 6);
        const nonce = ethers.keccak256(ethers.toUtf8Bytes(`transfer-${Date.now()}`));

        const now = Math.floor(Date.now() / 1000);
        const validAfter = now - 60;
        const validBefore = now + 3600;

        const signatureData = await getTransferAuthorizationSignatureMeme_USDC(
            sender,             // User wallet
            TokenAddress,       // wUSDC contract address
            sender.address,     // from
            to,                 // to
            transferAmount,     // value
            validAfter,
            validBefore,
            nonce
        );

        console.log("=== Signature Created ===");
        console.log(signatureData);

        let result = { signatureData };

        if (execute) {
            // Tạo signer admin để trả gas
            const adminSigner = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
            const tx = await Token.connect(adminSigner).sellTokensWithAuthorization(
                signatureData.from,
                signatureData.value,
                signatureData.validAfter,
                signatureData.validBefore,
                signatureData.nonce,
                signatureData.v,
                signatureData.r,
                signatureData.s
            );
            console.log("Transaction sent, waiting for receipt...");
            const receipt = await tx.wait();

            console.log("✅ Transaction Mined:", receipt.transactionHash);

            result.txHash = tx.hash;
            result.blockNumber = receipt.blockNumber;
            result.gasUsed = receipt.gasUsed.toString();
        }
        

        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
