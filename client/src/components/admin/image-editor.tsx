import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageIcon, Wand2, Loader2 } from 'lucide-react';

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
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData({
        imageUrl: data.imageUrl || '',
        alt: data.alt || ''
      });
    }
  }, [data]);

  const handleGenerateImage = async () => {
    if (isLocked || isGenerating) return;

    setIsGenerating(true);
    
    try {
      // TODO: Implement image generation logic here
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, we'll use a placeholder
      const generatedImageUrl = 'https://via.placeholder.com/400x200?text=Generated+App+Image';
      const newFormData = {
        imageUrl: generatedImageUrl,
        alt: 'Generated app image'
      };

      setFormData(newFormData);
      onUpdate(newFormData);
    } catch (error) {
      console.error('Error generating image:', error);
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

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleGenerateImage}
              disabled={isLocked || isGenerating}
              className="flex items-center gap-2"
              size="lg"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              {isGenerating ? 'Generating...' : 'Generate Image'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}