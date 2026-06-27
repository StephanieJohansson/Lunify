import { type FormEvent, useState } from "react";
import { CheckCircle2, KeyRound, Mail, ShieldAlert } from "lucide-react";
import type { Page, SettingsSection } from "../App";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { changePassword, sendEmailVerification } from "../services/AuthApi";
import type { AuthUser } from "../types/AuthUser";

type SettingsPageProps = {
    activePage: Page;
    currentUser: AuthUser;
    onCreateEvent: () => void;
    onCreatePackage: () => void;
    onLogout: () => void;
    onOpenSettings: (section: SettingsSection) => void;
    onPageChange: (page: Page) => void;
    initialSection: SettingsSection;
};

export default function SettingsPage({ activePage, currentUser, initialSection, onCreateEvent, onCreatePackage, onLogout, onOpenSettings, onPageChange }: SettingsPageProps) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [verificationMessage, setVerificationMessage] = useState("");
    const [busy, setBusy] = useState(false);
    const [activeSection, setActiveSection] = useState<SettingsSection>(initialSection);

    async function handlePasswordChange(event: FormEvent) {
        event.preventDefault();
        setPasswordMessage("");
        if (newPassword !== confirmPassword) {
            setPasswordMessage("The new passwords do not match.");
            return;
        }
        setBusy(true);
        try {
            await changePassword(currentPassword, newPassword);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setPasswordMessage("Password changed successfully.");
        } catch (error) {
            setPasswordMessage(error instanceof Error ? error.message : "Could not change password.");
        } finally {
            setBusy(false);
        }
    }

    async function handleVerification() {
        setBusy(true);
        setVerificationMessage("");
        try {
            await sendEmailVerification();
            setVerificationMessage("Verification link sent. It is valid for 24 hours.");
        } catch (error) {
            setVerificationMessage(error instanceof Error ? error.message : "Could not send verification email.");
        } finally {
            setBusy(false);
        }
    }

    const passwordFields = [
        { label: "Current password", value: currentPassword, setter: setCurrentPassword },
        { label: "New password", value: newPassword, setter: setNewPassword },
        { label: "Confirm new password", value: confirmPassword, setter: setConfirmPassword },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-slate-900 text-white">
            <Sidebar activePage={activePage} currentUser={currentUser} onPageChange={onPageChange} />
            <main className="min-w-0 flex-1 overflow-y-auto p-3">
                <Header currentUser={currentUser} onCreateEvent={onCreateEvent} onCreatePackage={onCreatePackage} onLogout={onLogout} onOpenSettings={onOpenSettings} />
                <div className="mx-auto max-w-4xl space-y-4 pb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Settings</h2>
                        <p className="text-sm text-slate-400">Manage your account and security.</p>
                    </div>
                    <nav aria-label="Settings categories" className="flex gap-2 rounded-2xl bg-slate-800/50 p-2">
                        <button type="button" onClick={() => setActiveSection("account")} className={`rounded-xl px-4 py-2 text-sm font-medium transition ${activeSection === "account" ? "bg-violet-600 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white"}`}>Account & email</button>
                        <button type="button" onClick={() => setActiveSection("security")} className={`rounded-xl px-4 py-2 text-sm font-medium transition ${activeSection === "security" ? "bg-violet-600 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white"}`}>Password & security</button>
                    </nav>
                    {activeSection === "account" && <section className="rounded-2xl bg-slate-800/80 p-5 shadow-lg">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-3">
                                <Mail className="mt-0.5 text-violet-300" size={20} />
                                <div>
                                    <h3 className="font-semibold">Email address</h3>
                                    <p className="text-sm text-slate-300">{currentUser.email}</p>
                                    <div className={`mt-2 flex items-center gap-2 text-sm ${currentUser.emailVerified ? "text-emerald-300" : "text-amber-300"}`}>
                                        {currentUser.emailVerified ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
                                        {currentUser.emailVerified ? "Verified" : "Not verified"}
                                    </div>
                                </div>
                            </div>
                            {!currentUser.emailVerified && (
                                <button type="button" disabled={busy} onClick={handleVerification} className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold transition hover:bg-violet-500 disabled:opacity-50">
                                    Send verification link
                                </button>
                            )}
                        </div>
                        {verificationMessage && <p className="mt-4 text-sm text-slate-300">{verificationMessage}</p>}
                    </section>}
                    {activeSection === "security" && <section className="rounded-2xl bg-slate-800/80 p-5 shadow-lg">
                        <div className="mb-4 flex items-center gap-3">
                            <KeyRound className="text-violet-300" size={20} />
                            <div><h3 className="font-semibold">Change password</h3><p className="text-sm text-slate-400">Use at least 8 characters.</p></div>
                        </div>
                        <form onSubmit={handlePasswordChange} className="max-w-md space-y-3">
                            {passwordFields.map(({ label, value, setter }) => (
                                <label key={label} className="block">
                                    <span className="mb-1 block text-sm text-slate-300">{label}</span>
                                    <input required minLength={label === "Current password" ? undefined : 8} type="password" value={value} onChange={(event) => setter(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-violet-500" />
                                </label>
                            ))}
                            <button disabled={busy} className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold transition hover:bg-violet-500 disabled:opacity-50">Change password</button>
                            {passwordMessage && <p className="text-sm text-slate-300">{passwordMessage}</p>}
                        </form>
                    </section>}
                </div>
            </main>
        </div>
    );
}
