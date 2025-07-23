"use client";
import { useEffect, useState } from "react";
import { getLabours, addLabourPayment, deleteLabourPayment, deleteLabour } from '@/app/actions';
import { AddLabourForm } from '@/components/ledger/labour-forms';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Trash2 } from 'lucide-react';

function formatDateDMY(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB'); // dd/mm/yyyy
}

export default function LabourPage() {
  const [labours, setLabours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLabour, setSelectedLabour] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();
  const [addPaymentModalOpen, setAddPaymentModalOpen] = useState(false);
  const [addPaymentLabour, setAddPaymentLabour] = useState<any | null>(null);

  async function fetchLabours() {
    setLoading(true);
    const data = await getLabours();
    setLabours(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchLabours();
  }, []);

  const handleRowClick = (labour: any) => {
    setSelectedLabour(labour);
    setModalOpen(true);
    setAmount('');
    setDate('');
  };

  async function handleAddPayment(e: any) {
    e.preventDefault();
    if (!selectedLabour) return;
    setIsPending(true);
    const result = await addLabourPayment(selectedLabour.id, { date, amount: Number(amount) });
    setIsPending(false);
    if (result?.errors) {
      toast({ title: 'Error', description: 'Please check the form for errors.', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Payment added.' });
      setAmount('');
      setDate('');
      await fetchLabours();
      // Update selectedLabour with new payments
      const updated = labours.find(l => l.id === selectedLabour.id);
      setSelectedLabour(updated);
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 py-4 px-1 sm:py-10 sm:px-2">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-2 sm:p-8 border border-gray-300">
        <h1 className="text-lg sm:text-3xl font-bold mb-4 sm:mb-6 text-black">Labour Charges & Payments</h1>
        <div className="mb-4 sm:mb-8">
          <h2 className="text-base sm:text-xl font-semibold mb-2 sm:mb-4 text-black">Add Labourer</h2>
          <div className="w-full">
            <AddLabourForm />
          </div>
        </div>
        <div>
          <h2 className="text-base sm:text-xl font-semibold mb-2 sm:mb-4 text-black">All Labourers</h2>
          <div className="overflow-x-auto w-full">
            <table className="min-w-[600px] w-full text-xs sm:text-sm border-separate border-spacing-y-2 border border-gray-400 rounded-lg">
              <thead>
                <tr className="bg-black text-white">
                  <th className="py-2 px-2 sm:px-3 text-left rounded-tl-lg">Name</th>
                  <th className="py-2 px-2 sm:px-3 text-left">Phone</th>
                  <th className="py-2 px-2 sm:px-3 text-left">Total Paid</th>
                  <th className="py-2 px-2 sm:px-3 text-left">Add Payment</th>
                  <th className="py-2 px-2 sm:px-3 text-left">Payments</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
                ) : labours.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted-foreground py-8">No labourers found.</td>
                  </tr>
                ) : (
                  labours.map((labour: any, idx: number) => (
                    <tr key={labour.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                      <td className="py-2 px-2 sm:py-3 sm:px-3 font-medium text-black break-all max-w-[120px] sm:max-w-none">{labour.name}</td>
                      <td className="py-2 px-2 sm:py-3 sm:px-3 text-black break-all max-w-[120px] sm:max-w-none">{labour.phone}</td>
                      <td className="py-2 px-2 sm:py-3 sm:px-3 text-black">₹{labour.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0).toLocaleString('en-IN')}</td>
                      <td className="py-2 px-2 sm:py-3 sm:px-3">
                        <Button size="sm" className="bg-black text-white hover:bg-gray-900 border border-gray-400 w-full sm:w-auto" onClick={() => { setAddPaymentLabour(labour); setAddPaymentModalOpen(true); }}>Add Payment</Button>
                      </td>
                      <td className="py-2 px-2 sm:py-3 sm:px-3 flex items-center gap-2">
                        <span className="underline text-blue-600 cursor-pointer" onClick={() => handleRowClick(labour)}>View</span>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-800 ml-2"
                          onClick={async () => {
                            if (confirm('Delete this labourer and all their payments?')) {
                              const result = await deleteLabour(labour.id);
                              if (result?.success) {
                                toast({ title: 'Deleted', description: 'Labourer deleted.' });
                                await fetchLabours();
                              } else {
                                toast({ title: 'Error', description: 'Could not delete labourer.', variant: 'destructive' });
                              }
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* View Payments Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-full w-[95vw] sm:max-w-lg p-2 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Labour Details</DialogTitle>
          </DialogHeader>
          {selectedLabour && (
            <div>
              <div className="mb-4">
                <div className="font-semibold text-base sm:text-lg mb-1">{selectedLabour.name} ({selectedLabour.phone})</div>
                <div className="bg-gray-100 rounded-lg p-2 sm:p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <div className="text-xs sm:text-sm font-medium text-gray-600">Total Paid</div>
                  <div className="text-lg sm:text-2xl font-bold text-black">₹{selectedLabour.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0).toLocaleString('en-IN')}</div>
                </div>
                <div className="mb-4">
                  <div className="font-medium mb-1 text-xs sm:text-sm">Transactions</div>
                  {selectedLabour.payments.length === 0 ? (
                    <div className="text-muted-foreground">No payments</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse mb-2 min-w-[220px]">
                        <thead>
                          <tr className="bg-gray-300">
                            <th className="text-left">Date</th>
                            <th className="text-left">Amount</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedLabour.payments.map((p: any) => (
                            <tr key={p.id}>
                              <td>{formatDateDMY(p.date)}</td>
                              <td>₹{p.amount}</td>
                              <td>
                                <button
                                  type="button"
                                  className="text-red-600 hover:text-red-800"
                                  onClick={async () => {
                                    if (confirm('Delete this payment?')) {
                                      const result = await deleteLabourPayment(selectedLabour.id, p.id);
                                      if (result?.success) {
                                        toast({ title: 'Deleted', description: 'Payment deleted.' });
                                        await fetchLabours();
                                        const updated = labours.find(l => l.id === selectedLabour.id);
                                        setSelectedLabour(updated);
                                      } else {
                                        toast({ title: 'Error', description: 'Could not delete payment.', variant: 'destructive' });
                                      }
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Add Payment Modal */}
      <AddPaymentModal open={addPaymentModalOpen} onOpenChange={setAddPaymentModalOpen} labour={addPaymentLabour} onPaymentAdded={async () => { setAddPaymentModalOpen(false); setAddPaymentLabour(null); await fetchLabours(); }} />
    </div>
  );
}

function AddPaymentModal({ open, onOpenChange, labour, onPaymentAdded }: { open: boolean, onOpenChange: (v: boolean) => void, labour: any, onPaymentAdded: () => void }) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setCalendarOpen(false);
    if (!open) {
      setAmount('');
      setDate('');
    }
  }, [open]);

  if (!labour) return null;

  async function handleAddPayment(e: any) {
    e.preventDefault();
    setIsPending(true);
    const result = await addLabourPayment(labour.id, { date, amount: Number(amount) });
    setIsPending(false);
    if (result?.errors) {
      toast({ title: 'Error', description: 'Please check the form for errors.', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Payment added.' });
      setAmount('');
      setDate('');
      onPaymentAdded();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full w-[95vw] sm:max-w-lg p-2 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Add Payment for {labour?.name || ''}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddPayment} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
          <div className="relative w-full sm:w-auto">
            <Input
              type="text"
              value={date}
              onClick={() => setCalendarOpen(true)}
              onChange={e => setDate(e.target.value)}
              placeholder="Select date"
              className="w-full sm:w-32 cursor-pointer bg-black text-white border border-gray-400 focus:border-blue-500"
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
                />
              </div>
            )}
          </div>
          <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} required min={1} placeholder="Amount" className="w-full sm:w-24 bg-black text-white border border-gray-400 focus:border-blue-500" />
          <Button type="submit" size="sm" disabled={isPending} className="w-full sm:w-auto bg-black text-white hover:bg-gray-900 border border-gray-400">{isPending ? 'Adding...' : 'Add Payment'}</Button>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 