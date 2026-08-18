'use client';

import { useState, useEffect } from 'react';
import { Customer, Vehicle, Loan, Payment } from '@/lib/types';
import { formatKsh, formatDateDMY, amountInWords } from '@/lib/finance';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Receipt as ReceiptIcon, Printer, Car as CarIcon } from 'lucide-react';

type Props = {
  loans: Loan[];
  customers: Customer[];
  vehicles: Vehicle[];
  payments: Payment[];
  loading: boolean;
  initialPaymentId?: string;
};

export function ReceiptsView({ loans, customers, vehicles, payments, loading, initialPaymentId }: Props) {
  const [selectedPaymentId, setSelectedPaymentId] = useState(initialPaymentId ?? '');

  useEffect(() => {
    if (initialPaymentId) setSelectedPaymentId(initialPaymentId);
  }, [initialPaymentId]);

  const payment = payments.find((p) => p.id === selectedPaymentId) ?? null;
  const loan = payment ? loans.find((l) => l.id === payment.loan_id) ?? null : null;
  const customer = loan ? customers.find((c) => c.id === loan.customer_id) ?? null : null;
  const vehicle = loan && loan.vehicle_id ? vehicles.find((v) => v.id === loan.vehicle_id) ?? null : null;

  const sorted = [...payments].sort(
    (a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime(),
  );

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Receipts</h1>
          <p className="text-sm text-muted-foreground">Print a Sakinya Motors receipt for any payment.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPaymentId} onValueChange={setSelectedPaymentId}>
            <SelectTrigger className="w-80"><SelectValue placeholder="Select a payment" /></SelectTrigger>
            <SelectContent>
              {sorted.map((p) => {
                const l = loans.find((x) => x.id === p.loan_id);
                const c = l ? customers.find((x) => x.id === l.customer_id) : null;
                return (
                  <SelectItem key={p.id} value={p.id}>
                    {c?.name ?? 'Unknown'} — {formatKsh(Number(p.amount))} — {formatDateDMY(p.payment_date)}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {payment && (
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <Card className="border-border/50 bg-card/40 p-12 text-center text-sm text-muted-foreground">Loading...</Card>
      ) : !payment ? (
        <Card className="border-border/50 bg-card/40 p-12 text-center">
          <ReceiptIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Select a payment to preview the receipt</h3>
          <p className="mt-1 text-sm text-muted-foreground">Choose a payment from the dropdown above.</p>
        </Card>
      ) : (
        <Card className="mx-auto max-w-xl border-border/60 bg-white p-8 text-black print:border-0 print:shadow-none">
          {/* Letterhead */}
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-md border-2 border-blue-800">
              <CarIcon className="h-8 w-8 text-blue-800" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold italic text-red-600">SAKINYA MOTORS</h2>
              <p className="text-xs italic font-semibold text-red-600">&quot;YOUR ULTIMATE DRIVING SOLUTION &quot;</p>
            </div>
          </div>

          <p className="mt-2 text-center text-sm font-semibold text-red-600">
            Dealers in: New and Clean Second hand Motor Vehicles and We also do Trade in
          </p>

          <div className="mt-2 border-t-2 border-red-600 pt-2">
            <div className="grid grid-cols-3 gap-2 text-[11px] font-medium">
              <div>
                <p>Along Oginga Odinga Rd.</p>
                <p>Evans Hospital roundabout opp.</p>
                <p>Charismata Church</p>
              </div>
              <div>
                <p>Email:sakinyamotors2019@gmail.com</p>
                <p>Website: www.sakinyamotors.com</p>
              </div>
              <div className="text-right">
                <p>P.O Box 9582-20100</p>
                <p>Nakuru Kenya</p>
                <p>Tel: 0722 384 118</p>
              </div>
            </div>
          </div>
          <div className="mt-2 border-t-2 border-red-600" />

          {/* Title */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm font-bold underline">PAYMENT RECEIPT</p>
            <p className="text-xs">
              Receipt No: <span className="font-semibold">{payment.id.slice(0, 8).toUpperCase()}</span>
            </p>
          </div>

          <div className="mt-4 space-y-1 text-sm">
            <p><span className="font-semibold">Date:</span> {formatDateDMY(payment.payment_date)}</p>
            <p><span className="font-semibold">Received From:</span> {customer?.name?.toUpperCase() ?? ''}</p>
            {customer?.phone && <p><span className="font-semibold">Tel No:</span> {customer.phone}</p>}
            <p>
              <span className="font-semibold">Vehicle:</span>{' '}
              {vehicle ? `${vehicle.make} ${vehicle.model}${vehicle.reg_no ? ` — ${vehicle.reg_no}` : ''}` : '—'}
            </p>
            {payment.note && <p><span className="font-semibold">For:</span> {payment.note}</p>}
          </div>

          <div className="mt-4 border-t border-black pt-3">
            <p className="text-sm font-bold underline">
              AMOUNT RECEIVED: {formatKsh(Number(payment.amount))}/= ({amountInWords(Number(payment.amount))})
            </p>
          </div>

          {loan && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <p><span className="font-semibold">Balance Before:</span> {formatKsh(Number(payment.remaining_after) + Number(payment.amount))}</p>
              <p><span className="font-semibold">Balance Remaining:</span> {formatKsh(Number(payment.remaining_after))}</p>
            </div>
          )}

          <div className="mt-10 grid grid-cols-2 gap-8 text-sm">
            <div>
              <div className="mb-10 border-b border-black" />
              <p className="text-xs">Received By (Sakinya Motors)</p>
            </div>
            <div>
              <div className="mb-10 border-b border-black" />
              <p className="text-xs">Customer Signature</p>
            </div>
          </div>

          <div className="mt-4 border-t-2 border-blue-800" />
          <p className="mt-2 text-center text-sm font-semibold text-red-600">
            Kindly quote our reference when replying
          </p>
        </Card>
      )}
    </div>
  );
}
