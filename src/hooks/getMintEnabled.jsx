import { AccountAddress } from "@aptos-labs/ts-sdk";
import { aptosClient } from "../utils/aptosClient";
import { MODULE_ADDRESS_TOKEN } from "../constants";

export const getMintEnabled = async ({ fa_address }) => {
  const mintEnabled = await aptosClient().view({
    payload: {
      function: `${AccountAddress.from(MODULE_ADDRESS_TOKEN)}::launchpad::is_mint_enabled`,
      functionArguments: [fa_address],
    },
  });

  return mintEnabled[0];
};