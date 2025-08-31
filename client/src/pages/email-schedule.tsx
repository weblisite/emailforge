import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import EmailScheduleForm from "@/components/forms/email-schedule-form";

export default function EmailSchedule() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  // Fetch scheduled emails (this would be implemented in the API)
  const { data: scheduledEmails = [], isLoading } = useQuery({
    queryKey: ['/api/emails/scheduled'],
    queryFn: () => api.getScheduledEmails?.() || Promise.resolve([]),
    enabled: false, // Disabled for now since this endpoint doesn't exist yet
  });

  const handleScheduleSuccess = () => {
    setIsFormOpen(false);
    toast({
      title: "Email scheduled successfully",
      description: "Your email has been added to the queue.",
    });
  };

  // Remove loading state - show content immediately

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1" data-testid="email-schedule-title">Email Scheduler</h2>
          <p className="text-muted-foreground mb-0">
            Schedule emails to be sent at specific dates and times
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-schedule-email">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule New Email
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Schedule Email</DialogTitle>
              <DialogDescription>
                Set up an email to be sent automatically at a specific date and time.
              </DialogDescription>
            </DialogHeader>
            <EmailScheduleForm 
              onSuccess={handleScheduleSuccess}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="metric-card text-center py-3">
            <div className="h5 mb-1 text-primary">{scheduledEmails.length}</div>
            <div className="text-muted-foreground text-sm">Scheduled Emails</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="metric-card text-center py-3">
            <div className="h5 mb-1 text-success">
              {scheduledEmails.filter(e => new Date(e.scheduledFor) > new Date()).length}
            </div>
            <div className="text-muted-foreground text-sm">Pending</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="metric-card text-center py-3">
            <div className="h5 mb-1 text-warning">
              {scheduledEmails.filter(e => new Date(e.scheduledFor) <= new Date()).length}
            </div>
            <div className="text-muted-foreground text-sm">Sent Today</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="metric-card text-center py-3">
            <div className="h5 mb-1 text-info">
              {scheduledEmails.filter(e => e.priority === 'high').length}
            </div>
            <div className="text-muted-foreground text-sm">High Priority</div>
          </div>
        </div>
      </div>

      {/* Scheduled Emails List */}
      <div className="metric-card">
        <h5 className="mb-3">Scheduled Emails</h5>
        
        {scheduledEmails.length === 0 ? (
          <div className="text-center py-4">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <div className="text-muted-foreground">No scheduled emails yet</div>
            <small>Schedule your first email to get started</small>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th>Subject</th>
                  <th>Scheduled For</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scheduledEmails.map((email) => (
                  <tr key={email.id}>
                    <td>{email.to}</td>
                    <td>{email.subject}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        {new Date(email.scheduledFor).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        email.priority === 'high' ? 'badge-warning' :
                        email.priority === 'urgent' ? 'badge-danger' :
                        email.priority === 'low' ? 'badge-secondary' : 'badge-primary'
                      }`}>
                        {email.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        new Date(email.scheduledFor) > new Date() ? 'badge-warning' : 'badge-success'
                      }`}>
                        {new Date(email.scheduledFor) > new Date() ? 'Pending' : 'Sent'}
                      </span>
                    </td>
                    <td>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Information Section */}
      <div className="row mt-4">
        <div className="col-lg-6 mb-4">
          <div className="metric-card">
            <h6 className="mb-3">How Email Scheduling Works</h6>
            <div className="space-y-2">
              <div className="d-flex align-items-start">
                <div className="bg-primary rounded-circle me-2 mt-1" style={{ width: '8px', height: '8px' }}></div>
                <div>
                  <strong>Set Schedule:</strong> Choose the exact date and time for your email
                </div>
              </div>
              <div className="d-flex align-items-start">
                <div className="bg-primary rounded-circle me-2 mt-1" style={{ width: '8px', height: '8px' }}></div>
                <div>
                  <strong>Queue Management:</strong> Emails are automatically queued and sent
                </div>
              </div>
              <div className="d-flex align-items-start">
                <div className="bg-primary rounded-circle me-2 mt-1" style={{ width: '8px', height: '8px' }}></div>
                <div>
                  <strong>Priority System:</strong> High-priority emails are processed first
                </div>
              </div>
              <div className="d-flex align-items-start">
                <div className="bg-primary rounded-circle me-2 mt-1" style={{ width: '8px', height: '8px' }}></div>
                <div>
                  <strong>Delivery Tracking:</strong> Monitor the status of scheduled emails
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-6 mb-4">
          <div className="metric-card">
            <h6 className="mb-3">Best Practices</h6>
            <div className="space-y-2">
              <div className="d-flex align-items-start">
                <div className="bg-success rounded-circle me-2 mt-1" style={{ width: '8px', height: '8px' }}></div>
                <div>
                  <strong>Optimal Timing:</strong> Schedule emails during business hours for better engagement
                </div>
              </div>
              <div className="d-flex align-items-start">
                <div className="bg-success rounded-circle me-2 mt-1" style={{ width: '8px', height: '8px' }}></div>
                <div>
                  <strong>Batch Scheduling:</strong> Spread emails over time to avoid overwhelming recipients
                </div>
              </div>
              <div className="d-flex align-items-start">
                <div className="bg-success rounded-circle me-2 mt-1" style={{ width: '8px', height: '8px' }}></div>
                <div>
                  <strong>Priority Management:</strong> Use priority levels for time-sensitive communications
                </div>
              </div>
              <div className="d-flex align-items-start">
                <div className="bg-success rounded-circle me-2 mt-1" style={{ width: '8px', height: '8px' }}></div>
                <div>
                  <strong>Review & Edit:</strong> You can modify scheduled emails before they're sent
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
