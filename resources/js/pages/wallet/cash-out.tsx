import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { storeCashOut } from '@/actions/App/Http/Controllers/WalletController';

function centavos(value: string) {
    const [whole, fraction = ''] = value.split('.');
    return Number(whole || 0) * 100 + Number((fraction + '00').slice(0, 2));
}

function money(value: number) {
    return `₱${(value / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

export default function CashOut({
    balance,
    minimum,
}: {
    balance: number;
    minimum: number;
}) {
    const form = useForm({
        amount_centavos: minimum,
        payout_method: 'cash_pickup',
        account_name: '',
        account_number: '',
    });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (
            window.confirm(
                'Submit this cash-out request? The amount will be held until staff review.',
            )
        ) {
            form.submit(storeCashOut());
        }
    };

    return (
        <>
            <Head title="Cash out" />
            <main className="min-h-full bg-[#f2f8f4] px-4 py-8 text-[#173a2d] sm:px-8">
                <form
                    onSubmit={submit}
                    className="mx-auto max-w-xl space-y-5 rounded-lg border border-[#d4e1ef] bg-white p-6"
                >
                    <header>
                        <p className="text-xs font-semibold text-[#258354] uppercase">
                            Wallet
                        </p>
                        <h1 className="mt-2 text-2xl font-semibold">
                            Request cash out
                        </h1>
                        <p className="mt-2 text-sm text-[#667c95]">
                            Available balance: {money(balance)}
                        </p>
                    </header>
                    <div>
                        <label
                            htmlFor="cash-out-amount"
                            className="mb-2 block text-sm font-medium"
                        >
                            Amount (PHP)
                        </label>
                        <input
                            id="cash-out-amount"
                            type="number"
                            min={minimum / 100}
                            max={balance / 100}
                            step="0.01"
                            value={(form.data.amount_centavos / 100).toFixed(2)}
                            onChange={(event) =>
                                form.setData(
                                    'amount_centavos',
                                    centavos(event.target.value),
                                )
                            }
                            className="w-full rounded-md border border-[#c4d8ed] px-3 py-2"
                        />
                        {form.errors.amount_centavos && (
                            <p className="mt-1 text-sm text-red-700">
                                {form.errors.amount_centavos}
                            </p>
                        )}
                    </div>
                    <div>
                        <label
                            htmlFor="payout-method"
                            className="mb-2 block text-sm font-medium"
                        >
                            Payout method
                        </label>
                        <select
                            id="payout-method"
                            value={form.data.payout_method}
                            onChange={(event) =>
                                form.setData(
                                    'payout_method',
                                    event.target.value,
                                )
                            }
                            className="w-full rounded-md border border-[#c4d8ed] bg-white px-3 py-2"
                        >
                            <option value="cash_pickup">Cash pickup</option>
                            <option value="gcash">GCash</option>
                            <option value="bank">Bank</option>
                        </select>
                    </div>
                    <div>
                        <label
                            htmlFor="account-name"
                            className="mb-2 block text-sm font-medium"
                        >
                            Account name
                        </label>
                        <input
                            id="account-name"
                            value={form.data.account_name}
                            onChange={(event) =>
                                form.setData('account_name', event.target.value)
                            }
                            className="w-full rounded-md border border-[#c4d8ed] px-3 py-2"
                        />
                        {form.errors.account_name && (
                            <p className="mt-1 text-sm text-red-700">
                                {form.errors.account_name}
                            </p>
                        )}
                    </div>
                    <div>
                        <label
                            htmlFor="account-number"
                            className="mb-2 block text-sm font-medium"
                        >
                            Account number / pickup details
                        </label>
                        <input
                            id="account-number"
                            value={form.data.account_number}
                            onChange={(event) =>
                                form.setData(
                                    'account_number',
                                    event.target.value,
                                )
                            }
                            className="w-full rounded-md border border-[#c4d8ed] px-3 py-2"
                        />
                        {form.errors.account_number && (
                            <p className="mt-1 text-sm text-red-700">
                                {form.errors.account_number}
                            </p>
                        )}
                    </div>
                    <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
                        The requested amount is held from your available balance
                        until staff approves or rejects this request.
                    </p>
                    <button
                        disabled={
                            form.processing ||
                            form.data.amount_centavos > balance
                        }
                        className="w-full rounded-md bg-[#2f70b3] px-4 py-2.5 font-semibold text-white disabled:opacity-50"
                    >
                        {form.processing
                            ? 'Submitting…'
                            : 'Confirm cash-out request'}
                    </button>
                </form>
            </main>
        </>
    );
}
