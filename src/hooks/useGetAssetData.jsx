import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
// Internal utils
import { aptosClient } from "../utils/aptosClient";
import { convertAmountFromOnChainToHumanReadable } from "../utils/helpers";
// Internal constants
import { getUserMintBalance } from "./getUserMintBalance";
import { FA_ADDRESS } from "../constants";
import { getMintEnabled } from "./getMintEnabled";

/**
 * A react hook to get fungible asset data.
 */
export function useGetAssetData(fa_address = FA_ADDRESS) {
  const { account } = useWallet();

  return useQuery({
    queryKey: ["app-state", fa_address],
    refetchInterval: 1000 * 30,
    queryFn: async () => {
      try {
        if (!fa_address) return null;

        const res = await aptosClient().queryIndexer({
          query: {
            variables: {
              fa_address,
              account: account?.address.toString() ?? "",
            },
            query: `
            query FungibleQuery($fa_address: String, $account: String) {
              fungible_asset_metadata(where: {asset_type: {_eq: $fa_address}}) {
                maximum_v2
                supply_v2
                name
                symbol
                decimals
                asset_type
                icon_uri
              }
              current_fungible_asset_balances(
                where: {owner_address: {_eq: $account}, asset_type: {_eq: $fa_address}}
                distinct_on: asset_type
                limit: 1
              ) {
                amount
              }
            }`,
          },
        });

        const asset = res.fungible_asset_metadata[0];
        if (!asset) return null;

        const isMintEnabled = await getMintEnabled({ fa_address });
        console.log("Response from useGetAssetData",res.current_fungible_asset_balances[0])

        return {
          asset,
          maxSupply: convertAmountFromOnChainToHumanReadable(asset.maximum_v2 ?? 0, asset.decimals),
          currentSupply: convertAmountFromOnChainToHumanReadable(asset.supply_v2 ?? 0, asset.decimals),
          userMintBalance: convertAmountFromOnChainToHumanReadable(
            account == null
              ? 0
              : await getUserMintBalance({ user_address: account.address.toStringLong(), fa_address }),
            asset.decimals,
          ),
          yourBalance: convertAmountFromOnChainToHumanReadable(
            res.current_fungible_asset_balances[0]?.amount ?? 0,
            asset.decimals,
          ),
          isMintActive: isMintEnabled && asset.maximum_v2 > asset.supply_v2,
        };
      } catch (error) {
        console.error(error);
      }
    },
  });
}