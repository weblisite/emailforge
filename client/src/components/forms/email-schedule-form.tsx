import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, Mail, Send, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface EmailScheduleFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: {
    to?: string;
    subject?: string;
    body?: string;
  };
}

export default function EmailScheduleForm({ onSuccess, onCancel, initialData }: EmailScheduleFormProps) {
  const [formData, setFormData] = useState({
    to: initialData?.to || '',
    subject: initialData?.subject || '',
    body: initialData?.body || '',
    scheduledFor: '',
    scheduledTime: '',
    priority: 'normal',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const scheduleEmailMutation = useMutation({
    mutationFn: (emailData: any) => api.scheduleEmail(emailData),
    onSuccess: (result) => {
      toast({
        title: "Email scheduled successfully",
        description: `Email will be sent on ${new Date(result.scheduledFor).toLocaleString()}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to schedule email",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.to || !formData.subject || !formData.body || !formData.scheduledFor || !formData.scheduledTime) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const scheduledDateTime = new Date(`${formData.scheduledFor}T${formData.scheduledTime}`);
    
    if (scheduledDateTime <= new Date()) {
      toast({
        title: "Invalid schedule time",
        description: "Please select a future date and time.",
        variant: "destructive",
      });
      return;
    }

    const emailData = {
      to: formData.to,
      subject: formData.subject,
      body: formData.body,
      scheduledFor: scheduledDateTime.toISOString(),
      priority: formData.priority,
    };

    scheduleEmailMutation.mutate(emailData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="row">
        <div className="col-md-6">
          <label className="form-label">Recipient Email *</label>
          <Input
            type="email"
            value={formData.to}
            onChange={(e) => handleInputChange('to', e.target.value)}
            placeholder="recipient@example.com"
            required
            data-testid="input-recipient-email"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Subject *</label>
          <Input
            type="text"
            value={formData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            placeholder="Email subject"
            required
            data-testid="input-email-subject"
          />
        </div>
      </div>

      <div>
        <label className="form-label">Email Body *</label>
        <Textarea
          value={formData.body}
          onChange={(e) => handleInputChange('body', e.target.value)}
          placeholder="Write your email content here..."
          rows={6}
          required
          data-testid="textarea-email-body"
        />
      </div>

      <div className="row">
        <div className="col-md-4">
          <label className="form-label">Schedule Date *</label>
          <div className="position-relative">
            <Calendar className="position-absolute top-50 start-0 translate-middle-y ms-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={formData.scheduledFor}
              onChange={(e) => handleInputChange('scheduledFor', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
              className="ps-5"
              data-testid="input-schedule-date"
            />
          </div>
        </div>
        <div className="col-md-4">
          <label className="form-label">Schedule Time *</label>
          <div className="position-relative">
            <Clock className="position-absolute top-50 start-0 translate-middle-y ms-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="time"
              value={formData.scheduledTime}
              onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
              required
              className="ps-5"
              data-testid="input-schedule-time"
            />
          </div>
        </div>
        <div className="col-md-4">
          <label className="form-label">Priority</label>
          <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
            <SelectTrigger data-testid="select-email-priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="alert alert-info">
        <div className="d-flex align-items-start">
          <Calendar className="h-4 w-4 mr-2 mt-1" />
          <div>
            <strong>Scheduling Information:</strong> Your email will be queued and sent at the specified date and time. 
            You can modify or cancel scheduled emails from the email queue.
          </div>
        </div>
      </div>

      <div className="d-flex gap-2 justify-content-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-testid="button-cancel-schedule"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={scheduleEmailMutation.isPending}
          data-testid="button-schedule-email"
        >
          {scheduleEmailMutation.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Scheduling...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Schedule Email
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
