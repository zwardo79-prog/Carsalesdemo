'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { DashboardStats, Customer, Vehicle, Loan, Payment, BalanceItem } from '@/lib/types';
import { Sidebar, type View } from '@/components/admin/sidebar';
import { DashboardView } from '@/components/admin/dashboard-view';
import { CustomersView } from '@/components/admin/customers-view';
import { VehiclesView } from '@/components/admin/vehicles-view';
import { LoansView } from '@/components/admin/loans-view';
import { PaymentsView } from '@/components/admin/payments-view';
import { ContractsView } from '@/components/admin/contracts-view';
import { ReceiptsView } from '@/components/admin/receipts-view';

export default function AdminPage() {
  const [view, setView] = useState<View>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [balanceItems, setBalanceItems] = useState<BalanceItem[]>([]);
  const [receiptPaymentId, setReceiptPaymentId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [cust, veh, loa, pay, bal] = await Promise.all([
      supabase.from('customers').select('*').order('created_at', { ascending: false }),
      supabase.from('vehicles').select('*').order('created_at', { ascending: false }),
      supabase.from('loans').select('*').order('created_at', { ascending: false }),
      supabase.from('payments').select('*').order('payment_date', { ascending: false }),
      supabase.from('balance_items').select('*').order('sort_order', { ascending: true }),
    ]);

    if (cust.error || veh.error || loa.error || pay.error || bal.error) {
      setError('Unable to load data. Please try again.');
      setLoading(false);
      return;
    }

    const c = (cust.data as Customer[]) ?? [];
    const v = (veh.data as Vehicle[]) ?? [];
    const l = (loa.data as Loan[]) ?? [];
    const p = (pay.data as Payment[]) ?? [];
    const b = (bal.data as BalanceItem[]) ?? [];
    setCustomers(c);
    setVehicles(v);
    setLoans(l);
    setPayments(p);
    setBalanceItems(b);

    const activeLoans = l.filter((x) => x.status === 'active');
    setStats({
      totalCustomers: c.length,
      totalVehicles: v.length,
      activeLoans: activeLoans.length,
      outstandingBalance: activeLoans.reduce(
        (sum, x) => sum + Number(x.remaining_balance),
        0,
      ),
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar current={view} onChange={setView} />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {view === 'dashboard' && (
            <DashboardView stats={stats} loans={loans} customers={customers} vehicles={vehicles} payments={payments} loading={loading} onNavigate={setView} />
          )}
          {view === 'customers' && (
            <CustomersView customers={customers} loading={loading} onChanged={refresh} />
          )}
          {view === 'vehicles' && (
            <VehiclesView vehicles={vehicles} loading={loading} onChanged={refresh} />
          )}
          {view === 'loans' && (
            <LoansView loans={loans} customers={customers} vehicles={vehicles} payments={payments} loading={loading} onChanged={refresh} />
          )}
          {view === 'payments' && (
            <PaymentsView
              loans={loans}
              customers={customers}
              vehicles={vehicles}
              payments={payments}
              loading={loading}
              onChanged={refresh}
              onPrintReceipt={(paymentId) => { setReceiptPaymentId(paymentId); setView('receipts'); }}
            />
          )}
          {view === 'contracts' && (
            <ContractsView loans={loans} customers={customers} vehicles={vehicles} payments={payments} balanceItems={balanceItems} loading={loading} />
          )}
          {view === 'receipts' && (
            <ReceiptsView loans={loans} customers={customers} vehicles={vehicles} payments={payments} loading={loading} initialPaymentId={receiptPaymentId} />
          )}
        </div>
      </main>
    </div>
  );
}
