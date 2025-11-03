import { ethers } from "ethers";

export async function getTransferAuthorizationSignatureMeme_USDC(
  senderWallet,
  memeTokenContract,
  provider,
  fromAddress,
  toAddress,
  value,
  validAfter,
  validBefore,
  nonce
) {
  if (!provider) throw new Error("Provider is undefined");
  if (!senderWallet.provider) senderWallet = senderWallet.connect(provider);

  const network = await provider.getNetwork();
  console.log("Chain ID:", network.chainId);

  let domainName;
  let domainVersion = "1";
  try {
    const eip712Domain = await memeTokenContract.eip712Domain();
    domainName = eip712Domain.name;
    domainVersion = eip712Domain.version || "1";
  } catch {
    try {
      domainName = await memeTokenContract.name();
    } catch {
      throw new Error("Cannot determine domain name from contract.");
    }
  }

  const domain = {
    name: domainName,
    version: domainVersion,
    chainId: Number(network.chainId),
    verifyingContract: memeTokenContract.target || memeTokenContract.address,
  };

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

  const message = { from: fromAddress, to: toAddress, value, validAfter, validBefore, nonce };

  const signature = await senderWallet.signTypedData(domain, types, message);
  const { v, r, s } = ethers.Signature.from(signature);
  return { v, r, s, ...message };
}
