import { useState } from "react";
import {
    Bell,
    Settings,
    Calendar,
    CheckSquare,
    CreditCard,
    Package,
    Clock,
} from "lucide-react";

export default function Header() {
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

    const quickAddItems = [
        { name: "New Event", icon: Calendar },
        { name: "New Reminder", icon: Clock },
        { name: "New Todo", icon: CheckSquare },
        { name: "New Payment", icon: CreditCard },
        { name: "New Package", icon: Package },
    ];

    return (
        <header className="mb-8 flex items-start justify-between gap-6">
            <div>
                <p className="text-slate-400">Welcome back</p>

                <h1 className="text-4xl font-bold text-white whitespace-nowrap">
                    Good morning, Stephanie <span>👋</span>
                </h1>

                <p className="mt-2 text-slate-500">Thursday, June 11</p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
                <button className="rounded-xl bg-slate-800 p-3 text-slate-300 transition hover:text-white">
                    <Bell size={18} />
                </button>

                <button className="rounded-xl bg-slate-800 p-3 text-slate-300 transition hover:text-white">
                    <Settings size={18} />
                </button>

                <div className="relative">
                    <button
                        onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
                        className="rounded-full bg-violet-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
                    >
                        + New
                    </button>

                    {isQuickAddOpen && (
                        <div className="absolute right-0 z-10 mt-3 w-52 rounded-2xl bg-slate-800 p-2 shadow-xl">
                            {quickAddItems.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <button
                                        key={item.name}
                                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-700 hover:text-white"
                                    >
                                        <Icon size={17} />
                                        {item.name}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-slate-800 px-4 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 font-bold text-white">
                        S
                    </div>

                    <span className="text-sm font-medium text-white">Stephanie</span>
                </div>
            </div>
        </header>
    );
}