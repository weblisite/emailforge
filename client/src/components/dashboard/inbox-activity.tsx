import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { InboxMessage } from "@shared/schema";

interface InboxActivityProps {
  messages: InboxMessage[];
}

export default function InboxActivity({ messages }: InboxActivityProps) {
  const getSentimentBadge = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive':
        return { className: 'badge-success', text: 'Positive' };
      case 'negative':
        return { className: 'badge-danger', text: 'Negative' };
      case 'unsubscribe':
        return { className: 'badge-danger', text: 'Unsubscribe' };
      default:
        return { className: 'badge-secondary', text: 'Neutral' };
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div className="table-responsive">
      <table className="table table-hover" data-testid="inbox-activity-table">
        <thead>
          <tr>
            <th>Contact</th>
            <th>Subject</th>
            <th>Campaign</th>
            <th>Account</th>
            <th>Status</th>
            <th>Received</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {messages.slice(0, 10).map((message) => {
            const sentimentInfo = getSentimentBadge(message.sentiment);
            return (
              <tr key={message.id} data-testid={`message-row-${message.id}`}>
                <td>
                  <div>
                    <div className="font-medium" data-testid={`message-from-name-${message.id}`}>
                      {message.fromName || 'Unknown'}
                    </div>
                    <div className="text-muted-foreground text-sm" data-testid={`message-from-email-${message.id}`}>
                      {message.fromEmail}
                    </div>
                  </div>
                </td>
                <td className="text-sm" data-testid={`message-subject-${message.id}`}>
                  {message.subject}
                </td>
                <td>
                  <Badge className="badge-primary">
                    Campaign
                  </Badge>
                </td>
                <td className="text-sm">
                  Account Email
                </td>
                <td>
                  <Badge className={sentimentInfo.className}>
                    {sentimentInfo.text}
                  </Badge>
                </td>
                <td className="text-sm" data-testid={`message-received-${message.id}`}>
                  {formatTimeAgo(message.receivedAt)}
                </td>
                <td>
                  {message.sentiment === 'unsubscribe' ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      data-testid={`process-unsubscribe-${message.id}`}
                    >
                      Process
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      data-testid={`reply-message-${message.id}`}
                    >
                      Reply
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {messages.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No recent inbox activity.</p>
        </div>
      )}
    </div>
  );
}
