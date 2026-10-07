import { Head, router } from '@inertiajs/react';
import { CalendarDays } from 'lucide-react';

type Reservation = {
    id: number;
    start_at: string;
    end_at: string;
    status: string;
    amount: string;
    user: { name: string; email: string };
    court: { name: string };
    payment: { status: string } | null;
};
type Paginated<T> = {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

export default function Reservations({
    reservations,
}: {
    reservations: Paginated<Reservation>;
}) {
    return (
        <>
            <Head title="Reservation management" />
            <main className="min-h-full bg-[#08111e] px-4 py-7 text-white sm:px-8 lg:px-12">
                <div className="mx-auto max-w-6xl">
                    <header className="mb-7">
                        <p className="text-xs font-semibold text-[#93c5fd] uppercase">
                            Admin / Operations
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold">
                            Reservation management
                        </h1>
                        <p className="mt-2 text-sm text-[#a8bfd7]">
                            Review upcoming play and keep booking status
                            current.
                        </p>
                    </header>
                    <section className="overflow-x-auto rounded-2xl border border-[#2a405a] bg-[#0f1b2b]">
                        <table className="w-full min-w-[1000px] text-left text-sm">
                            <thead className="bg-[#15243a] text-xs text-[#a8bfd7] uppercase">
                                <tr>
                                    <th className="px-5 py-3">Reference</th>
                                    <th className="px-5 py-3">Customer</th>
                                    <th className="px-4 py-3">Court</th>
                                    <th className="px-4 py-3">Date & time</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Payment</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">
                                        Update
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.data.map((reservation) => (
                                    <tr
                                        key={reservation.id}
                                        className="border-t border-[#2a405a] transition hover:bg-[#15243a]"
                                    >
                                        <td className="px-5 py-4 font-mono text-xs text-[#a8bfd7]">
                                            RES-
                                            {String(reservation.id).padStart(
                                                6,
                                                '0',
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-semibold">
                                                {reservation.user.name}
                                            </p>
                                            <p className="mt-1 text-xs text-[#a8bfd7]">
                                                {reservation.user.email}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            {reservation.court.name}
                                        </td>
                                        <td className="px-4 py-4">
                                            <p>
                                                {new Date(
                                                    reservation.start_at,
                                                ).toLocaleDateString([], {
                                                    dateStyle: 'medium',
                                                    timeZone: 'Asia/Manila',
                                                })}
                                            </p>
                                            <p className="mt-1 text-xs text-[#a8bfd7]">
                                                {new Date(
                                                    reservation.start_at,
                                                ).toLocaleTimeString([], {
                                                    timeStyle: 'short',
                                                    timeZone: 'Asia/Manila',
                                                })}
                                                –
                                                {new Date(
                                                    reservation.end_at,
                                                ).toLocaleTimeString([], {
                                                    timeStyle: 'short',
                                                    timeZone: 'Asia/Manila',
                                                })}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            ₱
                                            {Number(
                                                reservation.amount,
                                            ).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4 capitalize">
                                            {reservation.payment?.status ?? '—'}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center gap-1.5 capitalize">
                                                <CalendarDays
                                                    size={14}
                                                    className="text-[#3b82f6]"
                                                />
                                                {reservation.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <select
                                                aria-label={`Update reservation ${reservation.id}`}
                                                value={reservation.status}
                                                disabled={
                                                    reservation.status ===
                                                    'completed'
                                                }
                                                onChange={(event) =>
                                                    router.patch(
                                                        `/admin/reservations/${reservation.id}`,
                                                        {
                                                            status: event.target
                                                                .value,
                                                        },
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                                className="rounded-lg border border-[#2a405a] bg-[#08111e] px-2 py-1.5 text-sm text-white focus:border-[#3b82f6] focus:outline-none"
                                            >
                                                <option value="pending">
                                                    Pending
                                                </option>
                                                <option value="confirmed">
                                                    Confirmed
                                                </option>
                                                <option value="completed">
                                                    Completed
                                                </option>
                                                <option value="cancelled">
                                                    Cancelled
                                                </option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {reservations.data.length === 0 && (
                            <p className="px-5 py-12 text-center text-sm text-[#a8bfd7]">
                                No reservations yet.
                            </p>
                        )}
                    </section>
                    <nav
                        className="mt-4 flex flex-wrap gap-2"
                        aria-label="Reservation pages"
                    >
                        {reservations.links.map((link) => (
                            <button
                                key={link.label}
                                disabled={!link.url}
                                onClick={() =>
                                    link.url && router.visit(link.url)
                                }
                                className={`min-w-10 rounded-lg border px-3 py-1.5 text-sm transition ${link.active ? 'border-[#3b82f6] bg-[#3b82f6] text-white' : 'border-[#2a405a] bg-[#0f1b2b] text-[#bfd0e3] hover:border-[#3b82f6]'} disabled:opacity-40`}
                            >
                                {link.label
                                    .replace(/<[^>]*>/g, '')
                                    .replace(/&laquo;|&raquo;/g, '')
                                    .trim()}
                            </button>
                        ))}
                    </nav>
                </div>
            </main>
        </>
    );
}
