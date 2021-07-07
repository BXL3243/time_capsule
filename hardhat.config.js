require("@nomiclabs/hardhat-waffle");
require("hardhat-abi-exporter");
require("solidity-coverage");
require("hardhat-gas-reporter");

var secrets = {
  "walletPrivateKey": "016a20284dad63df8a7d88db267c6828cffbc028035858c0bfcf2c24393ad64f",
  "alchemyKey": "d0IQZPBMfmhcXtqsC8-t9lkSY1WARKVU"
}

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  solidity: "0.8.0",
  networks: {
    hardhat: {
      chainId: 1337
    },
    rinkenby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/" + secrets.alchemyKey,
      accounts: [secrets.walletPrivateKey],
    },
    arbitrum: {
      url: "https://arb-mainnet.g.alchemy.com/v2/" + secrets.alchemyKey,
      accounts: [secrets.walletPrivateKey],
    },
    ethereum: {
      url: "https://eth-mainnet.alchemyapi.io/v2/" + secrets.alchemyKey,
      accounts: [secrets.walletPrivateKey],
    },
    ropsten: {
      url: "https://eth-ropsten.alchemyapi.io/v2/" + secrets.alchemyKey,
      accounts: [secrets.walletPrivateKey],
    }
  },
  abiExporter: {
    path: "./client/src/contracts",
    clear: true,
    flat: true,
    only: ["Capsule.sol", "token/ERC20.sol"],
  },
  gasReporter: {
    currency: "CHF",
    gasPrice: 12,
    excludeContracts: ["token/"],
  },
};
