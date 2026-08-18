'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Customer, Loan, Payment } from '@/lib/types';
import { formatKsh } from '@/lib/finance';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  User, 
  Phone, 
  MapPin, 
  FileCheck, 
  FileX, 
  ArrowUpRight, 
  CreditCard 
} from 'lucide-react';

type CustomerWithFinancials = Customer & {
  activeLoanCount: number;
  totalBalance: number;
  totalPaid: number;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithFinancials[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomersData() {
      const supabase = createClient();

      // 1. Fetch all customers
      const { data: custData, error: custError } = await supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true });

      if (custError) {
        console.error('Error fetching customers:', custError);
        setLoading(false);
        return;
      }

      // 2. Fetch all loans & payments to compute live balances
      const { data: loanData } = await supabase.from('loans').select('*');
      const { data: paymentData } = await supabase.from('payments').select('*');

      const loans = loanData || [];
      const payments = paymentData || [];

      // 3. Map financial summary onto each customer
      const compiledCustomers: CustomerWithFinancials[] = (custData || []).map((customer) => {
        const customerLoans = loans.filter((l) => l.customer_id === customer.id);
        const customerLoanIds = customerLoans.map((l) => l.id);

        const totalBalance = customerLoans.reduce((acc, l) => acc + Number(l.balance || 0), 0);
        const totalPaid = payments
          .filter((p) => customerLoanIds.includes(p.loan_id))
          .reduce((acc, p) => acc + Number(p.amount || 0), 0);

        return {
          ...customer,
          activeLoanCount: customerLoans.length,
          totalBalance,
          totalPaid,
        };
      });

      setCustomers(compiledCustomers);
      setLoading(false);
    }

    fetchCustomersData();
  }, []);

  // Filter customers by search input
  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Select any customer to view details, upload logbooks/IDs, or view payment history.
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search name, ID, or phone..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Customer Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-48 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : filteredCustomers.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          No customers found matching &quot;{searchQuery}&quot;.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => {
            const hasLogbook = Boolean(customer.logbook_url);
            const hasId = Boolean(customer.id_document_url);
            const hasAgreement = Boolean(customer.agreement_url);
            const allDocsPresent = hasLogbook && hasId && hasAgreement;

            return (
              <Link key={customer.id} href={`/customers/${customer.id}`}>
                <Card className="group relative overflow-hidden transition-all duration-200 hover:border-primary hover:shadow-md cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold transition-colors group-hover:text-primary">
                            {customer.name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">ID: {customer.id_number}</p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 text-xs">
                    {/* Contact Details */}
                    <div className="space-y-1 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{customer.phone || 'No phone recorded'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{customer.address || 'No residence listed'}</span>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="rounded-lg bg-muted/50 p-2.5 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-muted-foreground">Outstanding Balance</p>
                        <p className="text-sm font-bold text-foreground">
                          {formatKsh(customer.totalBalance)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-semibold text-muted-foreground">Active Loans</p>
                        <Badge variant="outline" className="mt-0.5">
                          <CreditCard className="h-3 w-3 mr-1" />
                          {customer.activeLoanCount}
                        </Badge>
                      </div>
                    </div>

                    {/* Document Status Badges */}
                    <div className="pt-1 flex items-center justify-between border-t text-[11px]">
                      <span className="text-muted-foreground font-medium">Docs:</span>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={hasLogbook ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                          Logbook
                        </Badge>
                        <Badge variant={hasId ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                          ID
                        </Badge>
                        <Badge variant={hasAgreement ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                          Agreement
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
