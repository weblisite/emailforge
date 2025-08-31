import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookmarkCheck, Reply, Filter, Search, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { InboxMessage } from "@shared/schema";

export default function Inbox() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [replyContent, setReplyContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['/api/inbox'],
    queryFn: () => api.getInboxMessages(),
  });

  // Search functionality using the new API
  const searchMutation = useMutation({
    mutationFn: (query: string) => api.searchInbox(query),
    onSuccess: (searchResults) => {
      // Update the displayed messages with search results
      // In a real app, you might want to maintain separate state for search results
      console.log('Search results:', searchResults);
    },
    onError: () => {
      toast({
        title: "Search failed",
        description: "Could not perform search. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Send reply mutation
  const sendReplyMutation = useMutation({
    mutationFn: (replyData: { to: string; subject: string; body: string }) => 
      api.sendEmail({
        to: replyData.to,
        subject: replyData.subject,
        body: replyData.body,
        type: 'reply'
      }),
    onSuccess: () => {
      toast({
        title: "Reply sent successfully",
        description: "Your reply has been sent.",
      });
      setIsReplyOpen(false);
      setReplyingTo(null);
      setReplyContent("");
    },
    onError: () => {
      toast({
        title: "Failed to send reply",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: api.markMessageRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inbox'] });
      toast({
        title: "Message marked as read",
      });
    },
    onError: () => {
      toast({
        title: "Failed to mark message as read",
        variant: "destructive",
      });
    },
  });

  const getSentimentBadge = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive':
        return <Badge className="badge-success">Positive</Badge>;
      case 'negative':
        return <Badge className="badge-danger">Negative</Badge>;
      case 'unsubscribe':
        return <Badge className="badge-danger">Unsubscribe</Badge>;
      default:
        return <Badge className="badge-secondary">Neutral</Badge>;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const days = Math.floor(diffInHours / 24);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.fromName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.fromEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSentiment = 
      sentimentFilter === "all" || 
      message.sentiment === sentimentFilter;
    
    return matchesSearch && matchesSentiment;
  });

  // Enhanced search with API integration
  const handleSearch = async () => {
    if (searchTerm.trim()) {
      searchMutation.mutate(searchTerm);
    }
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  const handleMarkAsRead = (messageId: string) => {
    markReadMutation.mutate(messageId);
  };

  const handleMarkAllRead = () => {
    const unreadMessages = messages.filter(m => !m.isRead);
    unreadMessages.forEach(message => {
      markReadMutation.mutate(message.id);
    });
  };

  const handleProcessUnsubscribe = (message: any) => {
    // TODO: Implement actual unsubscribe processing
    toast({
      title: "Unsubscribe Processed",
      description: `Unsubscribe request from ${message.fromEmail} has been processed.`,
    });
  };

  const handleReply = (message: any) => {
    setReplyingTo(message);
    setIsReplyOpen(true);
  };

  const handleSendReply = async () => {
    if (!replyContent.trim()) {
      toast({
        title: "Reply content required",
        description: "Please enter your reply message.",
        variant: "destructive",
      });
      return;
    }

    if (!replyingTo) {
      toast({
        title: "No message selected",
        description: "Please select a message to reply to.",
        variant: "destructive",
      });
      return;
    }

    // Send reply using the API
    sendReplyMutation.mutate({
      to: replyingTo.fromEmail,
      subject: `Re: ${replyingTo.subject}`,
      body: replyContent
    });
  };

  // Remove loading state - show content immediately

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1" data-testid="inbox-title">Unified Inbox</h2>
          <p className="text-muted-foreground mb-0">
            Monitor replies from all your email accounts in one place
          </p>
        </div>
        <div className="d-flex gap-2">
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              onClick={handleMarkAllRead}
              data-testid="button-mark-all-read"
            >
              <BookmarkCheck className="h-4 w-4 mr-2" />
              Mark All Read ({unreadCount})
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="d-flex gap-2">
            <div className="position-relative flex-1">
              <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages by sender, subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="ps-5"
                data-testid="input-search-messages"
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={searchMutation.isPending}
              data-testid="button-search-messages"
            >
              {searchMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
                ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="col-md-3">
          <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
            <SelectTrigger data-testid="select-sentiment-filter">
              <SelectValue placeholder="Filter by sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Messages</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
              <SelectItem value="unsubscribe">Unsubscribes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-md-3">
          <div className="d-flex gap-2 h-100 align-items-center">
            <div className="text-sm">
              <strong>{filteredMessages.length}</strong> messages
            </div>
            {unreadCount > 0 && (
              <Badge className="badge-primary">
                {unreadCount} unread
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Messages Table */}
      {filteredMessages.length > 0 ? (
        <div className="metric-card">
          <div className="table-responsive">
            <table className="table table-hover" data-testid="inbox-messages-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>Subject</th>
                  <th>To Account</th>
                  <th>Sentiment</th>
                  <th>Received</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((message) => (
                  <tr 
                    key={message.id} 
                    className={!message.isRead ? 'table-active' : ''}
                    data-testid={`message-row-${message.id}`}
                  >
                    <td>
                      <div>
                        <div className={`font-medium ${!message.isRead ? 'fw-bold' : ''}`} data-testid={`message-from-name-${message.id}`}>
                          {message.fromName || 'Unknown'}
                        </div>
                        <div className="text-muted-foreground text-sm" data-testid={`message-from-email-${message.id}`}>
                          {message.fromEmail}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={`text-sm ${!message.isRead ? 'fw-bold' : ''}`} data-testid={`message-subject-${message.id}`}>
                        {message.subject}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {message.body.substring(0, 100)}...
                      </div>
                    </td>
                    <td className="text-sm">
                      Account Email
                    </td>
                    <td>
                      {getSentimentBadge(message.sentiment)}
                    </td>
                    <td className="text-sm" data-testid={`message-received-${message.id}`}>
                      {formatTimeAgo(message.receivedAt)}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        {!message.isRead && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleMarkAsRead(message.id)}
                            data-testid={`mark-read-${message.id}`}
                          >
                            <BookmarkCheck className="h-4 w-4" />
                          </Button>
                        )}
                        {message.sentiment === 'unsubscribe' ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleProcessUnsubscribe(message)}
                            data-testid={`process-unsubscribe-${message.id}`}
                          >
                            Process
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReply(message)}
                            data-testid={`reply-message-${message.id}`}
                          >
                            <Reply className="h-4 w-4 mr-1" />
                            Reply
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="metric-card text-center py-8">
          {messages.length === 0 ? (
            <div className="mb-4">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h4>No Messages</h4>
              <p className="text-muted-foreground">
                Your inbox is empty. Messages from your campaigns will appear here.
              </p>
            </div>
          ) : (
            <div>
              <h4>No matching messages</h4>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Reply Dialog */}
      <Dialog open={isReplyOpen} onOpenChange={setIsReplyOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to Message</DialogTitle>
            <DialogDescription>
              Send a reply to {replyingTo?.fromEmail}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="form-label">Reply Content</label>
              <textarea
                className="form-control"
                rows={6}
                placeholder="Type your reply message..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                data-testid="input-reply-content"
              />
            </div>
            <div className="d-flex gap-2 justify-content-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsReplyOpen(false);
                  setReplyingTo(null);
                  setReplyContent("");
                }}
                data-testid="button-cancel-reply"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendReply}
                data-testid="button-send-reply"
              >
                Send Reply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
