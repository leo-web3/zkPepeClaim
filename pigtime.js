const wallet = require("./wallet.json");
const ethers = require("ethers");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const rpc = `https://zksync-era.blockpi.network/v1/rpc/public`;
const provider = new ethers.providers.JsonRpcProvider(rpc);
const address = {};
(async () => {
  for (let key of wallet) {
    let wallet = new ethers.Wallet(key, provider);
    let address = wallet.address.toLowerCase();
    try {
      const eligible = await axios.post(
        `https://api.pigtime.meme/v1/account/check-eligible/${address}`
      );
      address[address] = eligible.data?.rewardPercent ?? "-null";
    } catch (error) {
      address[address] = error?.message ?? "Unknown error, please try again later";
    }
  }
  fs.writeFileSync(path.join(__dirname, "pigtime.json"), JSON.stringify(address, null, 2));
})();
