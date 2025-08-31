import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Shield, TestTube, Database, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/clerk-react";
import { api } from "@/lib/api";

export default function Settings() {
  const { user } = useUser();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: ""
  });
  const [deliverabilityTest, setDeliverabilityTest] = useState({
    fromEmail: "",
    subject: "",
    body: ""
  });
  const [domainToCheck, setDomainToCheck] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Debug useEffect
  useEffect(() => {
    console.log('isEditingProfile changed to:', isEditingProfile);
  }, [isEditingProfile]);

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User',
        email: user.primaryEmailAddress?.emailAddress || ''
      });
    }
  }, [user]);

  const deliverabilityTestMutation = useMutation({
    mutationFn: ({ fromEmail, subject, body }: { fromEmail: string; subject: string; body: string }) => 
      api.testDeliverability(body, fromEmail),
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

  const updateProfileMutation = useMutation({
    mutationFn: (data: { name: string; email: string }) => api.updateProfile(data),
    onSuccess: () => {
      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been updated.",
      });
      setIsEditingProfile(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update profile",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEditProfile = () => {
    console.log('handleEditProfile called, user:', user);
    console.log('Current isEditingProfile before:', isEditingProfile);
    if (user) {
      // Don't reset profileData - let user edit the current values
      setIsEditingProfile(true);
      console.log('Setting isEditingProfile to true');
      console.log('State should now be true');
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileData({
      name: user?.firstName || user?.lastName || user?.username || 'User',
      email: user?.primaryEmailAddress?.emailAddress || ''
    });
  };

  const handleSaveProfile = () => {
    if (!profileData.name.trim() || !profileData.email.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both name and email fields.",
        variant: "destructive",
      });
      return;
    }
    updateProfileMutation.mutate(profileData);
  };

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

  console.log('Settings render - isEditingProfile:', isEditingProfile, 'user:', user);
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
                  value={isEditingProfile ? profileData.name : (user?.firstName || user?.lastName || user?.username || 'User')} 
                  readOnly={!isEditingProfile}
                  onChange={(e) => isEditingProfile && setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  data-testid="input-user-name"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <Input 
                  value={isEditingProfile ? profileData.email : (user?.primaryEmailAddress?.emailAddress || '')} 
                  readOnly={!isEditingProfile}
                  onChange={(e) => isEditingProfile && setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  data-testid="input-user-email"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Account Status</label>
                <div>
                  <Badge className="badge-success">Active</Badge>
                </div>
              </div>
              {isEditingProfile ? (
                <div className="d-flex gap-2">
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancelEdit}
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-cancel-edit"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleEditProfile}
                  data-testid="button-edit-profile"
                >
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
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

              {/* Enhanced Deliverability Results */}
              {deliverabilityTestMutation.data && (
                <div className="mt-4 p-3 bg-light rounded">
                  <h6 className="mb-3">Test Results</h6>
                  
                  {/* Spam Score */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Spam Score:</span>
                      <Badge 
                        className={deliverabilityTestMutation.data.spamScore < 3 ? 'badge-success' : 
                                  deliverabilityTestMutation.data.spamScore < 6 ? 'badge-warning' : 'badge-danger'}
                      >
                        {deliverabilityTestMutation.data.spamScore}/10
                      </Badge>
                    </div>
                  </div>

                  {/* Blacklist Status */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Blacklist Status:</span>
                      <Badge 
                        className={deliverabilityTestMutation.data.blacklistStatus === 'clean' ? 'badge-success' : 'badge-danger'}
                      >
                        {deliverabilityTestMutation.data.blacklistStatus}
                      </Badge>
                    </div>
                  </div>

                  {/* Email Preview Link */}
                  {deliverabilityTestMutation.data.emailPreview && (
                    <div className="mb-3">
                      <span>Email Preview: </span>
                      <a href={deliverabilityTestMutation.data.emailPreview} target="_blank" rel="noopener noreferrer" className="text-primary">
                        View Preview
                      </a>
                    </div>
                  )}

                  {/* Client Compatibility */}
                  {deliverabilityTestMutation.data.clientCompatibility && (
                    <div className="mb-3">
                      <span>Client Compatibility:</span>
                      <div className="mt-2">
                        {Object.entries(deliverabilityTestMutation.data.clientCompatibility).map(([client, status]: [string, any]) => (
                          <Badge 
                            key={client} 
                            className={status === 'good' ? 'badge-success' : 'badge-warning'} 
                            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
                          >
                            {client}: {status}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div className="mb-3">
                    <span>Recommendations:</span>
                    <ul className="mt-2 mb-0">
                      {deliverabilityTestMutation.data.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-sm">{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
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

              {/* Enhanced Domain Reputation Results */}
              {domainReputationMutation.data && (
                <div className="mt-4 p-3 bg-light rounded">
                  <h6 className="mb-3">Reputation Analysis</h6>
                  
                  {/* Overall Reputation */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Overall Reputation:</span>
                      <Badge 
                        className={domainReputationMutation.data.reputation === 'excellent' ? 'badge-success' : 
                                  domainReputationMutation.data.reputation === 'good' ? 'badge-success' : 
                                  domainReputationMutation.data.reputation === 'moderate' ? 'badge-warning' : 'badge-danger'}
                      >
                        {domainReputationMutation.data.reputation}
                      </Badge>
                    </div>
                  </div>

                  {/* Reputation Score */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Reputation Score:</span>
                      <Badge 
                        className={domainReputationMutation.data.score >= 80 ? 'badge-success' : 
                                  domainReputationMutation.data.score >= 60 ? 'badge-success' : 
                                  domainReputationMutation.data.score >= 40 ? 'badge-warning' : 'badge-danger'}
                      >
                        {domainReputationMutation.data.score}/100
                      </Badge>
                    </div>
                  </div>

                  {/* Technical Factors */}
                  {domainReputationMutation.data.technicalFactors && (
                    <div className="mb-3">
                      <span>Technical Factors:</span>
                      <div className="mt-2">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span>SPF:</span>
                          <Badge 
                            className={domainReputationMutation.data.technicalFactors.spf.valid ? 'badge-success' : 'badge-danger'}
                          >
                            {domainReputationMutation.data.technicalFactors.spf.valid ? 'Valid' : 'Invalid'}
                          </Badge>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span>DKIM:</span>
                          <Badge 
                            className={domainReputationMutation.data.technicalFactors.dkim.valid ? 'badge-success' : 'badge-danger'}
                          >
                            {domainReputationMutation.data.technicalFactors.dkim.valid ? 'Valid' : 'Invalid'}
                          </Badge>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span>DMARC:</span>
                          <Badge 
                            className={domainReputationMutation.data.technicalFactors.dmarc.valid ? 'badge-success' : 'badge-danger'}
                          >
                            {domainReputationMutation.data.technicalFactors.dmarc.valid ? 'Valid' : 'Invalid'}
                          </Badge>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span>Overall:</span>
                          <Badge 
                            className={domainReputationMutation.data.technicalFactors.overall === 'excellent' ? 'badge-success' : 
                                      domainReputationMutation.data.technicalFactors.overall === 'good' ? 'badge-success' : 
                                      domainReputationMutation.data.technicalFactors.overall === 'moderate' ? 'badge-warning' : 'badge-danger'}
                          >
                            {domainReputationMutation.data.technicalFactors.overall}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Industry Benchmarks */}
                  {domainReputationMutation.data.industryBenchmarks && (
                    <div className="mb-3">
                      <span>Industry Benchmarks:</span>
                      <div className="mt-2">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span>Industry:</span>
                          <span className="text-muted">{domainReputationMutation.data.industryBenchmarks.industry}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span>Average Score:</span>
                          <span className="text-muted">{domainReputationMutation.data.industryBenchmarks.averageScore}/100</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span>Percentile:</span>
                          <span className="text-muted">{domainReputationMutation.data.industryBenchmarks.percentile}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Historical Data */}
                  {domainReputationMutation.data.historicalData && (
                    <div className="mb-3">
                      <span>Historical Trends:</span>
                      <div className="mt-2 text-sm text-muted">
                        <div>30-day trend: {domainReputationMutation.data.historicalData.trend30d || 'N/A'}</div>
                        <div>90-day trend: {domainReputationMutation.data.historicalData.trend90d || 'N/A'}</div>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div className="mb-3">
                    <span>Recommendations:</span>
                    <ul className="mt-2 mb-0">
                      {domainReputationMutation.data.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-sm">{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
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
