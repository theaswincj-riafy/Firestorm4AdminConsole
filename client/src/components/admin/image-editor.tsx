
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageIcon, Upload, X } from 'lucide-react';

interface ImageEditorProps {
  data: any;
  isLocked: boolean;
  onUpdate: (data: any) => void;
}

export default function ImageEditor({ data, isLocked, onUpdate }: ImageEditorProps) {
  const [formData, setFormData] = useState({
    imageUrl: '',
    alt: ''
  });

  useEffect(() => {
    if (data) {
      setFormData({
        imageUrl: data.imageUrl || '',
        alt: data.alt || ''
      });
    }
  }, [data]);

  const handleChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    onUpdate(newFormData);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a temporary URL for preview
      const url = URL.createObjectURL(file);
      handleChange('imageUrl', url);
      handleChange('alt', file.name);
    }
  };

  const clearImage = () => {
    handleChange('imageUrl', '');
    handleChange('alt', '');
  };

  return (
    <div className="h-full p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            App Image
          </CardTitle>
          <CardDescription>
            Upload or specify an image URL for your app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Preview */}
          {formData.imageUrl && (
            <div className="relative">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                <img
                  src={formData.imageUrl}
                  alt={formData.alt || 'App image'}
                  className="max-w-full h-auto max-h-64 mx-auto rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={clearImage}
                disabled={isLocked}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Upload Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Upload Image</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isLocked}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLocked}
                  onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={isLocked}
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alt">Alt Text</Label>
              <Input
                id="alt"
                value={formData.alt}
                onChange={(e) => handleChange('alt', e.target.value)}
                placeholder="Description of the image for accessibility"
                disabled={isLocked}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
