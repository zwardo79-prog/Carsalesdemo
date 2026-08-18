'use client';

import { useState } from 'react';
import { Vehicle, VehicleStatus } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency, toNumber } from '@/lib/finance';
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
import { Car, Plus, Search, Hash, DollarSign } from 'lucide-react';

type Props = {
  vehicles: Vehicle[];
  loading: boolean;
  onChanged: () => void;
};

type FormState = {
  make: string;
  model: string;
  year: string;
  vin: string;
  price: string;
  regNo: string;
  chassisNo: string;
  engineNo: string;
  colour: string;
  fuelType: string;
  engineCapacity: string;
};

const EMPTY: FormState = {
  make: '', model: '', year: String(new Date().getFullYear()), vin: '', price: '',
  regNo: '', chassisNo: '', engineNo: '', colour: '', fuelType: '', engineCapacity: '',
};

const statusColor: Record<VehicleStatus, string> = {
  available: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  financed: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  sold: 'border-muted-foreground/30 bg-muted/30 text-muted-foreground',
};

export function VehiclesView({ vehicles, loading, onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from('vehicles').insert({
      make: form.make,
      model: form.model,
      year: parseInt(form.year, 10),
      vin: form.vin || null,
      price: toNumber(form.price),
      status: 'available',
      reg_no: form.regNo || null,
      chassis_no: form.chassisNo || null,
      engine_no: form.engineNo || null,
      colour: form.colour || null,
      fuel_type: form.fuelType || null,
      engine_capacity: form.engineCapacity || null,
    });
    setSaving(false);
    setOpen(false);
    setForm(EMPTY);
    onChanged();
  };

  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase();
    return !q || `${v.make} ${v.model} ${v.year}`.toLowerCase().includes(q) || (v.vin ?? '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vehicles</h1>
          <p className="text-sm text-muted-foreground">Manage your dealership inventory and pricing.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Vehicle
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search vehicles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/30" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-border/50 bg-card/40 p-12 text-center">
          <Car className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No vehicles found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Add a vehicle to your inventory.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden border-border/50 bg-card/50 p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Vehicle</th>
                  <th className="px-5 py-3 font-medium">Year</th>
                  <th className="px-5 py-3 font-medium">VIN</th>
                  <th className="px-5 py-3 text-right font-medium">Price</th>
                  <th className="px-5 py-3 text-center font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id} className="border-b border-border/30 transition-colors hover:bg-muted/20">
                    <td className="px-5 py-3.5 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <Car className="h-4 w-4 text-primary/70" />
                        </div>
                        {v.make} {v.model}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{v.year}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {v.vin ? <span className="flex items-center gap-1.5"><Hash className="h-3 w-3" />{v.vin}</span> : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold">{formatCurrency(Number(v.price))}</td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge variant="outline" className={`capitalize ${statusColor[v.status]}`}>{v.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Vehicle</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make *</Label>
                <Input id="make" required value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} placeholder="Toyota" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input id="model" required value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Camry" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input id="year" type="number" required value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="price" type="number" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="pl-9" placeholder="32500" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vin">VIN</Label>
              <Input id="vin" value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} placeholder="Vehicle identification number" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="regNo">Reg No</Label>
                <Input id="regNo" value={form.regNo} onChange={(e) => setForm({ ...form, regNo: e.target.value })} placeholder="KDY 209A" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="colour">Colour</Label>
                <Input id="colour" value={form.colour} onChange={(e) => setForm({ ...form, colour: e.target.value })} placeholder="Red" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chassisNo">Chassis No</Label>
                <Input id="chassisNo" value={form.chassisNo} onChange={(e) => setForm({ ...form, chassisNo: e.target.value })} placeholder="BMLFS-112554" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="engineNo">Engine No</Label>
                <Input id="engineNo" value={form.engineNo} onChange={(e) => setForm({ ...form, engineNo: e.target.value })} placeholder="S5-30423441" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fuelType">Fuel</Label>
                <Input id="fuelType" value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })} placeholder="Diesel" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="engineCapacity">Engine Capacity</Label>
                <Input id="engineCapacity" value={form.engineCapacity} onChange={(e) => setForm({ ...form, engineCapacity: e.target.value })} placeholder="1490CC" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Vehicle'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
