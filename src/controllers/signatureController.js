import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.URL);
const admin = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const wusdcAddress = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
    
    const wusdcABI = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function balanceOf(address) view returns (uint256)",
      "function transfer(address,uint256) returns (bool)",
      "function approve(address,uint256) returns (bool)",
      "function allowance(address,address) view returns (uint256)",
      "function transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s)",
      "function authorizationState(address authorizer, bytes32 nonce) view returns (uint8)",
      "function deposit(uint256 amount)"
    ];
    
    const wusdc = new ethers.Contract(wusdcAddress, wusdcABI, admin);


export const createSignaturePayload = async (req, res) => {
  try {
    const { from, to, value } = req.body;

    if (!from || !to || !value)
      return res.status(400).json({ success: false, error: "Missing required fields" });

    // Chuẩn bị dữ liệu ký
    const transferAmount = ethers.parseUnits(value.toString(), 6);
    const nonce = ethers.keccak256(ethers.toUtf8Bytes(`transfer-${Date.now()}`));

    const now = Math.floor(Date.now() / 1000);
    const validAfter = now - 60;
    const validBefore = now + 3600;

    const network = await provider.getNetwork();
    const domain = {
      name: "USD Coin",
      version: "2",
      chainId: Number(network.chainId),
      verifyingContract: wusdc.target,
    };
    console.log("verifyingContract:", domain.verifyingContract);

    const types = {
      TransferWithAuthorization: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "validAfter", type: "uint256" },
        { name: "validBefore", type: "uint256" },
        { name: "nonce", type: "bytes32" },
      ],
    };

    const message = {
      from,
      to,
      value: transferAmount.toString(),
      validAfter,
      validBefore,
      nonce,
    };

    return res.json({
      success: true,
      domain,
      types,
      message,
    });
  } catch (err) {
    console.error("❌ Error creating signature payload:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
