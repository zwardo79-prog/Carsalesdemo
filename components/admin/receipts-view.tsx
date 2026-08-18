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
import { Receipt as ReceiptIcon, Printer } from 'lucide-react';

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
      {/* Non-printable Controls */}
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
        <Card className="border-border/50 bg-card/40 p-12 text-center text-sm text-muted-foreground print:hidden">Loading...</Card>
      ) : !payment ? (
        <Card className="border-border/50 bg-card/40 p-12 text-center print:hidden">
          <ReceiptIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Select a payment to preview the receipt</h3>
          <p className="mt-1 text-sm text-muted-foreground">Choose a payment from the dropdown above.</p>
        </Card>
      ) : (
        /* Printable Thermal Receipt Wrapper */
        <div className="flex justify-center">
          <Card id="receipt-printable" className="w-[80mm] max-w-[80mm] border-border/60 bg-white p-3 text-black print:p-0 print:border-0 print:shadow-none font-mono text-[11px] leading-tight">
            {/* Header / Letterhead */}
            <div className="text-center space-y-1">
              <h2 className="text-base font-extrabold tracking-wider uppercase">SAKINYA MOTORS</h2>
              <p className="text-[10px] font-bold">&quot;YOUR ULTIMATE DRIVING SOLUTION&quot;</p>
              <p className="text-[9px] leading-tight">Dealers in: New & Clean Second Hand Motor Vehicles & Trade-Ins</p>
            </div>

            <div className="my-2 border-t border-dashed border-black" />

            <div className="text-[10px] space-y-0.5">
              <p>Along Oginga Odinga Rd, Opp. Charismata Church</p>
              <p>Nakuru, Kenya | Tel: 0722 384 118</p>
              <p>Email: sakinyamotors2019@gmail.com</p>
            </div>

            <div className="my-2 border-t border-dashed border-black" />

            {/* Receipt Details */}
            <div className="flex justify-between font-bold text-[12px] uppercase">
              <span>PAYMENT RECEIPT</span>
              <span>#{payment.id.slice(0, 8).toUpperCase()}</span>
            </div>

            <div className="my-2 border-t border-dashed border-black" />

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-bold">Date:</span>
                <span>{formatDateDMY(payment.payment_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Customer:</span>
                <span className="truncate max-w-[140px]">{customer?.name?.toUpperCase() ?? 'N/A'}</span>
              </div>
              {customer?.phone && (
                <div className="flex justify-between">
                  <span className="font-bold">Tel No:</span>
                  <span>{customer.phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-bold">Vehicle:</span>
                <span className="text-right truncate max-w-[140px]">
                  {vehicle ? `${vehicle.make} ${vehicle.model} ${vehicle.reg_no ? `(${vehicle.reg_no})` : ''}` : 'N/A'}
                </span>
              </div>
              {payment.note && (
                <div className="flex justify-between">
                  <span className="font-bold">For:</span>
                  <span className="text-right truncate max-w-[140px]">{payment.note}</span>
                </div>
              )}
            </div>

            <div className="my-2 border-t border-dashed border-black" />

            {/* Financial Amounts */}
            <div className="space-y-1">
              <div className="flex justify-between text-[12px] font-bold">
                <span>AMOUNT PAID:</span>
                <span>{formatKsh(Number(payment.amount))}</span>
              </div>
              <p className="text-[9px] italic leading-tight">({amountInWords(Number(payment.amount))})</p>

              {loan && (
                <>
                  <div className="my-1 border-t border-dotted border-black" />
                  <div className="flex justify-between text-[10px]">
                    <span>Balance Before:</span>
                    <span>{formatKsh(Number(payment.remaining_after) + Number(payment.amount))}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>Balance Remaining:</span>
                    <span>{formatKsh(Number(payment.remaining_after))}</span>
                  </div>
                </>
              )}
            </div>

            <div className="my-2 border-t border-dashed border-black" />

            {/* Signatures */}
            <div className="mt-6 grid grid-cols-2 gap-4 text-[9px] text-center">
              <div>
                <div className="mb-6 border-b border-black" />
                <p>Received By</p>
              </div>
              <div>
                <div className="mb-6 border-b border-black" />
                <p>Customer Sign</p>
              </div>
            </div>

            <div className="my-2 border-t border-dashed border-black" />

            <p className="text-center text-[9px] font-bold uppercase mt-2">
              Kindly quote reference when replying
            </p>
            <p className="text-center text-[9px] mt-1">*** Thank you for your business ***</p>
          </Card>
        </div>
      )}

      {/* Global CSS Overrides for Thermal Printer Output */}
      <style jsx global>{`
        @media print {
          /* Hide all UI shell elements except printable area */
          body * {
            visibility: hidden;
          }

          /* Force continuous roll page size for standard thermal printer */
          @page {
            size: 80mm auto;
            margin: 0mm;
          }

          #receipt-printable,
          #receipt-printable * {
            visibility: visible;
          }

          #receipt-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 4mm !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
        }
      `}</style>
    </div>
  );
}
