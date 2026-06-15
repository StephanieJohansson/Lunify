import type {ReactNode} from "react";


type DashboardCardProps = {
    title: string;
    value: number;
    icon: ReactNode;
    onClick?: () => void
};

export default function DashboardCard({ title, value, icon, onClick,
                                      }: DashboardCardProps) {
    return (
        <div
            onClick={onClick}
            className="
            rounded-2xl bg-slate-800 p-3
            transition cursor-pointer
            hover:bg-slate-700
        "
        >
            <div className="mb-1 flex items-center justify-between">
                <p className="text-xs text-slate-400">{title}</p>

                <div className="rounded-lg bg-violet-500/20 p-1 text-violet-300">
                    {icon}
                </div>
            </div>

            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    );
}