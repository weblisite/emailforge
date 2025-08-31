import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertSequenceSchema, updateSequenceSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";

type SequenceFormData = z.infer<typeof insertSequenceSchema> & {
  steps: Array<{
    stepNumber: number;
    subject: string;
    body: string;
    delayDays: number;
  }>;
};

interface SequenceFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: any;
  isEditing?: boolean;
}

export default function SequenceForm({ onSuccess, onCancel, initialData, isEditing = false }: SequenceFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SequenceFormData>({
    resolver: zodResolver((isEditing ? updateSequenceSchema : insertSequenceSchema).extend({
      steps: z.array(z.object({
        stepNumber: z.number(),
        subject: z.string().min(1, "Subject is required"),
        body: z.string().min(1, "Body is required"),
        delayDays: z.number().min(0),
      })),
    })),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      isActive: initialData?.isActive ?? true,
      steps: initialData?.steps || [
        {
          stepNumber: 1,
          subject: "",
          body: "",
          delayDays: 0,
        },
      ],
    },
  });

  // Reset form when editing to ensure all fields are properly set
  useEffect(() => {
    if (isEditing && initialData) {
      form.reset({
        name: initialData.name || "",
        description: initialData.description || "",
        isActive: initialData.isActive ?? true,
        steps: initialData.steps || [
          {
            stepNumber: 1,
            subject: "",
            body: "",
            delayDays: 0,
          },
        ],
      });
    }
  }, [isEditing, initialData, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "steps",
  });

  const createSequenceMutation = useMutation({
    mutationFn: async (data: SequenceFormData) => {
      if (isEditing && initialData?.id) {
        console.log('Updating sequence:', initialData.id, 'with data:', data);
        const result = await api.updateSequence(initialData.id, data);
        console.log('Update result:', result);
        return result;
      } else {
        console.log('Creating new sequence with data:', data);
        const result = await api.createSequence(data);
        console.log('Create result:', result);
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sequences'] });
      toast({
        title: isEditing ? "Sequence updated successfully" : "Sequence created successfully",
        description: isEditing 
          ? "Your email sequence has been updated."
          : "Your email sequence is ready to use in campaigns.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: isEditing ? "Failed to update sequence" : "Failed to create sequence",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const addStep = () => {
    append({
      stepNumber: fields.length + 1,
      subject: "",
      body: "",
      delayDays: 3,
    });
  };

  const removeStep = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      // Update step numbers
      const currentSteps = form.getValues().steps;
      currentSteps.forEach((_, i) => {
        if (i >= index) {
          form.setValue(`steps.${i}.stepNumber`, i + 1);
        }
      });
    }
  };

  const onSubmit = (data: SequenceFormData) => {
    const { steps, ...sequence } = data;
    createSequenceMutation.mutate({ sequence, steps });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="sequence-form">
        <Card>
          <CardHeader>
            <CardTitle>Sequence Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sequence Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., SaaS Outreach Q4" 
                      data-testid="input-sequence-name"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of this sequence..." 
                      data-testid="input-sequence-description"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="h5 mb-0">Email Steps</h3>
            <Button 
              type="button" 
              variant="outline" 
              onClick={addStep}
              data-testid="button-add-step"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id} className="mb-4">
              <CardHeader>
                <div className="d-flex justify-content-between align-items-center">
                  <CardTitle className="h6">
                    Step {index + 1}
                    {index > 0 && (
                      <span className="text-muted-foreground text-sm ms-2">
                        (Send after{" "}
                        <FormField
                          control={form.control}
                          name={`steps.${index}.delayDays`}
                          render={({ field }) => (
                            <Input
                              type="number"
                              min="0"
                              className="d-inline-block w-auto mx-1"
                              style={{ width: '80px' }}
                              data-testid={`input-delay-days-${index}`}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          )}
                        />
                        days)
                      </span>
                    )}
                  </CardTitle>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeStep(index)}
                      data-testid={`button-remove-step-${index}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name={`steps.${index}.subject`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject Line</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Quick question about {{company}}" 
                          data-testid={`input-subject-${index}`}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`steps.${index}.body`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Body</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Hi {{name}},&#10;&#10;I noticed {{company}} might benefit from...&#10;&#10;Best regards"
                          rows={8}
                          data-testid={`input-body-${index}`}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        Use merge tags: {`{{name}}, {{company}}, {{email}}, {{title}}`}
                      </p>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          ))}
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
            disabled={createSequenceMutation.isPending}
            data-testid="button-save-sequence"
          >
            {createSequenceMutation.isPending ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Sequence" : "Create Sequence")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
