import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Send, Users, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface BulkEmailFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  leads?: any[];
}

export default function BulkEmailForm({ onSuccess, onCancel, leads = [] }: BulkEmailFormProps) {
  const [formData, setFormData] = useState({
    subject: '',
    body: '',
    emailAccountId: '',
    sendDelay: '0',
    batchSize: '50',
  });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendBulkEmailsMutation = useMutation({
    mutationFn: (emailData: any) => api.sendBulkEmails(emailData),
    onSuccess: (result) => {
      toast({
        title: "Bulk emails queued successfully",
        description: `${result.totalEmails} emails have been queued for sending.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to queue bulk emails",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCsvUpload = async (file: File) => {
    setIsProcessingCsv(true);
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      }).filter(row => row.email && row.email.includes('@')); // Filter valid emails
      
      setCsvData(data);
      toast({
        title: "CSV processed successfully",
        description: `${data.length} valid email addresses found.`,
      });
    } catch (error) {
      toast({
        title: "CSV processing failed",
        description: "Please check your CSV format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingCsv(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.body) {
      toast({
        title: "Missing required fields",
        description: "Please fill in subject and body.",
        variant: "destructive",
      });
      return;
    }

    const emailList = csvData.length > 0 ? csvData : leads;
    
    if (emailList.length === 0) {
      toast({
        title: "No recipients",
        description: "Please upload a CSV or select leads to send emails to.",
        variant: "destructive",
      });
      return;
    }

    const emailData = {
      subject: formData.subject,
      body: formData.body,
      emails: emailList.map(item => ({
        to: item.email,
        name: item.name || '',
        customFields: item
      })),
      emailAccountId: formData.emailAccountId,
      sendDelay: parseInt(formData.sendDelay),
      batchSize: parseInt(formData.batchSize),
    };

    sendBulkEmailsMutation.mutate(emailData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalRecipients = csvData.length > 0 ? csvData.length : leads.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="row">
        <div className="col-md-6">
          <label className="form-label">Subject *</label>
          <Input
            type="text"
            value={formData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            placeholder="Email subject"
            required
            data-testid="input-bulk-email-subject"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Email Account</label>
          <Select value={formData.emailAccountId} onValueChange={(value) => handleInputChange('emailAccountId', value)}>
            <SelectTrigger data-testid="select-email-account">
              <SelectValue placeholder="Select email account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Use default account</SelectItem>
              {/* Email accounts would be fetched from API */}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="form-label">Email Body *</label>
        <Textarea
          value={formData.body}
          onChange={(e) => handleInputChange('body', e.target.value)}
          placeholder="Write your email content here... Use {{name}} for personalization"
          rows={6}
          required
          data-testid="textarea-bulk-email-body"
        />
        <small className="text-muted-foreground">
          Use {{name}} to personalize emails with recipient names
        </small>
      </div>

      <div className="row">
        <div className="col-md-4">
          <label className="form-label">Send Delay (seconds)</label>
          <Input
            type="number"
            value={formData.sendDelay}
            onChange={(e) => handleInputChange('sendDelay', e.target.value)}
            min="0"
            max="3600"
            placeholder="0"
            data-testid="input-send-delay"
          />
          <small className="text-muted-foreground">Delay between each email</small>
        </div>
        <div className="col-md-4">
          <label className="form-label">Batch Size</label>
          <Input
            type="number"
            value={formData.batchSize}
            onChange={(e) => handleInputChange('batchSize', e.target.value)}
            min="1"
            max="1000"
            placeholder="50"
            data-testid="input-batch-size"
          />
          <small className="text-muted-foreground">Emails per batch</small>
        </div>
        <div className="col-md-4">
          <label className="form-label">Total Recipients</label>
          <div className="d-flex align-items-center">
            <Users className="h-4 w-4 mr-2 text-primary" />
            <span className="h5 mb-0">{totalRecipients}</span>
          </div>
        </div>
      </div>

      {/* CSV Upload Section */}
      <div className="metric-card">
        <h6 className="mb-3">Upload Recipients CSV</h6>
        <div className="mb-3">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setCsvFile(file);
                handleCsvUpload(file);
              }
            }}
            className="form-control"
            data-testid="input-csv-file"
          />
          <small className="text-muted-foreground">
            Required columns: email, name (optional). CSV will override selected leads.
          </small>
        </div>
        
        {csvData.length > 0 && (
          <div className="alert alert-success">
            <div className="d-flex align-items-start">
              <FileText className="h-4 w-4 mr-2 mt-1" />
              <div>
                <strong>CSV Loaded:</strong> {csvData.length} email addresses ready for sending.
                <br />
                <small>First few emails: {csvData.slice(0, 3).map(item => item.email).join(', ')}...</small>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="alert alert-info">
        <div className="d-flex align-items-start">
          <Send className="h-4 w-4 mr-2 mt-1" />
          <div>
            <strong>Bulk Email Information:</strong> Emails will be sent in batches to avoid overwhelming email providers. 
            You can monitor progress in the email queue.
          </div>
        </div>
      </div>

      <div className="d-flex gap-2 justify-content-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-testid="button-cancel-bulk-email"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={sendBulkEmailsMutation.isPending || isProcessingCsv || totalRecipients === 0}
          data-testid="button-send-bulk-emails"
        >
          {sendBulkEmailsMutation.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Queuing Emails...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send to {totalRecipients} Recipients
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
