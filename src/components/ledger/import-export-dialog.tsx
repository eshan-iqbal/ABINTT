"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, FileText, FileJson, AlertCircle, CheckCircle, Info, ChevronDown, ChevronRight } from "lucide-react";
import { exportCustomersCSV, exportCustomersJSON, importCustomersCSV, importCustomersJSON } from "@/app/actions";
import { downloadCSV, downloadJSON, readFileAsText } from "@/lib/utils";

interface ImportExportDialogProps {
  children: React.ReactNode;
}

export function ImportExportDialog({ children }: ImportExportDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("export");
  const [isLoading, setIsLoading] = React.useState(false);
  const [importData, setImportData] = React.useState("");
  const [importFile, setImportFile] = React.useState<File | null>(null);
  const [importResult, setImportResult] = React.useState<{ success: number; errors: string[]; duplicates: number } | null>(null);
  const [showFormatInfo, setShowFormatInfo] = React.useState(false);
  const { toast } = useToast();

  // Sample data for templates
  const sampleCSVData = `Name,Phone,Address,Bill Number,Amount Paid,Amount Due
John Doe,9876543210,123 Main Street City State,BILL001,5000,15000
Jane Smith,9876543211,456 Oak Avenue City State,BILL002,8000,12000
Mike Johnson,9876543212,789 Pine Road City State,BILL003,3000,20000
Sarah Wilson,9876543213,321 Elm Street City State,BILL004,0,25000
Tom Brown,9876543214,654 Maple Drive City State,BILL005,15000,0`;

  const sampleJSONData = `[
  {
    "name": "John Doe",
    "phone": "9876543210",
    "address": "123 Main Street, City, State",
    "billNumber": "BILL001",
    "amountPaid": 5000,
    "amountDue": 15000
  },
  {
    "name": "Jane Smith", 
    "phone": "9876543211",
    "address": "456 Oak Avenue, City, State",
    "billNumber": "BILL002",
    "amountPaid": 8000,
    "amountDue": 12000
  },
  {
    "name": "Mike Johnson",
    "phone": "9876543212", 
    "address": "789 Pine Road, City, State",
    "billNumber": "BILL003",
    "amountPaid": 3000,
    "amountDue": 20000
  }
]`;

  const downloadSampleCSV = () => {
    downloadCSV(sampleCSVData, 'customer-import-template.csv');
    toast({
      title: "Template Downloaded",
      description: "CSV template has been downloaded.",
    });
  };

  const downloadSampleJSON = () => {
    downloadJSON(sampleJSONData, 'customer-import-template.json');
    toast({
      title: "Template Downloaded", 
      description: "JSON template has been downloaded.",
    });
  };

  const handleExportCSV = async () => {
    setIsLoading(true);
    try {
      const result = await exportCustomersCSV();
      if (result.success && result.data) {
        downloadCSV(result.data, `customers-${new Date().toISOString().split('T')[0]}.csv`);
        toast({
          title: "Export Successful",
          description: "Customer data has been exported to CSV.",
        });
      } else {
        toast({
          title: "Export Failed",
          description: "Failed to export customer data.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "An unexpected error occurred during export.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportJSON = async () => {
    setIsLoading(true);
    try {
      const result = await exportCustomersJSON();
      if (result.success && result.data) {
        downloadJSON(result.data, `customers-${new Date().toISOString().split('T')[0]}.json`);
        toast({
          title: "Export Successful",
          description: "Customer data has been exported to JSON.",
        });
      } else {
        toast({
          title: "Export Failed",
          description: "Failed to export customer data.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "An unexpected error occurred during export.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      try {
        const content = await readFileAsText(file);
        setImportData(content);
      } catch (error) {
        toast({
          title: "File Read Error",
          description: "Failed to read the selected file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleImportCSV = async () => {
    if (!importData.trim()) {
      toast({
        title: "Import Error",
        description: "Please provide CSV data to import.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await importCustomersCSV(importData);
      if (result.success) {
        setImportResult(result.result);
        toast({
          title: "Import Successful",
          description: `Successfully imported ${result.result.success} customers.`,
        });
        // Reset form
        setImportData("");
        setImportFile(null);
        if (result.result.success > 0) {
          setOpen(false);
        }
      } else {
        toast({
          title: "Import Failed",
          description: "Failed to import customers.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "An unexpected error occurred during import.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportJSON = async () => {
    if (!importData.trim()) {
      toast({
        title: "Import Error",
        description: "Please provide JSON data to import.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await importCustomersJSON(importData);
      if (result.success) {
        setImportResult(result.result);
        toast({
          title: "Import Successful",
          description: `Successfully imported ${result.result.success} customers.`,
        });
        // Reset form
        setImportData("");
        setImportFile(null);
        if (result.result.success > 0) {
          setOpen(false);
        }
      } else {
        toast({
          title: "Import Failed",
          description: "Failed to import customers.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "An unexpected error occurred during import.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setImportData("");
    setImportFile(null);
    setImportResult(null);
    setActiveTab("export");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={resetForm}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import & Export Customers</DialogTitle>
          <DialogDescription>
            Import customers from CSV/JSON files or export your current customer data.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="export-csv">Export to CSV</Label>
                  <p className="text-sm text-muted-foreground">
                    Download customer data in CSV format for use in spreadsheets.
                  </p>
                </div>
                <Button onClick={handleExportCSV} disabled={isLoading}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="export-json">Export to JSON</Label>
                  <p className="text-sm text-muted-foreground">
                    Download customer data in JSON format for backup or integration.
                  </p>
                </div>
                <Button onClick={handleExportJSON} disabled={isLoading}>
                  <Download className="mr-2 h-4 w-4" />
                  Export JSON
                </Button>
              </div>

              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <strong>Export Information:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>CSV export includes: Name, Phone, Address, Bill Number, Amount Paid, Amount Due, Total Due, Total Paid, Balance</li>
                      <li>JSON export includes all customer data plus transaction history</li>
                      <li>Files are automatically named with current date (e.g., customers-2024-01-15.csv)</li>
                      <li>Phone numbers are exported with +91 prefix as stored in database</li>
                      <li>Amount fields are exported as numeric values</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="import-file">Upload File</Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".csv,.json,.txt"
                  onChange={handleFileChange}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Supported formats: CSV, JSON, or plain text files.
                </p>
              </div>

              <div>
                <Label htmlFor="import-data">Or Paste Data</Label>
                <Textarea
                  id="import-data"
                  placeholder="Paste your CSV or JSON data here..."
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="mt-1 min-h-[120px]"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Download Sample Templates</Label>
                  <p className="text-sm text-muted-foreground">
                    Use these templates to understand the expected format for importing customers.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={downloadSampleCSV}>
                    <FileText className="mr-2 h-3 w-3" />
                    CSV Template
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadSampleJSON}>
                    <FileJson className="mr-2 h-3 w-3" />
                    JSON Template
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg">
                <button
                  type="button"
                  onClick={() => setShowFormatInfo(!showFormatInfo)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Import Format Requirements</span>
                  </div>
                  {showFormatInfo ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                {showFormatInfo && (
                  <div className="px-4 pb-4 space-y-3 border-t">
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Required Fields:</strong>
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                          <li><code>Name</code> - Customer's full name (minimum 2 characters)</li>
                          <li><code>Phone</code> - Phone number (minimum 10 digits, will be prefixed with +91)</li>
                          <li><code>Address</code> - Customer's address (minimum 5 characters)</li>
                          <li><code>Bill Number</code> - Customer's bill number (optional)</li>
                          <li><code>Amount Paid</code> - Total amount paid by customer (must be 0 or greater)</li>
                          <li><code>Amount Due</code> - Total amount due from customer (must be 0 or greater)</li>
                        </ul>
                      </div>
                      
                      <div>
                        <strong>CSV Format:</strong>
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                          <li>First row must contain headers: Name, Phone, Address, Bill Number, Amount Paid, Amount Due</li>
                          <li>Use commas to separate values</li>
                          <li>Text fields with commas should be wrapped in quotes</li>
                          <li>One customer per row</li>
                          <li>Amount fields should be numeric values</li>
                        </ul>
                      </div>
                      
                      <div>
                        <strong>JSON Format:</strong>
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                          <li>Array of customer objects</li>
                          <li>Each object should have name, phone, address, billNumber, amountPaid, and amountDue properties</li>
                          <li>Phone numbers will be automatically formatted with +91 prefix</li>
                          <li>Amount fields should be numeric values</li>
                        </ul>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <strong className="text-blue-800">Note:</strong>
                        <p className="text-blue-700 mt-1">
                          Phone numbers will be automatically formatted. If you provide "9876543210", 
                          it will be stored as "+919876543210". Duplicate phone numbers will be automatically skipped 
                          (only unique customers will be imported). Bill numbers are optional. Amount fields must be numeric values.
                        </p>
                        <p className="text-blue-700 mt-2">
                          <strong>Balance Calculation:</strong> The system automatically creates transaction records from your 
                          Amount Paid and Amount Due values. Amount Due creates a DEBIT transaction (bill), Amount Paid creates 
                          a CREDIT transaction (payment). The balance is calculated from these transactions.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleImportCSV} disabled={isLoading || !importData.trim()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import CSV
                </Button>
                <Button onClick={handleImportJSON} disabled={isLoading || !importData.trim()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import JSON
                </Button>
              </div>

              {importResult && (
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Import Results</span>
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-green-600">
                      Successfully imported: {importResult.success} customers
                    </p>
                    
                    {importResult.duplicates > 0 && (
                      <p className="text-amber-600">
                        Skipped duplicates: {importResult.duplicates} customers (already exist in database)
                      </p>
                    )}
                    
                    {importResult.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-red-600 font-medium">Errors ({importResult.errors.length}):</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {importResult.errors.map((error, index) => (
                            <li key={index} className="text-red-600 text-xs">{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
