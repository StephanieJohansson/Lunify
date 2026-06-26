import { useEffect, useMemo, useState } from "react";
import {
    CalendarClock,
    CheckCircle2,
    Pencil,
    ExternalLink,
    PackagePlus,
    RefreshCw,
    Save,
    Trash2,
    Truck,
    X,
} from "lucide-react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import type { Page } from "../App";
import type { AuthUser } from "../types/AuthUser";
import {
    createPackageTracking,
    deletePackageTracking,
    getDeliveredPackages,
    getUndeliveredPackages,
    refreshPackageTracking,
    updatePackageTracking,
    type PackageTracking,
} from "../services/PackageApi";

type PackagesProps = {
    activePage: Page;
    currentUser: AuthUser;
    onLogout: () => void;
    onPageChange: (page: Page) => void;
};

const statusLabels: Record<string, string> = {
    REGISTERED: "Registered",
    PRE_NOTIFIED: "Pre-notified",
    IN_TRANSIT: "In transit",
    OUT_FOR_DELIVERY: "Out for delivery",
    READY_FOR_PICKUP: "Ready for pickup",
    DELAYED: "Delayed",
    DELIVERED: "Delivered",
    RETURNED: "Returned",
    TRACKING_UNAVAILABLE: "Tracking unavailable",
    UNKNOWN: "Unknown",
};

