import { Link } from '@inertiajs/react';
import {
    BookOpen,
    CalendarDays,
    CalendarPlus,
    CreditCard,
    FolderGit2,
    LayoutDashboard,
    Settings2,
    UsersRound,
    WalletCards,
    Volleyball,
    ChartNoAxesCombined,
} from 'lucide-react';
import { usePage } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { bookings, dashboard, payments, profile, reservations } from '@/routes';
import { index as walletRoute } from '@/actions/App/Http/Controllers/WalletController';
import { cashIns as adminWalletRoute } from '@/routes/admin/wallet';
import type { NavItem } from '@/types';

const customerNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutDashboard },
    { title: 'Book a Court', href: bookings(), icon: CalendarPlus },
    { title: 'My Reservations', href: reservations(), icon: CalendarDays },
    { title: 'Payments', href: payments(), icon: CreditCard },
    { title: 'Wallet', href: walletRoute(), icon: WalletCards },
    { title: 'Profile', href: profile(), icon: UsersRound },
];

const adminNavItems: NavItem[] = [
    { title: 'Overview', href: '/admin', icon: LayoutDashboard },
    { title: 'Courts', href: '/admin/courts', icon: Volleyball },
    { title: 'Reservations', href: '/admin/reservations', icon: CalendarDays },
    { title: 'Customers', href: '/admin/customers', icon: UsersRound },
    { title: 'Payments', href: '/admin/payments', icon: CreditCard },
    { title: 'Wallet', href: adminWalletRoute(), icon: WalletCards },
    { title: 'Reports', href: '/admin/reports', icon: ChartNoAxesCombined },
    { title: 'Settings', href: '/admin/settings', icon: Settings2 },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const isAdmin = auth.user.role === 'admin';
    const navItems = isAdmin ? adminNavItems : customerNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={isAdmin ? '/admin' : dashboard()}
                                prefetch
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
