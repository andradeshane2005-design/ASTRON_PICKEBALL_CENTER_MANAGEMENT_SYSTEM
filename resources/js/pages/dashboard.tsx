import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    CalendarPlus,
    ClipboardList,
    CreditCard,
    UserRound,
    CalendarDays,
    ChevronRight,
} from 'lucide-react';

const QUICK_ACTIONS = [
    {
        icon: CalendarPlus,
        title: 'Book a Court',
        description: 'Reserve your preferred time',
        href: 'bookings',
    },
    {
        icon: ClipboardList,
        title: 'My Reservations',
        description: 'View and manage your bookings',
        href: 'reservations',
    },
    {
        icon: CreditCard,
        title: 'Payments',
        description: 'Check your payment history',
        href: '/payments',
    },
    {
        icon: UserRound,
        title: 'Profile',
        description: 'Update your information',
        href: '/profile',
    },
];

type ReservationSummary = {
    court: { name: string };
    start_at: string;
};

type Props = {
    upcomingReservation: ReservationSummary | null;
    monthlyReservations: number;
    monthlySpend: number | string;
};

function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';

    return 'Good evening';
}

export default function Dashboard({
    upcomingReservation,
    monthlyReservations,
    monthlySpend,
}: Props) {
    const { auth } = usePage().props;

    const firstName = auth?.user?.name?.split(' ')[0] ?? 'there';

    return (
        <>
            <Head title="Dashboard" />

            <div className="min-h-screen bg-[#eff5fc] px-6 py-6 text-[#173353] md:px-10 lg:px-12">
                <div className="mx-auto max-w-[1500px]">
                    {/* ================= HEADER ================= */}
                    <div className="mb-7">
                        <h1 className="text-2xl font-bold tracking-tight text-[#2f6fb3] md:text-3xl">
                            {getGreeting()}, {firstName}!
                        </h1>

                        <p className="mt-1 text-sm text-[#566d86] md:text-base">
                            Here's your account overview.
                        </p>
                    </div>

                    {/* ================= OVERVIEW CARDS ================= */}
                    <div className="grid gap-5 md:grid-cols-3">
                        {/* Upcoming Reservation */}
                        <div className="rounded-lg border border-[#cbdced] bg-white p-6 transition duration-200 hover:border-[#77aee4]">
                            <div className="flex items-start gap-5">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[#e7f1fb] text-[#2f6fb3]">
                                    <CalendarDays className="h-8 w-8" />
                                </div>

                                <div>
                                    <p className="text-sm text-[#566d86]">
                                        Upcoming Reservation
                                    </p>

                                    <h2 className="mt-1 text-2xl font-bold text-[#173353]">
                                        {upcomingReservation?.court.name ??
                                            'No upcoming reservations'}
                                    </h2>

                                    <p className="mt-2 text-sm text-[#566d86]">
                                        {upcomingReservation
                                            ? new Date(
                                                  upcomingReservation.start_at,
                                              ).toLocaleString([], {
                                                  dateStyle: 'medium',
                                                  timeStyle: 'short',
                                              })
                                            : 'Choose a time and reserve a court'}
                                    </p>
                                </div>
                            </div>

                            <Link
                                href={
                                    upcomingReservation
                                        ? '/reservations'
                                        : '/bookings'
                                }
                                className="mt-6 block bg-[#2f6fb3] py-3 text-center text-sm font-semibold text-white transition hover:bg-[#24598f]"
                            >
                                {upcomingReservation
                                    ? 'View Details'
                                    : 'Book a Court'}
                            </Link>
                        </div>

                        {/* Total Reservations */}
                        <div className="rounded-lg border border-[#cbdced] bg-white p-6 transition duration-200 hover:border-[#77aee4]">
                            <div className="flex items-start gap-5">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#13365b] text-[#74baff]">
                                    <ClipboardList className="h-8 w-8" />
                                </div>

                                <div>
                                    <p className="text-sm text-[#566d86]">
                                        Total Reservations
                                    </p>

                                    <p className="mt-2 text-4xl font-bold text-white">
                                        {monthlyReservations}
                                    </p>

                                    <p className="mt-2 text-sm text-[#a8bfd7]">
                                        This month
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Total Spent */}
                        <div className="rounded-2xl border border-[#2a405a] bg-[#0f1b2b] p-6 transition duration-200 hover:border-[#347fc4]">
                            <div className="flex items-start gap-5">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#13365b] text-[#74baff]">
                                    <CreditCard className="h-8 w-8" />
                                </div>

                                <div>
                                    <p className="text-sm text-[#566d86]">
                                        Total Spent
                                    </p>

                                    <p className="mt-2 text-4xl font-bold text-white">
                                        ₱{Number(monthlySpend).toLocaleString()}
                                    </p>

                                    <p className="mt-2 text-sm text-[#a8bfd7]">
                                        This month
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ================= QUICK ACTIONS ================= */}
                    <div className="mt-12">
                        <h2 className="mb-5 text-2xl font-bold text-[#2f6fb3]">
                            Quick Actions
                        </h2>

                        <div className="grid gap-5 md:grid-cols-2">
                            {QUICK_ACTIONS.map(
                                ({ icon: Icon, title, description, href }) => (
                                    <Link
                                        key={title}
                                        href={href}
                                        className="group flex items-center justify-between rounded-lg border border-[#cbdced] bg-white p-6 transition duration-200 hover:border-[#77aee4]"
                                    >
                                        <div className="flex items-center gap-5">
                                            {/* Icon */}
                                            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[#e7f1fb] text-[#2f6fb3] transition group-hover:bg-[#d8e8f7]">
                                                <Icon className="h-8 w-8" />
                                            </span>

                                            {/* Text */}
                                            <div>
                                                <p className="text-base font-semibold text-[#173353] md:text-lg">
                                                    {title}
                                                </p>

                                                <p className="mt-1 text-sm text-[#566d86] md:text-base">
                                                    {description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <ChevronRight className="h-6 w-6 shrink-0 text-[#3b82f6] transition group-hover:translate-x-1" />
                                    </Link>
                                ),
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
