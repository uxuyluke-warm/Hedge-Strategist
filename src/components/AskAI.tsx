import { useState } from "react";
import { useDashboard } from "@/contexts/DashboardContext";
import { askAI } from "@/services/ai";
import { Send, Loader2, Bot, User } from "lucide-react";

type Msg = { role: "user" | "assistant"; text: string };

export function AskAI() {
  const { flows } = useDashboard();
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Ask me about hedging your BTC/ETH exposure — sizing, ratios, or how flows affect risk.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setLoading(true);
    try {
      const answer = await askAI(q, flows);
      setMsgs((m) => [...m, { role: "assistant", text: answer }]);
    } catch (e) {
      setMsgs((m) => [
        ...m,
        { role: "assistant", text: e instanceof Error ? e.message : "Error" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card flex flex-col h-96">
      <div className="border-b border-border px-4 py-3 flex items-center gap-2">
        <Bot className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Ask AI · Hedge Coach</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && <Bot className="h-4 w-4 mt-1 text-primary flex-shrink-0" />}
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {m.text}
            </div>
            {m.role === "user" && <User className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> thinking…
          </div>
        )}
      </div>
      <div className="border-t border-border p-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="How should I hedge $10k of ETH spot?"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-ring focus:outline-none"
        />
        <button
          onClick={send}
          disabled={loading}
          className="rounded-md bg-primary p-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
