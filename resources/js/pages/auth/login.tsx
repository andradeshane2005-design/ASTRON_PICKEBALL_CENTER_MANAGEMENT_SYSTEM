// resources/js/pages/auth/login.tsx
import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import PasskeyVerify from '@/components/passkey-verify';

import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <div className="fixed inset-0 z-[999] grid h-screen w-screen grid-cols-1 overflow-hidden lg:grid-cols-[1.05fr_1fr]">
            <Head title="Log in" />

            {/* Left: brand panel */}
            <div className="relative hidden flex-col justify-between gap-12 overflow-y-auto bg-gradient-to-br from-[#102c49] via-[#14395f] to-[#1d4f7b] p-16 text-white lg:flex">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(560px_560px_at_88%_18%,rgba(59,130,246,0.22),transparent_60%),radial-gradient(420px_420px_at_12%_92%,rgba(44,147,176,0.20),transparent_60%)]" />

                <div className="relative z-10 flex items-center gap-3">
                    <svg
                        width="34"
                        height="34"
                        viewBox="0 0 34 34"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle cx="17" cy="17" r="17" fill="#173a5f" />
                        <circle
                            cx="12"
                            cy="21"
                            r="4.6"
                            fill="none"
                            stroke="#edf5ff"
                            strokeWidth="1.6"
                        />
                        <line
                            x1="15.2"
                            y1="17.8"
                            x2="20"
                            y2="13"
                            stroke="#edf5ff"
                            strokeWidth="1.6"
                        />
                        <circle
                            cx="22"
                            cy="12"
                            r="4.6"
                            fill="none"
                            stroke="#edf5ff"
                            strokeWidth="1.6"
                        />
                        <circle cx="26.5" cy="24.5" r="2.4" fill="#E8D23C" />
                    </svg>
                    <div className="leading-tight">
                        <b className="block text-[20px] font-bold tracking-wide">
                            ASTRON
                        </b>
                        <span className="block text-[11px] tracking-[0.08em] text-[#adc8e6]">
                            PICKLEBALL CENTER
                        </span>
                    </div>
                </div>

                <div className="relative z-10 max-w-[440px]">
                    <div className="mb-5 inline-flex items-center gap-2 text-[13px] text-[#c0dcfa]">
                        <span className="h-[7px] w-[7px] rounded-full bg-[#E8D23C]" />
                        Member sign in
                    </div>
                    <h1 className="mb-4 text-[38px] leading-[1.2] font-semibold">
                        Welcome to the Astron Pickleball Systems.
                    </h1>
                    <p className="text-[15.5px] leading-relaxed text-[#ccdbef]">
                        Sign in to book your next slot, check upcoming
                        reservations, and manage your membership — everything
                        about your play at Astron, in one place.
                    </p>
                </div>

                <div className="relative z-10 aspect-[520/220] w-full shrink-0 overflow-hidden rounded-xl border border-white/15 bg-[#0b2138]">
                    <img
                        src="/courts.jpg"
                        alt="Astron Pickleball Center courts"
                        className="h-full w-full object-cover object-center transition duration-500 hover:scale-[1.02]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[#0b1c32]/15" />
                </div>

                <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5 text-[12.5px] text-[#95b4d5]">
                    <span>
                        <b className="font-semibold text-[#edf5ff]">1</b> active
                        court
                    </span>
                    <span>
                        <b className="font-semibold text-[#edf5ff]">
                            6:00 AM – 10:00 PM
                        </b>{' '}
                        daily
                    </span>
                    <span>Abuyog, Leyte</span>
                </div>
            </div>

            {/* Right: form panel */}
            <div className="flex items-center justify-center overflow-y-auto bg-white px-8 py-16 lg:px-20">
                <div className="w-full max-w-[420px]">
                    <div className="mb-8 flex items-center gap-2.5 lg:hidden">
                        <svg
                            width="26"
                            height="26"
                            viewBox="0 0 34 34"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle cx="17" cy="17" r="17" fill="#173a5f" />
                            <circle
                                cx="12"
                                cy="21"
                                r="4.6"
                                fill="none"
                                stroke="#edf5ff"
                                strokeWidth="1.6"
                            />
                            <line
                                x1="15.2"
                                y1="17.8"
                                x2="20"
                                y2="13"
                                stroke="#edf5ff"
                                strokeWidth="1.6"
                            />
                            <circle
                                cx="22"
                                cy="12"
                                r="4.6"
                                fill="none"
                                stroke="#edf5ff"
                                strokeWidth="1.6"
                            />
                            <circle
                                cx="26.5"
                                cy="24.5"
                                r="2.4"
                                fill="#E8D23C"
                            />
                        </svg>
                        <div className="leading-tight">
                            <b className="block text-[15px] font-bold text-[#14395f]">
                                ASTRON
                            </b>
                            <span className="block text-[9px] tracking-[0.07em] text-[#596d83]">
                                PICKLEBALL CENTER
                            </span>
                        </div>
                    </div>

                    <h2 className="mb-2 text-[26px] font-semibold text-[#162d49]">
                        Log in to your account
                    </h2>
                    <p className="mb-8 text-[14px] text-[#596d83]">
                        New to Astron?{' '}
                        <TextLink
                            href={register()}
                            className="font-medium text-[#2f70b3] hover:underline"
                        >
                            Create an account
                        </TextLink>
                    </p>

                    {status && (
                        <div className="mb-6 rounded-lg bg-[#e8f2fc] px-3 py-2.5 text-[13px] text-[#1d4f7b]">
                            {status}
                        </div>
                    )}

                    <PasskeyVerify />

                    <div className="my-7 flex items-center gap-2.5 text-[11px] tracking-wide text-[#596d83]">
                        <span className="h-px flex-1 bg-[#d6e3f2]" />
                        OR CONTINUE WITH EMAIL
                        <span className="h-px flex-1 bg-[#d6e3f2]" />
                    </div>

                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="flex flex-col gap-7"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="email"
                                        className="text-[13px] font-medium text-[#162d49]"
                                    >
                                        Email address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        className="h-12 rounded-md border-[#d6e3f2] bg-[#f3f7fc] px-4 text-[#162d49] transition placeholder:text-[#8192a8] focus-visible:border-[#3b82f6] focus-visible:ring-2 focus-visible:ring-[#3b82f6]/20"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-baseline justify-between">
                                        <Label
                                            htmlFor="password"
                                            className="text-[13px] font-medium text-[#162d49]"
                                        >
                                            Password
                                        </Label>
                                        {canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                tabIndex={5}
                                                className="text-[12.5px] font-medium text-[#2f70b3] hover:underline"
                                            >
                                                Forgot your password?
                                            </TextLink>
                                        )}
                                    </div>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        className="h-12 rounded-md border-[#d6e3f2] bg-[#f3f7fc] px-4 text-[#162d49] transition placeholder:text-[#8192a8] focus-visible:border-[#3b82f6] focus-visible:ring-2 focus-visible:ring-[#3b82f6]/20"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex items-center gap-2.5">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                        className="border-[#d6e3f2] data-[state=checked]:border-[#2f70b3] data-[state=checked]:bg-[#2f70b3]"
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="text-[13.5px] text-[#596d83]"
                                    >
                                        Remember me
                                    </Label>
                                </div>

                                <Button
                                    type="submit"
                                    tabIndex={4}
                                    disabled={processing}
                                    className="h-12 w-full rounded-md bg-[#3b82f6] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#2f70b3] hover:shadow-md hover:shadow-[#2f70b3]/20"
                                >
                                    {processing && (
                                        <Spinner className="h-4 w-4" />
                                    )}
                                    Log in
                                </Button>
                            </>
                        )}
                    </Form>

                    <p className="mt-9 text-center text-[13px] text-[#596d83]">
                        By signing in you agree to Astron&apos;s{' '}
                        <TextLink
                            href="#"
                            className="font-medium text-[#2f70b3] hover:underline"
                        >
                            Terms
                        </TextLink>{' '}
                        and{' '}
                        <TextLink
                            href="#"
                            className="font-medium text-[#2f70b3] hover:underline"
                        >
                            Privacy Policy
                        </TextLink>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
