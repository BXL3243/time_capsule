require("@nomiclabs/hardhat-waffle");
require("hardhat-abi-exporter");
require("solidity-coverage");
require("hardhat-gas-reporter");

// var secrets = require("./secrets");
// var secrets = require("secrets");
// var secrets = require("./.env.json");

// secret.verify('walletPrivateKey', 'alchemyKey')

var secrets = {
  walletPrivateKey:
    "016a20284dad63df8a7d88db267c6828cffbc028035858c0bfcf2c24393ad64f",
  // Account #0: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 (10000 ETH)

  // Time Capsule on Rinkeby
  // "alchemyKey": "d0IQZPBMfmhcXtqsC8-t9lkSY1WARKVU"
  // "capsule": "0x56fDA59a60a4fBf9bf090b4b5aF6B76964E5B1B4"

  // Time Vault on Rinkeby
  alchemyKey: "IQ1lo36pzLnqdBJGNtKUqpQr88m_JDJ3",
  // "capsule": "0xC0eDd76E6cb2a48C9980f224CA72df33D501f733"
};

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  solidity: "0.8.0",
  networks: {
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
