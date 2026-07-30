'use client';

import { useState, useMemo } from 'react';
import { Customer, Vehicle, Loan, Payment } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency, formatDate, toNumber } from '@/lib/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { CreditCard, Plus, TrendingDown, Receipt } from 'lucide-react';

type Props = {
  loans: Loan[];
  customers: Customer[];
  vehicles: Vehicle[];
  payments: Payment[];
  loading: boolean;
  onChanged: () => void;
};

export function PaymentsView({ loans, customers, vehicles, payments, loading, onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const activeLoans = loans.filter((l) => l.status === 'active');
  const selectedLoan = loans.find((l) => l.id === selectedLoanId) ?? null;

  const customerName = (id: string) => customers.find((c) => c.id === id)?.name ?? 'Unknown';
  const vehicleLabel = (id: string | null) => {
    if (!id) return 'N/A';
    const v = vehicles.find((x) => x.id === id);
    return v ? `${v.year} ${v.make} ${v.model}` : 'N/A';
  };

  const paymentsForLoan = useMemo(
    () => (selectedLoanId ? payments.filter((p) => p.loan_id === selectedLoanId) : []),
    [payments, selectedLoanId],
  );

  const recordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;
    setSaving(true);
    const payAmount = toNumber(amount);
    const newRemaining = Math.max(0, Number(selectedLoan.remaining_balance) - payAmount);

    await supabase.from('payments').insert({
      loan_id: selectedLoan.id,
      amount: payAmount,
      payment_date: new Date().toISOString().slice(0, 10),
      remaining_after: newRemaining,
      note: note || null,
    });

    await supabase
      .from('loans')
      .update({ remaining_balance: newRemaining, status: newRemaining <= 0 ? 'completed' : 'active' })
      .eq('id', selectedLoan.id);

    setSaving(false);
    setOpen(false);
    setAmount('');
    setNote('');
    setSelectedLoanId('');
    onChanged();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground">Record payments and track payment history per loan.</p>
        </div>
        <Button onClick={() => setOpen(true)} disabled={activeLoans.length === 0}>
          <Plus className="mr-2 h-4 w-4" /> Record Payment
        </Button>
      </div>

      {activeLoans.length === 0 && !loading && (
        <Card className="border-border/50 bg-card/40 p-6 text-sm text-muted-foreground">
          No active loans to record payments against.
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted/30" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {activeLoans.map((l) => {
            const pays = payments.filter((p) => p.loan_id === l.id);
            const totalPaid = pays.reduce((s, p) => s + Number(p.amount), 0);
            return (
              <Card key={l.id} className="border-border/50 bg-card/50 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold leading-tight">{customerName(l.customer_id)}</h3>
                      <p className="text-xs text-muted-foreground">{vehicleLabel(l.vehicle_id)} · {formatCurrency(Number(l.monthly_payment))}/mo</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Remaining</p>
                      <p className="text-lg font-bold">{formatCurrency(Number(l.remaining_balance))}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Paid</p>
                      <p className="text-lg font-bold text-primary">{formatCurrency(totalPaid)}</p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => { setSelectedLoanId(l.id); setOpen(true); }}
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" /> Payment
                    </Button>
                  </div>
                </div>

                {pays.length > 0 && (
                  <div className="mt-4 border-t border-border/40 pt-4">
                    <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                      <Receipt className="h-3.5 w-3.5" /> Payment History
                    </div>
                    <div className="space-y-2">
                      {pays.map((p) => (
                        <div key={p.id} className="flex items-center justify-between rounded-lg border border-border/30 bg-background/30 px-3 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="h-3.5 w-3.5 text-primary" />
                            <span className="font-medium text-primary">{formatCurrency(Number(p.amount))}</span>
                            <span className="text-muted-foreground">· {formatDate(p.payment_date)}</span>
                            {p.note && <Badge variant="outline" className="text-[10px]">{p.note}</Badge>}
                          </div>
                          <span className="text-xs text-muted-foreground">Bal: {formatCurrency(Number(p.remaining_after))}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={recordPayment} className="space-y-4">
            <div className="space-y-2">
              <Label>Loan *</Label>
              <Select value={selectedLoanId} onValueChange={setSelectedLoanId}>
                <SelectTrigger><SelectValue placeholder="Select active loan" /></SelectTrigger>
                <SelectContent>
                  {activeLoans.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {customerName(l.customer_id)} — {vehicleLabel(l.vehicle_id)} ({formatCurrency(Number(l.remaining_balance))} left)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedLoan && (
              <Card className="border-primary/30 bg-primary/5 p-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Current balance</span><span className="font-semibold">{formatCurrency(Number(selectedLoan.remaining_balance))}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Monthly payment</span><span className="font-semibold">{formatCurrency(Number(selectedLoan.monthly_payment))}</span></div>
              </Card>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount ($) *</Label>
              <Input id="amount" type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="545.82" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea id="note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" className="resize-none" />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving || !selectedLoanId}>{saving ? 'Recording...' : 'Record Payment'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
