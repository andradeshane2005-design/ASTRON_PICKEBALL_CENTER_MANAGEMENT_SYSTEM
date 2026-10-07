import { Head, Link } from '@inertiajs/react';
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    Wallet as WalletIcon,
} from 'lucide-react';
import {
    cashIn as cashInRoute,
    cashOut as cashOutRoute,
    transactions as transactionsRoute,
} from '@/routes/wallet';

type Transaction = {
    id: number;
    type: string;
    direction: 'credit' | 'debit';
    amount: number;
    status: string;
    reference_no: string;
    created_at: string;
};

function money(centavos: number) {
    return `₱${(centavos / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function WalletPage({
    wallet,
    transactions,
}: {
    wallet: { balance: number; held_balance: number };
    transactions: Transaction[];
}) {
    return (
        <>
            <Head title="Wallet" />
            <main className="min-h-full bg-[#f2f8f4] px-4 py-7 text-[#173a2d] sm:px-8 lg:px-12">
                <div className="mx-auto max-w-6xl">
                    <header className="mb-7">
                        <p className="text-xs font-semibold text-[#258354] uppercase">
                            Account / Wallet
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold">
                            Your wallet
                        </h1>
                    </header>
                    <section className="grid gap-4 sm:grid-cols-[1.5fr_1fr]">
                        <div className="rounded-lg bg-[#1d4f7b] p-6 text-white">
                            <div className="flex items-center gap-2 text-sm text-[#c2e4d1]">
                                <WalletIcon size={18} /> Available balance
                            </div>
                            <p className="mt-5 text-4xl font-semibold">
                                {money(wallet.balance)}
                            </p>
                            <p className="mt-3 text-sm text-[#c2e4d1]">
                                {money(wallet.held_balance)} currently on hold
                            </p>
                        </div>
                        <div className="flex flex-col justify-center gap-3 rounded-lg border border-[#d4e1ef] bg-white p-5">
                            <Link
                                href={cashInRoute()}
                                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2f70b3] px-4 py-3 text-sm font-semibold text-white hover:bg-[#24598f]"
                            >
                                <ArrowDownToLine size={17} /> Cash in
                            </Link>
                            <Link
                                href={cashOutRoute()}
                                className="inline-flex items-center justify-center gap-2 rounded-md border border-[#bdd6c6] px-4 py-3 text-sm font-semibold text-[#185b3d] hover:bg-[#f2f8f4]"
                            >
                                <ArrowUpFromLine size={17} /> Cash out
                            </Link>
                        </div>
                    </section>
                    <section className="mt-8">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                Recent transactions
                            </h2>
                            <Link
                                href={transactionsRoute()}
                                className="text-sm font-medium text-[#2f70b3] hover:underline"
                            >
                                View all
                            </Link>
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-[#d4e1ef] bg-white">
                            {transactions.length ? (
                                <table className="w-full min-w-[650px] text-left text-sm">
                                    <thead className="bg-[#f7faf7] text-xs text-[#667c95] uppercase">
                                        <tr>
                                            <th className="px-4 py-3">
                                                Activity
                                            </th>
                                            <th className="px-4 py-3">
                                                Reference
                                            </th>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3 text-right">
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-t border-[#e4edf7]"
                                            >
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${item.status === 'pending' ? 'bg-amber-100 text-amber-800' : item.direction === 'credit' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'}`}
                                                    >
                                                        {item.type.replace(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs">
                                                    {item.reference_no}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {new Date(
                                                        item.created_at,
                                                    ).toLocaleDateString()}
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
                            ) : (
                                <p className="px-5 py-12 text-center text-sm text-[#667c95]">
                                    No wallet activity yet.
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
