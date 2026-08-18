'use client';

import { useState } from 'react';
import { Customer, Vehicle, Loan, Payment, BalanceItem } from '@/lib/types';
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
import { FileText, Printer, Car as CarIcon } from 'lucide-react';

type Props = {
  loans: Loan[];
  customers: Customer[];
  vehicles: Vehicle[];
  payments: Payment[];
  balanceItems: BalanceItem[];
  loading: boolean;
};

const TERMS: string[] = [
  'The aforesaid motor vehicle is sold on basis as it is and the seller does not give any guarantee whatsoever to the buyer.',
  'Confirmed by taking possession of the aforesaid motor vehicle is satisfied that the motor vehicle is in proper condition.',
  'The deposit paid here by the buyer shall not be refundable and seller has the right to repossess the sole responsibility of the buyer.',
  'Immediately the buyer takes possession of the motor vehicle he/she shall be responsible to cater for insurance company of his/her own etc.',
  "Should motor vehicle be involved in any accident, stolen, or burnt etc. it shall be the sole responsibility of the buyer, notwithstanding the fact that the motor vehicle has not been formally transferred into his/her name.",
  'The log book shall be handed to the buyer',
  'If the installment is not paid on time, 40 percent penalty will be charged on the whole amount separately.',
  'In case of any criminal offence or court case over the said vehicle the buyer is fully responsible.',
  'The buyer shall pay transfer fees of the above-mentioned vehicle to the relevant authorities concerned.',
];

