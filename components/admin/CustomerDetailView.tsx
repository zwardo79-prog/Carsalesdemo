'use client';

import { useState, ChangeEvent } from 'react';
import { Customer, Vehicle, Loan, Payment } from '@/lib/types';
import { formatKsh, formatDateDMY, amountInWords } from '@/lib/finance';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Car, 
  Upload, 
  Printer, 
  DollarSign, 
  CheckCircle, 
  ExternalLink,
  ArrowLeft
} from 'lucide-react';

type ExtendedPayment = Payment & {
  logbook_url?: string;
};

type Props = {
  customer: Customer;
  loan: Loan | null;
  vehicle: Vehicle | null;
  payments: ExtendedPayment[];
  onUploadLogbook?: (loanId: string, file: File) => Promise<void>;
  onBack?: () => void;
};

export function CustomerDetailView({
  customer,
  loan,
  vehicle,
  payments,
  onUploadLogbook,
  onBack,
}: Props) {
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<ExtendedPayment | null>(null);
  const [logbookUrl, setLogbookUrl] = useState<string | null>(loan?.logbook_url ?? null);
  const [uploading, setUploading] = useState(false);

  // Sorting payment history by latest first
  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
  );

  // Financial calculations
  const totalAgreedPrice = loan ? Number(loan.total_amount ?? 0) : 0;
  const totalPaid = sortedPayments.reduce((acc, p) => acc + Number(p.amount), 0);
  const remainingBalance = totalAgreedPrice > 0 ? Math.max(0, totalAgreedPrice - totalPaid) : 0;
  const progressPercent = totalAgreedPrice > 0 ? Math.min(100, Math.round((totalPaid / totalAgreedPrice) * 100)) : 0;

  const handleLogbookUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !loan) return;

    const previewUrl = URL.createObjectURL(file);
    setLogbookUrl(previewUrl);

    if (onUploadLogbook) {
      setUploading(true);
      try {
        await onUploadLogbook(loan.id, file);
      } finally {
        setUploading(false);
      }
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      
      {/* Top Header & Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="outline" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
              <Badge variant={remainingBalance === 0 && totalAgreedPrice > 0 ? "default" : "secondary"}>
                {remainingBalance === 0 && totalAgreedPrice > 0 ? "Fully Paid" : "Active Financing"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Detailed car financing summary & account history.</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Customer Info & Financing Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden">
        
        {/* Left Column: Customer Profile & Vehicle Info */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Personal Info Card */}
          <Card className="p-5 border-border/60">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" /> Personal Details
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.phone || 'No phone provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>ID/Passport: {customer.id_number || 'N/A'}</span>
              </div>
            </div>
          </Card>

          {/* Financed Vehicle Info Card */}
          <Card className="p-5 border-border/60">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <Car className="h-4 w-4 text-blue-600" /> Financed Vehicle
            </h2>
            {vehicle ? (
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Make & Model</p>
                  <p className="font-semibold text-base">{vehicle.make} {vehicle.model}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Reg Number</p>
                    <p className="font-medium">{vehicle.reg_no || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Chassis/VIN</p>
                    <p className="font-medium">{vehicle.chassis_no || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No vehicle assigned to this account.</p>
            )}
          </Card>

          {/* Logbook Document Upload Vault */}
          <Card className="p-5 border-border/60">
            <h2 className="text-base font-bold mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" /> Vehicle Logbook Document
            </h2>
            <p className="text-xs text-muted-foreground mb-4">Attach and manage the scanned logbook copy for this vehicle.</p>
            
            <div className="space-y-4">
              {logbookUrl ? (
                <div className="relative group w-full h-36 rounded-lg overflow-hidden border border-border bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={logbookUrl} 
                    alt="Vehicle Logbook" 
                    className="w-full h-full object-cover"
                  />
                  <a 
                    href={logbookUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-xs font-semibold transition-opacity"
                  >
                    <ExternalLink className="h-4 w-4" /> View Full Document
                  </a>
                </div>
              ) : (
                <div className="w-full h-28 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground text-xs p-4 text-center">
                  No logbook document uploaded yet
                </div>
              )}

              <div>
                <label htmlFor="customer-logbook-upload" className="w-full cursor-pointer">
                  <div className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
                    <Upload className="h-3.5 w-3.5" />
                    {uploading ? 'Uploading...' : logbookUrl ? 'Replace Logbook Copy' : 'Upload Logbook Copy'}
                  </div>
                  <input 
                    id="customer-logbook-upload" 
                    type="file" 
                    accept="image/*,.pdf" 
                    onChange={handleLogbookUpload} 
                    className="hidden" 
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
          </Card>

        </div>

        {/* Right Column: Financing Stats & Installment Payment History */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Financing Overview Card */}
          <Card className="p-6 border-border/60">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" /> Auto Financing Overview
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-6">
              <div className="p-4 bg-muted/40 rounded-lg">
                <p className="text-xs text-muted-foreground">Agreed Total Price</p>
                <p className="text-lg font-bold mt-1">{formatKsh(totalAgreedPrice)}</p>
              </div>
              <div className="p-4 bg-green-500/10 text-green-700 dark:text-green-400 rounded-lg">
                <p className="text-xs">Total Amount Paid</p>
                <p className="text-lg font-bold mt-1">{formatKsh(totalPaid)}</p>
              </div>
              <div className="p-4 bg-red-500/10 text-red-700 dark:text-red-400 rounded-lg">
                <p className="text-xs">Remaining Balance</p>
                <p className="text-lg font-bold mt-1">{formatKsh(remainingBalance)}</p>
              </div>
            </div>

            {/* Payoff Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Payoff Progress</span>
                <span>{progressPercent}% Complete</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
            </div>
          </Card>

          {/* Installment History Table Card */}
          <Card className="p-6 border-border/60">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">Installment Payment History</h2>
              <Badge variant="outline">{sortedPayments.length} Payments Recorded</Badge>
            </div>

            {sortedPayments.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No payments recorded for this customer yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Receipt Ref</th>
                      <th className="pb-3">Note/Payment For</th>
                      <th className="pb-3 text-right">Amount</th>
                      <th className="pb-3 text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {sortedPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/30">
                        <td className="py-3 font-medium">{formatDateDMY(p.payment_date)}</td>
                        <td className="py-3 text-xs text-muted-foreground font-mono">#{p.id.slice(0, 8).toUpperCase()}</td>
                        <td className="py-3 text-xs">{p.note || 'Regular Installment'}</td>
                        <td className="py-3 text-right font-bold text-green-600 dark:text-green-400">
                          {formatKsh(Number(p.amount))}
                        </td>
                        <td className="py-3 text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSelectedReceiptPayment(p)}
                            className="h-8 px-2 text-xs"
                          >
                            <Printer className="h-3.5 w-3.5 mr-1" /> Thermal Receipt
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

        </div>

      </div>

      {/* Selected Thermal Receipt Section / Print View */}
      {selectedReceiptPayment && (
        <div className="pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-4 print:hidden">
            <h3 className="text-lg font-bold">Receipt Preview (80mm Thermal Printer)</h3>
            <div className="flex items-center gap-2">
              <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Print Receipt
              </Button>
              <Button variant="outline" onClick={() => setSelectedReceiptPayment(null)}>
                Close Preview
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            <Card id="receipt-printable" className="w-[80mm] max-w-[80mm] border-border/60 bg-white p-3 text-black print:p-0 print:border-0 print:shadow-none font-mono text-[11px] leading-tight shadow-lg">
              
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
                <span>#{selectedReceiptPayment.id.slice(0, 8).toUpperCase()}</span>
              </div>

              <div className="my-2 border-t border-dashed border-black" />

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold">Date:</span>
                  <span>{formatDateDMY(selectedReceiptPayment.payment_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Customer:</span>
                  <span className="truncate max-w-[140px]">{customer.name.toUpperCase()}</span>
                </div>
                {customer.phone && (
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
                {selectedReceiptPayment.note && (
                  <div className="flex justify-between">
                    <span className="font-bold">For:</span>
                    <span className="text-right truncate max-w-[140px]">{selectedReceiptPayment.note}</span>
                  </div>
                )}
              </div>

              <div className="my-2 border-t border-dashed border-black" />

              {/* Financial Amounts */}
              <div className="space-y-1">
                <div className="flex justify-between text-[12px] font-bold">
                  <span>AMOUNT PAID:</span>
                  <span>{formatKsh(Number(selectedReceiptPayment.amount))}</span>
                </div>
                <p className="text-[9px] italic leading-tight">({amountInWords(Number(selectedReceiptPayment.amount))})</p>

                {loan && (
                  <>
                    <div className="my-1 border-t border-dotted border-black" />
                    <div className="flex justify-between text-[10px]">
                      <span>Total Agreed:</span>
                      <span>{formatKsh(totalAgreedPrice)}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span>Total Paid to Date:</span>
                      <span>{formatKsh(totalPaid)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold">
                      <span>Balance Remaining:</span>
                      <span>{formatKsh(remainingBalance)}</span>
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
        </div>
      )}

      {/* Global Thermal Printing CSS Rule */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }

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
