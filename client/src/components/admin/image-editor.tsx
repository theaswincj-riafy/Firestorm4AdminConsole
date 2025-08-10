import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageIcon, RefreshCw, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';
import { useToast } from '@/hooks/use-toast';

interface ImageEditorProps {
  data: any;
  fullConfigData?: any;
  selectedApp?: any;
  isLocked: boolean;
  onUpdate: (data: any) => void;
  onTabDataUpdate?: (tabKey: string, newTabData: any) => void;
}

export default function ImageEditor({ 
  data, 
  fullConfigData, 
  selectedApp, 
  isLocked, 
  onUpdate, 
  onTabDataUpdate 
}: ImageEditorProps) {
  const [formData, setFormData] = useState({
    imageUrl: '',
    alt: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if there's an existing image in en.images (could be image, image1, or other variants)
    const imagesData = fullConfigData?.referral_json?.en?.images;
    let existingImage = null;
    
    if (imagesData) {
      // Check for various image key patterns
      existingImage = imagesData.image || imagesData.image1 || imagesData.imageUrl;
    }
    
    if (existingImage) {
      setFormData({
        imageUrl: existingImage,
        alt: 'App download image'
      });
    } else if (data) {
      setFormData({
        imageUrl: data.imageUrl || '',
        alt: data.alt || ''
      });
    }
  }, [data, fullConfigData]);

  const handleRegenerateImage = async () => {
    if (isLocked || isGenerating || !selectedApp) return;

    setIsGenerating(true);
    
    try {
      const appName = selectedApp.appName || 'Demo App';
      const appDescription = selectedApp.meta?.description || 'App description with visual elements';

      const result = await adminApi.generateAppImage(appName, appDescription);
      
      // Extract the image URL from the API response (check multiple possible locations)
      const generatedImageUrl = result?.data?.image1 || result?.data?.image || result?.images?.image || result?.image;
      
      if (!generatedImageUrl) {
        console.error('API Response structure:', result);
        throw new Error('No image URL returned from API');
      }

      const newFormData = {
        imageUrl: generatedImageUrl,
        alt: 'Generated app image'
      };

      setFormData(newFormData);
      
      console.log('Updating image with URL:', generatedImageUrl);
      
      // Update the full config data structure to include the new image
      if (onTabDataUpdate && fullConfigData) {
        // Update the images object in the config - use 'image' as the standard key
        const currentImages = fullConfigData.referral_json?.en?.images || {};
        const updatedImages = {
          ...currentImages,
          image: generatedImageUrl
        };
        
        // Remove any old image keys to standardize on 'image'
        delete updatedImages.image1;
        delete updatedImages.imageUrl;
        
        console.log('Calling onTabDataUpdate with images:', updatedImages);
        onTabDataUpdate('images', updatedImages);
      }
      
      // Also call onUpdate for backward compatibility
      onUpdate(newFormData);

      toast({
        title: "Image Generated",
        description: "App image has been successfully generated and updated",
      });
    } catch (error) {
      console.error('Error generating image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
      
      toast({
        title: "Image Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Download App Image
          </CardTitle>
          <CardDescription>
            Generate an image for download app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Preview */}
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
            {formData.imageUrl ? (
              <img
                src={formData.imageUrl}
                alt={formData.alt || 'App download image'}
                className="max-w-full h-auto max-h-64 mx-auto rounded-lg"
                onError={(e) => {
                  // If image fails to load, show placeholder
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Image+Preview';
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-sm">No image generated yet</p>
                <p className="text-xs text-muted-foreground mt-1">Click the button below to generate an image</p>
              </div>
            )}
          </div>

          {/* Regenerate Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleRegenerateImage}
              disabled={isLocked || isGenerating}
              className="flex items-center gap-2"
              size="lg"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {isGenerating ? 'Generating...' : 'Regenerate Image'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}