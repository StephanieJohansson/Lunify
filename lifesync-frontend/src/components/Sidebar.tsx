import {
    Home,
    Calendar,
    CheckSquare,
    CreditCard,
    Package,
    Bell,
} from "lucide-react";


export default function Sidebar() {

    const menuItems = [
        { name: "Home", icon: Home },
        { name: "Calendar", icon: Calendar },
        { name: "Todos", icon: CheckSquare },
        { name: "Payments", icon: CreditCard },
        { name: "Packages", icon: Package },
        { name: "Reminders", icon: Bell },
    ];

    return (
        <aside className="hidden min-h-screen w-64 bg-slate-950 p-6 text-white md:block">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-violet-600 flex items-center justify-center font-bold">
                    L
                </div>

                <span className="text-xl font-bold">
                    Lunify
                </span>
            </div>

            <nav className="mt-8 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.name}
                            className={`
                            flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm
                            transition
                            ${
                                item.name === "Home"
                                    ? "bg-slate-800 text-white"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }
                            `}
                        >
                            <Icon size={18} />
                            <span>{item.name}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="mt-auto rounded-2xl bg-slate-900 p-4">
                <p className="text-sm font-medium">Stephanie</p>
                <p className="text-xs text-slate-500">Lunify workspace</p>
            </div>
        </aside>


    );
}