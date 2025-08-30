import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, Shield, TestTube, Database, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function Settings() {
  const [deliverabilityTest, setDeliverabilityTest] = useState({
    fromEmail: "",
    subject: "",
    body: ""
  });
  const [domainToCheck, setDomainToCheck] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: () => api.me(),
  });

  const deliverabilityTestMutation = useMutation({
    mutationFn: api.testDeliverability,
    onSuccess: (result) => {
      toast({
        title: "Deliverability test completed",
        description: `Spam score: ${result.spamScore}/10 | Status: ${result.blacklistStatus}`,
      });
    },
    onError: () => {
      toast({
        title: "Deliverability test failed",
        description: "Please check your inputs and try again.",
        variant: "destructive",
      });
    },
  });

  const domainReputationMutation = useMutation({
    mutationFn: api.checkDomainReputation,
    onSuccess: (result) => {
      toast({
        title: "Domain reputation check completed",
        description: `Score: ${result.score}/100 | Reputation: ${result.reputation}`,
      });
    },
    onError: () => {
      toast({
        title: "Domain reputation check failed",
        description: "Please check the domain and try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeliverabilityTest = () => {
    if (!deliverabilityTest.fromEmail || !deliverabilityTest.subject || !deliverabilityTest.body) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields for the deliverability test.",
        variant: "destructive",
      });
      return;
    }
    deliverabilityTestMutation.mutate(deliverabilityTest);
  };

  const handleDomainCheck = () => {
    if (!domainToCheck) {
      toast({
        title: "Missing domain",
        description: "Please enter a domain to check.",
        variant: "destructive",
      });
      return;
    }
    domainReputationMutation.mutate(domainToCheck);
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1" data-testid="settings-title">Settings</h2>
          <p className="text-muted-foreground mb-0">
            Configure your account and test email deliverability
          </p>
        </div>
      </div>

      <div className="row">
        {/* User Profile */}
        <div className="col-lg-6 mb-4">
          <Card>
            <CardHeader>
              <CardTitle className="d-flex align-items-center">
                <SettingsIcon className="h-5 w-5 mr-2" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <Input 
                  value={user?.user?.name || ''} 
                  readOnly 
                  data-testid="input-user-name"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <Input 
                  value={user?.user?.email || ''} 
                  readOnly 
                  data-testid="input-user-email"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Account Status</label>
                <div>
                  <Badge className="badge-success">Active</Badge>
                </div>
              </div>
              <Button disabled data-testid="button-update-profile">
                <Save className="h-4 w-4 mr-2" />
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <div className="col-lg-6 mb-4">
          <Card>
            <CardHeader>
              <CardTitle className="d-flex align-items-center">
                <Database className="h-5 w-5 mr-2" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Database Connection</span>
                <Badge className="badge-success">Healthy</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Email Queue</span>
                <Badge className="badge-success">Running</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>IMAP Polling</span>
                <Badge className="badge-success">Active</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>API Services</span>
                <Badge className="badge-success">Operational</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deliverability Test */}
        <div className="col-lg-6 mb-4">
          <Card>
            <CardHeader>
              <CardTitle className="d-flex align-items-center">
                <Shield className="h-5 w-5 mr-2" />
                Deliverability Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <label className="form-label">From Email</label>
                <Input
                  placeholder="sales@yourdomain.com"
                  value={deliverabilityTest.fromEmail}
                  onChange={(e) => setDeliverabilityTest(prev => ({ ...prev, fromEmail: e.target.value }))}
                  data-testid="input-test-from-email"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Subject Line</label>
                <Input
                  placeholder="Test email subject"
                  value={deliverabilityTest.subject}
                  onChange={(e) => setDeliverabilityTest(prev => ({ ...prev, subject: e.target.value }))}
                  data-testid="input-test-subject"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email Body</label>
                <Textarea
                  placeholder="Email content to test..."
                  rows={4}
                  value={deliverabilityTest.body}
                  onChange={(e) => setDeliverabilityTest(prev => ({ ...prev, body: e.target.value }))}
                  data-testid="input-test-body"
                />
              </div>
              <Button 
                onClick={handleDeliverabilityTest}
                disabled={deliverabilityTestMutation.isPending}
                data-testid="button-test-deliverability"
              >
                <TestTube className="h-4 w-4 mr-2" />
                {deliverabilityTestMutation.isPending ? "Testing..." : "Test Deliverability"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Domain Reputation */}
        <div className="col-lg-6 mb-4">
          <Card>
            <CardHeader>
              <CardTitle className="d-flex align-items-center">
                <Shield className="h-5 w-5 mr-2" />
                Domain Reputation Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <label className="form-label">Domain to Check</label>
                <Input
                  placeholder="yourdomain.com"
                  value={domainToCheck}
                  onChange={(e) => setDomainToCheck(e.target.value)}
                  data-testid="input-domain-check"
                />
                <small className="text-muted-foreground">
                  Enter domain without http:// or www
                </small>
              </div>
              <Button 
                onClick={handleDomainCheck}
                disabled={domainReputationMutation.isPending}
                data-testid="button-check-domain"
              >
                <Shield className="h-4 w-4 mr-2" />
                {domainReputationMutation.isPending ? "Checking..." : "Check Reputation"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Help */}
        <div className="col-12">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="row">
                <div className="col-md-6">
                  <h6>Email Provider Settings</h6>
                  <ul className="list-unstyled text-sm">
                    <li><strong>Zoho:</strong> smtp.zoho.com:587, imap.zoho.com:993</li>
                    <li><strong>ProtonMail:</strong> smtp.protonmail.com:587, imap.protonmail.com:993</li>
                    <li><strong>Fastmail:</strong> smtp.fastmail.com:587, imap.fastmail.com:993</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6>Best Practices</h6>
                  <ul className="list-unstyled text-sm">
                    <li>• Warm up new email accounts gradually</li>
                    <li>• Keep daily sending limits under 50 emails</li>
                    <li>• Monitor bounce rates and spam scores</li>
                    <li>• Use proper SPF, DKIM, and DMARC records</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
