import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { adjust as adjustWallet } from '@/actions/App/Http/Controllers/Admin/WalletController';
import {
    cashIns as cashInsRoute,
    cashOuts as cashOutsRoute,
    customers as customersRoute,
    reports as reportsRoute,
} from '@/routes/admin/wallet';
import {
    approveCashIn,
    rejectCashIn,
    approveCashOut,
    rejectCashOut,
} from '@/actions/App/Http/Controllers/Admin/WalletController';

type Page<T> = {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
};
type RequestItem = {
    id: number;
    amount: number;
    status: string;
    created_at: string;
    reference_note?: string | null;
    payout_method?: string;
    account_name?: string;
    account_number?: string;
    reject_reason?: string | null;
    user: { id: number; name: string; email: string };
};
type CustomerItem = {
    id: number;
    name: string;
    email: string;
    wallet: { balance: number; held_balance: number } | null;
};
type ReportItem = { type: string; total_centavos: number; day: string };
type Stats = {
    pendingCashIns: number;
    pendingCashOuts: number;
    cashInCentavos?: number;
    cashOutCentavos?: number;
    paymentsCentavos?: number;
    refundsCentavos?: number;
};
type Props = {
    section: 'cash-ins' | 'cash-outs' | 'customers' | 'reports';
    items: Page<RequestItem | CustomerItem> | ReportItem[];
    stats: Stats;
    filters?: { period: string; from: string; to: string };
};

const tabs = [
    ['Cash-ins', cashInsRoute.url(), 'cash-ins'],
    ['Cash-outs', cashOutsRoute.url(), 'cash-outs'],
    ['Customer balances', customersRoute.url(), 'customers'],
    ['Reports', reportsRoute.url(), 'reports'],
] as const;

