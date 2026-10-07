import { Head, router } from '@inertiajs/react';
import { ReceiptText } from 'lucide-react';

type Payment = {
    id: number;
    created_at: string;
    amount: string;
    status: string;
    method: string | null;
    reference: string | null;
    user: { name: string; email: string };
    reservation: { court: { name: string } };
};
type Paginated<T> = {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

export default function Payments({
    payments,
}: {
    payments: Paginated<Payment>;
}) {
    return (
        <>
            <Head title="Payment management" />
            <main className="min-h-full bg-[#08111e] px-4 py-7 text-white sm:px-8 lg:px-12">
                <div className="mx-auto max-w-6xl">
                    <header className="mb-7">
                        <p className="text-xs font-semibold text-[#93c5fd] uppercase">
                            Admin / Finance
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold">
                            Payment records
                        </h1>
                        <p className="mt-2 text-sm text-[#a8bfd7]">
                            Record payments received at the center and track
                            outstanding balances.
                        </p>
                    </header>
                    <section className="overflow-x-auto rounded-2xl border border-[#2a405a] bg-[#0f1b2b]">
                        <table className="w-full min-w-[950px] text-left text-sm">
                            <thead className="bg-[#15243a] text-xs text-[#a8bfd7] uppercase">
                                <tr>
                                    <th className="px-5 py-3">Customer</th>
                                    <th className="px-4 py-3">Reservation</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">
                                        Record payment
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.data.map((payment) => (
                                    <tr
                                        key={payment.id}
                                        className="border-t border-[#2a405a] transition hover:bg-[#15243a]"
                                    >
                                        <td className="px-5 py-4">
                                            <p className="font-semibold">
                                                {payment.user.name}
                                            </p>
                                            <p className="mt-1 text-xs text-[#a8bfd7]">
                                                {payment.user.email}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            {payment.reservation.court.name}
                                        </td>
                                        <td className="px-4 py-4">
                                            {new Date(
                                                payment.created_at,
                                            ).toLocaleDateString([], {
                                                dateStyle: 'medium',
                                            })}
                                        </td>
                                        <td className="px-4 py-4">
                                            ₱
                                            {Number(
                                                payment.amount,
                                            ).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="capitalize">
                                                {payment.status}
                                                {payment.method
                                                    ? ` · ${payment.method}`
                                                    : ''}
                                            </span>
                                            {payment.reference && (
                                                <p className="mt-1 text-xs text-[#a8bfd7]">
                                                    {payment.reference}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            {payment.status !== 'paid' ? (
                                                <select
                                                    aria-label={`Record payment ${payment.id}`}
                                                    defaultValue=""
                                                    onChange={(event) => {
                                                        if (event.target.value)
                                                            router.patch(
                                                                `/admin/payments/${payment.id}`,
                                                                {
                                                                    status: 'paid',
                                                                    method: event
                                                                        .target
                                                                        .value,
                                                                },
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            );
                                                    }}
                                                    className="rounded-lg border border-[#2a405a] bg-[#08111e] px-2 py-1.5 text-sm text-white focus:border-[#3b82f6] focus:outline-none"
                                                >
                                                    <option value="" disabled>
                                                        Mark paid…
                                                    </option>
                                                    <option value="cash">
                                                        Cash
                                                    </option>
                                                    <option value="gcash">
                                                        GCash
                                                    </option>
                                                    <option value="bank transfer">
                                                        Bank transfer
                                                    </option>
                                                </select>
                                            ) : (
                                                <span className="text-[#93c5fd]">
                                                    Settled
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {payments.data.length === 0 && (
                            <p className="px-5 py-12 text-center text-sm text-[#a8bfd7]">
                                No payment records yet.
                            </p>
                        )}
                    </section>
                    <p className="mt-4 flex items-center gap-2 text-xs text-[#a8bfd7]">
                        <ReceiptText size={14} />
                        Payments are recorded manually; no payment gateway is
                        connected.
                    </p>
                    <nav
                        className="mt-4 flex flex-wrap gap-2"
                        aria-label="Payment pages"
                    >
                        {payments.links.map((link) => (
                            <button
                                key={link.label}
                                disabled={!link.url}
                                onClick={() =>
                                    link.url && router.visit(link.url)
                                }
                                className={`rounded-lg border px-3 py-1.5 text-sm transition ${link.active ? 'border-[#3b82f6] bg-[#3b82f6] text-white' : 'border-[#2a405a] bg-[#0f1b2b] text-[#bfd0e3] hover:border-[#3b82f6]'} disabled:opacity-40`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </nav>
                </div>
            </main>
        </>
    );
}
