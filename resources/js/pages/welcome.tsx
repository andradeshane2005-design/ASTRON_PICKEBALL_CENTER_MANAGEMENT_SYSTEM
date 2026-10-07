import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { useState } from 'react';
import {
    CalendarCheck,
    Clock,
    HeartPulse,
    MapPin,
    Package,
    Target,
    Trophy,
} from 'lucide-react';

type Tab = 'home' | 'courts' | 'reservations' | 'about';

const NAV_LINKS: { label: string; tab: Tab }[] = [
    { label: 'Home', tab: 'home' },
    { label: 'Courts', tab: 'courts' },
    { label: 'Reservations', tab: 'reservations' },
    { label: 'About', tab: 'about' },
];

const FEATURES = [
    {
        icon: Target,
        title: 'Pickleball Courts',
        description: 'Well-maintained indoor & outdoor courts',
    },
    { icon: Clock, title: 'Flexible', description: '4:00 PM – 2:00 AM' },
    {
        icon: CalendarCheck,
        title: 'Open Daily',
        description: 'Book any day of the week',
    },
    {
        icon: Package,
        title: 'Equipment',
        description: 'Rental available on-site',
    },
];

// Point these at real photos in public/images/ (or swap for @/assets/... imports).
const COURTS = [
    {
        name: 'Court 1',
        type: 'Outdoor',
        price: 350,
        image: '/images/court-1.jpg',
    },
    {
        name: 'Court 2',
        type: 'Outdoor',
        price: 350,
        image: '/images/court-2.jpg',
    },
    {
        name: 'Court 3',
        type: 'Outdoor',
        price: 350,
        image: '/images/court-3.jpg',
    },
    {
        name: 'Court 4',
        type: 'Outdoor',
        price: 350,
        image: '/images/court-4.jpg',
    },
];

const TIME_SLOTS = [
    '4:00 PM - 5:00 PM',
    '5:00 PM - 6:00 PM',
    '6:00 PM - 7:00 PM',
    '7:00 PM - 8:00 PM',
    '8:00 PM - 9:00 PM',
    '9:00 PM - 10:00 PM',
    '10:00 PM - 11:00 PM',
    '11:00 PM - 12:00 AM',
];

const DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

const VALUES = [
    {
        icon: HeartPulse,
        title: 'Health & Wellness',
        description: 'Stay active and healthy.',
    },
    {
        icon: Package,
        title: 'Community',
        description: 'Play, meet, and make friends.',
    },
    {
        icon: Trophy,
        title: 'Sportsmanship',
        description: 'Respect, enjoy, grow.',
    },
];

