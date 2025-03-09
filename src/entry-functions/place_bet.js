import { convertAmountFromHumanReadableToOnChain } from "../utils/helpers";
import { MODULE_ADDRESS_TOKEN,CREATOR_ADDRESS } from "../constants";

export const placeBet = (args) => {
  const { assetType, amount, decimals } = args;
  return {
    data: {
      function: `${MODULE_ADDRESS_TOKEN}::launchpad::place_bet`,
      typeArguments: [],
      functionArguments: [
        MODULE_ADDRESS_TOKEN,  // to_address
        assetType,             // fa_obj (Object<Metadata>)
        convertAmountFromHumanReadableToOnChain(amount, decimals)  // amount (u64)
      ],
    },
  };
};