import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Upload, MoreHorizontal, Trash2, Edit, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { Lead } from "@shared/schema";

export default function Leads() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['/api/leads'],
    queryFn: () => api.getLeads(),
  });

  const deleteLeadMutation = useMutation({
    mutationFn: api.deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      toast({
        title: "Lead deleted",
        description: "The lead has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete lead",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const uploadLeadsMutation = useMutation({
    mutationFn: (leadsData: any[]) => api.createLeadsBulk(leadsData),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      toast({
        title: "Leads uploaded successfully",
        description: `${result.length} leads have been added to your database.`,
      });
      setIsUploadOpen(false);
      setCsvFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Please check your CSV format and try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="badge-success">Active</Badge>;
      case 'unsubscribed':
        return <Badge className="badge-danger">Unsubscribed</Badge>;
      case 'bounced':
        return <Badge className="badge-warning">Bounced</Badge>;
      default:
        return <Badge className="badge-secondary">Unknown</Badge>;
    }
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = (lead: Lead) => {
    if (confirm(`Are you sure you want to delete ${lead.name}?`)) {
      deleteLeadMutation.mutate(lead.id);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload.",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error("CSV file must contain at least a header and one data row.");
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const requiredFields = ['name', 'email'];
      
      const missingFields = requiredFields.filter(field => !headers.includes(field));
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const leadsData = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        const lead: any = {};
        
        headers.forEach((header, i) => {
          if (values[i]) {
            lead[header] = values[i].replace(/"/g, '');
          }
        });

        if (!lead.name || !lead.email) {
          throw new Error(`Invalid data at row ${index + 2}: name and email are required.`);
        }

        return {
          name: lead.name,
          email: lead.email,
          company: lead.company || null,
          title: lead.title || null,
          source: 'csv',
        };
      });

      uploadLeadsMutation.mutate(leadsData);
    } catch (error) {
      toast({
        title: "CSV parsing failed",
        description: error instanceof Error ? error.message : "Invalid CSV format.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="animate-pulse text-xl font-medium text-primary mb-2">Loading Leads...</div>
          <div className="text-muted-foreground">Fetching your contact database</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1" data-testid="leads-title">Leads</h2>
          <p className="text-muted-foreground mb-0">
            Manage your contact database and lead information
          </p>
        </div>
        <div className="d-flex gap-2">
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-upload-leads">
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Leads from CSV</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="form-label">CSV File</label>
                  <input
                    type="file"
                    accept=".csv"
                    className="form-control"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                    data-testid="input-csv-file"
                  />
                  <small className="text-muted-foreground">
                    Required columns: name, email. Optional: company, title
                  </small>
                </div>
                
                <div className="alert alert-info">
                  <h6>CSV Format Example:</h6>
                  <code>
                    name,email,company,title<br />
                    John Doe,john@example.com,Acme Corp,CEO<br />
                    Jane Smith,jane@company.com,Tech Inc,CTO
                  </code>
                </div>

                <div className="d-flex gap-2 justify-content-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsUploadOpen(false)}
                    data-testid="button-cancel-upload"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCsvUpload}
                    disabled={!csvFile || uploadLeadsMutation.isPending}
                    data-testid="button-confirm-upload"
                  >
                    {uploadLeadsMutation.isPending ? "Uploading..." : "Upload Leads"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button data-testid="button-add-lead">
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="row mb-4">
        <div className="col-md-6">
          <Input
            placeholder="Search leads by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-leads"
          />
        </div>
        <div className="col-md-6">
          <div className="d-flex gap-3 align-items-center h-100">
            <div className="text-sm">
              <strong>{filteredLeads.length}</strong> of <strong>{leads.length}</strong> leads
            </div>
            <Badge className="badge-success">
              {leads.filter(l => l.status === 'active').length} Active
            </Badge>
            <Badge className="badge-danger">
              {leads.filter(l => l.status === 'unsubscribed').length} Unsubscribed
            </Badge>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      {filteredLeads.length > 0 ? (
        <div className="metric-card">
          <div className="table-responsive">
            <table className="table table-hover" data-testid="leads-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} data-testid={`lead-row-${lead.id}`}>
                    <td className="font-medium" data-testid={`lead-name-${lead.id}`}>
                      {lead.name}
                    </td>
                    <td className="text-muted-foreground" data-testid={`lead-email-${lead.id}`}>
                      {lead.email}
                    </td>
                    <td data-testid={`lead-company-${lead.id}`}>
                      {lead.company || '-'}
                    </td>
                    <td data-testid={`lead-title-${lead.id}`}>
                      {lead.title || '-'}
                    </td>
                    <td>
                      {getStatusBadge(lead.status)}
                    </td>
                    <td className="text-sm">
                      {lead.source || 'manual'}
                    </td>
                    <td className="text-sm">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            data-testid={`lead-actions-${lead.id}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem data-testid={`lead-edit-${lead.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(lead)}
                            disabled={deleteLeadMutation.isPending}
                            className="text-destructive"
                            data-testid={`lead-delete-${lead.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="metric-card text-center py-8">
          {leads.length === 0 ? (
            <div className="mb-4">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h4>No Leads</h4>
              <p className="text-muted-foreground">
                Upload a CSV file or add leads manually to get started.
              </p>
              <div className="d-flex gap-2 justify-content-center mt-3">
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" data-testid="button-upload-first-leads">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload CSV
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Leads from CSV</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="form-label">CSV File</label>
                        <input
                          type="file"
                          accept=".csv"
                          className="form-control"
                          onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                          data-testid="input-csv-file"
                        />
                        <small className="text-muted-foreground">
                          Required columns: name, email. Optional: company, title
                        </small>
                      </div>
                      
                      <div className="alert alert-info">
                        <h6>CSV Format Example:</h6>
                        <code>
                          name,email,company,title<br />
                          John Doe,john@example.com,Acme Corp,CEO<br />
                          Jane Smith,jane@company.com,Tech Inc,CTO
                        </code>
                      </div>

                      <div className="d-flex gap-2 justify-content-end">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsUploadOpen(false)}
                          data-testid="button-cancel-upload"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCsvUpload}
                          disabled={!csvFile || uploadLeadsMutation.isPending}
                          data-testid="button-confirm-upload"
                        >
                          {uploadLeadsMutation.isPending ? "Uploading..." : "Upload Leads"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button data-testid="button-add-first-lead">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lead
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <h4>No matching leads</h4>
              <p className="text-muted-foreground">
                Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
