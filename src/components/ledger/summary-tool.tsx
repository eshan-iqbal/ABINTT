"use client";

import { useState } from "react";
import { generateSummary } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { SummarizeTransactionsInput } from "@/ai/flows/summarize-transactions";
import { Bot, FileText } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

export function SummaryTool({ customerId }: { customerId: string }) {
  const [summaryType, setSummaryType] = useState<SummarizeTransactionsInput['summaryType']>('latest');
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setSummary(null);
    try {
      const result = await generateSummary(customerId, summaryType);
      setSummary(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to generate summary.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">AI Summary Tool</CardTitle>
        </div>
        <CardDescription>
          Generate an AI-powered summary of the customer's transactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Select
            value={summaryType}
            onValueChange={(value: SummarizeTransactionsInput['summaryType']) => setSummaryType(value)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select summary type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest Transactions</SelectItem>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="balance">Balance Summary</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateSummary} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? "Generating..." : "Generate Summary"}
          </Button>
        </div>
        
        {(isLoading || summary) && (
            <div className="mt-6 p-4 bg-background/50 rounded-lg border">
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                ) : (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{summary}</p>
                )}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
