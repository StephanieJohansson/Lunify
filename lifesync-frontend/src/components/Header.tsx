
export default function Header(){
    return (
        <header className="mb-6 flex items-center justify-between">
            <div>
                <p className="text-sm text-slate-400">Welcome back</p>
                <h1 className="text-3xl font-bold text-white">Good morning, Stephanie👋</h1>
            </div>

            <button className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white">
                + Add new
            </button>
        </header>
    )
}