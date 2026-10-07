import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    CircleDollarSign,
    MailWarning,
    ShieldCheck,
    UsersRound,
    Volleyball,
} from 'lucide-react';

type Metrics = {
    accounts: number;
    members: number;
    administrators: number;
    pendingVerification: number;
    joinedThisMonth: number;
    activeCourts: number;
    reservationsToday: number;
    revenueThisMonth: number;
};

type Reservation = {
    id: number;
    start_at: string;
    status: string;
    amount: string;
    user: { name: string; email: string };
    court: { name: string };
};

type Props = {
    metrics: Metrics;
    recentReservations: Reservation[];
    adminName: string;
};

const metricsList = [
    {
        key: 'reservationsToday',
        label: 'Reservations today',
        icon: CalendarDays,
        tone: 'bg-[#e7f1fb] text-[#2f6fb3]',
    },
    {
        key: 'activeCourts',
        label: 'Active courts',
        icon: Volleyball,
        tone: 'bg-[#e6f1fb] text-[#28718b]',
    },
    {
        key: 'revenueThisMonth',
        label: 'Collected this month',
        icon: CircleDollarSign,
        tone: 'bg-[#fbf1cf] text-[#9a6b12]',
    },
    {
        key: 'members',
        label: 'Member accounts',
        icon: UsersRound,
        tone: 'bg-[#e6f1fb] text-[#28718b]',
    },
    {
        key: 'administrators',
        label: 'Administrators',
        icon: ShieldCheck,
        tone: 'bg-[#e7f1fb] text-[#2f6fb3]',
    },
    {
        key: 'pendingVerification',
        label: 'Pending verification',
        icon: MailWarning,
        tone: 'bg-[#f9e8db] text-[#9b502b]',
    },
] as const;

export default function AdminDashboard({
    metrics,
    recentReservations,
    adminName,
}: Props) {
    return (
        <>
            <Head title="Admin dashboard" />
            <main className="min-h-full bg-[#08111e] px-4 py-7 text-white sm:px-8 lg:px-12">
                <div className="mx-auto max-w-6xl">
                    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold text-[#93c5fd] uppercase">
                                Astron / Administration
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold">
                                Operations overview
                            </h1>
                            <p className="mt-2 text-sm text-[#a8bfd7]">
                                Welcome back, {adminName}. Center operations at
                                a glance.
                            </p>
                        </div>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 rounded-full border border-[#2a405a] bg-[#0f1b2b] px-4 py-2 text-sm text-[#bfd0e3] transition hover:border-[#3b82f6] hover:text-white"
                        >
                            <ArrowLeft size={16} />
                            Member portal
                        </Link>
                    </header>

                    <section
                        aria-label="Operations metrics"
                        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
                    >
                        {metricsList.map(({ key, label, icon: Icon, tone }) => (
                            <article
                                key={key}
                                className="rounded-2xl border border-[#2a405a] bg-[#0f1b2b] p-5 transition duration-200 hover:border-[#347fc4]"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-[#a8bfd7]">
                                        {label}
                                    </span>
                                    <span
                                        className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}
                                    >
                                        <Icon size={18} />
                                    </span>
                                </div>
                                <p className="mt-5 text-3xl font-semibold tabular-nums">
                                    {key === 'revenueThisMonth'
                                        ? `₱${Number(metrics[key]).toLocaleString()}`
                                        : metrics[key].toLocaleString()}
                                </p>
                            </article>
                        ))}
                    </section>

                    <section className="mt-8 overflow-hidden rounded-2xl border border-[#2a405a] bg-[#0f1b2b]">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2a405a] px-5 py-4 sm:px-6">
                            <div>
                                <h2 className="font-semibold">
                                    Recent reservations
                                </h2>
                                <p className="mt-1 text-sm text-[#a8bfd7]">
                                    Latest bookings across all courts
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#a8bfd7]">
                                <CalendarDays
                                    size={16}
                                    className="text-[#3b82f6]"
                                />
                                {metrics.joinedThisMonth} new members this month
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-sm">
                                <thead className="bg-[#15243a] text-xs text-[#a8bfd7] uppercase">
                                    <tr>
                                        <th className="px-6 py-3">Customer</th>
                                        <th className="px-4 py-3">Court</th>
                                        <th className="px-4 py-3">Start</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-6 py-3 text-right">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentReservations.map((reservation) => (
                                        <tr
                                            key={reservation.id}
                                            className="border-t border-[#2a405a] transition hover:bg-[#15243a]"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="font-medium">
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
                                                {new Date(
                                                    reservation.start_at,
                                                ).toLocaleString([], {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                })}
                                            </td>
                                            <td className="px-4 py-4">
                                                ₱
                                                {Number(
                                                    reservation.amount,
                                                ).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right capitalize">
                                                {reservation.status}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {recentReservations.length === 0 && (
                            <p className="px-6 py-12 text-center text-sm text-[#a8bfd7]">
                                No reservations have been created yet.
                            </p>
                        )}
                    </section>

                    <section
                        className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
                        aria-label="Admin navigation"
                    >
                        {[
                            ['Courts', '/admin/courts'],
                            ['Reservations', '/admin/reservations'],
                            ['Customers', '/admin/customers'],
                            ['Reports', '/admin/reports'],
                        ].map(([label, href]) => (
                            <Link
                                key={href}
                                href={href}
                                className="rounded-xl border border-[#2a405a] bg-[#0f1b2b] px-4 py-3 text-sm font-semibold text-[#93c5fd] transition hover:border-[#3b82f6] hover:bg-[#12233a]"
                            >
                                {label} →
                            </Link>
                        ))}
                    </section>
                </div>
            </main>
        </>
    );
}
