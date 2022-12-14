import { ethers } from "ethers";
import * as erc721 from "../abi/erc721";
import * as nftFish from "../abi/nftFish";
import WebsocketProvider from "web3-providers-ws";

export const CHAIN_NODE = process.env.PINKNODE_GRPC_ENDPOINT

// @ts-ignore It appears default export is required otherwise it throws 'WebsocketProvider is not a constructor error', the typings says otherwise but well ...
const w3s = new WebsocketProvider(CHAIN_NODE, {
  timeout: 30 * 10 ** 3,
  clientConfig: {
    // Useful to keep a connection alive
    keepalive: true,
    keepaliveInterval: 20 * 10 ** 3, // ms
  },
  reconnect: {
    auto: true,
    delay: 5 * 10 ** 3,
  },
});

let w3sProvider = new ethers.providers.Web3Provider(w3s);

export const fishContract = new ethers.Contract(
  "0x938e84a92dda273b912f2886afe2bd7f5fc6abad".toLowerCase(),
  nftFish.abi,
  w3sProvider
);