function formatDate(date?: string) {
    if (!date) {
        return "No ETA yet";
    }

    return new Date(date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
}

function formatDateTime(dateTime?: string) {
    if (!dateTime) {
        return "Not refreshed yet";
    }

    return new Date(dateTime).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getStatusLabel(status?: string) {
    if (!status) {
        return "Unknown";
    }

    return statusLabels[status] ?? status.replaceAll("_", " ").toLowerCase();
}

function PackageCard({
    packageTracking,
    onDelete,
    onRefresh,
    onUpdate,
    deleting,
    refreshing,
    updating,
}: {
    packageTracking: PackageTracking;
    onDelete: (id: number) => void;
    onRefresh: (id: number) => void;
    onUpdate: (packageTracking: PackageTracking) => Promise<void>;
    deleting: boolean;
    refreshing: boolean;
    updating: boolean;
}) {
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState(packageTracking.packageName);
    const [editTrackingNumber, setEditTrackingNumber] = useState(
        packageTracking.trackingNumber
    );
    const [editCarrier, setEditCarrier] = useState(packageTracking.carrier);
    const latestEvents = (packageTracking.events ?? [])
        .filter((event) => !event.insignificant)
        .slice(0, 3);

    function startEditing() {
        setEditName(packageTracking.packageName);
        setEditTrackingNumber(packageTracking.trackingNumber);
        setEditCarrier(packageTracking.carrier);
        setEditing(true);
    }

    function handleSave(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        void onUpdate({
            ...packageTracking,
            packageName: editName,
            trackingNumber: editTrackingNumber,
            carrier: editCarrier,
        }).then(() => setEditing(false));
    }

    return (
        <article className="rounded-2xl bg-slate-800/80 p-4 shadow-lg">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <Truck size={18} className="text-violet-300" />
                        <h3 className="truncate text-lg font-semibold text-white">
                            {packageTracking.packageName}
                        </h3>
                    </div>

                    <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                        {packageTracking.carrier} - {packageTracking.trackingNumber}
                    </p>
                </div>

                <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-100">
                    {getStatusLabel(packageTracking.status)}
                </span>
            </div>

            {editing && (
                <form onSubmit={handleSave} className="mt-4 grid gap-2 lg:grid-cols-[1fr_1fr_10rem_auto]">
                    <input
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                        required
                        className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-violet-400"
                    />
                    <input
                        value={editTrackingNumber}
                        onChange={(event) => setEditTrackingNumber(event.target.value)}
                        required
                        className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-violet-400"
                    />
                    <select
                        value={editCarrier}
                        onChange={(event) => setEditCarrier(event.target.value)}
                        className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-violet-400"
                    >
                        <option value="BRING">Bring</option>
                        <option value="POSTNORD">PostNord</option>
                        <option value="DHL">DHL</option>
                        <option value="INSTABOX">Instabox</option>
                        <option value="BUDBEE">Budbee</option>
                    </select>
                    <div className="flex gap-2">
                        <button
                            disabled={updating}
                            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-wait disabled:opacity-60"
                        >
                            <Save size={16} />
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditing(false)}
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900/60 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </form>
            )}

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-900/50 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">ETA</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                        {formatDate(
                            packageTracking.expectedDeliveryDate ??
                                packageTracking.expectedDeliveryStart
                        )}
                    </p>
                </div>

                <div className="rounded-xl bg-slate-900/50 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                        Latest update
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                        {formatDateTime(packageTracking.lastEventTime)}
                    </p>
                </div>

                <div className="rounded-xl bg-slate-900/50 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                        Pickup
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-white">
                        {packageTracking.pickupPointName ||
                            packageTracking.pickupCode ||
                            "Not available"}
                    </p>
                </div>
            </div>

            {packageTracking.statusDescription && (
                <p className="mt-3 rounded-xl bg-slate-900/40 p-3 text-sm text-slate-300">
                    {packageTracking.statusDescription}
                </p>
            )}

            {latestEvents.length > 0 && (
                <div className="mt-3 space-y-2">
                    {latestEvents.map((event) => (
                        <div
                            key={event.id}
                            className="flex items-start justify-between gap-3 rounded-xl bg-slate-900/40 p-3"
                        >
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-white">
                                    {getStatusLabel(event.status)}
                                </p>
                                {event.description && (
                                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                                        {event.description}
                                    </p>
                                )}
                            </div>

                            <span className="shrink-0 text-xs text-slate-500">
                                {formatDateTime(event.eventTime)}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
                <button
                    onClick={startEditing}
                    disabled={editing || updating}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900/60 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Pencil size={16} />
                    Edit
                </button>

                <button
                    onClick={() => onRefresh(packageTracking.id)}
                    disabled={refreshing}
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-wait disabled:opacity-60"
                >
                    <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                    Refresh
                </button>

                {packageTracking.trackingUrl && (
                    <a
                        href={packageTracking.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900/60 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:text-white"
                    >
                        <ExternalLink size={16} />
                        Open tracking
                    </a>
                )}

                <button
                    onClick={() => onDelete(packageTracking.id)}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-wait disabled:opacity-60"
                >
                    <Trash2 size={16} />
                    Delete
                </button>
            </div>
        </article>
    );
}

export default function Packages({
    activePage,
    currentUser,
    onLogout,
    onPageChange,
}: PackagesProps) {
    const [activePackages, setActivePackages] = useState<PackageTracking[]>([]);
    const [deliveredPackages, setDeliveredPackages] = useState<PackageTracking[]>([]);
    const [packageName, setPackageName] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [carrier, setCarrier] = useState("BRING");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [refreshingId, setRefreshingId] = useState<number | null>(null);
    const [error, setError] = useState("");

    const nextPackage = useMemo(
        () =>
            [...activePackages].sort((a, b) => {
                const aDate = a.expectedDeliveryDate ?? a.expectedDeliveryStart ?? "";
                const bDate = b.expectedDeliveryDate ?? b.expectedDeliveryStart ?? "";
                return aDate.localeCompare(bDate);
            })[0],
        [activePackages]
    );

    useEffect(() => {
        Promise.all([getUndeliveredPackages(), getDeliveredPackages()])
            .then(([active, delivered]) => {
                setActivePackages(active);
                setDeliveredPackages(delivered);
            })
            .catch(() => setError("Could not load packages."))
            .finally(() => setLoading(false));
    }, []);

    function handleCreate(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setError("");

        createPackageTracking({
            packageName,
            trackingNumber,
            carrier,
        })
            .then((createdPackage) => {
                setActivePackages((current) => [createdPackage, ...current]);
                setPackageName("");
                setTrackingNumber("");
                setCarrier("BRING");
            })
            .catch(() => setError("Could not add package."))
            .finally(() => setSaving(false));
    }

    function handleRefresh(id: number) {
        setRefreshingId(id);
        setError("");

        refreshPackageTracking(id)
            .then((updatedPackage) => {
                setActivePackages((current) =>
                    current.map((item) =>
                        item.id === updatedPackage.id ? updatedPackage : item
                    )
                );
            })
            .catch(() => setError("Could not refresh package."))
            .finally(() => setRefreshingId(null));
    }

    function replacePackage(updatedPackage: PackageTracking) {
        setActivePackages((current) =>
            current.map((item) =>
                item.id === updatedPackage.id ? updatedPackage : item
            )
        );
        setDeliveredPackages((current) =>
            current.map((item) =>
                item.id === updatedPackage.id ? updatedPackage : item
            )
        );
    }

    function handleUpdate(packageTracking: PackageTracking) {
        setUpdatingId(packageTracking.id);
        setError("");

        return updatePackageTracking(packageTracking)
            .then(replacePackage)
            .catch(() => setError("Could not update package."))
            .finally(() => setUpdatingId(null));
    }

    function handleDelete(id: number) {
        if (!window.confirm("Delete this package from Lunify?")) {
            return;
        }

        setDeletingId(id);
        setError("");

        deletePackageTracking(id)
            .then(() => {
                setActivePackages((current) =>
                    current.filter((item) => item.id !== id)
                );
                setDeliveredPackages((current) =>
                    current.filter((item) => item.id !== id)
                );
            })
            .catch(() => setError("Could not delete package."))
            .finally(() => setDeletingId(null));
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-900 text-white">
            <Sidebar
                activePage={activePage}
                currentUser={currentUser}
                onPageChange={onPageChange}
            />

            <main className="flex min-w-0 flex-1 flex-col overflow-hidden px-4 py-3">
                <Header currentUser={currentUser} onLogout={onLogout} />

                <section className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_22rem]">
                    <div className="flex min-h-0 flex-col space-y-3">
                        <section className="rounded-xl bg-slate-800/80 p-4 shadow-lg">
                            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                                <div>
                                    <p className="text-xs text-slate-400">Packages</p>
                                    <h2 className="text-xl font-semibold text-white">
                                        Track deliveries
                                    </h2>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div className="rounded-xl bg-slate-900/50 px-4 py-2">
                                        <p className="text-xs text-slate-500">Active</p>
                                        <p className="text-lg font-bold">{activePackages.length}</p>
                                    </div>
                                    <div className="rounded-xl bg-slate-900/50 px-4 py-2">
                                        <p className="text-xs text-slate-500">Delivered</p>
                                        <p className="text-lg font-bold">{deliveredPackages.length}</p>
                                    </div>
                                    <div className="rounded-xl bg-slate-900/50 px-4 py-2">
                                        <p className="text-xs text-slate-500">Next ETA</p>
                                        <p className="truncate text-sm font-semibold">
                                            {formatDate(
                                                nextPackage?.expectedDeliveryDate ??
                                                    nextPackage?.expectedDeliveryStart
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {error && (
                            <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                {error}
                            </p>
                        )}

                        <section className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                            {loading ? (
                                <p className="rounded-2xl bg-slate-800/80 p-4 text-sm text-slate-400">
                                    Loading packages...
                                </p>
                            ) : activePackages.length === 0 ? (
                                <p className="rounded-2xl bg-slate-800/80 p-4 text-sm text-slate-400">
                                    No active packages yet. Add a tracking number to start.
                                </p>
                            ) : (
                                activePackages.map((packageTracking) => (
                                    <PackageCard
                                        key={packageTracking.id}
                                        packageTracking={packageTracking}
                                        onDelete={handleDelete}
                                        onRefresh={handleRefresh}
                                        onUpdate={handleUpdate}
                                        deleting={deletingId === packageTracking.id}
                                        refreshing={refreshingId === packageTracking.id}
                                        updating={updatingId === packageTracking.id}
                                    />
                                ))
                            )}
                        </section>
                    </div>

                    <aside className="min-h-0 space-y-3 overflow-y-auto pr-1">
                        <section className="rounded-xl bg-slate-800/80 p-4 shadow-lg">
                            <div className="flex items-center gap-2">
                                <PackagePlus size={18} className="text-violet-300" />
                                <h3 className="text-lg font-semibold">Add package</h3>
                            </div>

                            <form onSubmit={handleCreate} className="mt-4 space-y-3">
                                <label className="block">
                                    <span className="text-sm text-slate-300">Name</span>
                                    <input
                                        value={packageName}
                                        onChange={(event) =>
                                            setPackageName(event.target.value)
                                        }
                                        placeholder="New shoes"
                                        required
                                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-violet-400"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm text-slate-300">
                                        Tracking number
                                    </span>
                                    <input
                                        value={trackingNumber}
                                        onChange={(event) =>
                                            setTrackingNumber(event.target.value)
                                        }
                                        placeholder="TESTPACKAGEATPICKUPPOINT"
                                        required
                                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-violet-400"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm text-slate-300">Carrier</span>
                                    <select
                                        value={carrier}
                                        onChange={(event) => setCarrier(event.target.value)}
                                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-violet-400"
                                    >
                                        <option value="BRING">Bring</option>
                                        <option value="POSTNORD">PostNord</option>
                                        <option value="DHL">DHL</option>
                                        <option value="INSTABOX">Instabox</option>
                                        <option value="BUDBEE">Budbee</option>
                                    </select>
                                </label>

                                <button
                                    disabled={saving}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-wait disabled:opacity-60"
                                >
                                    <PackagePlus size={16} />
                                    {saving ? "Adding..." : "Add package"}
                                </button>
                            </form>
                        </section>

                        <section className="rounded-xl bg-slate-800/80 p-4 shadow-lg">
                            <div className="flex items-center gap-2">
                                <CalendarClock size={18} className="text-violet-300" />
                                <h3 className="text-lg font-semibold">Calendar sync</h3>
                            </div>

                            <p className="mt-3 text-sm text-slate-400">
                                ETA and important tracking updates are shown inside the
                                calendar as package events.
                            </p>
                        </section>

                        <section className="rounded-xl bg-slate-800/80 p-4 shadow-lg">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={18} className="text-emerald-300" />
                                <h3 className="text-lg font-semibold">Delivered</h3>
                            </div>

                            <div className="mt-3 space-y-2">
                                {deliveredPackages.length === 0 ? (
                                    <p className="text-sm text-slate-500">
                                        No delivered packages yet.
                                    </p>
                                ) : (
                                    deliveredPackages.slice(0, 4).map((packageTracking) => (
                                        <div
                                            key={packageTracking.id}
                                            className="rounded-xl bg-slate-900/50 p-3"
                                        >
                                            <p className="truncate text-sm font-semibold text-white">
                                                {packageTracking.packageName}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {packageTracking.carrier}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </aside>
                </section>
            </main>
        </div>
    );
}
