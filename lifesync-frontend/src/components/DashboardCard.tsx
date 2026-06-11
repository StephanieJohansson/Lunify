import type {ReactNode} from "react";


type DashboardCardProps = {
    title: string;
    value: number;
    icon: ReactNode;
};

export default function DashboardCard({ title, value, icon }: DashboardCardProps) {
    return (
        <div className="rounded-2xl bg-slate-800/80 p-5 shadow-lg transition hover:-translate-y-1 hover:bg-slate-700/80">
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-slate-400">{title}</p>
                <div className="rounded-xl bg-violet-500/20 p-2 text-violet-300">
                    {icon}
                </div>
            </div>

            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    );
}