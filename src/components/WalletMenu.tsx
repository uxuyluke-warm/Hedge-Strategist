import { useDashboard } from "@/contexts/DashboardContext";
import { LogOut, Wallet } from "lucide-react";

export function WalletMenu() {
  const { wallet, setWallet } = useDashboard();
  if (!wallet) return null;
  const short = `${wallet.slice(0, 6)}…${wallet.slice(-4)}`;
  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm">
      <Wallet className="h-3.5 w-3.5 text-primary" />
      <span className="font-mono text-xs">{short}</span>
      <button
        onClick={() => setWallet(null)}
        className="rounded p-1 hover:bg-muted"
        aria-label="Disconnect"
      >
        <LogOut className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
