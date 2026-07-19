import { useDashboard } from "@/contexts/DashboardContext";
import { Wallet } from "lucide-react";
import type { ReactNode } from "react";

export function WalletGate({ children }: { children: ReactNode }) {
  const { wallet, setWallet } = useDashboard();

  if (wallet) return <>{children}</>;

  const connect = async () => {
    const eth = (window as unknown as { ethereum?: { request: (a: unknown) => Promise<string[]> } })
      .ethereum;
    if (!eth) {
      alert("No wallet found. Install MetaMask or another browser wallet.");
      return;
    }
    try {
      const accts = await eth.request({ method: "eth_requestAccounts" });
      if (accts?.[0]) setWallet(accts[0]);
    } catch {
      alert("Wallet connection rejected.");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-8 flex flex-col items-center text-center gap-4">
      <div className="rounded-full bg-primary/10 p-4">
        <Wallet className="h-8 w-8 text-primary" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Connect a wallet</h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          Connect a testnet wallet to execute hedges on SoDEX. Read-only access to signals stays available without a wallet.
        </p>
      </div>
      <button
        onClick={connect}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Connect wallet
      </button>
    </div>
  );
}
