import { Head } from '@inertiajs/react';
import {
    ChartNoAxesCombined,
    CircleDollarSign,
    Clock3,
    Volleyball,
} from 'lucide-react';

type Summary = {
    revenueThisMonth: number | string;
    reservationsThisMonth: number;
    activeCourts: number;
    pendingPayments: number;
};
type DailyRevenue = { date: string; amount: number };

export default function Reports({
    summary,
    dailyRevenue,
}: {
    summary: Summary;
    dailyRevenue: DailyRevenue[];
}) {
    const maximum = Math.max(...dailyRevenue.map((day) => day.amount), 1);
    const metrics = [
        {
            label: 'Collected this month',
            value: `₱${Number(summary.revenueThisMonth).toLocaleString()}`,
            icon: CircleDollarSign,
        },
        {
            label: 'Reservations this month',
            value: summary.reservationsThisMonth.toLocaleString(),
            icon: ChartNoAxesCombined,
        },
        {
            label: 'Active courts',
            value: summary.activeCourts.toLocaleString(),
            icon: Volleyball,
        },
        {
            label: 'Payments pending',
            value: summary.pendingPayments.toLocaleString(),
            icon: Clock3,
        },
    ];
    return (
        <>
            <Head title="Reports" />
            <main className="min-h-full bg-[#08111e] px-4 py-7 text-white sm:px-8 lg:px-12">
                <div className="mx-auto max-w-6xl">
                    <header className="mb-7">
                        <p className="text-xs font-semibold text-[#93c5fd] uppercase">
                            Admin / Insights
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold">
                            Center reports
                        </h1>
                        <p className="mt-2 text-sm text-[#a8bfd7]">
                            Current-month operations and the last seven days of
                            recorded revenue.
                        </p>
                    </header>
                    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {metrics.map(({ label, value, icon: Icon }) => (
                            <article
                                key={label}
                                className="rounded-2xl border border-[#2a405a] bg-[#0f1b2b] p-5 transition duration-200 hover:border-[#347fc4]"
                            >
                                <div className="flex items-center justify-between text-sm text-[#a8bfd7]">
                                    <span>{label}</span>
                                    <Icon
                                        size={18}
                                        className="text-[#93c5fd]"
                                    />
                                </div>
                                <p className="mt-5 text-3xl font-semibold tabular-nums">
                                    {value}
                                </p>
                            </article>
                        ))}
                    </section>
                    <section className="mt-6 rounded-2xl border border-[#2a405a] bg-[#0f1b2b] p-5 sm:p-6">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold">
                                Daily collected revenue
                            </h2>
                            <p className="mt-1 text-sm text-[#a8bfd7]">
                                Paid payment records, by payment date
                            </p>
                        </div>
                        <div className="space-y-4">
                            {dailyRevenue.map((day) => (
                                <div
                                    key={day.date}
                                    className="grid grid-cols-[100px_1fr_90px] items-center gap-3 text-sm"
                                >
                                    <span className="text-[#a8bfd7]">
                                        {new Date(
                                            `${day.date}T00:00:00`,
                                        ).toLocaleDateString([], {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </span>
                                    <div className="h-3 overflow-hidden rounded-full bg-[#2a405a]">
                                        <div
                                            className="h-full rounded-full bg-[#3b82f6]"
                                            style={{
                                                width: `${Math.max((day.amount / maximum) * 100, day.amount > 0 ? 4 : 0)}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="text-right tabular-nums">
                                        ₱{day.amount.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
