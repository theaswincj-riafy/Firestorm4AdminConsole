import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, RefreshCw, Loader2 } from 'lucide-react';

interface RegenerateModalProps {
  isOpen: boolean;
  tabKey: string;
  tabTitle: string;
  currentDescription: string;
  isRegenerating: boolean;
  onClose: () => void;
  onRegenerate: (tabKey: string, description: string) => void;
}

export default function RegenerateModal({
  isOpen,
  tabKey,
  tabTitle,
  currentDescription,
  isRegenerating,
  onClose,
  onRegenerate,
}: RegenerateModalProps) {
  const [description, setDescription] = useState(currentDescription);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onRegenerate(tabKey, description.trim());
    }
  };

  const handleClose = () => {
    if (!isRegenerating) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            Regenerate {tabTitle}
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose}
            disabled={isRegenerating}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="description">
              App Description for Regeneration
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter app description to customize the regeneration..."
              disabled={isRegenerating}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Provide a description to help generate more relevant content for this tab.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isRegenerating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isRegenerating || !description.trim()}
              className="flex items-center gap-2"
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}