export default function Welcome() {
    const { auth } = usePage().props;
    const [tab, setTab] = useState<Tab>('home');

    const [selectedDay, setSelectedDay] = useState(9);
    const [selectedSlot, setSelectedSlot] = useState('4:00 PM - 5:00 PM');
    const [selectedCourt, setSelectedCourt] = useState(COURTS[0].name);

    return (
        <>
            <Head title="Astron Pickleball Center" />
            <div className="min-h-screen bg-[#f3f7fc] text-[#173353]">
                {/* Header — nav buttons swap the tab locally, no page reload needed */}
                <header className="border-b border-[#cfdeee] bg-white">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <button
                            type="button"
                            onClick={() => setTab('home')}
                            className="flex items-center gap-2 rounded-md text-lg font-semibold tracking-tight text-[#2f6fb3] transition hover:-translate-y-0.5 hover:text-[#24598f]"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2f6fb3] text-white">
                                A
                            </span>
                            ASTRON
                        </button>
                        <nav className="hidden items-center gap-8 text-sm font-medium text-[#536a84] md:flex">
                            {NAV_LINKS.map((link) => (
                                <button
                                    key={link.tab}
                                    type="button"
                                    onClick={() => setTab(link.tab)}
                                    className={
                                        tab === link.tab
                                            ? 'rounded-md bg-[#e4f0fc] px-3 py-2 font-semibold text-[#2f6fb3] transition hover:-translate-y-0.5 hover:bg-[#d8e8f7]'
                                            : 'rounded-md px-3 py-2 transition duration-150 hover:-translate-y-0.5 hover:bg-[#f0f6fc] hover:text-[#24598f]'
                                    }
                                >
                                    {link.label}
                                </button>
                            ))}
                        </nav>
                        <div className="flex items-center gap-3">
                            {auth?.user ? (
                                <Link
                                    href={dashboard()}
                                    className="rounded-md border border-[#2f6fb3] px-5 py-2 text-sm font-medium text-[#2f6fb3] transition hover:-translate-y-0.5 hover:bg-[#2f6fb3] hover:text-white hover:shadow-md hover:shadow-[#2f6fb3]/20"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-md border border-[#2f6fb3] px-5 py-2 text-sm font-medium text-[#2f6fb3] transition hover:-translate-y-0.5 hover:bg-[#2f6fb3] hover:text-white hover:shadow-md hover:shadow-[#2f6fb3]/20"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="rounded-md bg-[#2f6fb3] px-5 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#24598f] hover:shadow-md hover:shadow-[#2f6fb3]/20"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* HOME */}
                {tab === 'home' && (
                    <>
                        <section className="relative isolate flex min-h-[440px] items-center overflow-hidden bg-[#102b48] text-white sm:min-h-[480px]">
                            <img
                                src="/courts.jpg"
                                alt="Lit outdoor pickleball courts at Astron Pickleball Center"
                                className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
                            />
                            <div className="absolute inset-0 -z-10 bg-[#0b1c32]/65" />
                            <div className="mx-auto w-full max-w-6xl px-6 py-14">
                                <div className="max-w-2xl">
                                    <p className="mb-3 text-sm font-semibold text-[#c7e1fb]">
                                        Play. Connect. Compete.
                                    </p>
                                    <h1 className="mb-4 text-4xl leading-tight font-semibold sm:text-5xl">
                                        Astron Pickleball Center
                                    </h1>
                                    <p className="mb-8 max-w-xl text-[#e2eef9]">
                                        Reserve a court, meet your community,
                                        and enjoy the game in Abuyog, Leyte.
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setTab('reservations')
                                            }
                                            className="rounded-md bg-[#3b82f6] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#2563eb] hover:shadow-lg hover:shadow-black/20"
                                        >
                                            Book a Court
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTab('about')}
                                            className="rounded-md border border-white/70 bg-[#11243b]/50 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
                                        >
                                            Learn More
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="mx-auto max-w-6xl px-6 py-12">
                            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                                {FEATURES.map(
                                    ({ icon: Icon, title, description }) => (
                                        <div
                                            key={title}
                                            className="flex flex-col items-center rounded-lg border border-[#cfdeee] bg-white p-6 text-center transition duration-200 hover:-translate-y-1 hover:border-[#77aee4] hover:shadow-lg hover:shadow-[#315c87]/10"
                                        >
                                            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#e4f0fc] text-[#2f6fb3]">
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            <p className="text-sm font-semibold">
                                                {title}
                                            </p>
                                            <p className="mt-1 text-xs text-[#6d829a]">
                                                {description}
                                            </p>
                                        </div>
                                    ),
                                )}
                            </div>
                        </section>

                        <section className="mx-auto max-w-6xl px-6 pb-16">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-2xl font-semibold">
                                    Our Courts
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setTab('courts')}
                                    className="text-sm font-medium text-[#2f6fb3] hover:underline"
                                >
                                    View all
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
                                {COURTS.map((court) => (
                                    <div
                                        key={court.name}
                                        className="group overflow-hidden rounded-lg border border-[#cfdeee] bg-white transition duration-200 hover:-translate-y-1 hover:border-[#77aee4] hover:shadow-lg hover:shadow-[#315c87]/10"
                                    >
                                        <img
                                            src="/courts.jpg"
                                            alt={`${court.name} pickleball court`}
                                            className="aspect-[16/9] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                                        />
                                        <div className="p-4">
                                            <p className="text-sm font-semibold">
                                                {court.name}
                                            </p>
                                            <p className="text-xs text-[#6d829a]">
                                                {court.type} · ₱{court.price}
                                                /hour
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setTab('reservations')
                                                }
                                                className="mt-3 block w-full rounded-full bg-[#2f6fb3] py-1.5 text-center text-xs font-semibold text-white hover:bg-[#24598f]"
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}

                {/* COURTS */}
                {tab === 'courts' && (
                    <>
                        <section className="relative overflow-hidden bg-[#2f6fb3]">
                            <div
                                className="absolute inset-0 bg-[#2f6fb3]"
                                style={{
                                    clipPath:
                                        'polygon(0 0, 65% 0, 40% 100%, 0 100%)',
                                }}
                            />
                            <div className="relative mx-auto max-w-6xl px-6 py-16">
                                <h1 className="mb-3 text-3xl font-semibold text-white md:text-4xl">
                                    Our Courts
                                </h1>
                                <p className="max-w-md text-sm text-[#d8e8fb] md:text-base">
                                    Choose from our well-maintained courts and
                                    enjoy a great playing experience.
                                </p>
                                <span>Baranggay Bunga, Abuyog, Leyte</span>
                            </div>
                        </section>

                        <section className="mx-auto max-w-6xl px-6 py-12">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {COURTS.map((court) => (
                                    <div
                                        key={court.name}
                                        className="overflow-hidden rounded-xl border border-[#cfdeee] bg-white"
                                    >
                                        <img
                                            src="courts.jpg"
                                            alt="court1"
                                            className="aspect-[16/9] w-full object-cover"
                                        />
                                        <div className="p-5">
                                            <div className="mb-2 flex items-center justify-between">
                                                <p className="text-base font-semibold">
                                                    {court.name}
                                                </p>
                                                <p className="text-sm font-semibold text-[#2f6fb3]">
                                                    ₱{court.price} / hour
                                                </p>
                                            </div>
                                            <p className="mb-4 flex items-center gap-1 text-sm text-[#6d829a]">
                                                <MapPin className="h-4 w-4" />
                                                {court.type}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCourt(
                                                        court.name,
                                                    );
                                                    setTab('reservations');
                                                }}
                                                className="block w-full rounded-full bg-[#2f6fb3] py-2 text-center text-sm font-semibold text-white hover:bg-[#24598f]"
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}

                {/* RESERVATIONS */}
                {tab === 'reservations' && (
                    <section className="mx-auto max-w-4xl px-6 py-10">
                        <h1 className="mb-1 text-2xl font-semibold">
                            Book a Court
                        </h1>
                        <p className="mb-8 text-sm text-[#6d829a]">
                            Select your preferred date, time, and court.
                        </p>

                        <ol className="mb-8 flex items-center gap-6 text-sm font-medium text-[#6d829a]">
                            <li className="flex items-center gap-2 text-[#2f6fb3]">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2f6fb3] text-xs text-white">
                                    1
                                </span>
                                Select Date &amp; Time
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#cadcee] text-xs">
                                    2
                                </span>
                                Choose Court
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#cadcee] text-xs">
                                    3
                                </span>
                                Confirm
                            </li>
                        </ol>

                        <div className="grid gap-6 rounded-2xl border border-[#cfdeee] bg-white p-6 md:grid-cols-2">
                            <div>
                                <p className="mb-3 text-sm font-semibold">
                                    Select Date
                                </p>
                                <div className="mb-2 flex items-center justify-between text-sm text-[#6d829a]">
                                    <button type="button" className="px-1">
                                        ‹
                                    </button>
                                    <span className="font-medium text-[#173353]">
                                        September 2026
                                    </span>
                                    <button type="button" className="px-1">
                                        ›
                                    </button>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(
                                        (d, i) => (
                                            <span
                                                key={`${d}-${i}`}
                                                className="py-1 text-[#8398ad]"
                                            >
                                                {d}
                                            </span>
                                        ),
                                    )}
                                    {DAYS.map((day) => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => setSelectedDay(day)}
                                            className={`rounded-md py-1.5 ${
                                                day === selectedDay
                                                    ? 'bg-[#2f6fb3] font-semibold text-white'
                                                    : 'text-[#173353] hover:bg-[#e4f0fc]'
                                            }`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="mb-3 text-sm font-semibold">
                                    Available Time Slots
                                </p>
                                <div className="grid grid-cols-1 gap-2">
                                    {TIME_SLOTS.map((slot) => (
                                        <button
                                            key={slot}
                                            type="button"
                                            onClick={() =>
                                                setSelectedSlot(slot)
                                            }
                                            className={`rounded-lg border px-3 py-2 text-left text-sm ${
                                                slot === selectedSlot
                                                    ? 'border-[#2f6fb3] bg-[#e4f0fc] font-semibold text-[#2f6fb3]'
                                                    : 'border-[#cfdeee] text-[#536a84] hover:border-[#2f6fb3]'
                                            }`}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <p className="mb-3 text-sm font-semibold">
                                    Choose Court
                                </p>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {COURTS.map((court) => (
                                        <button
                                            key={court.name}
                                            type="button"
                                            onClick={() =>
                                                setSelectedCourt(court.name)
                                            }
                                            className={`rounded-lg border px-3 py-2 text-sm ${
                                                court.name === selectedCourt
                                                    ? 'border-[#2f6fb3] bg-[#e4f0fc] font-semibold text-[#2f6fb3]'
                                                    : 'border-[#cfdeee] text-[#536a84] hover:border-[#2f6fb3]'
                                            }`}
                                        >
                                            {court.name} · {court.type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <button
                                    type="button"
                                    className="w-full rounded-full bg-[#2f6fb3] py-2.5 text-sm font-semibold text-white hover:bg-[#24598f]"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* ABOUT */}
                {tab === 'about' && (
                    <>
                        <section className="mx-auto max-w-6xl px-6 py-14">
                            <h1 className="mb-3 text-3xl font-semibold">
                                About Us
                            </h1>
                            <p className="max-w-2xl text-sm text-[#6d829a] md:text-base">
                                ASTRON Pickleball Center is more than just a
                                place to play. It's a community built around
                                sport, health, and connection.
                            </p>
                            <span>Baranggay Bunga, Abuyog, Leyte</span>
                        </section>

                        <section className="mx-auto max-w-6xl px-6 pb-14">
                            <div className="grid items-center gap-10 md:grid-cols-2">
                                <img
                                    src="courts.jpg"
                                    alt="Astron Pickleball Center courts"
                                    className="aspect-[4/3] w-full rounded-2xl object-cover"
                                />
                                <div>
                                    <h2 className="mb-3 text-xl font-semibold">
                                        Our Story
                                    </h2>
                                    <p className="text-sm leading-relaxed text-[#536a84]">
                                        Astron Pickleball Center was established
                                        with the vision of providing a safe,
                                        modern, and welcoming space for
                                        pickleball enthusiasts of all levels. We
                                        aim to promote an active lifestyle,
                                        bring people together, and grow the
                                        sport in our community.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="mx-auto max-w-6xl px-6 pb-16">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                {VALUES.map(
                                    ({ icon: Icon, title, description }) => (
                                        <div
                                            key={title}
                                            className="flex flex-col items-center rounded-xl border border-[#cfdeee] bg-white p-6 text-center"
                                        >
                                            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#e4f0fc] text-[#2f6fb3]">
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            <p className="text-sm font-semibold">
                                                {title}
                                            </p>
                                            <p className="mt-1 text-xs text-[#6d829a]">
                                                {description}
                                            </p>
                                        </div>
                                    ),
                                )}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </>
    );
}
