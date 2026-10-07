import { Head, router } from '@inertiajs/react';
import { transactions as transactionsRoute } from '@/routes/wallet';

type Transaction = {
    id: number;
    type: string;
    direction: string;
    amount: number;
    status: string;
    reference_no: string;
    created_at: string;
};
type Props = {
    transactions: {
        data: Transaction[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: { type?: string; from?: string; to?: string; search?: string };
};

export default function WalletTransactions({ transactions, filters }: Props) {
    const money = (value: number) =>
        `₱${(value / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    const update = (key: string, value: string) =>
        router.get(
            transactionsRoute.url(),
            { ...filters, [key]: value || undefined },
            { preserveState: true, replace: true },
        );
    return (
        <>
            <Head title="Wallet transactions" />
            <main className="min-h-full bg-[#f2f8f4] px-4 py-7 text-[#173a2d] sm:px-8">
                <div className="mx-auto max-w-6xl">
                    <h1 className="mb-5 text-2xl font-semibold">
                        Wallet transactions
                    </h1>
                    <div className="mb-4 grid gap-3 sm:grid-cols-4">
                        <select
                            aria-label="Transaction type"
                            value={filters.type ?? ''}
                            onChange={(event) =>
                                update('type', event.target.value)
                            }
                            className="rounded-md border border-[#c4d8ed] bg-white px-3 py-2"
                        >
                            <option value="">All activity</option>
                            {[
                                'cash_in',
                                'cash_out',
                                'payment',
                                'refund',
                                'adjustment',
                                'hold',
                                'release',
                            ].map((type) => (
                                <option key={type} value={type}>
                                    {type.replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                        <input
                            aria-label="From date"
                            type="date"
                            value={filters.from ?? ''}
                            onChange={(event) =>
                                update('from', event.target.value)
                            }
                            className="rounded-md border border-[#c4d8ed] bg-white px-3 py-2"
                        />
                        <input
                            aria-label="To date"
                            type="date"
                            value={filters.to ?? ''}
                            onChange={(event) =>
                                update('to', event.target.value)
                            }
                            className="rounded-md border border-[#c4d8ed] bg-white px-3 py-2"
                        />
                        <input
                            aria-label="Search reference"
                            placeholder="Search reference"
                            value={filters.search ?? ''}
                            onChange={(event) =>
                                update('search', event.target.value)
                            }
                            className="rounded-md border border-[#c4d8ed] bg-white px-3 py-2"
                        />
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-[#d4e1ef] bg-white">
                        <table className="w-full min-w-[700px] text-left text-sm">
                            <thead className="bg-[#f7faf7] text-xs text-[#667c95] uppercase">
                                <tr>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Reference</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.data.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-t border-[#e4edf7]"
                                    >
                                        <td className="px-4 py-3 capitalize">
                                            {item.type.replace('_', ' ')}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs">
                                            {item.reference_no}
                                        </td>
                                        <td className="px-4 py-3">
                                            {new Date(
                                                item.created_at,
                                            ).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 capitalize">
                                            {item.status}
                                        </td>
                                        <td
                                            className={`px-4 py-3 text-right font-semibold ${item.direction === 'credit' ? 'text-[#2f70b3]' : 'text-[#b43b43]'}`}
                                        >
                                            {item.direction === 'credit'
                                                ? '+'
                                                : '−'}
                                            {money(item.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {transactions.data.length === 0 && (
                            <p className="px-5 py-12 text-center text-sm text-[#667c95]">
                                No matching wallet transactions.
                            </p>
                        )}
                    </div>
                    <nav
                        aria-label="Transaction pages"
                        className="mt-4 flex flex-wrap gap-2"
                    >
                        {transactions.links.map((link) => (
                            <button
                                key={link.label}
                                disabled={!link.url}
                                onClick={() =>
                                    link.url && router.visit(link.url)
                                }
                                className={`rounded-md border px-3 py-1.5 text-sm ${link.active ? 'border-[#2f70b3] bg-[#2f70b3] text-white' : 'border-[#c4d8ed] bg-white text-[#315f91]'} disabled:opacity-40`}
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
