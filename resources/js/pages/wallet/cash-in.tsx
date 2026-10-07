import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { storeCashIn } from '@/actions/App/Http/Controllers/WalletController';

function centavos(value: string) {
    const [whole, fraction = ''] = value.split('.');
    return Number(whole || 0) * 100 + Number((fraction + '00').slice(0, 2));
}

export default function CashIn({
    minimum,
    maximum,
}: {
    minimum: number;
    maximum: number;
}) {
    const form = useForm({
        amount_centavos: minimum,
        method: 'front_desk',
        reference_note: '',
    });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.submit(storeCashIn(), { onSuccess: () => undefined });
    };

    return (
        <>
            <Head title="Cash in" />
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
                            Request cash in
                        </h1>
                    </header>
                    <div>
                        <label
                            htmlFor="cash-in-amount"
                            className="mb-2 block text-sm font-medium"
                        >
                            Amount (PHP)
                        </label>
                        <input
                            id="cash-in-amount"
                            type="number"
                            min={minimum / 100}
                            max={maximum / 100}
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
                    <div className="flex flex-wrap gap-2">
                        {[200, 500, 1000, 2000].map((amount) => (
                            <button
                                key={amount}
                                type="button"
                                onClick={() =>
                                    form.setData(
                                        'amount_centavos',
                                        amount * 100,
                                    )
                                }
                                className="rounded-md border border-[#bdd6c6] px-3 py-1.5 text-sm text-[#185b3d] hover:bg-[#edf7f0]"
                            >
                                ₱{amount.toLocaleString()}
                            </button>
                        ))}
                    </div>
                    <div>
                        <label
                            htmlFor="cash-in-method"
                            className="mb-2 block text-sm font-medium"
                        >
                            Payment method
                        </label>
                        <select
                            id="cash-in-method"
                            value={form.data.method}
                            onChange={(event) =>
                                form.setData('method', event.target.value)
                            }
                            className="w-full rounded-md border border-[#c4d8ed] bg-white px-3 py-2"
                        >
                            <option value="front_desk">
                                Cash at the front desk
                            </option>
                        </select>
                    </div>
                    <div>
                        <label
                            htmlFor="cash-in-note"
                            className="mb-2 block text-sm font-medium"
                        >
                            Reference note (optional)
                        </label>
                        <input
                            id="cash-in-note"
                            value={form.data.reference_note}
                            onChange={(event) =>
                                form.setData(
                                    'reference_note',
                                    event.target.value,
                                )
                            }
                            maxLength={255}
                            className="w-full rounded-md border border-[#c4d8ed] px-3 py-2"
                        />
                    </div>
                    <p className="rounded-md bg-[#f0f8f2] p-3 text-sm text-[#315f91]">
                        Pay at the front desk, then wait for staff confirmation.
                        Your wallet is credited only after approval.
                    </p>
                    <button
                        disabled={form.processing}
                        className="w-full rounded-md bg-[#2f70b3] px-4 py-2.5 font-semibold text-white disabled:opacity-50"
                    >
                        {form.processing
                            ? 'Submitting…'
                            : 'Submit cash-in request'}
                    </button>
                </form>
            </main>
        </>
    );
}
