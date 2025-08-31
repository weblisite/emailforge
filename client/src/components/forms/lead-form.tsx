import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { insertLeadSchema, updateLeadSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { z } from "zod";

type LeadFormData = z.infer<typeof insertLeadSchema>;

interface LeadFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: any;
  isEditing?: boolean;
}

export default function LeadForm({ onSuccess, onCancel, initialData, isEditing = false }: LeadFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  console.log('🔍 LeadForm props:', { initialData, isEditing });

  const form = useForm<LeadFormData>({
    resolver: zodResolver(isEditing ? updateLeadSchema : insertLeadSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      company: initialData?.company || "",
      title: initialData?.title || "",
      phone: initialData?.phone || "",
      status: initialData?.status || "active",
    },
  });

  // Reset form when editing to ensure all fields are properly set
  useEffect(() => {
    if (isEditing && initialData) {
      console.log('🔍 Resetting form with initial data:', initialData);
      form.reset({
        name: initialData.name || "",
        email: initialData.email || "",
        company: initialData.company || "",
        title: initialData.title || "",
        phone: initialData.phone || "",
        status: initialData.status || "active",
      });
    }
  }, [isEditing, initialData, form]);

  const createLeadMutation = useMutation({
    mutationFn: async (data: LeadFormData) => {
      if (isEditing && initialData?.id) {
        console.log('Updating lead:', initialData.id, 'with data:', data);
        const result = await api.updateLead(initialData.id, data);
        console.log('Update result:', result);
        return result;
      } else {
        console.log('Creating new lead with data:', data);
        const result = await api.createLead(data);
        console.log('Create result:', result);
        return result;
      }
    },
    onSuccess: (data) => {
      console.log('Mutation successful:', data);
      console.log('Is editing:', isEditing);
      console.log('Initial data:', initialData);
      
      if (isEditing && initialData?.id) {
        console.log('Updating cache for lead ID:', initialData.id);
        
        // For updates, update the cache directly with better error handling
        queryClient.setQueryData(['/api/leads'], (oldData: any) => {
          console.log('Old cache data:', oldData);
          if (!oldData || !Array.isArray(oldData)) {
            console.log('No old data or not an array, returning as is');
            return oldData;
          }
          
          const updatedData = oldData.map((lead: any) => {
            if (lead.id === initialData.id) {
              console.log('Updating lead in cache:', lead.id, 'with new data:', data);
              return { ...lead, ...data };
            }
            return lead;
          });
          
          console.log('Updated cache data:', updatedData);
          return updatedData;
        });
        
        // Small delay to ensure cache update is processed before refetch
        setTimeout(() => {
          // Force a refetch to ensure the UI updates immediately
          queryClient.refetchQueries({ queryKey: ['/api/leads'] });
          
          // Also update any other related queries that might contain lead data
          queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
        }, 100);
      } else {
        // For new leads, just invalidate
        queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      }
      
      toast({
        title: isEditing ? "Lead updated successfully" : "Lead added successfully",
        description: isEditing 
          ? "Your lead information has been updated."
          : "Your lead has been added to the database.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: isEditing ? "Failed to update lead" : "Failed to add lead",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LeadFormData) => {
    console.log('🔍 Form submission data:', data);
    console.log('🔍 Form current values:', form.getValues());
    console.log('🔍 Form status field value:', form.getValues('status'));
    console.log('🔍 Form watch status:', form.watch('status'));
    console.log('🔍 Is editing:', isEditing);
    createLeadMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="row">
          <div className="col-md-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-md-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corporation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-md-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="CEO" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-md-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => {
                console.log('🔍 Status field render:', { 
                  value: field.value, 
                  onChange: field.onChange,
                  name: field.name 
                });
                return (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <select 
                        className="form-select" 
                        {...field}
                        value={field.value}
                        onChange={(e) => {
                          console.log('🔍 Status field onChange:', e.target.value);
                          field.onChange(e);
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="unsubscribed">Unsubscribed</option>
                        <option value="bounced">Bounced</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
        </div>

        <div className="d-flex gap-2 justify-content-end pt-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={createLeadMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createLeadMutation.isPending}
            data-testid="button-submit-lead"
          >
            {createLeadMutation.isPending ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Update Lead" : "Add Lead")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
