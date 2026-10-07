import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { Pencil, Plus, Trash2, Volleyball, X } from 'lucide-react';
import { destroy, store, update } from '@/routes/admin/courts';

type Court = {
    id: number;
    name: string;
    surface: string;
    price_per_hour: string;
    is_active: boolean;
    reservations_count: number;
};

export default function AdminCourts({ courts }: { courts: Court[] }) {
    const [editing, setEditing] = useState<Court | null>(null);
    const form = useForm({
        name: '',
        surface: 'Outdoor',
        price_per_hour: '350',
        is_active: true,
    });

    const resetForm = () => {
        setEditing(null);
        form.reset();
        form.clearErrors();
    };

    const startEdit = (court: Court) => {
        setEditing(court);
        form.setData({
            name: court.name,
            surface: court.surface,
            price_per_hour: court.price_per_hour,
            is_active: court.is_active,
        });
        form.clearErrors();
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (editing) {
            form.submit(update(editing.id), {
                preserveScroll: true,
                onSuccess: resetForm,
            });
            return;
        }

        form.submit(store(), {
            preserveScroll: true,
            onSuccess: resetForm,
        });
    };

    const removeCourt = (court: Court) => {
        if (
            court.reservations_count === 0 &&
            window.confirm(`Remove ${court.name}? This cannot be undone.`)
        ) {
            router.delete(destroy(court.id).url, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Court management" />
            <main className="min-h-full bg-[#08111e] px-4 py-7 text-[#f0f6ff] sm:px-8 lg:px-12">
                <div className="mx-auto max-w-6xl">
                    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-[#79b9ff] uppercase">
                                Admin / Operations
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold">
                                Court management
                            </h1>
                            <p className="mt-2 text-sm text-[#a8bfd7]">
                                Manage court rates, surfaces, and availability.
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-2 rounded-md border border-[#29415d] bg-[#101d2d] px-3 py-2 text-sm text-[#b5c8df]">
                            <Volleyball size={16} /> {courts.length} courts
                        </span>
                    </header>

                    <form
                        onSubmit={submit}
                        className="mb-6 rounded-lg border border-[#29415d] bg-[#101d2d] p-5 transition-colors hover:border-[#4776a7]"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-semibold">
                                {editing
                                    ? `Edit ${editing.name}`
                                    : 'Add a court'}
                            </h2>
                            {editing && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    aria-label="Cancel court edit"
                                    className="rounded-md p-2 text-[#bfd0e3] hover:bg-[#1b3048] hover:text-white"
                                >
                                    <X size={17} />
                                </button>
                            )}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <label className="text-sm text-[#c0d0e2]">
                                Court name
                                <input
                                    required
                                    maxLength={80}
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                    className="mt-1.5 block w-full rounded-md border border-[#29415d] bg-[#091321] px-3 py-2 text-white transition focus:border-[#5aa5ed] focus:ring-2 focus:ring-[#5aa5ed]/20 focus:outline-none"
                                />
                                {form.errors.name && (
                                    <span className="mt-1 block text-xs text-red-300">
                                        {form.errors.name}
                                    </span>
                                )}
                            </label>
                            <label className="text-sm text-[#c0d0e2]">
                                Surface
                                <input
                                    required
                                    maxLength={80}
                                    value={form.data.surface}
                                    onChange={(event) =>
                                        form.setData(
                                            'surface',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-1.5 block w-full rounded-md border border-[#29415d] bg-[#091321] px-3 py-2 text-white transition focus:border-[#5aa5ed] focus:ring-2 focus:ring-[#5aa5ed]/20 focus:outline-none"
                                />
                                {form.errors.surface && (
                                    <span className="mt-1 block text-xs text-red-300">
                                        {form.errors.surface}
                                    </span>
                                )}
                            </label>
                            <label className="text-sm text-[#c0d0e2]">
                                Rate per hour (PHP)
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    max="100000"
                                    step="0.01"
                                    value={form.data.price_per_hour}
                                    onChange={(event) =>
                                        form.setData(
                                            'price_per_hour',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-1.5 block w-full rounded-md border border-[#29415d] bg-[#091321] px-3 py-2 text-white transition focus:border-[#5aa5ed] focus:ring-2 focus:ring-[#5aa5ed]/20 focus:outline-none"
                                />
                                {form.errors.price_per_hour && (
                                    <span className="mt-1 block text-xs text-red-300">
                                        {form.errors.price_per_hour}
                                    </span>
                                )}
                            </label>
                            {editing && (
                                <label className="flex items-center gap-2 self-end pb-2 text-sm text-[#c0d0e2]">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_active}
                                        onChange={(event) =>
                                            form.setData(
                                                'is_active',
                                                event.target.checked,
                                            )
                                        }
                                        className="size-4 accent-blue-500"
                                    />
                                    Accepting reservations
                                </label>
                            )}
                        </div>
                        <div className="mt-5 flex justify-end">
                            <button
                                disabled={form.processing}
                                className="inline-flex items-center gap-2 rounded-md bg-[#347fc4] px-4 py-2 text-sm font-semibold text-white transition duration-150 hover:-translate-y-0.5 hover:bg-[#286ba9] hover:shadow-lg hover:shadow-[#286ba9]/25 disabled:translate-y-0 disabled:opacity-50"
                            >
                                <Plus size={16} />
                                {form.processing
                                    ? 'Saving…'
                                    : editing
                                      ? 'Save changes'
                                      : 'Add court'}
                            </button>
                        </div>
                    </form>

                    <section className="overflow-x-auto rounded-lg border border-[#29415d] bg-[#101d2d]">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="bg-[#14243a] text-xs text-[#a9c3df] uppercase">
                                <tr>
                                    <th className="px-5 py-3">Court</th>
                                    <th className="px-4 py-3">Surface</th>
                                    <th className="px-4 py-3">Rate / hour</th>
                                    <th className="px-4 py-3">Reservations</th>
                                    <th className="px-4 py-3">Availability</th>
                                    <th className="px-5 py-3 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {courts.map((court) => (
                                    <tr
                                        key={court.id}
                                        className="border-t border-[#263b55] transition-colors hover:bg-[#172a42]"
                                    >
                                        <td className="px-5 py-4 font-semibold">
                                            {court.name}
                                        </td>
                                        <td className="px-4 py-4 text-[#bed0e3]">
                                            {court.surface}
                                        </td>
                                        <td className="px-4 py-4">
                                            ₱
                                            {Number(
                                                court.price_per_hour,
                                            ).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td className="px-4 py-4">
                                            {court.reservations_count}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs ${court.is_active ? 'bg-[#132f4c] text-[#9bcaff]' : 'bg-[#252a31] text-[#a6b0bc]'}`}
                                            >
                                                {court.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="inline-flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        startEdit(court)
                                                    }
                                                    aria-label={`Edit ${court.name}`}
                                                    className="rounded-md border border-[#29415d] p-2 text-[#a9c3df] transition duration-150 hover:-translate-y-0.5 hover:border-[#69b2f6] hover:bg-[#172a42] hover:text-white"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeCourt(court)
                                                    }
                                                    disabled={
                                                        court.reservations_count >
                                                        0
                                                    }
                                                    aria-label={`Delete ${court.name}`}
                                                    title={
                                                        court.reservations_count >
                                                        0
                                                            ? 'Courts with reservation history cannot be deleted; deactivate instead.'
                                                            : 'Delete court'
                                                    }
                                                    className="rounded-md border border-[#29415d] p-2 text-red-300 transition duration-150 hover:-translate-y-0.5 hover:border-red-500 hover:bg-red-950/30 hover:text-red-200 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-35"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {courts.length === 0 && (
                            <p className="px-5 py-12 text-center text-sm text-[#a9bfd6]">
                                No courts found. Add your first court above.
                            </p>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}
