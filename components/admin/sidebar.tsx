'use client';

import { LayoutDashboard, Users, Car as CarIcon, Landmark, CreditCard, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export type View = 'dashboard' | 'customers' | 'vehicles' | 'loans' | 'payments' | 'contracts';

const NAV: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'vehicles', label: 'Vehicles', icon: CarIcon },
  { id: 'loans', label: 'Loans', icon: Landmark },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'contracts', label: 'Contracts', icon: FileText },
];

export function Sidebar({
  current,
  onChange,
}: {
  current: View;
  onChange: (v: View) => void;
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/50 bg-card/40 backdrop-blur md:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
          <CarIcon className="h-5 w-5 text-primary" />
        </div>
        <div className="leading-none">
          <div className="text-base font-bold tracking-tight">Sakinya</div>
          <div className="text-base font-bold tracking-tight text-primary">Motors</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              current === item.id
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-border/50 px-5 py-4 text-xs text-muted-foreground">
        Admin Console v1.0
      </div>
    </aside>
  );
}
