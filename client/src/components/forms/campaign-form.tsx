import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertCampaignSchema, updateCampaignSchema } from "@shared/schema";
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
  sequenceData?: any; // Sequence data when coming from "Use in Campaign"
  initialData?: any;
  isEditing?: boolean;
}

export default function CampaignForm({ onSuccess, onCancel, sequenceData, initialData, isEditing = false }: CampaignFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(isEditing ? updateCampaignSchema : insertCampaignSchema),
    defaultValues: {
      name: initialData?.name || sequenceData ? `${sequenceData.name} Campaign` : "",
      sequenceId: initialData?.sequenceId || sequenceData?.id || "",
      status: initialData?.status || "draft",
    },
  });

  // Pre-fill form when sequence data is available
  useEffect(() => {
    if (sequenceData) {
      form.setValue('name', `${sequenceData.name} Campaign`);
      form.setValue('sequenceId', sequenceData.id);
    }
  }, [sequenceData, form]);

  // Reset form when editing to ensure all fields are properly set
  useEffect(() => {
    if (isEditing && initialData) {
      form.reset({
        name: initialData.name || "",
        sequenceId: initialData.sequenceId || "",
        status: initialData.status || "draft",
      });
    }
  }, [isEditing, initialData, form]);

  // Fetch sequences for dropdown
  const { data: sequences = [] } = useQuery({
    queryKey: ['/api/sequences'],
    queryFn: () => api.getSequences(),
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      if (isEditing && initialData?.id) {
        console.log('Updating campaign:', initialData.id, 'with data:', data);
        const result = await api.updateCampaign(initialData.id, data);
        console.log('Update result:', result);
        return result;
      } else {
        console.log('Creating new campaign with data:', data);
        const result = await api.createCampaign(data);
        console.log('Create result:', result);
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      toast({
        title: isEditing ? "Campaign updated successfully" : "Campaign created successfully",
        description: isEditing 
          ? "Your campaign has been updated."
          : "Your campaign has been created and is ready to launch.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: isEditing ? "Failed to update campaign" : "Failed to create campaign",
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
            {createCampaignMutation.isPending ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Campaign" : "Create Campaign")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
