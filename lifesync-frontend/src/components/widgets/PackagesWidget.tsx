import { Package } from "lucide-react";
import type { PackageTracking } from "../../services/PackageApi";

type PackagesWidgetProps = {
    packages: PackageTracking[];
    onShowAll: () => void;
};

export default function PackagesWidget({ packages, onShowAll }: PackagesWidgetProps) {
    return (
        <section className="flex h-full min-h-0 flex-col rounded-xl bg-slate-800/80 p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-white">Packages</h2>
            </div>

            {packages.length === 0 ? (
                <div className="min-h-0 flex-1 space-y-1.5 overflow-hidden">
                    {["Carrier", "Tracking"].map((row) => (
                        <div
                            key={row}
                            className="flex items-center gap-3 rounded-xl border border-dashed border-slate-700/80 bg-slate-900/30 px-3 py-2"
                        >
                            <Package size={15} className="text-slate-600" />
                            <span className="h-2 flex-1 rounded-full bg-slate-700/40" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                    {packages.map((packageTracking) => (
                        <button
                            key={packageTracking.id}
                            onClick={onShowAll}
                            className="flex w-full items-center justify-between gap-3 rounded-xl bg-slate-900/50 px-3 py-2 text-left transition hover:bg-slate-700/60"
                        >
                            <span className="min-w-0">
                                <span className="block truncate text-sm font-semibold text-white">
                                    {packageTracking.packageName}
                                </span>
                                <span className="block truncate text-xs text-slate-500">
                                    {packageTracking.carrier}
                                </span>
                            </span>
                            <span className="shrink-0 text-xs text-sky-300">
                                {packageTracking.status?.replaceAll("_", " ") ?? "Tracking"}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            <div className="mt-2 shrink-0">
                <button
                    type="button"
                    onClick={onShowAll}
                    className="w-full rounded-xl border border-violet-400/20 bg-slate-900/35 px-3 py-1.5 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/15"
                >
                    Show all packages
                </button>
            </div>
        </section>
    );
}
