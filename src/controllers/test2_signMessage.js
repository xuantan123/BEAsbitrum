import { ethers } from "ethers";
import dotenv from "dotenv";
import { abi_Meme } from "../config/abi_Meme.js";
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.URL);
const admin = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const TokenAddress = process.env.TOKEN_ADDRESS;

const Token = new ethers.Contract(TokenAddress, abi_Meme, admin);

export const executeAuthorizedTransfer = async (req, res) => {
    try {
        const {
            from,
            value,
            validAfter,
            validBefore,
            nonce,
            v,
            r,
            s,
        } = req.body;

        if (!from || !value || !nonce || !v || !r || !s)
            return res.status(400).json({ success: false, error: "Missing required fields" });

        const adminSigner = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

        console.log("=== Executing buyTokensWithAuthorization ===");
        console.log("From:", from);
        console.log("Value:", value);
        console.log("Nonce:", nonce);
        console.log("v:",v);
        console.log("r:",r);
        console.log("s:",s);
        console.log("validAfter:",validAfter);
        console.log("validBefore:",validBefore);

        const tx = await Token.connect(adminSigner).buyTokensWithAuthorization(
            from,
            value,
            validAfter,
            validBefore,
            nonce,
            v,
            r,
            s
        );

        console.log("⛽ Transaction sent:", tx.hash);
        const receipt = await tx.wait();

        res.json({
            success: true,
            txHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
        });
    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};


export const checkBalanceMeme = async (req, res) => {
    try {
        const { user } = req.body
        console.log("Token address:", TokenAddress);

        const MemeBalance = await Token.balanceOf(TokenAddress);
        const formattedBalance = ethers.formatUnits(MemeBalance, 18);

        const totalSupply = await Token.totalSupply();
        const formattedTotalSupply = ethers.formatUnits(totalSupply, 18);

        const SALE_ALLOCATION = await Token.SALE_ALLOCATION();
        const formattedSaleAllocation = ethers.formatUnits(SALE_ALLOCATION, 18);
        console.log("Sale Allocation:", formattedSaleAllocation);

        const USDCCollected = await Token.wUSDCCollected();
        const formattedUSDCCollected = ethers.formatUnits(USDCCollected, 6);
        console.log("USDCCollected:", formattedUSDCCollected);


        const userWUSDCDeposited = await Token.userWUSDCDeposited(user);
        const formatteduserWUSDCDeposited = ethers.formatUnits(userWUSDCDeposited, 6);
        console.log("userWUSDCDeposited:", formatteduserWUSDCDeposited);

        let tokensSold = 0;
        try {
            tokensSold = await Token.tokensSold();
        } catch {
            console.log("⚠️ Contract không có biến tokensSold (bỏ qua)");
        }

        const formattedTokensSold = tokensSold ? ethers.formatUnits(tokensSold, 18) : "N/A";

        console.log("Total Supply:      ", formattedTotalSupply);
        console.log("Contract Balance:  ", formattedBalance);
        console.log("Tokens Sold:       ", formattedTokensSold);
        console.log("Sale Allocation: ", formattedSaleAllocation);  //Max 
        console.log("USDC Collected:   ", formattedUSDCCollected);
        console.log("userWUSDCDeposited:   ", formatteduserWUSDCDeposited); // user buy usdc

        res.json({
            success: true,
            data: {
                tokenAddress: TokenAddress,
                totalSupply: formattedTotalSupply,
                contractBalance: formattedBalance,
                tokensSold: formattedTokensSold,
                SALE_ALLOCATION: formattedSaleAllocation,
                USDCCollected: formattedUSDCCollected,
                userWUSDCDeposited: formatteduserWUSDCDeposited,
            },
        });
    } catch (err) {
        console.error("❌ Error checking balance:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};