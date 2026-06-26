import type { ReactNode } from "react";


type DashboardCardProps = {
    title: string;
    value: number;
    icon: ReactNode;
    onClick?: () => void
};

export default function DashboardCard({
    title,
    value,
    icon,
    onClick,
}: DashboardCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex h-[4.25rem] w-full items-center gap-3 rounded-xl bg-slate-800 px-4 py-3 text-left transition hover:bg-slate-700"
        >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-xl font-semibold leading-none text-white">{value}</p>
                <p className="mt-1 truncate text-xs text-slate-400">{title}</p>
            </div>
        </button>
    );
}
