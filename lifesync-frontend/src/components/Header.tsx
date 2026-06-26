import { useState } from "react";
import {
    Bell,
    Calendar,
    CheckSquare,
    Clock,
    CreditCard,
    LogOut,
    Package,
    Settings,
} from "lucide-react";
import CreateTodoModal from "./CreateTodoModal";
import { createTodo } from "../services/TodoApi";
import type { AuthUser } from "../types/AuthUser";

type HeaderProps = {
    currentUser: AuthUser;
    onLogout: () => void;
};

export default function Header({ currentUser, onLogout }: HeaderProps) {
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [showCreateTodo, setShowCreateTodo] = useState(false);
    const firstName = currentUser.name.split(" ")[0] || currentUser.email;
    const initial = (currentUser.name || currentUser.email).slice(0, 1).toUpperCase();
    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });

    const quickAddItems = [
        { name: "New Event", icon: Calendar },
        { name: "New Reminder", icon: Clock },
        { name: "New Todo", icon: CheckSquare },
        { name: "New Payment", icon: CreditCard },
        { name: "New Package", icon: Package },
    ];

    return (
        <header className="mb-3 flex items-start justify-between gap-4">
            <div>
                <p className="text-slate-400">Welcome back</p>

                <h1 className="text-3xl font-bold text-white whitespace-nowrap">
                    Good morning, {firstName}
                </h1>

                <p className="mt-1 text-sm text-slate-500">{today}</p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <button className="rounded-xl bg-slate-800 p-2.5 text-slate-300 transition hover:text-white">
                    <Bell size={18} />
                </button>

                <button className="rounded-xl bg-slate-800 p-2.5 text-slate-300 transition hover:text-white">
                    <Settings size={18} />
                </button>

                <button
                    onClick={onLogout}
                    className="rounded-xl bg-slate-800 p-2.5 text-slate-300 transition hover:text-white"
                    aria-label="Log out"
                >
                    <LogOut size={18} />
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
                                        onClick={() => {
                                            if (item.name === "New Todo") {
                                                setShowCreateTodo(true);
                                                setIsQuickAddOpen(false);
                                            }
                                        }}
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

                <div className="flex items-center gap-3 rounded-xl bg-slate-800 px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 font-bold text-white">
                        {initial}
                    </div>

                    <span className="text-sm font-medium text-white">{firstName}</span>
                </div>
            </div>

            {showCreateTodo && (
                <CreateTodoModal
                    onClose={() => setShowCreateTodo(false)}
                    onSave={(title, description) => {
                        createTodo(title, description)
                            .then(() => {
                                setShowCreateTodo(false);
                                window.location.reload();
                            })
                            .catch(console.error);
                    }}
                />
            )}
        </header>
    );
}
