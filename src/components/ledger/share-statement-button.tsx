
"use client";

import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from "@/components/ui/button";
import { Share2, Loader2 } from "lucide-react";
import type { CustomerWithSummary } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';


export function ShareStatementButton({ customer }: { customer: CustomerWithSummary }) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

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
                scale: 1.5, // Reduced scale for smaller file size
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            // Create a PDF from the canvas
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4',
            });
            const imgData = canvas.toDataURL('image/png', 0.9); // Use JPG with quality setting for compression
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            
            // Get PDF as a Blob
            const pdfBlob = pdf.output('blob');
            
            // Create a file from the Blob
            const pdfFile = new File([pdfBlob], `statement-${customer.name.replace(/\s+/g, '_')}.pdf`, { type: 'application/pdf' });
            
            const shareText = `Hello ${customer.name}, here is your payment statement from AB INTERIOR.`;

            // Use the Web Share API
            if (navigator.share && navigator.canShare({ files: [pdfFile] })) {
                // For mobile, also copy the text to clipboard for convenience
                 if (navigator.clipboard) {
                    await navigator.clipboard.writeText(shareText);
                    toast({
                        title: "Message Copied",
                        description: "A friendly message has been copied to your clipboard.",
                    });
                }
                
                await navigator.share({
                    files: [pdfFile],
                    title: `Payment Statement for ${customer.name}`,
                    text: shareText, // This text might be used by some apps
                });

            } else {
                // Fallback for browsers that don't support Web Share API (e.g., desktop)
                const link = document.createElement('a');
                link.href = URL.createObjectURL(pdfBlob);
                link.download = `statement-${customer.name.replace(/\s+/g, '_')}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast({
                    title: "Statement Downloaded",
                    description: "The PDF has been downloaded. You can now share it manually.",
                });
            }
        } catch (error) {
            console.error("Error generating or sharing PDF:", error);
            if ((error as any).name !== 'AbortError') { // Don't show error if user cancels share
                 toast({
                    title: "Error",
                    description: "Could not generate or share the PDF.",
                    variant: "destructive",
                });
            }
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
