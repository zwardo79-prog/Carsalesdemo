'use client';

import { DashboardStats, Customer, Vehicle, Loan, Payment } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/finance';
import { Users, Car, Landmark, Wallet, TrendingUp, ArrowRight } from 'lucide-react';
import { View } from '@/components/admin/sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Props = {
  stats: DashboardStats | null;
  loans: Loan[];
  customers: Customer[];
  vehicles: Vehicle[];
  payments: Payment[];
  loading: boolean;
  onNavigate: (v: View) => void;
};

export function DashboardView({ stats, loans, customers, vehicles, payments, loading, onNavigate }: Props) {
  const customerName = (id: string) => customers.find((c) => c.id === id)?.name ?? 'Unknown';
  const vehicleLabel = (id: string | null) => {
    if (!id) return 'N/A';
    const v = vehicles.find((x) => x.id === id);
    return v ? `${v.year} ${v.make} ${v.model}` : 'N/A';
  };

  const recentLoans = loans.slice(0, 5);
  const recentPayments = payments.slice(0, 5);

  const cards = [
    { 
      label: 'Total Customers', 
      value: stats?.totalCustomers ?? 0, 
      icon: Users, 
      tint: 'text-sky-400', 
      bg: 'bg-sky-500/10',
      // Navigates directly to customer view when clicking this stat card
      onClick: () => onNavigate('customers') 
    },
    { 
      label: 'Total Vehicles', 
      value: stats?.totalVehicles ?? 0, 
      icon: Car, 
      tint: 'text-emerald-400', 
      bg: 'bg-emerald-500/10',
      onClick: () => onNavigate('vehicles')
    },
    { 
      label: 'Active Loans', 
      value: stats?.activeLoans ?? 0, 
      icon: Landmark, 
      tint: 'text-amber-400', 
      bg: 'bg-amber-500/10',
      onClick: () => onNavigate('loans')
    },
    { 
      label: 'Outstanding Balance', 
      value: formatCurrency(stats?.outstandingBalance ?? 0), 
      icon: Wallet, 
      tint: 'text-primary', 
      bg: 'bg-primary/10',
      onClick: () => onNavigate('loans')
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your dealership financing operations.</p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card 
            key={c.label} 
            onClick={c.onClick}
            className="relative overflow-hidden border-border/50 bg-card/50 p-5 cursor-pointer hover:border-border transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</p>
                <p className="mt-2 truncate text-2xl font-bold" title={String(c.value)}>{c.value}</p>
              </div>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${c.bg}`}>
                <c.icon className={`h-5 w-5 ${c.tint}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* RECENT LOANS CARD */}
        <Card className="border-border/50 bg-card/50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Loans</h2>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => onNavigate('loans')}>
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : recentLoans.length === 0 ? (
            <p className="text-sm text-muted-foreground">No loans yet.</p>
          ) : (
            <div className="space-y-3">
              {recentLoans.map((l) => (
                <div 
                  key={l.id} 
                  onClick={() => onNavigate('customers')}
                  className="flex items-center justify-between rounded-lg border border-border/40 bg-background/30 px-3 py-2.5 cursor-pointer hover:bg-background/60 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{customerName(l.customer_id)}</p>
                    <p className="truncate text-xs text-muted-foreground">{vehicleLabel(l.vehicle_id)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(Number(l.remaining_balance))}</p>
                    <Badge variant="outline" className="mt-0.5 text-[10px] capitalize">{l.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* RECENT PAYMENTS CARD */}
        <Card className="border-border/50 bg-card/50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Payments</h2>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => onNavigate('payments')}>
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : recentPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((p) => {
                const loan = loans.find((l) => l.id === p.loan_id);
                return (
                  <div 
                    key={p.id} 
                    onClick={() => onNavigate('customers')}
                    className="flex items-center justify-between rounded-lg border border-border/40 bg-background/30 px-3 py-2.5 cursor-pointer hover:bg-background/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{loan ? customerName(loan.customer_id) : 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(p.payment_date)}</p>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" />
                      <span className="text-sm font-semibold text-primary">{formatCurrency(Number(p.amount))}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