export function ContractsView({ loans, customers, vehicles, payments, balanceItems, loading }: Props) {
  const [selectedLoanId, setSelectedLoanId] = useState('');

  const loan = loans.find((l) => l.id === selectedLoanId) ?? null;
  const customer = loan ? customers.find((c) => c.id === loan.customer_id) ?? null : null;
  const vehicle = loan && loan.vehicle_id ? vehicles.find((v) => v.id === loan.vehicle_id) ?? null : null;
  const loanBalanceItems = loan
    ? balanceItems.filter((b) => b.loan_id === loan.id).sort((a, b) => a.sort_order - b.sort_order)
    : [];

  const handlePrint = () => window.print();

  const specRow = (label: string, value: string | number | null | undefined) => (
    <div className="flex text-[10px]">
      <span className="w-32 shrink-0 font-semibold text-black">
        <span className="mr-1 text-red-600">&#10070;</span>{label}
      </span>
      <span className="text-black">: {value ?? ''}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          /* 1. Reset standard page dimensions and margins */
          @page {
            size: A4 portrait;
            margin: 5mm;
          }

          /* 2. Hide EVERYTHING on the DOM by default */
          body * {
            visibility: hidden !important;
          }

          /* 3. Make ONLY the contract container visible and reset background */
          #contract-print-node,
          #contract-print-node * {
            visibility: visible !important;
          }

          /* 4. Position contract at top-left to overwrite parent layout borders */
          #contract-print-node {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }

          /* Force light background and clean white page */
          html, body {
            background: #ffffff !important;
            background-color: #ffffff !important;
          }

          /* Eliminate card borders and outlines */
          .printable-card-body {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
          }
        }
      `}</style>

      {/* Screen Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contracts</h1>
          <p className="text-sm text-muted-foreground">Generate the Sakinya Motors sale agreement for any loan.</p>
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
        <div id="contract-print-node">
          <div className="printable-card-body mx-auto max-w-3xl rounded-lg border border-border/60 bg-white p-6 text-black">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-blue-800">
                  <CarIcon className="h-6 w-6 text-blue-800" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold italic text-red-600">SAKINYA MOTORS</h2>
                  <p className="text-[9px] italic font-semibold text-red-600">&quot;YOUR ULTIMATE DRIVING SOLUTION &quot;</p>
                </div>
              </div>
            </div>

            <p className="mt-1 text-center text-[10px] font-semibold text-red-600">
              Dealers in: New and Clean Second hand Motor Vehicles and We also do Trade in
            </p>

            <div className="mt-1 border-t-2 border-red-600 pt-1">
              <div className="grid grid-cols-3 gap-2 text-[9px] font-medium text-black">
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
            <div className="mt-1 border-t-2 border-red-600" />

            {/* Document Title */}
            <p className="mt-2 text-xs font-bold underline text-black">
              MOTOR VEHICLE SALE AGREEMENT {formatDateDMY(loan.contract_date)}
            </p>

            {/* Specs */}
            <div className="mt-1.5 space-y-0.5">
              {specRow('MAKE', vehicle ? `${vehicle.make} ${vehicle.model}` : '')}
              {specRow('REG NO', vehicle?.reg_no)}
              {specRow('CHASSIS NO', vehicle?.chassis_no)}
              {specRow('ENGINE NO', vehicle?.engine_no)}
              {specRow('COLOUR', vehicle?.colour)}
              {specRow('FUEL', vehicle?.fuel_type)}
              {specRow('MANUFACTURE YEAR', vehicle?.year)}
              {specRow('ENGINE CAPACITY', vehicle?.engine_capacity)}
            </div>

            {/* Buyer Details */}
            <div className="mt-1.5 space-y-0.5 text-[10px] text-black">
              <p>
                <span className="font-semibold">- BUYER &#39;S NAME: {customer?.name?.toUpperCase() ?? ''}</span>
                <span className="ml-6">IDNO; {customer?.id_number ?? ''}</span>
              </p>
              <p className="pl-3">
                <span className="font-semibold">RESIDENCE: {customer?.address ?? ''}</span>
                <span className="ml-6">TEL NO:{customer?.phone ?? ''}</span>
              </p>
              <p className="font-bold underline">
                PURCHASE PRICE: KSH {Number(loan.vehicle_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}/= ({amountInWords(loan.vehicle_price)})
              </p>
            </div>

            {/* Payment Schedule */}
            <div className="mt-1.5 space-y-0.5 text-[10px] text-black">
              <p>
                <span className="font-semibold underline">DEPOSIT</span>
                <span className="ml-6 font-semibold underline">
                  : {formatKsh(Number(loan.deposit))} PAID IN CASH ON {formatDateDMY(loan.deposit_date)}
                </span>
              </p>
              <p>
                <span className="font-semibold underline">BALANCE</span>
                <span className="ml-6 font-semibold underline">
                  : {formatKsh(Number(loan.balance))} TO BE PAID AS FOLLOWS.
                </span>
              </p>
              {loanBalanceItems.length > 0 && (
                <div className="pl-8">
                  {loanBalanceItems.map((item) => (
                    <p key={item.id} className="font-semibold underline">
                      - {formatKsh(Number(item.amount))} {item.description}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Terms List */}
            <ol className="mt-2 list-none space-y-0.5 text-[9px] leading-tight text-black">
              {TERMS.map((t, i) => (
                <li key={i}>
                  {i + 1}. {t}
                  {i === 5 && (
                    <div className="pl-4">- Immediately upon the seller receiving the last installment.</div>
                  )}
                </li>
              ))}
            </ol>

            {/* Signatures */}
            <div className="mt-4 grid grid-cols-2 gap-8 text-[10px]">
              <div>
                <p className="font-bold text-red-600">SELLER: SAKINYA MOTORS</p>
                <p className="mt-4 text-black">SIGN………………………</p>
                <p className="mt-1 text-black">DATE:{formatDateDMY(loan.contract_date)}</p>
              </div>
              <div>
                <p className="font-bold text-blue-800">BUYER: {customer?.name?.toUpperCase() ?? ''}</p>
                <p className="mt-4 text-black">SIGN……………</p>
                <p className="mt-1 text-black">DATE: {formatDateDMY(loan.contract_date)}</p>
              </div>
            </div>

            {/* Witness Block */}
            <div className="mt-2 text-center text-[10px] text-black">
              <p>
                WITNESS: {loan.witness_name?.toUpperCase() ?? ''} &nbsp; IDNO: {loan.witness_id_number ?? ''}
              </p>
              <p>TEL NO: {loan.witness_phone ?? ''} &nbsp; SIGN………………</p>
            </div>

            <div className="mt-2 border-t-2 border-blue-800" />
            <p className="mt-1 text-center text-[10px] font-semibold text-red-600">
              Kindly quote our reference when replying
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
