import { Head, router, useForm } from '@inertiajs/react';
import { Search, UsersRound } from 'lucide-react';

type Customer = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    email_verified_at: string | null;
    created_at: string;
    reservations_count: number;
};
type Paginated<T> = {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

export default function Customers({
    customers,
    search,
}: {
    customers: Paginated<Customer>;
    search: string;
}) {
    const { data, setData, get } = useForm({ search });
    return (
        <>
            <Head title="Customer management" />
            <main className="min-h-full bg-[#08111e] px-4 py-7 text-white sm:px-8 lg:px-12">
                <div className="mx-auto max-w-6xl">
                    <header className="mb-7 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold text-[#93c5fd] uppercase">
                                Admin / Accounts
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold">
                                Customer management
                            </h1>
                            <p className="mt-2 text-sm text-[#a8bfd7]">
                                Search members and review account activity.
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#2a405a] bg-[#0f1b2b] px-4 py-2 text-sm text-[#bfd0e3]">
                            <UsersRound size={16} />
                            {customers.data.length} shown
                        </span>
                    </header>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            get('/admin/customers', { preserveState: true });
                        }}
                        className="mb-4 flex max-w-xl gap-2"
                    >
                        <label className="relative flex-1">
                            <Search
                                size={16}
                                className="absolute top-1/2 left-3 -translate-y-1/2 text-[#a8bfd7]"
                            />
                            <input
                                value={data.search}
                                onChange={(event) =>
                                    setData('search', event.target.value)
                                }
                                placeholder="Search name or email"
                                className="w-full rounded-full border border-[#2a405a] bg-[#0f1b2b] py-2.5 pr-3 pl-9 text-sm text-white placeholder:text-[#8095ad] focus:border-[#3b82f6] focus:outline-none"
                            />
                        </label>
                        <button className="rounded-full bg-[#3b82f6] px-5 text-sm font-semibold text-white transition hover:bg-[#2563eb]">
                            Search
                        </button>
                    </form>
                    <section className="overflow-x-auto rounded-2xl border border-[#2a405a] bg-[#0f1b2b]">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="bg-[#15243a] text-xs text-[#a8bfd7] uppercase">
                                <tr>
                                    <th className="px-5 py-3">Customer</th>
                                    <th className="px-4 py-3">Phone</th>
                                    <th className="px-4 py-3">Reservations</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-5 py-3 text-right">
                                        Joined
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.data.map((customer) => (
                                    <tr
                                        key={customer.id}
                                        className="border-t border-[#2a405a] transition hover:bg-[#15243a]"
                                    >
                                        <td className="px-5 py-4">
                                            <p className="font-semibold">
                                                {customer.name}
                                            </p>
                                            <p className="mt-1 text-xs text-[#a8bfd7]">
                                                {customer.email}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            {customer.phone ?? '—'}
                                        </td>
                                        <td className="px-4 py-4">
                                            {customer.reservations_count}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span
                                                className={
                                                    customer.email_verified_at
                                                        ? 'text-[#93c5fd]'
                                                        : 'text-amber-400'
                                                }
                                            >
                                                {customer.email_verified_at
                                                    ? 'Verified'
                                                    : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            {new Date(
                                                customer.created_at,
                                            ).toLocaleDateString([], {
                                                dateStyle: 'medium',
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {customers.data.length === 0 && (
                            <p className="px-5 py-12 text-center text-sm text-[#a8bfd7]">
                                No matching members.
                            </p>
                        )}
                    </section>
                    <nav
                        className="mt-4 flex flex-wrap gap-2"
                        aria-label="Customer pages"
                    >
                        {customers.links.map((link) => (
                            <button
                                key={link.label}
                                disabled={!link.url}
                                onClick={() =>
                                    link.url && router.visit(link.url)
                                }
                                className={`rounded-lg border px-3 py-1.5 text-sm transition ${link.active ? 'border-[#3b82f6] bg-[#3b82f6] text-white' : 'border-[#2a405a] bg-[#0f1b2b] text-[#bfd0e3] hover:border-[#3b82f6]'} disabled:opacity-40`}
                            >
                                {link.label
                                    .replace(/<[^>]*>/g, '')
                                    .replace(/&laquo;|&raquo;/g, '')
                                    .trim()}
                            </button>
                        ))}
                    </nav>
                </div>
            </main>
        </>
    );
}
