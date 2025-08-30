import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertEmailAccountSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { z } from "zod";

type EmailAccountFormData = z.infer<typeof insertEmailAccountSchema>;

interface EmailAccountFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const providerPresets = {
  zoho: {
    smtpHost: 'smtp.zoho.com',
    smtpPort: 587,
    imapHost: 'imap.zoho.com',
    imapPort: 993,
  },
  protonmail: {
    smtpHost: 'smtp.protonmail.com',
    smtpPort: 587,
    imapHost: 'imap.protonmail.com',
    imapPort: 993,
  },
  fastmail: {
    smtpHost: 'smtp.fastmail.com',
    smtpPort: 587,
    imapHost: 'imap.fastmail.com',
    imapPort: 993,
  },
  custom: {
    smtpHost: '',
    smtpPort: 587,
    imapHost: '',
    imapPort: 993,
  },
};

export default function EmailAccountForm({ onSuccess, onCancel }: EmailAccountFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EmailAccountFormData>({
    resolver: zodResolver(insertEmailAccountSchema),
    defaultValues: {
      name: "",
      email: "",
      provider: "",
      smtpHost: "",
      smtpPort: 587,
      imapHost: "",
      imapPort: 993,
      username: "",
      dailyLimit: 50,
      isActive: true,
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: api.createEmailAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      toast({
        title: "Email account added successfully",
        description: "Your email account has been configured and tested.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add email account",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  const handleProviderChange = (provider: string) => {
    const preset = providerPresets[provider as keyof typeof providerPresets];
    if (preset) {
      form.setValue('provider', provider);
      form.setValue('smtpHost', preset.smtpHost);
      form.setValue('smtpPort', preset.smtpPort);
      form.setValue('imapHost', preset.imapHost);
      form.setValue('imapPort', preset.imapPort);
    }
  };

  const onSubmit = (data: EmailAccountFormData) => {
    createAccountMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="email-account-form">
        <div className="row">
          <div className="col-md-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Sales Account" 
                      data-testid="input-account-name"
                      {...field} 
                    />
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
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="sales@company.com" 
                      data-testid="input-email"
                      {...field} 
                    />
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
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Provider</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleProviderChange(value);
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-provider">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="zoho">Zoho Mail</SelectItem>
                      <SelectItem value="protonmail">ProtonMail</SelectItem>
                      <SelectItem value="fastmail">Fastmail</SelectItem>
                      <SelectItem value="custom">Custom SMTP</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="col-md-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username/Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Your email password" 
                      data-testid="input-password"
                      {...field} 
                    />
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
              name="smtpHost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SMTP Host</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="smtp.example.com" 
                      data-testid="input-smtp-host"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="col-md-6">
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
                      data-testid="input-smtp-port"
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
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
              name="imapHost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IMAP Host</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="imap.example.com" 
                      data-testid="input-imap-host"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="col-md-6">
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
                      data-testid="input-imap-port"
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="dailyLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Daily Sending Limit</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="50" 
                  data-testid="input-daily-limit"
                  {...field} 
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
            disabled={createAccountMutation.isPending}
            data-testid="button-save-account"
          >
            {createAccountMutation.isPending ? "Testing & Saving..." : "Save Account"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
