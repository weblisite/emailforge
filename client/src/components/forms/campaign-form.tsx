import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertCampaignSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { z } from "zod";

type CampaignFormData = z.infer<typeof insertCampaignSchema>;

interface CampaignFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CampaignForm({ onSuccess, onCancel }: CampaignFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(insertCampaignSchema),
    defaultValues: {
      name: "",
      sequenceId: "",
      status: "draft",
    },
  });

  // Fetch sequences for dropdown
  const { data: sequences = [] } = useQuery({
    queryKey: ['/api/sequences'],
    queryFn: () => api.getSequences(),
  });

  const createCampaignMutation = useMutation({
    mutationFn: api.createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      toast({
        title: "Campaign created successfully",
        description: "Your campaign has been created and is ready to launch.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create campaign",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CampaignFormData) => {
    createCampaignMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="campaign-form">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Q4 SaaS Outreach" 
                  data-testid="input-campaign-name"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sequenceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Sequence</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-sequence">
                    <SelectValue placeholder="Select an email sequence" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sequences.map((sequence) => (
                    <SelectItem key={sequence.id} value={sequence.id}>
                      {sequence.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
              {sequences.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No sequences available. Create a sequence first.
                </p>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue placeholder="Select campaign status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="alert alert-info">
          <h6>Next Steps:</h6>
          <ul className="mb-0">
            <li>After creating the campaign, you'll be able to assign leads</li>
            <li>Configure email account rotation settings</li>
            <li>Set up sending schedules and daily limits</li>
            <li>Start the campaign when ready</li>
          </ul>
        </div>

        <div className="d-flex gap-2 justify-content-end">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={createCampaignMutation.isPending || sequences.length === 0}
            data-testid="button-save-campaign"
          >
            {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
