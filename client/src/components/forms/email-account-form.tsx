import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertEmailAccountSchema, updateEmailAccountSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { z } from "zod";

type EmailAccountFormData = z.infer<typeof insertEmailAccountSchema>;

interface EmailAccountFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: any;
  isEditing?: boolean;
}

const providerPresets = {
  gmail: {
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    imapHost: 'imap.gmail.com',
    imapPort: 993,
  },
  outlook: {
    smtpHost: 'smtp-mail.outlook.com',
    smtpPort: 587,
    imapHost: 'outlook.office365.com',
    imapPort: 993,
  },
  zoho: {
    smtpHost: 'smtp.zoho.com',
    smtpPort: 587,
    imapHost: 'imap.zoho.com',
    imapPort: 993,
  },
  custom: {
    smtpHost: '',
    smtpPort: 587,
    imapHost: '',
    imapPort: 993,
  },
};

export default function EmailAccountForm({ onSuccess, onCancel, initialData, isEditing = false }: EmailAccountFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EmailAccountFormData>({
    resolver: zodResolver(isEditing ? updateEmailAccountSchema : insertEmailAccountSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      provider: initialData?.provider || '',
      smtpHost: initialData?.smtpHost || '',
      smtpPort: initialData?.smtpPort || 587,
      imapHost: initialData?.imapHost || '',
      imapPort: initialData?.imapPort || 993,
      username: initialData?.username || '',
      password: '', // Don't pre-fill password for security
      dailyLimit: initialData?.dailyLimit || 50,
    },
  });

  // Reset form when editing to ensure all fields are properly set
  useEffect(() => {
    if (isEditing && initialData) {
      form.reset({
        name: initialData.name || '',
        email: initialData.email || '',
        provider: initialData.provider || '',
        smtpHost: initialData.smtpHost || '',
        smtpPort: initialData.smtpPort || 587,
        imapHost: initialData.imapHost || '',
        imapPort: initialData.imapPort || 993,
        username: initialData.username || '',
        password: '', // Don't pre-fill password for security
        dailyLimit: initialData.dailyLimit || 50,
      });
    }
  }, [isEditing, initialData, form]);

  const handleProviderChange = (provider: string) => {
    const preset = providerPresets[provider as keyof typeof providerPresets];
    if (preset) {
      form.setValue('smtpHost', preset.smtpHost);
      form.setValue('smtpPort', preset.smtpPort);
      form.setValue('imapHost', preset.imapHost);
      form.setValue('imapPort', preset.imapPort);
    }
  };

  const createEmailAccountMutation = useMutation({
    mutationFn: async (data: EmailAccountFormData) => {
      if (isEditing && initialData?.id) {
        console.log('Updating email account:', initialData.id, 'with data:', data);
        const result = await api.updateEmailAccount(initialData.id, data);
        console.log('Update result:', result);
        return result;
      } else {
        console.log('Creating new email account with data:', data);
        const result = await api.createEmailAccount(data);
        console.log('Create result:', result);
        return result;
      }
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Email account updated successfully" : "Email account added successfully",
        description: isEditing 
          ? "Your email account settings have been updated."
          : "Your email account has been configured and is ready to use.",
      });
      
      // Refresh the email accounts list
      queryClient.invalidateQueries({ queryKey: ['/api/email-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: isEditing ? "Failed to update email account" : "Failed to add email account",
        description: error.message || "Please check your settings and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EmailAccountFormData) => {
    console.log('🔍 Form submission data:', data);
    createEmailAccountMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Row 1: Account Name & Email */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Sales Account" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="sales@company.com" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Row 2: Provider & Daily Limit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Provider</FormLabel>
                  <Select onValueChange={(value) => {
                    field.onChange(value);
                    handleProviderChange(value);
                  }} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gmail">Gmail</SelectItem>
                      <SelectItem value="outlook">Outlook</SelectItem>
                      <SelectItem value="zoho">Zoho</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div>
            <FormField
              control={form.control}
              name="dailyLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Send Limit</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="50" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Row 3: SMTP Host & Port */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FormField
              control={form.control}
              name="smtpHost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SMTP Host</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="smtp.example.com" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div>
            <FormField
              control={form.control}
              name="smtpPort"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SMTP Port</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="587" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Row 4: IMAP Host & Port */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FormField
              control={form.control}
              name="imapHost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IMAP Host</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="imap.example.com" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div>
            <FormField
              control={form.control}
              name="imapPort"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IMAP Port</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="993" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Row 5: Username & Password */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="your-email@domain.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Your email password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-2">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          
          <Button 
            type="submit" 
            disabled={createEmailAccountMutation.isPending}
            className="min-w-[120px]"
          >
            {createEmailAccountMutation.isPending ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Update Email Account" : "Add Email Account")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
