import { Head, useForm, usePage } from '@inertiajs/react';
import { Camera, Trash2, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type AuthUser = {
    name?: string;
    email?: string;
    phone?: string | number | null;
    avatar_url?: string | null;
};

export default function Profile() {
    const { auth } = usePage().props;
    const user = (auth?.user ?? {}) as AuthUser;

    const userName = user.name ?? 'Shane Andrade';
    const userEmail = user.email ?? 'shane@gmail.com';

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, transform, processing, errors } = useForm<{
        name: string;
        email: string;
        phone: string;
        avatar: File | null;
        remove_avatar: boolean;
    }>({
        name: userName,
        email: userEmail,
        phone: String(user.phone ?? ''),
        avatar: null,
        remove_avatar: false,
    });

    // Laravel can't read multipart data on a real PATCH request, so we send a
    // POST and tell Laravel to treat it as PATCH.
    transform((formData) => ({ ...formData, _method: 'patch' }));

    // Preview of the newly picked file (before it is saved).
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!data.avatar) {
            setPreview(null);

            return;
        }

        const url = URL.createObjectURL(data.avatar);
        setPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [data.avatar]);

    const currentAvatar = data.remove_avatar
        ? null
        : (preview ?? user.avatar_url ?? null);

    const handlePick = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;

        if (file) {
            setData((prev) => ({
                ...prev,
                avatar: file,
                remove_avatar: false,
            }));
        }
    };

    const handleRemove = () => {
        setData((prev) => ({ ...prev, avatar: null, remove_avatar: true }));

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSave = () => {
        post('/profile', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setData((prev) => ({
                    ...prev,
                    avatar: null,
                    remove_avatar: false,
                }));

                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

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
                        <div className="mb-8 flex flex-wrap items-center gap-5">
                            {/* Avatar */}
                            <div className="relative h-20 w-20 shrink-0">
                                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#e7f1fb]">
                                    {currentAvatar ? (
                                        <img
                                            src={currentAvatar}
                                            alt={`${userName} profile photo`}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <UserRound className="h-10 w-10 text-[#2f6fb3]" />
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    aria-label="Change profile photo"
                                    className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#2f6fb3] text-white transition hover:bg-[#24598f]"
                                >
                                    <Camera className="h-4 w-4" />
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={handlePick}
                                    className="hidden"
                                />
                            </div>

                            {/* Name + Email */}
                            <div>
                                <h2 className="text-xl font-semibold text-[#173353]">
                                    {userName}
                                </h2>

                                <p className="mt-1 text-sm text-[#566d86]">
                                    {userEmail}
                                </p>

                                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="text-[#2f6fb3] hover:underline"
                                    >
                                        {currentAvatar
                                            ? 'Change photo'
                                            : 'Upload photo'}
                                    </button>

                                    {currentAvatar && (
                                        <button
                                            type="button"
                                            onClick={handleRemove}
                                            className="flex items-center gap-1 text-red-500 hover:underline"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <p className="mt-1 text-xs text-[#788ca4]">
                                    JPG, PNG or WebP. Max 2 MB.
                                </p>

                                {errors.avatar && (
                                    <p className="mt-1 text-sm text-red-400">
                                        {errors.avatar}
                                    </p>
                                )}
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
                                onClick={handleSave}
                                className="w-full bg-[#2f6fb3] py-3 text-sm font-semibold text-white transition hover:bg-[#24598f] disabled:opacity-60"
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
