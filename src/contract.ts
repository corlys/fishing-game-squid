// src/contract.ts
import { Store } from "@subsquid/typeorm-store";
import { ethers } from "ethers";
import WebsocketProvider from "web3-providers-ws";
import * as erc721 from "./abi/erc721";
import { astarCatsContract } from "./helper/AstarCats";
import { astarDegenscontract } from "./helper/AstarDegens";
import { fishContract } from "./helper/Fish";
import { fishMarketplaceContract } from "./helper/FishMarketplace";
import { ticketPassAContract } from "./helper/TicketPassA";
import { Contract } from "./model";

export const CHAIN_NODE = process.env.PINKNODE_GRPC_ENDPOINT

interface ContractInfo {
  ethersContract: ethers.Contract;
  contractModel: Contract;
}

export const contractMapping: Map<string, ContractInfo> = new Map<
  string,
  ContractInfo
>();

contractMapping.set(fishContract.address, {
  ethersContract: fishContract,
  contractModel: {
    id: fishContract.address,
    name: "Fish",
    symbol: "FISH",
    totalSupply: null,
    mintedTokens: [],
  },
});

contractMapping.set(fishMarketplaceContract.address, {
  ethersContract: fishMarketplaceContract,
  contractModel: {
    id: fishMarketplaceContract.address,
    name: "Fishy Marketplace",
    symbol: null,
    totalSupply: null,
    mintedTokens: [],
  },
});

contractMapping.set(ticketPassAContract.address, {
  ethersContract: ticketPassAContract,
  contractModel: {
    id: ticketPassAContract.address,
    name: "Cosmite Ticket Pass",
    symbol: "CTP",
    totalSupply: null,
    mintedTokens: [],
  },
});

// contractMapping.set(astarDegenscontract.address, {
//   ethersContract: astarDegenscontract,
//   contractModel: {
//     id: astarDegenscontract.address,
//     name: "AstarDegens",
//     symbol: "DEGEN",
//     totalSupply: 10000n,
//     mintedTokens: [],
//   },
// });

// contractMapping.set(astarCatsContract.address, {
//   ethersContract: astarCatsContract,
//   contractModel: {
//     id: astarCatsContract.address,
//     name: "AstarCats",
//     symbol: "CAT",
//     totalSupply: 7777n,
//     mintedTokens: [],
//   },
// });

export function createContractEntity(address: string): Contract {
  return new Contract(contractMapping.get(address)?.contractModel);
}

const contractAddresstoModel: Map<string, Contract> = new Map<
  string,
  Contract
>();

export async function getContractEntity(
  store: Store,
  address: string
): Promise<Contract | undefined> {
  if (contractAddresstoModel.get(address) == null) {
    let contractEntity = await store.get(Contract, address);
    if (contractEntity == null) {
      contractEntity = createContractEntity(address);
      await store.insert(contractEntity);
      contractAddresstoModel.set(address, contractEntity);
    }
  }

  return contractAddresstoModel.get(address);
}

export async function getTokenURI(
  tokenId: string,
  address: string
): Promise<string> {
  return retry(async () =>
    timeout(contractMapping.get(address)?.ethersContract?.tokenURI(tokenId))
  );
}

async function timeout<T>(res: Promise<T>, seconds = 30): Promise<T> {
  return new Promise((resolve, reject) => {
    let timer: any = setTimeout(() => {
      timer = undefined;
      reject(new Error(`Request timed out in ${seconds} seconds`));
    }, seconds * 1000);

    res
      .finally(() => {
        if (timer != null) {
          clearTimeout(timer);
        }
      })
      .then(resolve, reject);
  });
}

async function retry<T>(promiseFn: () => Promise<T>, attempts = 3): Promise<T> {
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await promiseFn();
    } catch (err) {
      console.log(err);
    }
  }
  throw new Error(`Error after ${attempts} attempts`);
}
