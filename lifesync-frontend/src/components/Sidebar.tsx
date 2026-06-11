import {
    Home,
    Calendar,
    CheckSquare,
    CreditCard,
    Package,
    Bell,
} from "lucide-react";

type Page = "dashboard" | "todos";

type SidebarProps = {
    activePage: Page;
    onPageChange: (page: Page) => void;
};

export default function Sidebar({ activePage, onPageChange }: SidebarProps) {
    const menuItems = [
        { name: "Home", page: "dashboard", icon: Home },
        { name: "Calendar", page: null, icon: Calendar },
        { name: "Todos", page: "todos", icon: CheckSquare },
        { name: "Payments", page: null, icon: CreditCard },
        { name: "Packages", page: null, icon: Package },
        { name: "Reminders", page: null, icon: Bell },
    ] as const;

    return (
        <aside className="hidden min-h-screen w-64 flex-col bg-slate-950 p-6 text-white md:flex">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 font-bold">
                    L
                </div>

                <span className="text-xl font-bold">Lunify</span>
            </div>

            <nav className="mt-8 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.page === activePage;

                    return (
                        <button
                            key={item.name}
                            disabled={!item.page}
                            onClick={() => {
                                if (item.page) {
                                    onPageChange(item.page);
                                }
                            }}
                            className={`
                flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm
                transition
                ${
                                isActive
                                    ? "bg-slate-800 text-white"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }
                ${!item.page ? "cursor-not-allowed opacity-60" : ""}
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