import { useState } from "react";
import { LogIn, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { login, register, requestPasswordReset } from "../services/AuthApi";
import type { AuthUser } from "../types/AuthUser";

type AuthMode = "login" | "register" | "forgot";

type AuthPageProps = {
    onAuthenticated: (user: AuthUser) => void;
};

export default function AuthPage({ onAuthenticated }: AuthPageProps) {
    const [mode, setMode] = useState<AuthMode>("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const isRegister = mode === "register";
    const isForgot = mode === "forgot";

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError("");
        setNotice("");

        if (isForgot) {
            requestPasswordReset(email)
                .then(() => setNotice("If an account exists for that address, a reset link has been sent."))
                .catch(() => setError("Could not process the request. Please try again later."))
                .finally(() => setLoading(false));
            return;
        }

        const authAction = isRegister
            ? register({ name, email, password })
            : login({ email, password });

        authAction
            .then(onAuthenticated)
            .catch(() =>
                setError(
                    isRegister
                        ? "Could not create that account."
                        : "Email or password did not match."
                )
            )
            .finally(() => setLoading(false));
    }

    return (
        <main className="grid min-h-screen bg-slate-950 text-white lg:grid-cols-[minmax(0,1fr)_28rem]">
            <section className="flex min-h-[45vh] flex-col justify-between bg-slate-900 px-8 py-8 lg:min-h-screen lg:px-14">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-lg font-bold">
                        L
                    </div>
                    <span className="text-2xl font-bold">Lunify</span>
                </div>

                <div className="max-w-2xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-300">
                        Personal workspace
                    </p>
                    <h1 className="mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl">
                        Your calendar, todos and deliveries in one signed-in space.
                    </h1>
                    <p className="mt-5 max-w-xl text-base text-slate-400">
                        Sign in with your real email so Lunify can keep your data tied
                        to your own account.
                    </p>
                </div>

                <div className="grid max-w-2xl gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-800/80 p-4">
                        <ShieldCheck className="text-emerald-300" size={22} />
                        <p className="mt-3 text-sm font-semibold">Private by account</p>
                        <p className="mt-1 text-sm text-slate-400">
                            New todos, events and packages attach to the logged-in user.
                        </p>
                    </div>
                    <div className="rounded-2xl bg-slate-800/80 p-4">
                        <Mail className="text-sky-300" size={22} />
                        <p className="mt-3 text-sm font-semibold">Email ready</p>
                        <p className="mt-1 text-sm text-slate-400">
                            Secure verification and password recovery are supported by email.
                        </p>
                    </div>
                </div>
            </section>

            <section className="flex items-center justify-center px-6 py-10">
                <form onSubmit={handleSubmit} className="w-full max-w-sm">
                    {!isForgot && <div className="mb-6 flex rounded-xl bg-slate-900 p-1">
                        <button
                            type="button"
                            onClick={() => setMode("login")}
                            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                                !isRegister
                                    ? "bg-violet-600 text-white"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            Log in
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("register")}
                            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                                isRegister
                                    ? "bg-violet-600 text-white"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            Create
                        </button>
                    </div>}

                    <h2 className="text-2xl font-bold">
                        {isForgot ? "Reset your password" : isRegister ? "Create your account" : "Welcome back"}
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        {isForgot
                            ? "Enter your email and we will send a secure reset link if the account exists."
                            : isRegister
                            ? "Use the email you want Lunify connected to."
                            : "Sign in to continue to your workspace."}
                    </p>

                    <div className="mt-6 space-y-4">
                        {isRegister && (
                            <label className="block">
                                <span className="text-sm text-slate-300">Name</span>
                                <input
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    required
                                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                                />
                            </label>
                        )}

                        <label className="block">
                            <span className="text-sm text-slate-300">Email</span>
                            <input
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                type="email"
                                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                            />
                        </label>

                        {!isForgot && <label className="block">
                            <span className="text-sm text-slate-300">Password</span>
                            <input
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                                minLength={8}
                                type="password"
                                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                            />
                        </label>}
                    </div>

                    {error && (
                        <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            {error}
                        </p>
                    )}

                    {!isForgot && !isRegister && (
                        <button type="button" onClick={() => { setMode("forgot"); setError(""); }} className="mt-4 text-sm font-medium text-violet-300 hover:text-violet-200">
                            Forgot password?
                        </button>
                    )}
                    {notice && (
                        <p className="mt-4 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                            {notice}
                        </p>
                    )}

                    <button
                        disabled={loading}
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-wait disabled:opacity-60"
                    >
                        {isRegister ? <UserPlus size={18} /> : isForgot ? <Mail size={18} /> : <LogIn size={18} />}
                        {loading
                            ? "Working..."
                            : isForgot
                              ? "Send reset link"
                              : isRegister
                              ? "Create account"
                              : "Log in"}
                    </button>
                    {isForgot && (
                        <button type="button" onClick={() => { setMode("login"); setError(""); }} className="mt-4 w-full text-sm text-slate-400 hover:text-white">
                            Back to login
                        </button>
                    )}
                </form>
            </section>
        </main>
    );
}
