import { Head, useForm } from '@inertiajs/react';
import { Building2, Clock3, Save } from 'lucide-react';

type Settings = {
    center_name: string;
    location: string;
    opening_time: string;
    closing_time: string;
    cancellation_hours: string;
};

export default function SettingsPage({ settings }: { settings: Settings }) {
    const form = useForm(settings);
    return (
        <>
            <Head title="Facility settings" />
            <main className="min-h-full bg-[#08111e] px-4 py-7 text-white sm:px-8 lg:px-12">
                <div className="mx-auto max-w-4xl">
                    <header className="mb-7">
                        <p className="text-xs font-semibold text-[#93c5fd] uppercase">
                            Admin / Configuration
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold">
                            Facility settings
                        </h1>
                        <p className="mt-2 text-sm text-[#a8bfd7]">
                            Set the customer-facing center information and
                            reservation policy.
                        </p>
                    </header>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.patch('/admin/settings');
                        }}
                        className="overflow-hidden rounded-2xl border border-[#2a405a] bg-[#0f1b2b]"
                    >
                        <section className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                            <div className="flex items-center gap-2 border-b border-[#2a405a] pb-3 sm:col-span-2">
                                <Building2
                                    size={18}
                                    className="text-[#93c5fd]"
                                />
                                <h2 className="font-semibold">
                                    Center details
                                </h2>
                            </div>
                            <label className="text-sm font-medium">
                                Center name
                                <input
                                    value={form.data.center_name}
                                    onChange={(event) =>
                                        form.setData(
                                            'center_name',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 block w-full rounded-lg border border-[#2a405a] bg-[#08111e] px-3 py-2.5 text-white focus:border-[#3b82f6] focus:outline-none"
                                />
                                {form.errors.center_name && (
                                    <span className="mt-1 block text-xs text-red-600">
                                        {form.errors.center_name}
                                    </span>
                                )}
                            </label>
                            <label className="text-sm font-medium">
                                Location
                                <input
                                    value={form.data.location}
                                    onChange={(event) =>
                                        form.setData(
                                            'location',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 block w-full rounded-lg border border-[#2a405a] bg-[#08111e] px-3 py-2.5 text-white focus:border-[#3b82f6] focus:outline-none"
                                />
                                {form.errors.location && (
                                    <span className="mt-1 block text-xs text-red-600">
                                        {form.errors.location}
                                    </span>
                                )}
                            </label>
                            <div className="flex items-center gap-2 border-b border-[#2a405a] pt-3 pb-3 sm:col-span-2">
                                <Clock3 size={18} className="text-[#93c5fd]" />
                                <h2 className="font-semibold">
                                    Hours and cancellation
                                </h2>
                            </div>
                            <label className="text-sm font-medium">
                                Opening time
                                <input
                                    type="time"
                                    value={form.data.opening_time}
                                    onChange={(event) =>
                                        form.setData(
                                            'opening_time',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 block w-full rounded-lg border border-[#2a405a] bg-[#08111e] px-3 py-2.5 text-white focus:border-[#3b82f6] focus:outline-none"
                                />
                                {form.errors.opening_time && (
                                    <span className="mt-1 block text-xs text-red-600">
                                        {form.errors.opening_time}
                                    </span>
                                )}
                            </label>
                            <label className="text-sm font-medium">
                                Closing time
                                <input
                                    type="time"
                                    value={form.data.closing_time}
                                    onChange={(event) =>
                                        form.setData(
                                            'closing_time',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 block w-full rounded-lg border border-[#2a405a] bg-[#08111e] px-3 py-2.5 text-white focus:border-[#3b82f6] focus:outline-none"
                                />
                                {form.errors.closing_time && (
                                    <span className="mt-1 block text-xs text-red-600">
                                        {form.errors.closing_time}
                                    </span>
                                )}
                            </label>
                            <label className="text-sm font-medium sm:col-span-2">
                                Cancellation notice (hours)
                                <input
                                    type="number"
                                    min="0"
                                    max="168"
                                    value={form.data.cancellation_hours}
                                    onChange={(event) =>
                                        form.setData(
                                            'cancellation_hours',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 block w-full max-w-xs rounded-lg border border-[#2a405a] bg-[#08111e] px-3 py-2.5 text-white focus:border-[#3b82f6] focus:outline-none"
                                />
                                {form.errors.cancellation_hours && (
                                    <span className="mt-1 block text-xs text-red-600">
                                        {form.errors.cancellation_hours}
                                    </span>
                                )}
                            </label>
                        </section>
                        <footer className="flex justify-end border-t border-[#2a405a] p-5">
                            <button
                                disabled={form.processing}
                                className="inline-flex items-center gap-2 rounded-full bg-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2563eb] disabled:opacity-50"
                            >
                                <Save size={16} />
                                {form.processing ? 'Saving…' : 'Save settings'}
                            </button>
                        </footer>
                    </form>
                </div>
            </main>
        </>
    );
}
