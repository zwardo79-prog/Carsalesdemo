'use client';

import { useState, useMemo } from 'react';
import { Customer, Vehicle, Loan, Payment } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';
import { calculateBalance, calculateMonthlyPayment, formatCurrency, formatDate, toNumber } from '@/lib/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Landmark, Plus, User, Car, Calendar, Wallet } from 'lucide-react';

type Props = {
  loans: Loan[];
  customers: Customer[];
  vehicles: Vehicle[];
  payments: Payment[];
  loading: boolean;
  onChanged: () => void;
};

type FormState = {
  customerId: string;
  vehicleId: string;
  deposit: string;
  duration: string;
  interestRate: string;
};

const EMPTY: FormState = { customerId: '', vehicleId: '', deposit: '', duration: '48', interestRate: '6.5' };

export function LoansView({ loans, customers, vehicles, payments, loading, onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);

  const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId) ?? null;
  const vehiclePrice = selectedVehicle ? Number(selectedVehicle.price) : 0;
  const deposit = toNumber(form.deposit);
  const balance = useMemo(() => calculateBalance(vehiclePrice, deposit), [vehiclePrice, deposit]);
  const months = parseInt(form.duration, 10) || 0;
  const rate = toNumber(form.interestRate);
  const monthly = useMemo(() => calculateMonthlyPayment(balance, rate, months), [balance, rate, months]);

  const customerName = (id: string) => customers.find((c) => c.id === id)?.name ?? 'Unknown';
  const vehicleLabel = (id: string | null) => {
    if (!id) return 'N/A';
    const v = vehicles.find((x) => x.id === id);
    return v ? `${v.year} ${v.make} ${v.model}` : 'N/A';
  };
  const paymentsFor = (loanId: string) => payments.filter((p) => p.loan_id === loanId);

  const availableVehicles = vehicles.filter((v) => v.status === 'available');

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data } = await supabase
      .from('loans')
      .insert({
        customer_id: form.customerId,
        vehicle_id: form.vehicleId || null,
        vehicle_price: vehiclePrice,
        deposit,
        balance,
        duration_months: months,
        interest_rate: rate,
        monthly_payment: monthly,
        remaining_balance: balance,
        status: 'active',
        start_date: new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();

    if (data && form.vehicleId) {
      await supabase.from('vehicles').update({ status: 'financed' }).eq('id', form.vehicleId);
    }
    setSaving(false);
    setOpen(false);
    setForm(EMPTY);
    onChanged();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Loans</h1>
          <p className="text-sm text-muted-foreground">Create financing contracts with automatic balance and payment calculations.</p>
        </div>
        <Button onClick={() => setOpen(true)} disabled={customers.length === 0 || availableVehicles.length === 0}>
          <Plus className="mr-2 h-4 w-4" /> New Loan
        </Button>
      </div>

      {customers.length === 0 || availableVehicles.length === 0 ? (
        <Card className="border-border/50 bg-card/40 p-6 text-sm text-muted-foreground">
          You need at least one customer and one available vehicle before creating a loan.
        </Card>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/30" />
          ))}
        </div>
      ) : loans.length === 0 ? (
        <Card className="border-border/50 bg-card/40 p-12 text-center">
          <Landmark className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No loans yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Create a financing contract to get started.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {loans.map((l) => {
            const pays = paymentsFor(l.id);
            const paid = pays.reduce((s, p) => s + Number(p.amount), 0);
            return (
              <Card key={l.id} className="border-border/50 bg-card/50 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                      <Landmark className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold leading-tight">{customerName(l.customer_id)}</h3>
                      <p className="text-xs text-muted-foreground">{vehicleLabel(l.vehicle_id)}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`capitalize ${l.status === 'active' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-muted-foreground/30 bg-muted/30 text-muted-foreground'}`}>
                    {l.status}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Vehicle Price</p>
                    <p className="text-xs font-semibold break-words">{formatCurrency(Number(l.vehicle_price))}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Deposit</p>
                    <p className="text-xs font-semibold">{formatCurrency(Number(l.deposit))}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Monthly</p>
                    <p className="text-xs font-semibold text-primary">{formatCurrency(Number(l.monthly_payment))}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Remaining</p>
                    <p className="text-xs font-semibold">{formatCurrency(Number(l.remaining_balance))}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
                  <span>{l.duration_months} months @ {l.interest_rate}% APR</span>
                  <span>{pays.length} payments · {formatCurrency(paid)} paid</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Loan</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Customer *</Label>
                <Select value={form.customerId} onValueChange={(v) => setForm({ ...form, customerId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Vehicle *</Label>
                <Select value={form.vehicleId} onValueChange={(v) => setForm({ ...form, vehicleId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                  <SelectContent>
                    {availableVehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.year} {v.make} {v.model} — {formatCurrency(Number(v.price))}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deposit">Deposit ($)</Label>
                <Input id="deposit" type="number" step="0.01" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} placeholder="5000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (months)</Label>
                <Input id="duration" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate">Interest Rate (%)</Label>
                <Input id="rate" type="number" step="0.1" value={form.interestRate} onChange={(e) => setForm({ ...form, interestRate: e.target.value })} />
              </div>
            </div>

            <Card className="border-primary/30 bg-primary/5 p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Vehicle Price</p>
                  <p className="text-lg font-bold">{formatCurrency(vehiclePrice)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Balance (auto)</p>
                  <p className="text-lg font-bold text-accent">{formatCurrency(balance)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Monthly Payment (auto)</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(monthly)}</p>
                </div>
              </div>
            </Card>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving || !form.customerId || !form.vehicleId}>
                {saving ? 'Creating...' : 'Create Loan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
