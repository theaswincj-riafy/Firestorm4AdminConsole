import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { appFormSchema, type AppFormData, type App } from "@shared/schema";

interface AppModalProps {
  isOpen: boolean;
  editingApp: App | null;
  onClose: () => void;
  onSubmit: (data: AppFormData) => void;
  isSubmitting: boolean;
}

export default function AppModal({
  isOpen,
  editingApp,
  onClose,
  onSubmit,
  isSubmitting
}: AppModalProps) {
  const form = useForm<AppFormData>({
    resolver: zodResolver(appFormSchema),
    defaultValues: {
      packageName: '',
      appName: '',
      appDescription: '',
      playUrl: '',
      appStoreUrl: ''
    }
  });

  useEffect(() => {
    if (editingApp) {
      form.reset({
        packageName: editingApp.packageName,
        appName: editingApp.appName,
        appDescription: editingApp.meta?.description || '',
        playUrl: editingApp.meta?.playUrl || '',
        appStoreUrl: editingApp.meta?.appStoreUrl || ''
      });
    } else {
      form.reset({
        packageName: '',
        appName: '',
        appDescription: '',
        playUrl: '',
        appStoreUrl: ''
      });
    }
  }, [editingApp, form]);

  const handleSubmit = (data: AppFormData) => {
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {editingApp ? 'Edit App' : 'Create New App'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-4">
          <div>
            <Label htmlFor="appName">App Name *</Label>
            <Input
              id="appName"
              placeholder="Demo Referral App"
              {...form.register('appName')}
              disabled={isSubmitting}
            />
            {form.formState.errors.appName && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.appName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="packageName">Package Name *</Label>
            <Input
              id="packageName"
              placeholder="com.demo.referral"
              {...form.register('packageName')}
              disabled={isSubmitting}
            />
            {form.formState.errors.packageName && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.packageName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="appDescription">App Description</Label>
            <Textarea
              id="appDescription"
              placeholder="A brief description of your app"
              {...form.register('appDescription')}
              disabled={isSubmitting}
            />
            {form.formState.errors.appDescription && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.appDescription.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="playUrl">Google Play Link</Label>
            <Input
              id="playUrl"
              type="url"
              placeholder="https://play.google.com/store/apps/details?id=..."
              {...form.register('playUrl')}
              disabled={isSubmitting}
            />
            {form.formState.errors.playUrl && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.playUrl.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="appStoreUrl">iOS App Store Link</Label>
            <Input
              id="appStoreUrl"
              type="url"
              placeholder="https://apps.apple.com/app/..."
              {...form.register('appStoreUrl')}
              disabled={isSubmitting}
            />
            {form.formState.errors.appStoreUrl && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.appStoreUrl.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editingApp ? 'Save Changes' : 'Create App')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}