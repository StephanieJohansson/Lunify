
export default function Sidebar() {
    return (
        <aside className="hidden min-h-screen w-64 bg-slate-950 p-6 text-white md:block">
            <h2 className="mb-8 text-2xl font-bold">LifeSync</h2>

            <nav className="space-y-3 text-sm text-slate-300">
                <p className="rounded-lg bg-slate-800 px-3 py-2 text-white">Home</p>
                <p className="px-3 py-2">Calendar</p>
                <p className="px-3 py-2">Todos</p>
                <p className="px-3 py-2">Payments</p>
                <p className="px-3 py-2">Packages</p>
                <p className="px-3 py-2">Reminders</p>
            </nav>
        </aside>
    );
}