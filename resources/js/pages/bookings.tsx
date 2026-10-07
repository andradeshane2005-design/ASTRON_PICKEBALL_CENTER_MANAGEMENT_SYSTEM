import { useEffect, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { bookings } from '@/routes';
import { cashIn as walletCashInRoute } from '@/routes/wallet';

type Court = {
    id: number;
    name: string;
    surface: string;
    pricePerHour: number;
};

type Props = {
    courts: Array<Omit<Court, 'pricePerHour'> & { price_per_hour: string }>;
    minimumDate: string;
    openingTime: string;
    closingTime: string;
    walletBalance: number;
};

const STEPS = ['Date & Time', 'Select Court', 'Confirm'] as const;

function buildCalendarDays(monthDate: Date) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    const firstOfMonth = new Date(year, month, 1);
    // Monday-first weekday index (0 = Mon ... 6 = Sun)
    const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (number | null)[] = [
        ...Array(leadingBlanks).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    return days;
}

export default function Bookings({
    courts,
    minimumDate,
    openingTime,
    closingTime,
    walletBalance,
}: Props) {
    const [currentStep, setCurrentStep] = useState(0);
    const [monthDate, setMonthDate] = useState(new Date());
    const [availableCourtIds, setAvailableCourtIds] = useState<number[]>([]);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        date: minimumDate,
        start_time: openingTime,
        duration: 1,
        court_id: 0,
        payment_method: 'front_desk' as 'front_desk' | 'wallet',
    });

    const selectedDate = new Date(`${data.date}T00:00:00`).getDate();
    const selectedCourt = data.court_id || null;
    const selectedCourtPrice = Number(
        courts.find((court) => court.id === selectedCourt)?.price_per_hour ?? 0,
    );
    const bookingTotal = Math.round(selectedCourtPrice * data.duration * 100);
    const walletShortfall = Math.max(0, bookingTotal - walletBalance);
    const openingMinutes =
        Number(openingTime.slice(0, 2)) * 60 + Number(openingTime.slice(3, 5));
    const closingMinutes =
        Number(closingTime.slice(0, 2)) * 60 + Number(closingTime.slice(3, 5));
    const selectedStartMinutes =
        Number(data.start_time.slice(0, 2)) * 60 +
        Number(data.start_time.slice(3, 5));
    const timeSlots = Array.from(
        {
            length: Math.max(
                0,
                Math.floor((closingMinutes - openingMinutes - 60) / 60) + 1,
            ),
        },
        (_, index) => openingMinutes + index * 60,
    ).map(
        (minutes) =>
            `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`,
    );
    const durations = [1, 2, 3].filter(
        (hours) => selectedStartMinutes + hours * 60 <= closingMinutes,
    );

    useEffect(() => {
        let ignore = false;
        setAvailabilityLoading(true);
        fetch(
            `/bookings/availability?date=${data.date}&start_time=${data.start_time}&duration=${data.duration}`,
            {
                headers: { Accept: 'application/json' },
            },
        )
            .then((response) =>
                response.ok ? response.json() : Promise.reject(),
            )
            .then((result: { availableCourtIds: number[] }) => {
                if (!ignore) setAvailableCourtIds(result.availableCourtIds);
            })
            .catch(() => {
                if (!ignore) setAvailableCourtIds([]);
            })
            .finally(() => {
                if (!ignore) setAvailabilityLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [data.date, data.duration, data.start_time]);

    const days = buildCalendarDays(monthDate);
    const monthLabel = monthDate.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
    });

    const changeMonth = (delta: number) => {
        setMonthDate(
            (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1),
        );
    };

    const selectDay = (day: number) => {
        const date = new Date(
            monthDate.getFullYear(),
            monthDate.getMonth(),
            day,
        );
        const isoDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setData('date', isoDate);
        setData('court_id', 0);
    };

    return (
        <>
            <Head title="Bookings" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <h1 className="text-xl font-semibold">Book a Court</h1>

                        <ol className="flex items-center gap-2">
                            {STEPS.map((step, index) => {
                                const isActive = index === currentStep;
                                const isComplete = index < currentStep;
                                return (
                                    <li
                                        key={step}
                                        className="flex items-center gap-2"
                                    >
                                        <span
                                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                                                isActive || isComplete
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            {isComplete ? (
                                                <Check className="h-3.5 w-3.5" />
                                            ) : (
                                                index + 1
                                            )}
                                        </span>
                                        <span
                                            className={`text-sm ${
                                                isActive
                                                    ? 'font-medium text-foreground'
                                                    : 'text-muted-foreground'
                                            }`}
                                        >
                                            {step}
                                        </span>
                                        {index < STEPS.length - 1 && (
                                            <span className="mx-1 h-px w-6 bg-border sm:w-10" />
                                        )}
                                    </li>
                                );
                            })}
                        </ol>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Select Date */}
                        <div className="flex flex-col gap-3">
                            <h2 className="text-sm font-medium text-muted-foreground">
                                Select Date
                            </h2>

                            <div className="rounded-xl border p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => changeMonth(-1)}
                                        className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                                        aria-label="Previous month"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="text-sm font-medium">
                                        {monthLabel}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => changeMonth(1)}
                                        className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                                        aria-label="Next month"
                                    ></button>
                                </div>

                                <div className="grid grid-cols-7 gap-y-2 text-center text-xs text-muted-foreground">
                                    {[
                                        'Mo',
                                        'Tu',
                                        'We',
                                        'Th',
                                        'Fr',
                                        'Sa',
                                        'Su',
                                    ].map((d) => (
                                        <span key={d}>{d}</span>
                                    ))}
                                </div>

                                <div className="mt-1 grid grid-cols-7 gap-y-2 text-center text-sm">
                                    {days.map((day, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-center"
                                        >
                                            {day ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        selectDay(day)
                                                    }
                                                    disabled={
                                                        `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` <
                                                        minimumDate
                                                    }
                                                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                                                        selectedDate === day &&
                                                        monthDate.getMonth() ===
                                                            new Date(
                                                                `${data.date}T00:00:00`,
                                                            ).getMonth()
                                                            ? 'bg-blue-500 text-white'
                                                            : 'hover:bg-muted'
                                                    }`}
                                                >
                                                    {day}
                                                </button>
                                            ) : (
                                                <span className="h-8 w-8" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Available Courts */}
                        <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-2 gap-3">
                                <label className="text-sm font-medium text-muted-foreground">
                                    Start time
                                    <select
                                        value={data.start_time}
                                        onChange={(event) => {
                                            setData(
                                                'start_time',
                                                event.target.value,
                                            );
                                            setData('court_id', 0);
                                        }}
                                        className="mt-2 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                                    >
                                        {timeSlots.map((time) => (
                                            <option key={time} value={time}>
                                                {time}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Duration
                                    <select
                                        value={data.duration}
                                        onChange={(event) => {
                                            setData(
                                                'duration',
                                                Number(event.target.value),
                                            );
                                            setData('court_id', 0);
                                        }}
                                        className="mt-2 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                                    >
                                        {durations.map((hours) => (
                                            <option key={hours} value={hours}>
                                                {hours}{' '}
                                                {hours === 1 ? 'hour' : 'hours'}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-medium text-muted-foreground">
                                    Available Courts
                                </h2>
                                {availabilityLoading && (
                                    <span className="text-xs text-muted-foreground">
                                        Checking availability…
                                    </span>
                                )}
                            </div>
                            {errors.start_time && (
                                <p className="text-sm text-destructive">
                                    {errors.start_time}
                                </p>
                            )}
                            {errors.date && (
                                <p className="text-sm text-destructive">
                                    {errors.date}
                                </p>
                            )}
                            {errors.court_id && (
                                <p className="text-sm text-destructive">
                                    {errors.court_id}
                                </p>
                            )}

                            <div className="flex flex-col gap-3">
                                {courts.map((court) => {
                                    const available =
                                        availableCourtIds.includes(court.id);
                                    return (
                                        <button
                                            key={court.id}
                                            type="button"
                                            disabled={
                                                !available ||
                                                availabilityLoading
                                            }
                                            onClick={() =>
                                                setData('court_id', court.id)
                                            }
                                            className={`flex items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                                                selectedCourt === court.id
                                                    ? 'border-blue-500 ring-1 ring-blue-500'
                                                    : 'hover:bg-muted/50'
                                            } ${!available ? 'cursor-not-allowed opacity-60' : ''}`}
                                        >
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {court.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    ₱
                                                    {Number(
                                                        court.price_per_hour,
                                                    ).toLocaleString()}
                                                    /hour · {court.surface}
                                                </p>
                                            </div>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    available
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}
                                            >
                                                {available
                                                    ? 'Available'
                                                    : 'Unavailable'}
                                            </span>
                                        </button>
                                    );
                                })}
                                {courts.length === 0 && (
                                    <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                                        No courts are accepting reservations
                                        right now.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer actions */}
                    {currentStep === 2 && selectedCourt && (
                        <div className="rounded-md border bg-muted/30 p-4 text-sm">
                            <p className="font-semibold">Reservation summary</p>
                            <p className="mt-1 text-muted-foreground">
                                {
                                    courts.find(
                                        (court) => court.id === selectedCourt,
                                    )?.name
                                }{' '}
                                · {data.date} · {data.start_time} ·{' '}
                                {data.duration} hour(s)
                            </p>
                            <fieldset className="mt-4 space-y-2">
                                <legend className="mb-2 font-medium">
                                    Payment method
                                </legend>
                                <label className="flex cursor-pointer items-center gap-3 rounded-md border p-3">
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        checked={
                                            data.payment_method === 'front_desk'
                                        }
                                        onChange={() =>
                                            setData(
                                                'payment_method',
                                                'front_desk',
                                            )
                                        }
                                    />
                                    <span>Pay at the front desk</span>
                                </label>
                                <label
                                    className={`flex items-start gap-3 rounded-md border p-3 ${walletShortfall ? 'opacity-70' : 'cursor-pointer'}`}
                                >
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        checked={
                                            data.payment_method === 'wallet'
                                        }
                                        onChange={() =>
                                            setData('payment_method', 'wallet')
                                        }
                                        disabled={walletShortfall > 0}
                                    />
                                    <span className="flex-1">
                                        <span className="block">
                                            Pay with Wallet
                                        </span>
                                        <span className="block text-xs text-muted-foreground">
                                            Balance ₱
                                            {(
                                                walletBalance / 100
                                            ).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                            })}{' '}
                                            · Due ₱
                                            {(
                                                bookingTotal / 100
                                            ).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                            })}
                                        </span>
                                        {walletShortfall > 0 && (
                                            <span className="mt-1 block text-xs text-destructive">
                                                Short by ₱
                                                {(
                                                    walletShortfall / 100
                                                ).toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                })}
                                                .{' '}
                                                <a
                                                    href={
                                                        walletCashInRoute().url
                                                    }
                                                    className="underline"
                                                >
                                                    Top up
                                                </a>
                                            </span>
                                        )}
                                    </span>
                                </label>
                            </fieldset>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        {currentStep > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    setCurrentStep((step) => step - 1)
                                }
                            >
                                Back
                            </Button>
                        )}
                        <Button
                            type="button"
                            disabled={
                                processing || !selectedDate || !selectedCourt
                            }
                            onClick={() => {
                                if (currentStep < 2) {
                                    setCurrentStep((step) => step + 1);
                                    return;
                                }

                                post('/bookings');
                            }}
                            className="bg-blue-500 px-8 hover:bg-blue-600"
                        >
                            {currentStep === 2
                                ? processing
                                    ? 'Reserving…'
                                    : data.payment_method === 'wallet'
                                      ? 'Pay & reserve'
                                      : 'Confirm reservation'
                                : 'Next'}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

Bookings.layout = {
    breadcrumbs: [
        {
            title: 'Bookings',
            href: bookings(),
        },
    ],
};
