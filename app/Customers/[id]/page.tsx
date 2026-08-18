'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Customer, Loan, Payment } from '@/lib/types';
import { formatKsh, formatDateDMY } from '@/lib/finance';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DocumentUploader } from '@/components/DocumentUploader';
import { User, CreditCard, FileText, ArrowLeft } from 'lucide-react';

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Fetch Customer
      const { data: custData } = await supabase
        .from('customers')
        .select('*')
        .eq('id', params.id)
        .single();

      // Fetch Customer Loans
      const { data: loanData } = await supabase
        .from('loans')
        .select('*')
        .eq('customer_id', params.id);

      // Fetch All Payments linked to these loans
      const loanIds = (loanData || []).map((l) => l.id);
      const { data: paymentData } = await supabase
        .from('payments')
        .select('*')
        .in('loan_id', loanIds.length > 0 ? loanIds : ['none'])
        .order('payment_date', { ascending: false });

      setCustomer(custData);
      setLoans(loanData || []);
      setPayments(paymentData || []);
      setLoading(false);
    }

    fetchData();
  }, [params.id]);

  if (loading) return <div className="p-8 text-center text-sm text-muted-foreground">Loading details...</div>;
  if (!customer) return <div className="p-8 text-center text-sm text-muted-foreground">Customer not found.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6">
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
      </Link>

      {/* Customer Header Info */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">{customer.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              ID: {customer.id_number || 'N/A'} | Phone: {customer.phone || 'N/A'} | Residence: {customer.address || 'N/A'}
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Grid: Document Uploads & Loan Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Document Storage Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5" /> Customer Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DocumentUploader
              customerId={customer.id}
              docType="logbook"
              label="Vehicle Logbook"
              currentUrl={customer.logbook_url}
              onUploadComplete={(url) => setCustomer({ ...customer, logbook_url: url })}
            />
            <DocumentUploader
              customerId={customer.id}
              docType="id_document"
              label="National ID / Passport"
              currentUrl={customer.id_document_url}
              onUploadComplete={(url) => setCustomer({ ...customer, id_document_url: url })}
            />
            <DocumentUploader
              customerId={customer.id}
              docType="agreement"
              label="Signed Sale Agreement"
              currentUrl={customer.agreement_url}
              onUploadComplete={(url) => setCustomer({ ...customer, agreement_url: url })}
            />
          </CardContent>
        </Card>

        {/* Payment & Loan Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-5 w-5" /> Active Loans & Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loans.length === 0 ? (
              <p className="text-xs text-muted-foreground">No active loans found for this customer.</p>
            ) : (
              loans.map((loan) => (
                <div key={loan.id} className="border-b pb-3 last:border-0 space-y-1">
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Vehicle Price</span>
                    <span>{formatKsh(Number(loan.vehicle_price))}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Deposit: {formatKsh(Number(loan.deposit))}</span>
                    <span className="font-medium text-foreground">Balance: {formatKsh(Number(loan.balance))}</span>
                  </div>
                </div>
              ))
            )}

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Payment History
              </h4>
              {payments.length === 0 ? (
                <p className="text-xs text-muted-foreground">No payments recorded yet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {payments.map((p) => (
                    <div key={p.id} className="flex justify-between text-xs border-b py-1">
                      <span>{formatDateDMY(p.payment_date)}</span>
                      <span className="font-medium text-green-600">+{formatKsh(Number(p.amount))}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
