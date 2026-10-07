import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Check, Clock3, MapPin, Volleyball } from 'lucide-react';
import { bookings, courts } from '@/routes';

type Court = {
    id: number;
    name: string;
    surface: string;
    price_per_hour: string;
};

type Props = {
    courts: Court[];
    openingTime: string;
    closingTime: string;
    location: string;
};

function formatTime(value: string) {
    const [hours, minutes] = value.split(':').map(Number);
    return new Date(2020, 0, 1, hours, minutes).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
    });
}

export default function CourtsPage({
    courts: activeCourts,
    openingTime,
    closingTime,
    location,
}: Props) {
    return (
        <>
            <Head title="Courts" />
            <main className="min-h-full bg-[#eef4fb] px-4 py-7 text-[#15243a] sm:px-8 lg:px-12">
                <div className="mx-auto max-w-6xl">
                    <header className="mb-6">
                        <p className="text-xs font-semibold tracking-wide text-[#2765a8] uppercase">
                            Astron Pickleball Center
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold text-[#102746]">
                            Our courts
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-[#536981]">
                            Choose a court and reserve a time that works for
                            your game.
                        </p>
                    </header>

                    <section className="overflow-hidden rounded-lg border border-[#cbd9e8] bg-white">
                        <img
                            src="/courts.jpg"
                            alt="Outdoor pickleball courts at Astron Pickleball Center"
                            className="aspect-[2.3/1] w-full object-cover object-center"
                        />
                        <div className="grid gap-5 border-t border-[#dce6f0] p-5 sm:grid-cols-3 sm:p-6">
                            <div className="flex items-start gap-3">
                                <MapPin
                                    className="mt-0.5 shrink-0 text-[#347cc0]"
                                    size={18}
                                />
                                <div>
                                    <p className="text-xs font-medium text-[#70849a] uppercase">
                                        Location
                                    </p>
                                    <p className="mt-1 text-sm font-medium">
                                        {location}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock3
                                    className="mt-0.5 shrink-0 text-[#347cc0]"
                                    size={18}
                                />
                                <div>
                                    <p className="text-xs font-medium text-[#70849a] uppercase">
                                        Operating hours
                                    </p>
                                    <p className="mt-1 text-sm font-medium">
                                        {formatTime(openingTime)} –{' '}
                                        {formatTime(closingTime)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Volleyball
                                    className="mt-0.5 shrink-0 text-[#347cc0]"
                                    size={18}
                                />
                                <div>
                                    <p className="text-xs font-medium text-[#70849a] uppercase">
                                        Court count
                                    </p>
                                    <p className="mt-1 text-sm font-medium">
                                        {activeCourts.length} active{' '}
                                        {activeCourts.length === 1
                                            ? 'court'
                                            : 'courts'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
                        <section>
                            <div className="mb-4 flex items-end justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-semibold text-[#102746]">
                                        Available courts
                                    </h2>
                                    <p className="mt-1 text-sm text-[#657b92]">
                                        Rates are shown per hour.
                                    </p>
                                </div>
                                <Link
                                    href={bookings()}
                                    className="hidden items-center gap-1 text-sm font-semibold text-[#2765a8] transition hover:gap-2 hover:text-[#174879] sm:inline-flex"
                                >
                                    Book a court <ArrowRight size={15} />
                                </Link>
                            </div>
                            {activeCourts.length > 0 ? (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {activeCourts.map((court) => (
                                        <article
                                            key={court.id}
                                            className="group rounded-lg border border-[#cfdae7] bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[#78a9dc] hover:shadow-lg hover:shadow-[#315c87]/10"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="font-semibold text-[#17375c]">
                                                        {court.name}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-[#657b92]">
                                                        {court.surface}
                                                    </p>
                                                </div>
                                                <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f2fc] px-2.5 py-1 text-xs font-medium text-[#2765a8]">
                                                    <Check size={13} /> Active
                                                </span>
                                            </div>
                                            <div className="mt-5 flex items-end justify-between gap-3 border-t border-[#e4ebf2] pt-3">
                                                <p className="text-sm text-[#536981]">
                                                    <span className="text-xl font-semibold text-[#102746]">
                                                        ₱
                                                        {Number(
                                                            court.price_per_hour,
                                                        ).toLocaleString(
                                                            undefined,
                                                            {
                                                                minimumFractionDigits: 2,
                                                            },
                                                        )}
                                                    </span>{' '}
                                                    / hour
                                                </p>
                                                <Link
                                                    href={bookings()}
                                                    className="inline-flex items-center gap-1 rounded-md bg-[#2869ad] px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#1d548f] hover:shadow-md hover:shadow-[#2869ad]/20"
                                                >
                                                    Reserve{' '}
                                                    <ArrowRight size={14} />
                                                </Link>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <p className="rounded-lg border border-dashed border-[#b9cbdc] bg-white px-5 py-12 text-center text-sm text-[#657b92]">
                                    No courts are accepting reservations right
                                    now.
                                </p>
                            )}
                        </section>

                        <aside className="h-fit border-l-2 border-[#4b91cf] pl-4">
                            <h2 className="font-semibold text-[#17375c]">
                                Before you play
                            </h2>
                            <ul className="mt-3 space-y-3 text-sm text-[#536981]">
                                <li className="flex gap-2">
                                    <Check
                                        size={16}
                                        className="shrink-0 text-[#347cc0]"
                                    />{' '}
                                    Standard pickleball court dimensions
                                </li>
                                <li className="flex gap-2">
                                    <Check
                                        size={16}
                                        className="shrink-0 text-[#347cc0]"
                                    />{' '}
                                    Evening court lighting
                                </li>
                                <li className="flex gap-2">
                                    <Check
                                        size={16}
                                        className="shrink-0 text-[#347cc0]"
                                    />{' '}
                                    Clean playing area and free parking
                                </li>
                            </ul>
                            <p className="mt-5 text-xs leading-5 text-[#70849a]">
                                Select your date and start time on the booking
                                page to check availability.
                            </p>
                            <Link
                                href={bookings()}
                                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#2765a8] transition hover:gap-3 hover:text-[#174879]"
                            >
                                Continue to booking <ArrowRight size={15} />
                            </Link>
                        </aside>
                    </div>
                </div>
            </main>
        </>
    );
}

CourtsPage.layout = {
    breadcrumbs: [
        {
            title: 'Courts',
            href: courts(),
        },
    ],
};
