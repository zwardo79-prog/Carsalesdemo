'use client';

import { useState, useMemo } from 'react';
import { Customer, Vehicle, Loan, Payment } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/finance';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Printer, Car as CarIcon } from 'lucide-react';

type Props = {
  loans: Loan[];
  customers: Customer[];
  vehicles: Vehicle[];
  payments: Payment[];
  loading: boolean;
};

export function ContractsView({ loans, customers, vehicles, payments, loading }: Props) {
  const [selectedLoanId, setSelectedLoanId] = useState('');

  const loan = loans.find((l) => l.id === selectedLoanId) ?? null;
  const customer = loan ? customers.find((c) => c.id === loan.customer_id) ?? null : null;
  const vehicle = loan && loan.vehicle_id ? vehicles.find((v) => v.id === loan.vehicle_id) ?? null : null;
  const loanPayments = useMemo(
    () => (loan ? payments.filter((p) => p.loan_id === loan.id) : []),
    [payments, loan],
  );

  const totalPaid = loanPayments.reduce((s, p) => s + Number(p.amount), 0);
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contracts</h1>
          <p className="text-sm text-muted-foreground">Generate a printable financing agreement for any loan.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedLoanId} onValueChange={setSelectedLoanId}>
            <SelectTrigger className="w-72"><SelectValue placeholder="Select a loan" /></SelectTrigger>
            <SelectContent>
              {loans.map((l) => {
                const c = customers.find((x) => x.id === l.customer_id);
                const v = l.vehicle_id ? vehicles.find((x) => x.id === l.vehicle_id) : null;
                return (
                  <SelectItem key={l.id} value={l.id}>
                    {c?.name ?? 'Unknown'} — {v ? `${v.make} ${v.model}` : 'N/A'}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {loan && (
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <Card className="border-border/50 bg-card/40 p-12 text-center text-sm text-muted-foreground">Loading...</Card>
      ) : !loan ? (
        <Card className="border-border/50 bg-card/40 p-12 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Select a loan to preview the contract</h3>
          <p className="mt-1 text-sm text-muted-foreground">Choose a loan from the dropdown above.</p>
        </Card>
      ) : (
        <Card className="mx-auto max-w-3xl border-border/60 bg-white p-10 text-slate-900 print:border-0 print:shadow-none">
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                <CarIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Sakinya Motors</h2>
                <p className="text-xs text-slate-500">Vehicle Financing Division</p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>1234 Autobahn Drive</p>
              <p>Springfield, USA</p>
              <p>contact@sakinyamotors.com</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-bold uppercase tracking-wide">Vehicle Financing Agreement</h3>
            <p className="mt-1 text-xs text-slate-500">Contract #{loan.id.slice(0, 8).toUpperCase()} · Issued {today}</p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-6">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Buyer</p>
              <p className="font-semibold">{customer?.name ?? '—'}</p>
              {customer?.email && <p className="text-sm text-slate-600">{customer.email}</p>}
              {customer?.phone && <p className="text-sm text-slate-600">{customer.phone}</p>}
              {customer?.address && <p className="text-sm text-slate-600">{customer.address}</p>}
              {customer?.id_number && <p className="text-sm text-slate-600">ID: {customer.id_number}</p>}
            </div>
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Vehicle</p>
              <p className="font-semibold">{vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : '—'}</p>
              {vehicle?.vin && <p className="text-sm text-slate-600">VIN: {vehicle.vin}</p>}
              <p className="text-sm text-slate-600">Loan start: {formatDate(loan.start_date)}</p>
            </div>
          </div>

          <div className="mt-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-300 text-left text-[10px] uppercase tracking-wide text-slate-500">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-2">Vehicle Purchase Price</td>
                  <td className="py-2 text-right">{formatCurrency(Number(loan.vehicle_price))}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2">Down Payment / Deposit</td>
                  <td className="py-2 text-right">{formatCurrency(Number(loan.deposit))}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 font-semibold">Financed Balance</td>
                  <td className="py-2 text-right font-semibold">{formatCurrency(Number(loan.balance))}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2">Annual Interest Rate</td>
                  <td className="py-2 text-right">{loan.interest_rate}% APR</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2">Term</td>
                  <td className="py-2 text-right">{loan.duration_months} months</td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold">Monthly Payment</td>
                  <td className="py-2 text-right font-semibold">{formatCurrency(Number(loan.monthly_payment))}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 rounded-lg bg-slate-100 p-4 text-center">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Total Paid</p>
              <p className="text-base font-bold text-emerald-700">{formatCurrency(totalPaid)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Remaining Balance</p>
              <p className="text-base font-bold text-slate-900">{formatCurrency(Number(loan.remaining_balance))}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Status</p>
              <p className="text-base font-bold capitalize">{loan.status}</p>
            </div>
          </div>

          {loanPayments.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Payment Schedule</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-300 text-left text-[10px] uppercase tracking-wide text-slate-500">
                    <th className="py-1.5">#</th>
                    <th className="py-1.5">Date</th>
                    <th className="py-1.5 text-right">Amount</th>
                    <th className="py-1.5 text-right">Balance After</th>
                  </tr>
                </thead>
                <tbody>
                  {loanPayments.map((p, i) => (
                    <tr key={p.id} className="border-b border-slate-100">
                      <td className="py-1.5">{i + 1}</td>
                      <td className="py-1.5">{formatDate(p.payment_date)}</td>
                      <td className="py-1.5 text-right">{formatCurrency(Number(p.amount))}</td>
                      <td className="py-1.5 text-right">{formatCurrency(Number(p.remaining_after))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-10 grid grid-cols-2 gap-8">
            <div>
              <div className="mb-12 border-b border-slate-400" />
              <p className="text-xs text-slate-500">Buyer Signature</p>
              <p className="mt-1 text-sm font-medium">{customer?.name ?? ''}</p>
              <p className="mt-3 text-xs text-slate-500">Date: {today}</p>
            </div>
            <div>
              <div className="mb-12 border-b border-slate-400" />
              <p className="text-xs text-slate-500">Authorized Dealer Signature</p>
              <p className="mt-1 text-sm font-medium">Sakinya Motors</p>
              <p className="mt-3 text-xs text-slate-500">Date: {today}</p>
            </div>
          </div>

          <p className="mt-8 border-t border-slate-200 pt-4 text-[10px] leading-relaxed text-slate-400">
            This agreement is governed by applicable state and federal lending laws. The buyer agrees to
            remit the monthly payment on or before the due date each month. Late payments may incur fees.
            The vehicle serves as collateral for the duration of the financing term. This document is a
            system-generated copy from Sakinya Motors and constitutes a binding financing agreement.
          </p>
        </Card>
      )}
    </div>
  );
}
