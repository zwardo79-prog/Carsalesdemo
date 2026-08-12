'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Car as CarIcon,
  Landmark,
  CreditCard,
  FileText,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type View =
  | 'dashboard'
  | 'customers'
  | 'vehicles'
  | 'loans'
  | 'payments'
  | 'contracts';

const NAV: {
  id: View;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleChange = (view: View) => {
    onChange(view);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg border border-border bg-card p-2.5 text-foreground shadow-lg md:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-background transition-transform duration-200 md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-5">
          <div>
            <div className="text-lg font-bold text-foreground">
              Sakinya
            </div>
            <div className="text-sm text-primary">Motors</div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => handleChange(item.id)}
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

      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border bg-background md:flex">
        <div className="px-5 py-5">
          <div className="text-lg font-bold text-foreground">Sakinya</div>
          <div className="text-sm text-primary">Motors</div>
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
    </>
  );
}