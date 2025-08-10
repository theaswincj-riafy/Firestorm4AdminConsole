import { useState, useCallback, useRef, useEffect } from "react";
import { Plus, X, Code, Trash2, Package, Globe, Smartphone, FileText, Star, Users, Calendar, MessageSquare, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import AppDetailsEditor from './app-details-editor';
import ImageEditor from './image-editor';

interface UIEditorProps {
  data: any;
  isLocked: boolean;
  onUpdate: (data: any) => void;
  tabKey: string;
}

export default function UIEditor({ data, isLocked, onUpdate, tabKey }: UIEditorProps) {
  // Local state to manage input values for immediate UI updates
  const [localData, setLocalData] = useState(data);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update local state when data prop changes (e.g., when switching tabs)
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);
  
  // Handle special tabs
  if (tabKey === 'app-details') {
    return (
      <AppDetailsEditor 
        data={data}
        isLocked={isLocked}
        onUpdate={onUpdate}
      />
    );
  }

  if (tabKey === 'image' || tabKey === 'images') {
    return (
      <ImageEditor 
        data={data}
        isLocked={isLocked}
        onUpdate={onUpdate}
      />
    );
  }

  const updateValue = useCallback((path: string, value: any) => {
    if (isLocked) return;

    try {
      // Update local state immediately for UI responsiveness
      const newLocalData = JSON.parse(JSON.stringify(localData || {}));
      let current = newLocalData;
      const pathArray = path.split('.');

      for (let i = 0; i < pathArray.length - 1; i++) {
        const segment = pathArray[i];
        if (current[segment] === undefined) {
          current[segment] = {};
        }
        current = current[segment];
      }

      const lastSegment = pathArray[pathArray.length - 1];
      current[lastSegment] = value;
      setLocalData(newLocalData);

      // Clear previous timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Debounce the parent update to avoid excessive re-renders
      debounceTimeoutRef.current = setTimeout(() => {
        onUpdate(newLocalData);
      }, 300);
    } catch (error) {
      console.error('Error updating value:', error);
    }
  }, [localData, isLocked, onUpdate]);

  const renderEmptyState = (title: string, description: string, icon: any) => {
    const IconComponent = icon;
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <IconComponent className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground max-w-md">{description}</p>
      </div>
    );
  };

  // Helper function to humanize field names
  const humanizeFieldName = (key: string): string => {
    return key
      .replace(/[_-]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/Id$/, 'ID')
      .replace(/Url$/, 'URL')
      .replace(/Cta$/, 'CTA')
      .replace(/Faq$/, 'FAQ');
  };

  // Helper function to determine field type
  const getFieldType = (value: any, key: string): 'text' | 'textarea' | 'number' | 'boolean' | 'array' | 'object' => {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object' && value !== null) return 'object';
    
    // Check for long text fields that should be textareas
    const textareaFields = ['desc', 'description', 'subtitle', 'message', 'body', 'text'];
    if (typeof value === 'string' && (
      value.length > 100 || 
      textareaFields.some(field => key.toLowerCase().includes(field))
    )) {
      return 'textarea';
    }
    
    return 'text';
  };

  // Dynamic field renderer
  const renderField = (value: any, path: string, key: string, level: number = 0): JSX.Element => {
    const fieldType = getFieldType(value, key);
    const fieldName = humanizeFieldName(key);
    const isExpanded = level < 2; // Auto-expand first 2 levels for now (can be made stateful later)

    switch (fieldType) {
      case 'boolean':
        return (
          <div key={path} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={path}
                checked={value || false}
                onCheckedChange={(checked) => updateValue(path, checked)}
                disabled={isLocked}
              />
              <Label htmlFor={path} className="text-sm font-medium">
                {fieldName}
              </Label>
            </div>
          </div>
        );

      case 'number':
        return (
          <div key={path} className="space-y-2">
            <Label htmlFor={path} className="text-sm font-medium">
              {fieldName}
            </Label>
            <Input
              id={path}
              type="number"
              value={value || 0}
              onChange={(e) => updateValue(path, Number(e.target.value))}
              disabled={isLocked}
              placeholder={`Enter ${fieldName.toLowerCase()}`}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={path} className="space-y-2">
            <Label htmlFor={path} className="text-sm font-medium">
              {fieldName}
            </Label>
            <Textarea
              id={path}
              value={value || ''}
              onChange={(e) => updateValue(path, e.target.value)}
              disabled={isLocked}
              placeholder={`Enter ${fieldName.toLowerCase()}`}
              className="min-h-[80px]"
            />
          </div>
        );

      case 'text':
        return (
          <div key={path} className="space-y-2">
            <Label htmlFor={path} className="text-sm font-medium">
              {fieldName}
            </Label>
            <Input
              id={path}
              value={value || ''}
              onChange={(e) => updateValue(path, e.target.value)}
              disabled={isLocked}
              placeholder={`Enter ${fieldName.toLowerCase()}`}
            />
          </div>
        );

      case 'array':
        return (
          <div key={path} className="space-y-3">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{fieldName} ({Array.isArray(value) ? value.length : 0} items)</span>
              </div>
              <div className="space-y-3">
                {Array.isArray(value) && value.map((item, index) => {
                  const itemPath = `${path}.${index}`;
                  if (typeof item === 'object' && item !== null) {
                    return (
                      <Card key={itemPath} className="p-4">
                        <div className="flex items-center mb-3">
                          <Badge variant="outline">Item {index + 1}</Badge>
                        </div>
                        <div className="space-y-4">
                          {renderObjectFields(item, itemPath, level + 1)}
                        </div>
                      </Card>
                    );
                  } else {
                    return (
                      <div key={itemPath} className="space-y-2">
                        <Label htmlFor={itemPath} className="text-sm font-medium">
                          {fieldName} {index + 1}
                        </Label>
                        <Input
                          id={itemPath}
                          value={item || ''}
                          onChange={(e) => {
                            const newArray = [...value];
                            newArray[index] = e.target.value;
                            updateValue(path, newArray);
                          }}
                          disabled={isLocked}
                          placeholder={`Enter ${fieldName.toLowerCase()} ${index + 1}`}
                        />
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          </div>
        );

      case 'object':
        return (
          <div key={path} className="space-y-3">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{fieldName}</span>
              </div>
              <div className="space-y-4 pl-4 border-l-2 border-muted">
                {renderObjectFields(value, path, level + 1)}
              </div>
            </div>
          </div>
        );

      default:
        return <div key={path} />;
    }
  };

  // Render all fields in an object
  const renderObjectFields = (obj: any, basePath: string, level: number = 0): JSX.Element[] => {
    if (!obj || typeof obj !== 'object') return [];
    
    return Object.entries(obj).map(([key, value]) => {
      const path = basePath ? `${basePath}.${key}` : key;
      return renderField(value, path, key, level);
    });
  };

  // Main dynamic content renderer
  const renderDynamicContent = () => {
    if (!localData || typeof localData !== 'object') {
      return renderEmptyState("No Data Available", "The content for this tab is not yet configured.", FileText);
    }

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          {renderObjectFields(localData, '', 0)}
        </div>
      </div>
    );
  };

  // Render content based on the tab key
  if (!tabKey) {
    return <div className="p-8">No tab selected</div>;
  }

  const renderContent = () => {
    // For all tabs, use the dynamic renderer
    return renderDynamicContent();
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl bg-background">
      {renderContent()}
    </div>
  );
}