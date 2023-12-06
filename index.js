const wallet = require("./wallet.json");
const ethers = require("ethers");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const rpc = `https://zksync-era.blockpi.network/v1/rpc/public`;
const provider = new ethers.providers.JsonRpcProvider(rpc);
/*
wallet.json
[
  "0x00000" // private key
]
*/
const address = {};
(async () => {
  const gasPrice = await provider.getGasPrice();
  for (let key of wallet) {
    let wallet = new ethers.Wallet(key, provider);
    const contract = new ethers.Contract(
      `0x95702a335e3349d197036Acb04BECA1b4997A91a`,
      [
        {
          inputs: [
            {
              internalType: "bytes32[]",
              name: "proof",
              type: "bytes32[]",
            },
            {
              internalType: "uint256",
              name: "name",
              type: "uint256",
            },
          ],
          name: "claim",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      wallet
    );
    try {
      const amountResult = await axios.get(
        `https://www.zksyncpepe.com/resources/amounts/${wallet.address.toLowerCase()}.json`
      );
      const amount = parseFloat(amountResult.data[0]);
      if (Number.isNaN(amount)) {
        address[wallet.address.toLowerCase()] = "null";
        continue;
      }
      const proofsResult = await axios.get(
        `https://www.zksyncpepe.com/resources/proofs/${wallet.address.toLowerCase()}.json`
      );
      const proofs = proofsResult.data;
      const estimate = await contract.estimateGas.claim(proofs, BigInt(amount) * BigInt(10 ** 18));
      let tx;
      if (proofs.length) {
        tx = await contract.claim(proofs, BigInt(amount) * BigInt(10 ** 18), {
          gasPrice,
          gasLimit: estimate,
        });
      }
      address[wallet.address.toLowerCase()] = {
        amount,
        proofs,
        tx,
      };
    } catch (error) {
      address[wallet.address.toLowerCase()] =
        error?.message ?? "Unknown error, please try again later";
    }
  }
  fs.writeFileSync(path.join(__dirname, "address.json"), JSON.stringify(address, null, 2));
})();
