
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Smartphone, ExternalLink } from 'lucide-react';

interface AppDetailsEditorProps {
  data: any;
  isLocked: boolean;
  onUpdate: (data: any) => void;
}

export default function AppDetailsEditor({ data, isLocked, onUpdate }: AppDetailsEditorProps) {
  const [formData, setFormData] = useState({
    packageName: '',
    appName: '',
    appDescription: '',
    playUrl: '',
    appStoreUrl: ''
  });

  useEffect(() => {
    if (data) {
      setFormData({
        packageName: data.packageName || '',
        appName: data.appName || '',
        appDescription: data.meta?.description || '',
        playUrl: data.meta?.playUrl || '',
        appStoreUrl: data.meta?.appStoreUrl || ''
      });
    }
  }, [data]);

  const handleChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Create updated app data structure immediately
    const updatedData = {
      ...data,
      packageName: newFormData.packageName,
      appName: newFormData.appName,
      meta: {
        ...data?.meta,
        description: newFormData.appDescription,
        playUrl: newFormData.playUrl,
        appStoreUrl: newFormData.appStoreUrl
      }
    };
    
    // Call onUpdate immediately for real-time updates
    onUpdate(updatedData);
  };

  return (
    <div className="h-full p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            App Information
          </CardTitle>
          <CardDescription>
            Basic information about your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="packageName">Package Name</Label>
              <Input
                id="packageName"
                value={formData.packageName}
                placeholder="com.example.myapp"
                disabled={true}
                className="bg-muted"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appName">App Name</Label>
              <Input
                id="appName"
                value={formData.appName}
                placeholder="My Awesome App"
                disabled={true}
                className="bg-muted"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="appDescription">App Description</Label>
            <Textarea
              id="appDescription"
              value={formData.appDescription}
              placeholder="A brief description of your app..."
              disabled={true}
              rows={3}
              className="bg-muted"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Store Links
          </CardTitle>
          <CardDescription>
            Links to your app in various app stores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="playUrl" className="flex items-center gap-2">
              Google Play Store Link
              <ExternalLink className="w-4 h-4" />
            </Label>
            <Input
              id="playUrl"
              value={formData.playUrl}
              onChange={(e) => handleChange('playUrl', e.target.value)}
              placeholder="https://play.google.com/store/apps/details?id=..."
              disabled={isLocked}
              type="url"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="appStoreUrl" className="flex items-center gap-2">
              iOS App Store Link
              <ExternalLink className="w-4 h-4" />
            </Label>
            <Input
              id="appStoreUrl"
              value={formData.appStoreUrl}
              onChange={(e) => handleChange('appStoreUrl', e.target.value)}
              placeholder="https://apps.apple.com/app/..."
              disabled={isLocked}
              type="url"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
