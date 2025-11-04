import { ethers } from "ethers";

export async function getTransferAuthorizationSignature(
    senderWallet,
    wusdcContractOrAddress, 
    fromAddress,
    toAddress,
    value,
    validAfter,
    validBefore,
    nonce
) {
    const network = await senderWallet.provider.getNetwork();

    const domain = {
        name: "USD Coin",
        version: "2",
        chainId: 42161,
        verifyingContract: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
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

    const message = {
        from: fromAddress,
        to: toAddress,
        value: BigInt(value),
        validAfter: BigInt(validAfter),
        validBefore: BigInt(validBefore),
        nonce,
    };

    const signature = await senderWallet.signTypedData(domain, types, message);
    const { v, r, s } = ethers.Signature.from(signature);

    return {
        v,
        r,
        s,
        from: message.from,
        to: message.to,
        value: message.value.toString(),
        validAfter: message.validAfter.toString(),
        validBefore: message.validBefore.toString(),
        nonce: message.nonce
    };
}
