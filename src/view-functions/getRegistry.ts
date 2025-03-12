import { AccountAddress } from "@aptos-labs/ts-sdk";
import { MODULE_ADDRESS } from "../constants";
import { aptosClient } from "../utils/aptosClient";


export const getRegistry = async () => {
  const registry = await aptosClient().view<[[{ inner: string }]]>({
    payload: {
      function: `${AccountAddress.from(MODULE_ADDRESS)}::launchpad::get_registry`,
    },
  });
  return registry[0];
};
