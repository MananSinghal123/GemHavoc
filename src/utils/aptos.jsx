import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { ABI } from "./abi";

export const APTOGOTCHI_CONTRACT_ADDRESS =
  "0x497c93ccd5d3c3e24a8226d320ecc9c69697c0dad5e1f195553d7eaa1140e91f";
export const COLLECTION_ID =
  "0xfce62045f3ac19160c1e88662682ccb6ef1173eba82638b8bae172cc83d8e8b8";
export const COLLECTION_CREATOR_ADDRESS =
  "0x714319fa1946db285254e3c7c75a9aac05277200e59429dd1f80f25272910d9c";
export const COLLECTION_NAME = "Aptogotchi Collection";

export const APT = "0x1::aptos_coin::AptosCoin";
export const APT_UNIT = 100_000_000;

const config = new AptosConfig({
  network: Network.TESTNET,
});
export const aptos = new Aptos(config);

export const getNft = async (NftObjectAddr) => {
  const nft = await aptos.account.getAccountResources({
    accountAddress: NftObjectAddr,
  });
  return nft[2];
};

export const getAptBalance = async (addr) => {
  const result = await aptos.getAccountCoinAmount({
    accountAddress: addr,
    coinType: APT,
  });

  console.log("APT balance", result);
  return result;
};

export const getCollection = async () => {
  const collection = await aptos.getCollectionData({
    collectionName: COLLECTION_NAME,
    creatorAddress: COLLECTION_CREATOR_ADDRESS,
  });
  console.log("collection", collection);
  return collection;
};

export const getUserOwnedNfts = async (ownerAddr) => {
  const result = await aptos.getAccountOwnedTokens({
    accountAddress: ownerAddr,
  });

  console.log("my nfts", result);
  return result;
};

export const listAptogotchi = async (sender, aptogotchiObjectAddr) => {
  const rawTxn = await aptos.transaction.build.simple({
    sender: sender.accountAddress,
    data: {
      function: `${
        import.meta.env.VITE_MODULE_ADDRESS
      }::marketplace::list_with_fixed_price`,
      typeArguments: [APT],
      functionArguments: [aptogotchiObjectAddr, 10],
    },
  });
  const pendingTxn = await aptos.signAndSubmitTransaction({
    signer: sender,
    transaction: rawTxn,
  });
  const response = await aptos.waitForTransaction({
    transactionHash: pendingTxn.hash,
  });
  console.log("listed aptogotchi. - ", response.hash);
};

export const buyAptogotchi = async (sender, listingObjectAddr) => {
  const rawTxn = await aptos.transaction.build.simple({
    sender: sender.accountAddress,
    data: {
      function: `${ABI.address}::marketplace::purchase`,
      typeArguments: [APT],
      functionArguments: [listingObjectAddr],
    },
  });
  const pendingTxn = await aptos.signAndSubmitTransaction({
    signer: sender,
    transaction: rawTxn,
  });
  const response = await aptos.waitForTransaction({
    transactionHash: pendingTxn.hash,
  });
  console.log("bought aptogotchi. - ", response.hash);
};

export const getAllListingObjectAddresses = async (sellerAddr) => {
  const allListings = await aptos.view({
    payload: {
      function: `${
        import.meta.env.VITE_MODULE_ADDRESS
      }::launchpad::get_seller_listings`,
      typeArguments: [],
      functionArguments: [sellerAddr],
    },
  });
  console.log("all listings", allListings);
  return allListings[0];
};

export const getAllSellers = async () => {
  const allSellers = await aptos.view({
    payload: {
      function: `${
        import.meta.env.VITE_MODULE_ADDRESS
      }::launchpad::get_sellers`,
      typeArguments: [],
      functionArguments: [],
    },
  });
  console.log("all sellers", allSellers);
  return allSellers[0];
};

export const getListingObjectAndSeller = async (listingObjectAddr) => {
  const listingObjectAndSeller = await aptos.view({
    payload: {
      function: `${import.meta.env.VITE_MODULE_ADDRESS}::launchpad::listing`,
      typeArguments: [],
      functionArguments: [listingObjectAddr],
    },
  });
  console.log("listing object and seller", listingObjectAndSeller);
  return [listingObjectAndSeller[0]["inner"], listingObjectAndSeller[1]];
};

export const getListingObjectPrice = async (listingObjectAddr) => {
  const listingObjectPrice = await aptos.view({
    payload: {
      function: `${import.meta.env.VITE_MODULE_ADDRESS}::launchpad::price`,
      typeArguments: [APT],
      functionArguments: [listingObjectAddr],
    },
  });
  console.log("listing object price", JSON.stringify(listingObjectPrice));
  return listingObjectPrice[0]["vec"] / APT_UNIT;
};
