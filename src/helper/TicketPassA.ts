import { ethers } from "ethers";
import * as erc721 from "../abi/erc721";
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

export const ticketPassAContract = new ethers.Contract(
  "0x1ad2032Cfdf2e969BC1bF9976dA1AA2a8D03D42b".toLowerCase(),
  erc721.abi,
  w3sProvider
);
