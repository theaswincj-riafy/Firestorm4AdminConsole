import { useState } from "react";
import { Plus, X, Code, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { humanizeKey, hasTemplateVariable } from "@/lib/form-utils";

interface UIEditorProps {
  data: any;
  isLocked: boolean;
  onUpdate: (data: any) => void;
}

export default function UIEditor({ data, isLocked, onUpdate }: UIEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("promote-sharing");
  const [expandedObjects, setExpandedObjects] = useState<Set<string>>(new Set());

  const updateValue = (path: string, value: any) => {
    const newData = JSON.parse(JSON.stringify(data));
    let current = newData;
    const pathArray = path.split('.').map(p => p.replace(/\[(\d+)\]/, '.$1'));

    for (let i = 0; i < pathArray.length - 1; i++) {
      const segment = pathArray[i];
      if (segment.includes('.')) {
        const keys = segment.split('.');
        if (current[keys[0]] === undefined) current[keys[0]] = {};
        current = current[keys[0]];
        for (let j = 1; j < keys.length; j++) {
          if (current[keys[j]] === undefined) current[keys[j]] = {};
          current = current[keys[j]];
        }
      } else {
        if (current[segment] === undefined) {
          current[segment] = {};
        }
        current = current[segment];
      }
    }

    const lastSegment = pathArray[pathArray.length - 1];
    if (lastSegment.includes('.')) {
      const keys = lastSegment.split('.');
      current[keys[0]][keys[1]] = value;
    } else {
      current[lastSegment] = value;
    }
    onUpdate(newData);
  };

  const handleAddArrayItem = (path: string) => {
    const newData = JSON.parse(JSON.stringify(data));
    let current = newData;
    const pathArray = path.split('.').map(p => p.replace(/\[(\d+)\]/, '.$1'));

    for (let i = 0; i < pathArray.length - 1; i++) {
      const segment = pathArray[i];
      if (segment.includes('.')) {
        const keys = segment.split('.');
        current = current[keys[0]][keys[1]];
      } else {
        current = current[segment];
      }
    }

    const arrayKey = pathArray[pathArray.length - 1];
    const array = current[arrayKey];
    if (Array.isArray(array)) {
      const template = array.length > 0 ?
        (typeof array[0] === 'object' ? JSON.parse(JSON.stringify(array[0])) : '') :
        '';
      array.push(template);
      onUpdate(newData);
    }
  };

  const handleRemoveArrayItem = (path: string, index: number) => {
    const newData = JSON.parse(JSON.stringify(data));
    let current = newData;
    const pathArray = path.split('.').map(p => p.replace(/\[(\d+)\]/, '.$1'));

    for (let i = 0; i < pathArray.length - 1; i++) {
      const segment = pathArray[i];
      if (segment.includes('.')) {
        const keys = segment.split('.');
        current = current[keys[0]][keys[1]];
      } else {
        current = current[segment];
      }
    }

    const arrayKey = pathArray[pathArray.length - 1];
    const array = current[arrayKey];
    if (Array.isArray(array)) {
      array.splice(index, 1);
      onUpdate(newData);
    }
  };

  const toggleObjectExpanded = (path: string) => {
    const newExpanded = new Set(expandedObjects);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedObjects(newExpanded);
  };

  const renderPrimitiveField = (key: string, value: any, path: string) => {
    const isTextArea = typeof value === 'string' && value.length > 100;

    return (
      <div className="space-y-3">
        <Label htmlFor={path} className="text-sm font-semibold text-foreground">
          {key.replace(/([A-Z])/g, ' $1').trim()}
        </Label>
        {isTextArea ? (
          <Textarea
            id={path}
            value={value || ''}
            onChange={(e) => updateValue(path, e.target.value)}
            disabled={isLocked}
            className="min-h-[120px] resize-none border-2 focus:border-primary transition-colors"
            placeholder="Enter text here..."
          />
        ) : (
          <Input
            id={path}
            value={value || ''}
            onChange={(e) => updateValue(path, e.target.value)}
            disabled={isLocked}
            className="border-2 focus:border-primary transition-colors"
            placeholder="Enter value..."
          />
        )}
      </div>
    );
  };

  const renderArrayField = (key: string, value: any[], path: string) => {
    const isRestrictedSection = ['benefits', 'milestones', 'featureHighlights'].includes(key);

    return (
      <Card className="mb-6 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg font-semibold text-foreground">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </CardTitle>
          {!isRestrictedSection && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddArrayItem(path)}
              disabled={isLocked}
              className="hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {value.map((item, index) => (
            <div key={index} className="group relative p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow">
              <div className="flex-1">
                {renderField(`${path}[${index}]`, item, [`${path}[${index}]`])}
              </div>
              {!isRestrictedSection && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveArrayItem(path, index)}
                  disabled={isLocked}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const renderObjectField = (key: string, value: any, path: string) => {
    return (
      <Card className="mb-6 shadow-sm border-l-4 border-l-primary/20">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg font-semibold text-foreground">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {Object.entries(value).map(([subKey, subValue]) => (
            <div key={subKey} className="space-y-2">
              {renderField(subKey, subValue, [`${path}.${subKey}`])}
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const renderField = (key: string, value: any, path: string[] = []): JSX.Element => {
    const currentPath = [...path, key];
    const pathString = currentPath.join('.');

    if (value === null || value === undefined) {
      return renderPrimitiveField(key, '', currentPath.join('.'));
    }

    if (typeof value === 'string') {
      return renderPrimitiveField(key, value, pathString);
    }

    if (typeof value === 'number') {
      return renderPrimitiveField(key, value, pathString);
    }

    if (typeof value === 'boolean') {
      return (
        <div key={pathString} className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={pathString}
              checked={value}
              onCheckedChange={(checked) => updateValue(pathString, checked)}
              disabled={isLocked}
            />
            <Label htmlFor={pathString} className="text-sm font-semibold text-foreground">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </Label>
          </div>
        </div>
      );
    }

    if (Array.isArray(value)) {
      return renderArrayField(key, value, pathString);
    }

    if (typeof value === 'object') {
      return renderObjectField(key, value, pathString);
    }

    return <div key={pathString}>Unsupported field type</div>;
  };

  const tabKeys = Object.keys(data);
  const tabNames = [
    "Promote Sharing",
    "Referrer Status",
    "Promote Download",
    "Redeem Code",
    "Notifications",
    "Images",
    "App Details"
  ];

  const tabData = tabKeys.reduce((acc, key) => {
    const tabName = tabNames.find(name => name.toLowerCase().replace(/\s+/g, '-') === key.toLowerCase().replace(/\s+/g, '-'));
    if (tabName) {
      acc[key] = { name: tabName, content: data[key] };
    }
    return acc;
  }, {} as Record<string, { name: string, content: any }>);

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          {tabKeys.map((key) => {
            const tabConfig = tabData[key];
            if (!tabConfig) return null;
            return (
              <TabsTrigger key={key} value={key.toLowerCase().replace(/\s+/g, '-')} className="capitalize">
                {tabConfig.name}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {tabKeys.map((key) => {
          const tabConfig = tabData[key];
          if (!tabConfig) return null;
          return (
            <TabsContent key={key} value={key.toLowerCase().replace(/\s+/g, '-')} className="p-6 border rounded-md bg-card/50 mt-6">
              <div className="grid gap-6">
                {Object.entries(tabConfig.content).map(([sectionKey, sectionValue]) => (
                  <div key={sectionKey} className="animate-in fade-in-50 duration-200">
                    {renderField(sectionKey, sectionValue, [sectionKey])}
                  </div>
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}