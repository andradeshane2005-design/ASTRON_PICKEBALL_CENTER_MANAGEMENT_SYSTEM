import { Head } from '@inertiajs/react';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

type Payment = {
    id: number;
    created_at: string;
    amount: string;
    status: string;
    method: string | null;
    reservation: { court: { name: string } };
};

export default function Payments({ payments }: { payments: Payment[] }) {
    const [pendingOnly, setPendingOnly] = useState(false);
    const shownPayments = payments.filter((payment) =>
        pendingOnly ? payment.status === 'pending' : true,
    );
    return (
        <>
            <Head title="Payments" />

            <div className="min-h-screen bg-[#eff5fc] px-6 py-6 text-[#173353] md:px-10 lg:px-12">
                <div className="mx-auto max-w-[1100px]">
                    {/* ================= HEADER ================= */}
                    <div className="mb-7 flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-[#2f6fb3]" />

                        <h1 className="text-2xl font-bold tracking-tight text-[#173353]">
                            Payments
                        </h1>
                    </div>

                    {/* ================= TABS ================= */}
                    <div className="mb-6 flex w-full max-w-[385px] border border-[#cbdced] bg-white p-1">
                        <button
                            type="button"
                            onClick={() => setPendingOnly(false)}
                            className={`flex-1 px-5 py-2.5 text-sm font-semibold transition ${pendingOnly ? 'text-[#566d86] hover:bg-[#eff5fc]' : 'bg-[#2f6fb3] text-white hover:bg-[#24598f]'}`}
                        >
                            Payment History
                        </button>

                        <button
                            type="button"
                            onClick={() => setPendingOnly(true)}
                            className={`flex-1 px-5 py-2.5 text-sm font-medium transition ${pendingOnly ? 'bg-[#2f6fb3] text-white' : 'text-[#566d86] hover:bg-[#eff5fc]'}`}
                        >
                            Pending
                        </button>
                    </div>

                    {/* ================= PAYMENT TABLE ================= */}
                    <div className="overflow-hidden border border-[#cbdced] bg-white">
                        {/* Table Header */}
                        <div className="grid grid-cols-4 border-b border-[#e3eee8] bg-[#f5faf7] px-5 py-4 text-xs font-medium tracking-wide text-[#566d86] uppercase md:px-6">
                            <div>Date</div>

                            <div>Description</div>

                            <div>Amount</div>

                            <div>Status</div>
                        </div>

                        {/* Payment Rows */}
                        <div>
                            {shownPayments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="grid grid-cols-4 items-center border-b border-[#e3eee8] px-5 py-5 last:border-b-0 md:px-6"
                                >
                                    {/* Date */}
                                    <div className="text-sm text-[#566d86]">
                                        {new Date(
                                            payment.created_at,
                                        ).toLocaleDateString([], {
                                            dateStyle: 'medium',
                                        })}
                                    </div>

                                    {/* Description */}
                                    <div className="text-sm text-[#173353]">
                                        {payment.reservation.court.name}{' '}
                                        reservation
                                        {payment.method
                                            ? ` · ${payment.method}`
                                            : ''}
                                    </div>

                                    {/* Amount */}
                                    <div className="text-sm font-medium text-[#173353]">
                                        ₱
                                        {Number(
                                            payment.amount,
                                        ).toLocaleString()}
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium ${payment.status === 'paid' ? 'bg-[#e7f1fb] text-[#2f6fb3]' : 'bg-[#fbf1cf] text-[#8a6515]'}`}
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5" />

                                            {payment.status
                                                .charAt(0)
                                                .toUpperCase() +
                                                payment.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {shownPayments.length === 0 && (
                        <p className="px-6 py-12 text-center text-sm text-[#566d86]">
                            No{' '}
                            {pendingOnly
                                ? 'pending payments'
                                : 'payment history'}{' '}
                            yet.
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}
