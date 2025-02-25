import { PropsWithChildren } from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";

import { APTOS_API_KEY, NETWORK } from "../constants";
import { useToast } from "./ui/use-toast";

export function WalletProvider({ children }) {
  const { toast } = useToast();

  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{ network: NETWORK, aptosApiKey: APTOS_API_KEY }}
      optInWallets={[
        "Continue with Google",
        "Petra",
        "Nightly",
        "Pontem Wallet",
        "Mizu Wallet",
      ]}
      onError={(error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error || "Unknown wallet error",
        });
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
