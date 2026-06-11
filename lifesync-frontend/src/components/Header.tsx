import { Bell, Settings } from "lucide-react";

export default function Header() {
    return (
        <div className="flex items-start justify-between mb-8">
            <div>
                <p className="text-slate-400">Welcome back</p>

                <h1 className="text-4xl font-bold text-white">
                    Good morning, Stephanie 👋
                </h1>

                <p className="mt-2 text-slate-500">
                    Thursday, June 11
                </p>
            </div>



            <div className="flex items-center gap-4">
                <button className="rounded-xl bg-slate-800 p-3 text-slate-300 hover:text-white">
                    <Bell size={18} />
                </button>

                <button className="rounded-xl bg-slate-800 p-3 text-slate-300 hover:text-white">
                    <Settings size={18} />
                </button>

                <button className="rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500">
                    + New
                </button>

                <div className="flex items-center gap-3 rounded-xl bg-slate-800 px-4 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 font-bold">
                        S
                    </div>

                    <span>Stephanie</span>
                </div>
            </div>
        </div>
    );
}