import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Globe, Zap, RefreshCw, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface WebhookFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: {
    name?: string;
    url?: string;
    events?: string[];
    isActive?: boolean;
  };
}

export default function WebhookForm({ onSuccess, onCancel, initialData }: WebhookFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    url: initialData?.url || '',
    events: initialData?.events || ['lead.created'],
    isActive: initialData?.isActive ?? true,
    secret: '',
    description: '',
  });
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createWebhookMutation = useMutation({
    mutationFn: (webhookData: any) => api.createWebhook(webhookData),
    onSuccess: (result) => {
      toast({
        title: "Webhook created successfully",
        description: `Webhook "${result.name}" has been configured.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create webhook",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.url) {
      toast({
        title: "Missing required fields",
        description: "Please fill in webhook name and URL.",
        variant: "destructive",
      });
      return;
    }

    // Validate URL format
    try {
      new URL(formData.url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL including protocol (http:// or https://).",
        variant: "destructive",
      });
      return;
    }

    const webhookData = {
      name: formData.name,
      url: formData.url,
      events: formData.events,
      isActive: formData.isActive,
      secret: formData.secret,
      description: formData.description,
    };

    createWebhookMutation.mutate(webhookData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEventToggle = (event: string) => {
    const currentEvents = [...formData.events];
    if (currentEvents.includes(event)) {
      handleInputChange('events', currentEvents.filter(e => e !== event));
    } else {
      handleInputChange('events', [...currentEvents, event]);
    }
  };

  const testWebhook = async () => {
    setIsTesting(true);
    try {
      // This would call a test endpoint in a real implementation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast({
        title: "Test webhook sent",
        description: "A test payload has been sent to your webhook URL.",
      });
    } catch (error) {
      toast({
        title: "Test failed",
        description: "Could not send test webhook. Please check your URL.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const availableEvents = [
    { value: 'lead.created', label: 'Lead Created', description: 'When a new lead is added' },
    { value: 'lead.updated', label: 'Lead Updated', description: 'When a lead is modified' },
    { value: 'lead.deleted', label: 'Lead Deleted', description: 'When a lead is removed' },
    { value: 'campaign.created', label: 'Campaign Created', description: 'When a campaign is created' },
    { value: 'campaign.started', label: 'Campaign Started', description: 'When a campaign begins' },
    { value: 'campaign.completed', label: 'Campaign Completed', description: 'When a campaign finishes' },
    { value: 'email.sent', label: 'Email Sent', description: 'When an email is sent' },
    { value: 'email.opened', label: 'Email Opened', description: 'When an email is opened' },
    { value: 'email.replied', label: 'Email Replied', description: 'When an email receives a reply' },
    { value: 'email.bounced', label: 'Email Bounced', description: 'When an email bounces' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="row">
        <div className="col-md-6">
          <label className="form-label">Webhook Name *</label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="My Webhook"
            required
            data-testid="input-webhook-name"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Webhook URL *</label>
          <Input
            type="url"
            value={formData.url}
            onChange={(e) => handleInputChange('url', e.target.value)}
            placeholder="https://your-domain.com/webhook"
            required
            data-testid="input-webhook-url"
          />
        </div>
      </div>

      <div>
        <label className="form-label">Description</label>
        <Input
          type="text"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Optional description of this webhook"
          data-testid="input-webhook-description"
        />
      </div>

      <div className="row">
        <div className="col-md-6">
          <label className="form-label">Webhook Secret</label>
          <Input
            type="text"
            value={formData.secret}
            onChange={(e) => handleInputChange('secret', e.target.value)}
            placeholder="Optional secret for security"
            data-testid="input-webhook-secret"
          />
          <small className="text-muted-foreground">
            Used to verify webhook authenticity
          </small>
        </div>
        <div className="col-md-6">
          <label className="form-label">Status</label>
          <Select value={formData.isActive ? 'active' : 'inactive'} onValueChange={(value) => handleInputChange('isActive', value === 'active')}>
            <SelectTrigger data-testid="select-webhook-status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Event Selection */}
      <div className="metric-card">
        <h6 className="mb-3">Select Events to Listen For</h6>
        <div className="row">
          {availableEvents.map((event) => (
            <div key={event.value} className="col-md-6 mb-2">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={event.value}
                  checked={formData.events.includes(event.value)}
                  onChange={() => handleEventToggle(event.value)}
                  data-testid={`checkbox-event-${event.value}`}
                />
                <label className="form-check-label" htmlFor={event.value}>
                  <div className="font-medium">{event.label}</div>
                  <small className="text-muted-foreground">{event.description}</small>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Webhook */}
      <div className="metric-card">
        <h6 className="mb-3">Test Your Webhook</h6>
        <p className="text-muted-foreground mb-3">
          Send a test payload to verify your webhook is working correctly.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={testWebhook}
          disabled={isTesting || !formData.url}
          data-testid="button-test-webhook"
        >
          {isTesting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <TestTube className="h-4 w-4 mr-2" />
              Test Webhook
            </>
          )}
        </Button>
      </div>

      <div className="alert alert-info">
        <div className="d-flex align-items-start">
          <Zap className="h-4 w-4 mr-2 mt-1" />
          <div>
            <strong>Webhook Information:</strong> Webhooks will send HTTP POST requests to your URL whenever the selected events occur. 
            Make sure your endpoint can handle POST requests and returns a 2xx status code.
          </div>
        </div>
      </div>

      <div className="d-flex gap-2 justify-content-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-testid="button-cancel-webhook"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createWebhookMutation.isPending}
          data-testid="button-create-webhook"
        >
          {createWebhookMutation.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Globe className="h-4 w-4 mr-2" />
              Create Webhook
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
