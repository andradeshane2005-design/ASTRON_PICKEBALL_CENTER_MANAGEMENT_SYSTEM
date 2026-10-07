import { Head, router } from '@inertiajs/react';
import { reservations } from '@/routes';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { useState } from 'react';

type ReservationItem = {
    id: number;
    start_at: string;
    end_at: string;
    status: string;
    amount: string;
    court: { name: string };
    payment?: { status: string } | null;
};

type Props = { reservations: ReservationItem[] };

export default function Reservation({ reservations: reservationItems }: Props) {
    const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past'>(
        'upcoming',
    );
    const reservations = reservationItems.filter((reservation) => {
        const isPast =
            new Date(reservation.end_at) < new Date() ||
            ['completed', 'cancelled'].includes(reservation.status);
        return selectedTab === 'past' ? isPast : !isPast;
    });

    return (
        <>
            <Head title="My Reservations" />

            <div className="min-h-screen bg-[#eff5fc] px-4 py-6 text-[#173353] md:px-8">
                <div className="mx-auto max-w-5xl">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">My Reservations</h1>

                        <p className="mt-1 text-sm text-[#566d86]">
                            View and manage your court reservations
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6 flex w-full max-w-sm border border-[#cbdced] bg-white p-1">
                        <button
                            onClick={() => setSelectedTab('upcoming')}
                            className={`flex-1 px-5 py-2 text-sm font-medium ${selectedTab === 'upcoming' ? 'bg-[#2f6fb3] text-white' : 'text-[#566d86] hover:bg-[#eff5fc]'}`}
                        >
                            Upcoming
                        </button>

                        <button
                            onClick={() => setSelectedTab('past')}
                            className={`flex-1 px-5 py-2 text-sm font-medium ${selectedTab === 'past' ? 'bg-[#2f6fb3] text-white' : 'text-[#566d86] hover:bg-[#eff5fc]'}`}
                        >
                            Past
                        </button>
                    </div>

                    {/* Reservation List */}
                    <div className="space-y-4">
                        {reservations.map((reservation) => (
                            <div
                                key={reservation.id}
                                className="border border-[#cbdced] bg-white p-5 transition hover:border-[#77aee4]"
                            >
                                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                                    {/* Reservation Information */}
                                    <div className="flex items-start gap-4">
                                        {/* Court Icon */}
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e7f1fb] text-[#2f6fb3]">
                                            <MapPin size={21} />
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h2 className="text-base font-semibold text-[#173353]">
                                                    {reservation.court.name}
                                                </h2>

                                                {/* Status */}
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                        reservation.status ===
                                                        'confirmed'
                                                            ? 'bg-[#e7f1fb] text-[#2f6fb3]'
                                                            : 'bg-[#e6f1fb] text-[#28718b]'
                                                    }`}
                                                >
                                                    {reservation.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        reservation.status.slice(
                                                            1,
                                                        )}
                                                </span>
                                            </div>
                                            <p className="mt-2 font-mono text-xs text-[#566d86]">
                                                Reservation reference: RES-
                                                {String(
                                                    reservation.id,
                                                ).padStart(6, '0')}
                                            </p>

                                            {/* Date */}
                                            <div className="mt-2 flex items-center gap-2 text-sm text-[#566d86]">
                                                <CalendarDays size={15} />
                                                <span>
                                                    {new Date(
                                                        reservation.start_at,
                                                    ).toLocaleDateString([], {
                                                        dateStyle: 'medium',
                                                        timeZone: 'Asia/Manila',
                                                    })}
                                                </span>
                                            </div>

                                            {/* Time */}
                                            <div className="mt-1 flex items-center gap-2 text-sm text-[#566d86]">
                                                <Clock size={15} />
                                                <span>
                                                    {new Date(
                                                        reservation.start_at,
                                                    ).toLocaleTimeString([], {
                                                        timeStyle: 'short',
                                                        timeZone: 'Asia/Manila',
                                                    })}{' '}
                                                    -{' '}
                                                    {new Date(
                                                        reservation.end_at,
                                                    ).toLocaleTimeString([], {
                                                        timeStyle: 'short',
                                                        timeZone: 'Asia/Manila',
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex items-center gap-3 md:ml-auto">
                                        <button className="border border-[#cbdced] px-4 py-2 text-sm font-medium text-[#2f6fb3] transition hover:bg-[#eff5fc]">
                                            {reservation.payment?.status ===
                                            'pending'
                                                ? 'Payment due at center'
                                                : `₱${Number(reservation.amount).toLocaleString()}`}
                                        </button>

                                        {['pending', 'confirmed'].includes(
                                            reservation.status,
                                        ) &&
                                            new Date(reservation.start_at) >
                                                new Date() && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.delete(
                                                            `/reservations/${reservation.id}`,
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        )
                                                    }
                                                    className="border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {reservations.length === 0 && (
                            <p className="border border-dashed border-[#cbdced] bg-white px-5 py-12 text-center text-sm text-[#566d86]">
                                No {selectedTab} reservations.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

Reservation.layout = {
    breadcrumbs: [
        {
            title: 'Reservations',
            href: reservations(),
        },
    ],
};
