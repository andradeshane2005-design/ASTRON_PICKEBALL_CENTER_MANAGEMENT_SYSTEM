import { Card, CardContent } from '@/components/ui/card';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
    icon: LucideIcon;
    iconColor: string;   // tailwind text color class, e.g. "text-green-600"
    iconBg: string;      // tailwind bg color class, e.g. "bg-green-100"
    label: string;
    value: string | number;
    hint: string;
}

export default function StatCard({ icon: Icon, iconColor, iconBg, label, value, hint }: StatCardProps) {
    return (
        <Card>
            <CardContent className="flex items-center gap-4 p-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-semibold leading-tight">{value}</p>
                    <p className="text-xs text-muted-foreground">{hint}</p>
                </div>
            </CardContent>
        </Card>
    );
}