'use client';

import { useState } from 'react';
import { Customer, Loan } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';
import { formatDate, formatCurrency } from '@/lib/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Users, Plus, Pencil, Mail, Phone, MapPin, Search, FileText, Printer } from 'lucide-react';

type Props = {
  customers: Customer[];
  loans?: Loan[];
  loading: boolean;
  onChanged: () => void;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  address: string;
  id_number: string;
};

const EMPTY: FormState = { name: '', email: '', phone: '', address: '', id_number: '' };

export function CustomersView({ customers, loans = [], loading, onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  // State for Customer Agreements Modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [agreementsOpen, setAgreementsOpen] = useState(false);

  const startAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const startEdit = (c: Customer) => {
    setEditing(c);
    setForm({
      name: c.name,
      email: c.email ?? '',
      phone: c.phone ?? '',
      address: c.address ?? '',
      id_number: c.id_number ?? '',
    });
    setOpen(true);
  };

  const openAgreements = (c: Customer) => {
    setSelectedCustomer(c);
    setAgreementsOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      id_number: form.id_number || null,
    };
    if (editing) {
      await supabase.from('customers').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('customers').insert(payload);
    }
    setSaving(false);
    setOpen(false);
    onChanged();
  };

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || (c.email ?? '').toLowerCase().includes(q) || (c.phone ?? '').includes(q);
  });

  const customerLoans = loans.filter((l) => l.customer_id === selectedCustomer?.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">Manage buyer profiles and contact details.</p>
        </div>
        <Button onClick={startAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted/30" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-border/50 bg-card/40 p-12 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No customers found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Add your first customer to get started.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} className="flex flex-col justify-between border-border/50 bg-card/50 p-5">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                      {c.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold leading-tight">{c.name}</h3>
                      <p className="text-xs text-muted-foreground">Added {formatDate(c.created_at)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(c)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  {c.email && <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-primary/60" /> {c.email}</p>}
                  {c.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-primary/60" /> {c.phone}</p>}
                  {c.address && <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-primary/60" /> {c.address}</p>}
                  {c.id_number && <p className="flex items-center gap-2"><Badge variant="outline" className="text-[10px]">ID: {c.id_number}</Badge></p>}
                </div>
              </div>

              {/* ACTION BUTTON FOR AGREEMENTS */}
              <div className="mt-5 border-t border-border/40 pt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs" 
                  onClick={() => openAgreements(c)}
                >
                  <FileText className="mr-1.5 h-3.5 w-3.5 text-primary" />
                  View Agreements
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* EDIT / ADD CUSTOMER DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(555) 123-4567" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St, City" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="id_number">ID Number</Label>
              <Input id="id_number" value={form.id_number} onChange={(e) => setForm({ ...form, id_number: e.target.value })} placeholder="Driver license / national ID" />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CUSTOMER AGREEMENTS MODAL */}
      <Dialog open={agreementsOpen} onOpenChange={setAgreementsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Agreements - {selectedCustomer?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {customerLoans.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">
                No active agreements or loans found for this customer.
              </p>
            ) : (
              customerLoans.map((loan) => (
                <div key={loan.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Loan #{loan.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      Balance: <span className="font-medium text-foreground">{formatCurrency(Number(loan.remaining_balance))}</span>
                    </p>
                    <Badge variant="outline" className="text-[10px] capitalize">{loan.status}</Badge>
                  </div>
                  <Button size="sm" onClick={() => window.print()}>
                    <Printer className="mr-1.5 h-3.5 w-3.5" /> Print Agreement
                  </Button>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAgreementsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
