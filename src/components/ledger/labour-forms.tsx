"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { addLabour, addLabourPayment } from "@/app/actions";
import { Calendar } from "@/components/ui/calendar";

export function AddLabourForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: any) {
    e.preventDefault();
    setIsPending(true);
    const result = await addLabour({ name, phone });
    setIsPending(false);
    if (result?.errors) {
      toast({ title: 'Error', description: 'Please check the form for errors.', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Labourer added.' });
      setName('');
      setPhone('');
      window.location.reload();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end mb-4">
      <div>
        <label className="block text-xs font-medium mb-1 text-black">Name</label>
        <Input value={name} onChange={e => setName(e.target.value)} required minLength={2} className="bg-black text-white border border-gray-400 focus:border-blue-500" />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1 text-black">Phone</label>
        <Input value={phone} onChange={e => setPhone(e.target.value)} required minLength={10} className="bg-black text-white border border-gray-400 focus:border-blue-500" />
      </div>
      <Button type="submit" disabled={isPending} className="bg-black text-white hover:bg-gray-900 border border-gray-400">{isPending ? 'Adding...' : 'Add Labourer'}</Button>
    </form>
  );
}

export function AddLabourPaymentForm({ labourId, calendarDropdown }: { labourId: string, calendarDropdown?: boolean }) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: any) {
    e.preventDefault();
    setIsPending(true);
    const result = await addLabourPayment(labourId, { date, amount: Number(amount) });
    setIsPending(false);
    if (result?.errors) {
      toast({ title: 'Error', description: 'Please check the form for errors.', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Payment added.' });
      setAmount('');
      setDate('');
      window.location.reload();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      {calendarDropdown ? (
        <div className="relative">
          <Input
            type="text"
            value={date}
            onFocus={() => setCalendarOpen(true)}
            onChange={e => setDate(e.target.value)}
            placeholder="Select date"
            className="w-32 cursor-pointer bg-black text-white border border-gray-400 focus:border-blue-500"
            readOnly
          />
          {calendarOpen && (
            <div className="absolute z-10 bg-white text-black border rounded shadow mt-1">
              <Calendar
                mode="single"
                selected={date ? new Date(date) : undefined}
                onSelect={d => {
                  if (d) {
                    setDate(d.toISOString().slice(0, 10));
                    setCalendarOpen(false);
                  }
                }}
                initialFocus
              />
            </div>
          )}
        </div>
      ) : (
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-32 bg-black text-white border border-gray-400 focus:border-blue-500" />
      )}
      <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} required min={1} placeholder="Amount" className="w-24 bg-black text-white border border-gray-400 focus:border-blue-500" />
      <Button type="submit" size="sm" disabled={isPending} className="bg-black text-white hover:bg-gray-900 border border-gray-400">{isPending ? 'Adding...' : 'Add Payment'}</Button>
    </form>
  );
} 