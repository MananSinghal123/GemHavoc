import { convertAmountFromHumanReadableToOnChain } from "../utils/helpers";
import { MODULE_ADDRESS_TOKEN } from "../constants";

export const pickWinner = (args) => {
  const { assetType } = args;
  return {
    data: {
      function: `${MODULE_ADDRESS_TOKEN}::launchpad::pickWinner`,
      typeArguments: [],
      functionArguments: [assetType, 0],
    },
  };
};