function money(value: number) {
    return `₱${(value / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function centavos(value: string) {
    const [whole, fraction = ''] = value.replace('-', '').split('.');
    const amount =
        Number(whole || 0) * 100 + Number((fraction + '00').slice(0, 2));
    return value.startsWith('-') ? -amount : amount;
}

export default function AdminWallet({
    section,
    items,
    stats,
    filters = { period: 'daily', from: '', to: '' },
}: Props) {
    const [review, setReview] = useState<{
        type: 'cash-ins' | 'cash-outs';
        id: number;
        action: 'approve' | 'reject';
    } | null>(null);
    const [processingReview, setProcessingReview] = useState<string | null>(
        null,
    );
    const [adjusting, setAdjusting] = useState<CustomerItem | null>(null);
    const [reason, setReason] = useState('');
    const reviewForm = useForm({ reason: '' });
    const adjustment = useForm({ user_id: 0, amount_centavos: 0, reason: '' });
    const pageItems = !Array.isArray(items) ? items.data : [];
    const reportItems = Array.isArray(items) ? items : [];
    const updateReportFilter = (key: string, value: string) =>
        router.get(
            reportsRoute.url(),
            { ...filters, [key]: value },
            { preserveState: true, replace: true },
        );

    const submitReview = (event: FormEvent) => {
        event.preventDefault();
        if (!review || review.action !== 'reject') return;
        const action =
            review.type === 'cash-ins'
                ? rejectCashIn(review.id)
                : rejectCashOut(review.id);
        reviewForm.transform(() => ({ reason }));
        reviewForm.submit(action, {
            preserveScroll: true,
            onSuccess: () => {
                setReview(null);
                setReason('');
            },
        });
    };

    const approveRequest = (type: 'cash-ins' | 'cash-outs', id: number) => {
        const key = `${type}-${id}`;
        if (
            processingReview ||
            !window.confirm(
                `Confirm ${type === 'cash-ins' ? 'cash-in' : 'cash-out'} approval?`,
            )
        ) {
            return;
        }

        const action =
            type === 'cash-ins' ? approveCashIn(id) : approveCashOut(id);
        setProcessingReview(key);
        router.post(
            action.url,
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessingReview(null),
            },
        );
    };

    const submitAdjustment = (event: FormEvent) => {
        event.preventDefault();
        adjustment.submit(adjustWallet(), {
            preserveScroll: true,
            onSuccess: () => setAdjusting(null),
        });
    };

    const startAdjust = (customer: CustomerItem) => {
        setAdjusting(customer);
        adjustment.setData({
            user_id: customer.id,
            amount_centavos: 0,
            reason: '',
        });
    };

    return (
        <>
            <Head title="Wallet operations" />
            <main className="min-h-full bg-[#08111e] px-4 py-7 text-white sm:px-8 lg:px-12">
                <div className="mx-auto max-w-6xl">
                    <header className="mb-6">
                        <p className="text-xs font-semibold text-[#93c5fd] uppercase">
                            Admin / Finance
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold">
                            Wallet operations
                        </h1>
                    </header>
                    <section className="mb-5 grid gap-px overflow-hidden rounded-lg border border-[#2a405a] bg-[#2a405a] sm:grid-cols-2">
                        <div className="bg-[#0f1b2b] p-4">
                            <p className="text-xs text-[#a8bfd7] uppercase">
                                Pending cash-ins
                            </p>
                            <p className="mt-1 text-2xl font-semibold">
                                {stats.pendingCashIns}
                            </p>
                        </div>
                        <div className="bg-[#0f1b2b] p-4">
                            <p className="text-xs text-[#a8bfd7] uppercase">
                                Pending cash-outs
                            </p>
                            <p className="mt-1 text-2xl font-semibold">
                                {stats.pendingCashOuts}
                            </p>
                        </div>
                    </section>
                    <nav
                        className="mb-5 flex flex-wrap gap-2"
                        aria-label="Wallet sections"
                    >
                        {tabs.map(([label, href, id]) => (
                            <a
                                key={id}
                                href={href}
                                aria-current={
                                    section === id ? 'page' : undefined
                                }
                                className={`rounded-md border px-3 py-2 text-sm ${section === id ? 'border-[#3b82f6] bg-[#3b82f6] text-white' : 'border-[#2a405a] bg-[#0f1b2b] text-[#bfd0e3] hover:border-[#3b82f6]'}`}
                            >
                                {label}
                            </a>
                        ))}
                    </nav>
                    {section === 'cash-ins' || section === 'cash-outs' ? (
                        <div className="overflow-x-auto rounded-lg border border-[#2a405a] bg-[#0f1b2b]">
                            <table className="w-full min-w-[850px] text-left text-sm">
                                <thead className="bg-[#15243a] text-xs text-[#a8bfd7] uppercase">
                                    <tr>
                                        <th className="px-4 py-3">Customer</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Details</th>
                                        <th className="px-4 py-3">Submitted</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">
                                            Review
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(pageItems as RequestItem[]).map(
                                        (item) => (
                                            <tr
                                                key={item.id}
                                                className="border-t border-[#2a405a]"
                                            >
                                                <td className="px-4 py-4">
                                                    <p className="font-medium">
                                                        {item.user.name}
                                                    </p>
                                                    <p className="text-xs text-[#a8bfd7]">
                                                        {item.user.email}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-4 font-semibold">
                                                    {money(item.amount)}
                                                </td>
                                                <td className="px-4 py-4 text-[#bfd0e3]">
                                                    {section === 'cash-ins'
                                                        ? item.reference_note ||
                                                          'Front desk'
                                                        : `${item.payout_method} · ${item.account_name} · ${item.account_number}`}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {new Date(
                                                        item.created_at,
                                                    ).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-4 capitalize">
                                                    {item.status}
                                                    {item.reject_reason ? (
                                                        <p className="text-xs text-red-300">
                                                            {item.reject_reason}
                                                        </p>
                                                    ) : null}
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    {item.status ===
                                                    'pending' ? (
                                                        <span className="inline-flex gap-2">
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    processingReview ===
                                                                    `${section}-${item.id}`
                                                                }
                                                                onClick={() =>
                                                                    approveRequest(
                                                                        section,
                                                                        item.id,
                                                                    )
                                                                }
                                                                className="rounded-md bg-[#2f6fb3] px-3 py-1.5 text-xs font-semibold"
                                                            >
                                                                {processingReview ===
                                                                `${section}-${item.id}`
                                                                    ? 'Approving…'
                                                                    : 'Approve'}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setReview({
                                                                        type: section,
                                                                        id: item.id,
                                                                        action: 'reject',
                                                                    });
                                                                    setReason(
                                                                        '',
                                                                    );
                                                                }}
                                                                className="rounded-md border border-red-800 px-3 py-1.5 text-xs text-red-200"
                                                            >
                                                                Reject
                                                            </button>
                                                        </span>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                            {pageItems.length === 0 && (
                                <p className="px-5 py-10 text-center text-sm text-[#a8bfd7]">
                                    No wallet requests found.
                                </p>
                            )}
                        </div>
                    ) : section === 'customers' ? (
                        <div className="overflow-x-auto rounded-lg border border-[#2a405a] bg-[#0f1b2b]">
                            <table className="w-full min-w-[700px] text-left text-sm">
                                <thead className="bg-[#15243a] text-xs text-[#a8bfd7] uppercase">
                                    <tr>
                                        <th className="px-4 py-3">Customer</th>
                                        <th className="px-4 py-3">Available</th>
                                        <th className="px-4 py-3">On hold</th>
                                        <th className="px-4 py-3 text-right">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(pageItems as CustomerItem[]).map(
                                        (customer) => (
                                            <tr
                                                key={customer.id}
                                                className="border-t border-[#2a405a]"
                                            >
                                                <td className="px-4 py-4">
                                                    <p className="font-medium">
                                                        {customer.name}
                                                    </p>
                                                    <p className="text-xs text-[#a8bfd7]">
                                                        {customer.email}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    {money(
                                                        customer.wallet
                                                            ?.balance ?? 0,
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {money(
                                                        customer.wallet
                                                            ?.held_balance ?? 0,
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <button
                                                        onClick={() =>
                                                            startAdjust(
                                                                customer,
                                                            )
                                                        }
                                                        className="rounded-md border border-[#355f8a] px-3 py-1.5 text-xs text-[#a2cbf4]"
                                                    >
                                                        Adjust balance
                                                    </button>
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <section className="rounded-lg border border-[#2a405a] bg-[#0f1b2b] p-5">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                <h2 className="text-lg font-semibold">
                                    Wallet ledger totals
                                </h2>
                                <a
                                    href={`${reportsRoute.url()}?${new URLSearchParams({ ...filters, export: '1' })}`}
                                    className="rounded-md border border-[#355f8a] px-3 py-2 text-sm text-[#a2cbf4]"
                                >
                                    Export CSV
                                </a>
                            </div>
                            <div className="mb-4 grid gap-3 sm:grid-cols-3">
                                <label className="text-xs text-[#a8bfd7]">
                                    Period
                                    <select
                                        value={filters.period}
                                        onChange={(event) =>
                                            updateReportFilter(
                                                'period',
                                                event.target.value,
                                            )
                                        }
                                        className="mt-1 block w-full rounded-md border border-[#2a405a] bg-[#08111e] px-3 py-2 text-sm text-white"
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </label>
                                <label className="text-xs text-[#a8bfd7]">
                                    From
                                    <input
                                        type="date"
                                        value={filters.from}
                                        onChange={(event) =>
                                            updateReportFilter(
                                                'from',
                                                event.target.value,
                                            )
                                        }
                                        className="mt-1 block w-full rounded-md border border-[#2a405a] bg-[#08111e] px-3 py-2 text-sm text-white"
                                    />
                                </label>
                                <label className="text-xs text-[#a8bfd7]">
                                    To
                                    <input
                                        type="date"
                                        value={filters.to}
                                        onChange={(event) =>
                                            updateReportFilter(
                                                'to',
                                                event.target.value,
                                            )
                                        }
                                        className="mt-1 block w-full rounded-md border border-[#2a405a] bg-[#08111e] px-3 py-2 text-sm text-white"
                                    />
                                </label>
                            </div>
                            <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {[
                                    ['Cash-ins', stats.cashInCentavos],
                                    ['Cash-outs', stats.cashOutCentavos],
                                    [
                                        'Reservation payments',
                                        stats.paymentsCentavos,
                                    ],
                                    ['Refunds', stats.refundsCentavos],
                                ].map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="border-l-2 border-[#3b82f6] bg-[#15243a] p-3"
                                    >
                                        <p className="text-xs text-[#a8bfd7]">
                                            {label}
                                        </p>
                                        <p className="mt-1 font-semibold">
                                            {money(Number(value ?? 0))}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[500px] text-left text-sm">
                                    <thead className="text-xs text-[#a8bfd7] uppercase">
                                        <tr>
                                            <th className="py-2">
                                                Period starting
                                            </th>
                                            <th className="py-2">Type</th>
                                            <th className="py-2 text-right">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportItems.map((row, index) => (
                                            <tr
                                                key={`${row.day}-${row.type}-${index}`}
                                                className="border-t border-[#2a405a]"
                                            >
                                                <td className="py-3">
                                                    {row.day}
                                                </td>
                                                <td className="py-3 capitalize">
                                                    {row.type.replace('_', ' ')}
                                                </td>
                                                <td className="py-3 text-right">
                                                    {money(
                                                        Number(
                                                            row.total_centavos,
                                                        ),
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}
                    {!Array.isArray(items) && (
                        <nav
                            aria-label="Wallet pages"
                            className="mt-4 flex flex-wrap gap-2"
                        >
                            {items.links.map((link) => (
                                <button
                                    key={link.label}
                                    disabled={!link.url}
                                    onClick={() =>
                                        link.url && router.visit(link.url)
                                    }
                                    className={`rounded-md border px-3 py-1.5 text-sm ${link.active ? 'border-[#3b82f6] bg-[#3b82f6]' : 'border-[#2a405a] bg-[#0f1b2b] text-[#bfd0e3]'} disabled:opacity-40`}
                                >
                                    {link.label
                                        .replace(/<[^>]*>/g, '')
                                        .replace(/&laquo;|&raquo;/g, '')
                                        .trim()}
                                </button>
                            ))}
                        </nav>
                    )}
                </div>
            </main>
            {review?.action === 'reject' && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
                    <form
                        onSubmit={submitReview}
                        className="w-full max-w-md space-y-4 rounded-lg border border-[#2a405a] bg-[#0f1b2b] p-5"
                    >
                        <h2 className="text-lg font-semibold">
                            Reject wallet request
                        </h2>
                        <label className="block text-sm">
                            Reason
                            <textarea
                                required
                                minLength={3}
                                maxLength={500}
                                value={reason}
                                onChange={(event) =>
                                    setReason(event.target.value)
                                }
                                className="mt-2 min-h-24 w-full rounded-md border border-[#2a405a] bg-[#08111e] p-3"
                            />
                        </label>
                        {reviewForm.errors.reason && (
                            <p className="text-sm text-red-300">
                                {reviewForm.errors.reason}
                            </p>
                        )}
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setReview(null)}
                                className="rounded-md border border-[#355f8a] px-3 py-2 text-sm"
                            >
                                Back
                            </button>
                            <button
                                disabled={reviewForm.processing}
                                className="rounded-md bg-red-800 px-3 py-2 text-sm"
                            >
                                Confirm rejection
                            </button>
                        </div>
                    </form>
                </div>
            )}
            {adjusting && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
                    <form
                        onSubmit={submitAdjustment}
                        className="w-full max-w-md space-y-4 rounded-lg border border-[#2a405a] bg-[#0f1b2b] p-5"
                    >
                        <h2 className="text-lg font-semibold">
                            Adjust {adjusting.name}'s balance
                        </h2>
                        <label className="block text-sm">
                            Adjustment (PHP, use minus to debit)
                            <input
                                required
                                type="number"
                                step="0.01"
                                value={(
                                    adjustment.data.amount_centavos / 100
                                ).toFixed(2)}
                                onChange={(event) =>
                                    adjustment.setData(
                                        'amount_centavos',
                                        centavos(event.target.value),
                                    )
                                }
                                className="mt-2 w-full rounded-md border border-[#2a405a] bg-[#08111e] px-3 py-2"
                            />
                        </label>
                        <label className="block text-sm">
                            Reason
                            <textarea
                                required
                                value={adjustment.data.reason}
                                onChange={(event) =>
                                    adjustment.setData(
                                        'reason',
                                        event.target.value,
                                    )
                                }
                                className="mt-2 min-h-20 w-full rounded-md border border-[#2a405a] bg-[#08111e] p-3"
                            />
                        </label>
                        {adjustment.errors.amount_centavos && (
                            <p className="text-sm text-red-300">
                                {adjustment.errors.amount_centavos}
                            </p>
                        )}
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setAdjusting(null)}
                                className="rounded-md border border-[#355f8a] px-3 py-2 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={
                                    adjustment.processing ||
                                    adjustment.data.amount_centavos === 0
                                }
                                className="rounded-md bg-[#2f6fb3] px-3 py-2 text-sm"
                            >
                                Save adjustment
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
