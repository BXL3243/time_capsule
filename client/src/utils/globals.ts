import { ethOracles, OracleType, rinkebyOracles } from "../data/oracles";
import rinkebyTokens from "../data/rinkebyTokens";
import { getNetwork } from "../services/web3Service";
import Token from "../types/Token";

export const TEST_MODE = true;

type GlobalsType = {
  CAPSULE: string;
  TOKENS: Token[];
  TOKENS_URL: string;
  ORACLES: OracleType[];
};

const RINKEBY_GLOBALS: GlobalsType = {
  CAPSULE: "0xC0eDd76E6cb2a48C9980f224CA72df33D501f733",
  TOKENS: rinkebyTokens,
  TOKENS_URL: "",
  ORACLES: rinkebyOracles,
};

const ETH_GLOBALS: GlobalsType = {
  CAPSULE: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  TOKENS: [],
  TOKENS_URL: "https://tokens.coingecko.com/uniswap/all.json",
  ORACLES: ethOracles,
};

const ARBITRUM_GLOBALS: GlobalsType = {
  CAPSULE: "0x5b884817588a037a2668135031ebe2a36ca2957c",
  TOKENS: [],
  TOKENS_URL: "https://tokens.coingecko.com/uniswap/all.json",
  ORACLES: ethOracles,
};

export const getGlobals = async (): Promise<GlobalsType> => {
  const networkId = await getNetwork();
  if (networkId === 4) return RINKEBY_GLOBALS;
  if (networkId === 42161) return ARBITRUM_GLOBALS;
  // if (networkId === 56) return BSC_GLOBALS;
  return ETH_GLOBALS;
};
