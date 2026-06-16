import type { ReactNode } from "react";


type DashboardCardProps = {
    title: string;
    value: number;
    icon: ReactNode;
    onClick?: () => void;
};

export default function DashboardCard({
    title,
    value,
    icon,
    onClick,
}: DashboardCardProps) {
    return (
        <div
            onClick={onClick}
            className={`rounded-2xl bg-slate-800/80 px-3 py-2.5 text-left shadow-lg transition hover:bg-slate-700/80 ${
                onClick ? "cursor-pointer" : ""
            }`}
        >
            <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">{title}</p>

                <div className="rounded-lg bg-violet-500/20 p-1.5 text-violet-300">
                    {icon}
                </div>
            </div>

            <p className="mt-0.5 text-xl font-bold text-white">{value}</p>
        </div>
    );
}
