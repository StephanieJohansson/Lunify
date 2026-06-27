import { CalendarPlus, CheckSquare, CreditCard, Package } from "lucide-react";
import type { Page } from "../../App";

type QuickActionsWidgetProps = {
    onPageChange: (page: Page) => void;
};

export default function QuickActionsWidget({ onPageChange }: QuickActionsWidgetProps) {
    const actions = [
        { label: "New event", icon: CalendarPlus, onClick: () => onPageChange("calendar") },
        { label: "New task", icon: CheckSquare, onClick: () => onPageChange("todos") },
        { label: "New package", icon: Package, onClick: () => onPageChange("packages") },
        { label: "Payment", icon: CreditCard, onClick: undefined },
    ];

    return (
        <section className="flex h-full min-h-0 flex-col rounded-xl bg-slate-800/80 p-4 shadow-lg">
            <h2 className="mb-3 text-base font-semibold text-white">Quick Actions</h2>

            <div className="grid min-h-0 flex-1 grid-cols-2 gap-2">
                {actions.map((action) => {
                    const Icon = action.icon;

                    return (
                        <button
                            key={action.label}
                            disabled={!action.onClick}
                            onClick={action.onClick}
                            className="flex min-h-0 flex-col items-start justify-between rounded-xl bg-slate-900/40 p-3 text-left text-sm font-medium text-slate-200 transition hover:bg-slate-700/60 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Icon size={17} className="text-violet-300" />
                            <span>{action.label}</span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
