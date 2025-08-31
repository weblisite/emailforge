import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ToastTest() {
  const { toast, toastSuccess, toastWarning, toastError, toastInfo } = useToast();

  const showDefaultToast = () => {
    toast({
      title: "Default Toast",
      description: "This is a default toast notification with proper contrast.",
    });
  };

  const showSuccessToast = () => {
    toastSuccess({
      title: "Success!",
      description: "Operation completed successfully with green styling.",
    });
  };

  const showWarningToast = () => {
    toastWarning({
      title: "Warning",
      description: "This is a warning message with yellow styling.",
    });
  };

  const showErrorToast = () => {
    toastError({
      title: "Error",
      description: "Something went wrong with red styling.",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Toast Notification Test</CardTitle>
          <CardDescription>
            Test different types of toast notifications to verify contrast and visibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={showDefaultToast} variant="outline">
              Show Default Toast
            </Button>
            <Button onClick={showSuccessToast} variant="outline">
              Show Success Toast
            </Button>
            <Button onClick={showWarningToast} variant="outline">
              Show Warning Toast
            </Button>
            <Button onClick={showErrorToast} variant="outline">
              Show Error Toast
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Expected Results:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Default: White background with black text and black close button</li>
              <li>• Success: Light green background with dark green text</li>
              <li>• Warning: Light yellow background with dark yellow text</li>
              <li>• Error: Light red background with dark red text</li>
              <li>• All toasts should have visible close buttons and proper contrast</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
