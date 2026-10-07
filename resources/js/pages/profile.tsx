import { Head, useForm, usePage } from '@inertiajs/react';
import { UserRound } from 'lucide-react';

export default function Profile() {
    const { auth } = usePage().props;

    const userName = auth?.user?.name ?? 'Shane Andrade';
    const userEmail = auth?.user?.email ?? 'shane@gmail.com';
    const { data, setData, patch, processing, errors } = useForm({
        name: userName,
        email: userEmail,
        phone: String(auth?.user?.phone ?? ''),
    });

    return (
        <>
            <Head title="Profile" />

            <div className="min-h-screen bg-[#eff5fc] px-6 py-6 text-[#173353] md:px-10 lg:px-12">
                <div className="mx-auto max-w-[1100px]">
                    {/* ================= HEADER ================= */}
                    <div className="mb-7 flex items-center gap-2">
                        <UserRound className="h-5 w-5 text-[#2f6fb3]" />

                        <h1 className="text-2xl font-bold tracking-tight text-[#173353]">
                            Profile
                        </h1>
                    </div>

                    {/* ================= PROFILE CARD ================= */}
                    <div className="border border-[#cbdced] bg-white p-6">
                        {/* ================= USER INFO ================= */}
                        <div className="mb-8 flex items-center gap-5">
                            {/* Avatar */}
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#e7f1fb]">
                                <UserRound className="h-10 w-10 text-[#2f6fb3]" />
                            </div>

                            {/* Name + Email */}
                            <div>
                                <h2 className="text-xl font-semibold text-[#173353]">
                                    {userName}
                                </h2>

                                <p className="mt-1 text-sm text-[#566d86]">
                                    {userEmail}
                                </p>
                            </div>
                        </div>

                        {/* ================= PERSONAL INFORMATION ================= */}
                        <div>
                            <h2 className="mb-5 text-lg font-semibold text-[#173353]">
                                Personal Information
                            </h2>

                            {/* Full Name */}
                            <div className="mb-4">
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm font-medium text-[#566d86]"
                                >
                                    Full Name
                                </label>

                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
                                    className="w-full border border-[#cbdced] bg-white px-4 py-3 text-sm text-[#173353] transition outline-none placeholder:text-[#788ca4] focus:border-[#2f6fb3] focus:ring-1 focus:ring-[#2f6fb3]"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-400">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="mb-4">
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-[#566d86]"
                                >
                                    Email
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(event) =>
                                        setData('email', event.target.value)
                                    }
                                    className="w-full border border-[#cbdced] bg-white px-4 py-3 text-sm text-[#173353] transition outline-none placeholder:text-[#788ca4] focus:border-[#2f6fb3] focus:ring-1 focus:ring-[#2f6fb3]"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-400">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div className="mb-6">
                                <label
                                    htmlFor="phone"
                                    className="mb-2 block text-sm font-medium text-[#566d86]"
                                >
                                    Phone Number
                                </label>

                                <input
                                    id="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(event) =>
                                        setData('phone', event.target.value)
                                    }
                                    className="w-full border border-[#cbdced] bg-white px-4 py-3 text-sm text-[#173353] transition outline-none placeholder:text-[#788ca4] focus:border-[#2f6fb3] focus:ring-1 focus:ring-[#2f6fb3]"
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-400">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>

                            {/* Save Button */}
                            <button
                                type="button"
                                disabled={processing}
                                onClick={() => patch('/profile')}
                                className="w-full bg-[#2f6fb3] py-3 text-sm font-semibold text-white transition hover:bg-[#24598f]"
                            >
                                {processing ? 'Saving…' : 'Save Profile'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
