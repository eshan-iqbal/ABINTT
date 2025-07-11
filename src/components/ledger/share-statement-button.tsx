
"use client";

import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from "@/components/ui/button";
import { Share2, Loader2 } from "lucide-react";
import type { CustomerWithSummary } from '@/lib/types';

export function ShareStatementButton({ customer }: { customer: CustomerWithSummary }) {
    const [isLoading, setIsLoading] = useState(false);

    const generateAndSharePdf = async () => {
        setIsLoading(true);

        const statementElement = document.getElementById('statement-content');
        if (!statementElement) {
            console.error("Statement content element not found!");
            setIsLoading(false);
            return;
        }

        try {
            // Use html2canvas to render the div to a canvas
            const canvas = await html2canvas(statementElement, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            // Create a PDF from the canvas
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4',
            });
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            
            // Get PDF as a Blob
            const pdfBlob = pdf.output('blob');
            
            // Create a file from the Blob
            const pdfFile = new File([pdfBlob], `statement-${customer.name.replace(/\s+/g, '_')}.pdf`, { type: 'application/pdf' });
            
            const formatCurrency = (amount: number) => {
                return new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                }).format(amount);
            };

            // Use the Web Share API
            if (navigator.share && navigator.canShare({ files: [pdfFile] })) {
                await navigator.share({
                    files: [pdfFile],
                    title: `Payment Statement for ${customer.name}`,
                    text: `Hello ${customer.name}, here is your payment statement from AB INTERIOR. Your current balance is ${formatCurrency(customer.balance)}. Thank you!`,
                });
            } else {
                // Fallback for browsers that don't support Web Share API
                const link = document.createElement('a');
                link.href = URL.createObjectURL(pdfBlob);
                link.download = `statement-${customer.name.replace(/\s+/g, '_')}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                alert("Statement downloaded. You can now share it via WhatsApp manually.");
            }
        } catch (error) {
            console.error("Error generating or sharing PDF:", error);
            alert("Could not generate or share the PDF. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button onClick={generateAndSharePdf} disabled={isLoading}>
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
            ) : (
                <>
                    <Share2 className="mr-2 h-4 w-4" /> Share Statement
                </>
            )}
        </Button>
    );
}
