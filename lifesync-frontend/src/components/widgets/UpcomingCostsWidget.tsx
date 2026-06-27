import { WalletCards } from "lucide-react";

export default function UpcomingCostsWidget({ count }: { count: number }) {
    const rows = count > 0
        ? ["Upcoming payment", "Household cost", "Subscription"]
        : ["No payments due", "Add a bill", "Track a subscription"];

    return (
        <section className="flex h-full min-h-0 flex-col rounded-xl bg-slate-800/80 p-3 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">Upcoming Costs</h2>
                <WalletCards size={17} className="text-violet-300" />
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                {rows.map((row, index) => (
                    <div key={row} className="flex items-center justify-between rounded-xl bg-slate-900/40 px-3 py-2">
                        <span className={count > 0 ? "text-sm text-slate-200" : "h-2 w-28 rounded-full bg-slate-700/40 text-transparent"}>
                            {row}
                        </span>
                        <span className="text-xs text-slate-500">
                            {count > 0 && index === 0 ? "Soon" : ""}
                        </span>
                    </div>
                ))}
            </div>

            <button
                type="button"
                disabled
                className="mt-2 rounded-xl border border-violet-400/10 bg-slate-900/25 px-3 py-1.5 text-xs font-semibold text-slate-500"
            >
                Show all costs
            </button>
        </section>
    );
}
