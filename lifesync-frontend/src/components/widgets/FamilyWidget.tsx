import { Users } from "lucide-react";

export default function FamilyWidget() {
    const rows = ["Emma", "Liam"];

    return (
        <section className="flex h-full min-h-0 flex-col rounded-xl bg-slate-800/80 p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">Family</h2>
                <Users size={18} className="text-violet-300" />
            </div>

            <div className="min-h-0 flex-1 space-y-1 overflow-hidden">
                {rows.map((row, index) => (
                    <div
                        key={row}
                        className="flex items-center gap-3 rounded-xl bg-slate-900/40 px-3 py-1.5"
                    >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 text-xs font-semibold text-violet-100">
                            {row.slice(0, 1)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-200">{row}</p>
                            <p className="truncate text-xs text-slate-500">
                                {index === 0 ? "No events today" : "Ready to plan"}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-2 shrink-0">
                <button
                    type="button"
                    disabled
                    className="w-full rounded-xl border border-violet-400/10 bg-slate-900/25 px-3 py-1.5 text-xs font-semibold text-slate-500"
                >
                    Show all family
                </button>
            </div>
        </section>
    );
}
