import { type FormEvent, useState } from "react";
import { KeyRound } from "lucide-react";
import { resetPassword } from "../services/AuthApi";

export default function ResetPasswordPage({ token }: { token: string }) {
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);

    async function submit(event: FormEvent) {
        event.preventDefault();
        if (password !== confirmation) {
            setMessage("The passwords do not match.");
            return;
        }
        setBusy(true);
        try {
            await resetPassword(token, password);
            window.history.replaceState(null, "", window.location.pathname);
            setMessage("Password changed. All previous sessions have been signed out. You can now return to login.");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Could not reset password.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white">
            <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-slate-800 p-6 shadow-xl">
                <KeyRound className="text-violet-300" size={32} />
                <h1 className="mt-4 text-2xl font-bold">Choose a new password</h1>
                <p className="mt-2 text-sm text-slate-400">The reset link can be used once and expires after 30 minutes.</p>
                {[{ label: "New password", value: password, setter: setPassword }, { label: "Confirm password", value: confirmation, setter: setConfirmation }].map(({ label, value, setter }) => (
                    <label key={label} className="mt-4 block">
                        <span className="text-sm text-slate-300">{label}</span>
                        <input required minLength={8} maxLength={128} type="password" value={value} onChange={(event) => setter(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-violet-400" />
                    </label>
                ))}
                <button disabled={busy || message.startsWith("Password changed")} className="mt-5 w-full rounded-xl bg-violet-600 px-4 py-3 font-semibold hover:bg-violet-500 disabled:opacity-50">Set new password</button>
                {message && <p className="mt-4 text-sm text-slate-300">{message}</p>}
            </form>
        </main>
    );
}
