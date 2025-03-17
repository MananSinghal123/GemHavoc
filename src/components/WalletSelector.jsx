import {
  APTOS_CONNECT_ACCOUNT_URL,
  AboutAptosConnect,
  isAptosConnectWallet,
  groupAndSortWallets,
  isInstallRequired,
  truncateAddress,
  useWallet,
  WalletItem,
  AptosPrivacyPolicy,
} from "@aptos-labs/wallet-adapter-react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Copy,
  LogOut,
  User,
  Anchor,
} from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "./ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useToast } from "./ui/use-toast";

export function WalletSelector() {
  const { account, connected, disconnect, wallet } = useWallet();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const closeDialog = useCallback(() => setIsDialogOpen(false), []);

  const copyAddress = useCallback(async () => {
    if (!account?.address) return;
    try {
      await navigator.clipboard.writeText(account.address);
      toast({
        title: "Success",
        description: "Copied wallet address to clipboard.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy wallet address.",
      });
    }
  }, [account?.address, toast]);

  return connected ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-gradient-to-r from-[#8b4513] to-[#cd7f32] hover:from-[#cd7f32] hover:to-[#daa520] text-[#ffd700] font-bold border border-[#ffd700] shadow-md hover:shadow-lg transition-all px-4 py-2 flex items-center gap-2">
          <Anchor className="h-4 w-4" />
          {account?.ansName ||
            (account?.address
              ? truncateAddress(account.address.toString())
              : "Unknown")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#240d08] border border-[#8b4513] text-[#e6c78b]">
        <DropdownMenuItem onSelect={copyAddress} className="gap-2 hover:bg-[#3d1d15] hover:text-[#ffd700]">
          <Copy className="h-4 w-4" /> Copy address
        </DropdownMenuItem>
        {wallet && isAptosConnectWallet(wallet) && (
          <DropdownMenuItem asChild className="hover:bg-[#3d1d15] hover:text-[#ffd700]">
            <a
              href={APTOS_CONNECT_ACCOUNT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-2"
            >
              <User className="h-4 w-4" /> Account
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={disconnect} className="gap-2 hover:bg-[#3d1d15] hover:text-[#ffd700]">
          <LogOut className="h-4 w-4" /> Abandon Ship
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[#8b4513] to-[#cd7f32] hover:from-[#cd7f32] hover:to-[#daa520] text-[#ffd700] font-bold border border-[#ffd700] shadow-md hover:shadow-lg transition-all px-4 py-2 flex items-center gap-2">
          <Anchor className="h-5 w-5 mr-1" />
          Board the Ship
        </Button>
      </DialogTrigger>
      <ConnectWalletDialog close={closeDialog} />
    </Dialog>
  );
}

function ConnectWalletDialog({ close }) {
  const { wallets = [] } = useWallet();
  const isPublicMintPage = true;
  const { aptosConnectWallets, availableWallets, installableWallets } =
    groupAndSortWallets(wallets);
  const hasAptosConnectWallets = !!aptosConnectWallets.length;

  return (
    <DialogContent className="max-h-screen overflow-auto bg-[#1a0f0b] border-2 border-[#8b4513] text-[#e6c78b]">
      <AboutAptosConnect renderEducationScreen={renderEducationScreen}>
        {isPublicMintPage ? (
          <>
            <DialogHeader className="flex flex-col items-center">
              <DialogTitle className="flex flex-col text-center leading-snug text-[#ffd700]">
                <span>Sign the Crew Manifest</span>
                <span>with Social + Aptos Connect</span>
              </DialogTitle>
            </DialogHeader>
            {hasAptosConnectWallets && (
              <div className="flex flex-col gap-2 pt-3">
                {aptosConnectWallets.map((wallet) => (
                  <AptosConnectWalletRow
                    key={wallet.name}
                    wallet={wallet}
                    onConnect={close}
                  />
                ))}
                <p className="flex gap-1 justify-center items-center text-[#cd7f32] text-sm">
                  Learn more about{" "}
                  <AboutAptosConnect.Trigger className="flex gap-1 py-3 items-center text-[#ffd700]">
                    Aptos Connect <ArrowRight size={16} />
                  </AboutAptosConnect.Trigger>
                </p>
                <AptosPrivacyPolicy className="flex flex-col items-center py-1">
                  <p className="text-xs leading-5 text-[#cd7f32]">
                    <AptosPrivacyPolicy.Disclaimer />{" "}
                    <AptosPrivacyPolicy.Link className="text-[#ffd700] underline underline-offset-4" />
                    <span className="text-[#cd7f32]">.</span>
                  </p>
                  <AptosPrivacyPolicy.PoweredBy className="flex gap-1.5 items-center text-xs leading-5 text-[#cd7f32]" />
                </AptosPrivacyPolicy>
                <div className="flex items-center gap-3 pt-4 text-[#cd7f32]">
                  <div className="h-px w-full bg-[#5e2814]" />
                  Or
                  <div className="h-px w-full bg-[#5e2814]" />
                </div>
              </div>
            )}
          </>
        ) : (
          <DialogHeader className="flex flex-col items-center">
            <DialogTitle className="flex flex-col text-center leading-snug text-[#ffd700]">
              <span>Choose Yer Treasure Chest</span>
            </DialogTitle>
          </DialogHeader>
        )}
        <div className="flex flex-col gap-3 pt-3">
          {availableWallets.map((wallet) => (
            <WalletRow key={wallet.name} wallet={wallet} onConnect={close} />
          ))}
          {!!installableWallets.length && (
            <Collapsible className="flex flex-col gap-3">
              <CollapsibleTrigger asChild>
                <Button size="sm" variant="ghost" className="gap-2 text-[#ffd700] hover:text-[#daa520] hover:bg-[#3d1d15]">
                  More treasure chests <ChevronDown />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="flex flex-col gap-3">
                {installableWallets.map((wallet) => (
                  <WalletRow
                    key={wallet.name}
                    wallet={wallet}
                    onConnect={close}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </AboutAptosConnect>
    </DialogContent>
  );
}

function WalletRow({ wallet, onConnect }) {
  return (
    <WalletItem
      wallet={wallet}
      onConnect={onConnect}
      className="flex items-center justify-between px-4 py-3 gap-4 border border-[#8b4513] rounded-md bg-gradient-to-b from-[#2d1610] to-[#1a0f0b] hover:from-[#3d1d15] hover:to-[#2d1610] transition-colors"
    >
      <div className="flex items-center gap-4">
        <WalletItem.Icon className="h-6 w-6" />
        <WalletItem.Name className="text-base font-normal text-[#e6c78b]" />
      </div>
      {isInstallRequired(wallet) ? (
        <Button size="sm" variant="ghost" asChild className="text-[#ffd700] hover:text-[#daa520] hover:bg-[#3d1d15]">
          <WalletItem.InstallLink />
        </Button>
      ) : (
        <WalletItem.ConnectButton asChild>
          <Button size="sm" className="bg-[#8b4513] hover:bg-[#cd7f32] text-[#ffd700] border border-[#daa520]">
            Board
          </Button>
        </WalletItem.ConnectButton>
      )}
    </WalletItem>
  );
}

function AptosConnectWalletRow({ wallet, onConnect }) {
  return (
    <WalletItem wallet={wallet} onConnect={onConnect}>
      <WalletItem.ConnectButton asChild>
        <Button size="lg" variant="outline" className="w-full gap-4 bg-gradient-to-r from-[#2d1610] to-[#3d1d15] hover:from-[#3d1d15] hover:to-[#5e2814] text-[#ffd700] border border-[#cd7f32]">
          <WalletItem.Icon className="h-5 w-5" />
          <WalletItem.Name className="text-base font-normal" />
        </Button>
      </WalletItem.ConnectButton>
    </WalletItem>
  );
}

function renderEducationScreen(screen) {
  return (
    <>
      <DialogHeader className="grid grid-cols-[1fr_4fr_1fr] items-center space-y-0">
        <Button variant="ghost" size="icon" onClick={screen.cancel} className="text-[#ffd700] hover:text-[#daa520] hover:bg-[#3d1d15]">
          <ArrowLeft />
        </Button>
        <DialogTitle className="leading-snug text-base text-center text-[#ffd700]">
          About Aptos Connect
        </DialogTitle>
      </DialogHeader>

      <div className="flex h-[162px] pb-3 items-end justify-center">
        <screen.Graphic />
      </div>
      <div className="flex flex-col gap-2 text-center pb-4">
        <screen.Title className="text-xl text-[#ffd700]" />
        <screen.Description className="text-sm text-[#cd7f32] [&>a]:underline [&>a]:underline-offset-4 [&>a]:text-[#ffd700]" />
      </div>

      <div className="grid grid-cols-3 items-center">
        <Button
          size="sm"
          variant="ghost"
          onClick={screen.back}
          className="justify-self-start text-[#ffd700] hover:text-[#daa520] hover:bg-[#3d1d15]"
        >
          Back
        </Button>
        <div className="flex items-center gap-2 place-self-center">
          {screen.screenIndicators.map((ScreenIndicator, i) => (
            <ScreenIndicator key={i} className="py-4">
              <div className="h-0.5 w-6 transition-colors bg-[#5e2814] [[data-active]>&]:bg-[#ffd700]" />
            </ScreenIndicator>
          ))}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={screen.next}
          className="gap-2 justify-self-end text-[#ffd700] hover:text-[#daa520] hover:bg-[#3d1d15]"
        >
          {screen.screenIndex === screen.totalScreens - 1 ? "Finish" : "Next"}
          <ArrowRight size={16} />
        </Button>
      </div>
    </>
  );
}