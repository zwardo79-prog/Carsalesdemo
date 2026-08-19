'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Customer } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Search, User, Phone, MapPin, ArrowUpRight, Plus } from 'lucide-react';

type Props = {
  customers: Customer[];
  loading: boolean;
  onChanged?: () => void;
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  address: string;
  idNumber: string;
};

const EMPTY: FormState = { name: '', phone: '', email: '', address: '', idNumber: '' };

export function CustomersView({ customers, loading, onChanged }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from('customers').insert({
      name: form.name,
      phone: form.phone || null,
      email: form.email || null,
      address: form.address || null,
      id_number: form.idNumber || null,
    });
    setSaving(false);
    setOpen(false);
    setForm(EMPTY);
    onChanged?.();
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.id_number && c.id_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.phone && c.phone.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Click on any customer card to open their detail page and upload documents.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Customer
          </Button>
        </div>
      </div>

      {/* Grid of Clickable Customer Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-44 animate-pulse bg-muted/40" />
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
                          <p className="text-xs text-muted-foreground">
                            ID: {customer.id_number || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 text-xs">
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Margaret Wambui Ng'anga" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0726 935 722" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idNumber">ID Number</Label>
                <Input id="idNumber" value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} placeholder="25361806" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="customer@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Residence</Label>
              <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Nakuru - Naka" />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving || !form.name}>{saving ? 'Saving...' : 'Add Customer'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
