import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { apiFetch } from "../services/ApiClient";

export default function VerifyEmailPage({ token }: { token: string }) {
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);

    async function verify() {
        setBusy(true);
        const response = await apiFetch("/api/auth/verify-email", {
            method: "POST",
            body: JSON.stringify({ token }),
        });
        window.history.replaceState(null, "", window.location.pathname);
        setMessage(response.ok ? "Your email is verified. You can return to Lunify." : "This verification link is invalid or has expired.");
        setBusy(false);
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white">
            <section className="w-full max-w-md rounded-2xl bg-slate-800 p-6 text-center shadow-xl">
                <ShieldCheck className="mx-auto text-violet-300" size={36} />
                <h1 className="mt-4 text-2xl font-bold">Verify your email</h1>
                <p className="mt-2 text-sm text-slate-400">Confirm that this email address belongs to you.</p>
                <button disabled={busy || Boolean(message)} onClick={verify} className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 font-semibold hover:bg-violet-500 disabled:opacity-50">
                    Verify email
                </button>
                {message && <p className="mt-4 text-sm text-slate-300">{message}</p>}
            </section>
        </main>
    );
}
