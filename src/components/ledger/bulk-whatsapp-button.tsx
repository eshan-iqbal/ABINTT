"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2, Copy } from "lucide-react";
import { CustomerSummary } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function BulkWhatsAppButton({ customers }: { customers: CustomerSummary[] | null }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState(
    "Hello {name}, this is a message from AB INTERIOR. Your current balance is {balance}. Thank you for your business!"
  );
  const { toast } = useToast();

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return "0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const sendBulkMessages = async () => {
    if (!customers || customers.length === 0) {
      toast({
        title: "No customers found",
        description: "There are no customers to send messages to.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Create an array of WhatsApp URLs for each customer
      const whatsappUrls = customers.map(customer => {
        // Replace placeholders in the message template
        const personalizedMessage = message
          .replace(/{name}/g, customer.name)
          .replace(/{balance}/g, formatCurrency(customer.balance));
        
        // Encode the message for URL
        const encodedMessage = encodeURIComponent(personalizedMessage);
        
        // Format phone number for WhatsApp (ensure it has country code)
        let phoneNumber = customer.phone;
        // If phone doesn't start with '+' or country code, add Indian country code
        if (!phoneNumber.startsWith('+') && !phoneNumber.startsWith('91')) {
          // Remove leading zeros if any
          phoneNumber = phoneNumber.replace(/^0+/, '');
          // Add Indian country code
          phoneNumber = '91' + phoneNumber;
        } else if (phoneNumber.startsWith('+')) {
          // Remove the '+' as wa.me links don't use it
          phoneNumber = phoneNumber.substring(1);
        }
        
        // Create the WhatsApp URL
        return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      });

      // Open each WhatsApp URL in a new tab
      whatsappUrls.forEach(url => window.open(url, '_blank'));

      toast({
        title: "Links Opened",
        description: `WhatsApp links for ${customers.length} customers have been opened in new tabs. Send the message from each tab.`,
      });

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error generating WhatsApp links:", error);
      toast({
        title: "Error",
        description: "Could not generate WhatsApp links.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyAllMessages = async () => {
    if (!customers || customers.length === 0) {
      toast({
        title: "No customers found",
        description: "There are no customers to copy messages for.",
        variant: "destructive",
      });
      return;
    }
    const allMessages = customers.map(customer =>
      message
        .replace(/{name}/g, customer.name)
        .replace(/{balance}/g, formatCurrency(customer.balance))
    ).join('\n\n');
    try {
      await navigator.clipboard.writeText(allMessages);
      toast({
        title: "Messages Copied",
        description: `Personalized messages for ${customers.length} customers have been copied to your clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy messages to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <MessageCircle className="mr-2 h-4 w-4" /> Send Bulk WhatsApp
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Bulk WhatsApp Messages</DialogTitle>
          <DialogDescription>
            Customize your message to send to {customers?.length || 0} customers. Use <code>{"{name}"}</code> and <code>{"{balance}"}</code> as placeholders.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="message">Message Template</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here..."
              className="min-h-[100px]"
            />
            <div className="text-sm text-muted-foreground mt-2">
              <p className="font-medium">Preview:</p>
              <p className="mt-1 p-2 border rounded-md bg-muted/50">
                {message
                  .replace(/{name}/g, "Customer Name")
                  .replace(/{balance}/g, formatCurrency(1000))}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={sendBulkMessages} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>Generate WhatsApp Links</>
            )}
          </Button>
          <Button variant="outline" onClick={copyAllMessages} disabled={isLoading}>
            <Copy className="mr-2 h-4 w-4" /> Copy All Messages
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}