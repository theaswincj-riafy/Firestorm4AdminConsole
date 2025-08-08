import { useState } from "react";
import { Plus, X, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { humanizeKey, hasTemplateVariable } from "@/lib/form-utils";

interface UIEditorProps {
  data: any;
  isLocked: boolean;
  onUpdate: (data: any) => void;
}

export default function UIEditor({ data, isLocked, onUpdate }: UIEditorProps) {
  const [expandedObjects, setExpandedObjects] = useState<Set<string>>(new Set());

  const updateValue = (path: string[], value: any) => {
    const newData = JSON.parse(JSON.stringify(data));
    let current = newData;

    for (let i = 0; i < path.length - 1; i++) {
      if (current[path[i]] === undefined) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }

    current[path[path.length - 1]] = value;
    onUpdate(newData);
  };

  const addArrayItem = (path: string[]) => {
    const newData = JSON.parse(JSON.stringify(data));
    let current = newData;

    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }

    const array = current[path[path.length - 1]];
    if (Array.isArray(array)) {
      const template = array.length > 0 ? 
        (typeof array[0] === 'object' ? JSON.parse(JSON.stringify(array[0])) : array[0]) :
        '';
      array.push(template);
      onUpdate(newData);
    }
  };

  const removeArrayItem = (path: string[], index: number) => {
    const newData = JSON.parse(JSON.stringify(data));
    let current = newData;

    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }

    const array = current[path[path.length - 1]];
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

  const renderField = (key: string, value: any, path: string[] = []): JSX.Element => {
    const currentPath = [...path, key];
    const pathString = currentPath.join('.');

    if (value === null || value === undefined) {
      return (
        <div key={pathString} className="mb-4">
          <Label htmlFor={pathString}>{humanizeKey(key)}</Label>
          <Input
            id={pathString}
            value=""
            onChange={(e) => updateValue(currentPath, e.target.value)}
            disabled={isLocked}
          />
        </div>
      );
    }

    if (typeof value === 'string') {
      const isMultiline = value.length > 50 || value.includes('\n');
      const hasVariable = hasTemplateVariable(value);

      return (
        <div key={pathString} className="mb-4">
          <Label htmlFor={pathString} className="flex items-center">
            {humanizeKey(key)}
            {hasVariable && (
              <span className="variable-badge">
                <Code className="w-3 h-3" />
                uses variable
              </span>
            )}
          </Label>
          {isMultiline ? (
            <Textarea
              id={pathString}
              value={value}
              onChange={(e) => updateValue(currentPath, e.target.value)}
              disabled={isLocked}
              className="min-h-[80px]"
            />
          ) : (
            <Input
              id={pathString}
              value={value}
              onChange={(e) => updateValue(currentPath, e.target.value)}
              disabled={isLocked}
            />
          )}
        </div>
      );
    }

    if (typeof value === 'number') {
      return (
        <div key={pathString} className="mb-4">
          <Label htmlFor={pathString}>{humanizeKey(key)}</Label>
          <Input
            id={pathString}
            type="number"
            value={value}
            onChange={(e) => updateValue(currentPath, parseFloat(e.target.value) || 0)}
            disabled={isLocked}
          />
        </div>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <div key={pathString} className="mb-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={pathString}
              checked={value}
              onCheckedChange={(checked) => updateValue(currentPath, checked)}
              disabled={isLocked}
            />
            <Label htmlFor={pathString}>{humanizeKey(key)}</Label>
          </div>
        </div>
      );
    }

    if (Array.isArray(value)) {
      const isObjectArray = value.length > 0 && typeof value[0] === 'object';

      return (
        <div key={pathString} className="form-fieldset mb-4">
          <div className="form-fieldset-header">
            <h4 className="form-fieldset-title">{humanizeKey(key)}</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addArrayItem(currentPath)}
              disabled={isLocked}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>

          <div className="space-y-2">
            {value.map((item, index) => (
              <div key={`${pathString}-${index}`} className="repeater-item">
                <button
                  className="remove-btn"
                  onClick={() => removeArrayItem(currentPath, index)}
                  disabled={isLocked}
                >
                  <X className="w-3 h-3" />
                </button>

                {isObjectArray ? (
                  Object.keys(item).map((itemKey) =>
                    renderField(itemKey, item[itemKey], [...currentPath, index.toString()])
                  )
                ) : (
                  renderField('value', item, [...currentPath, index.toString()])
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (typeof value === 'object') {
      const isExpanded = expandedObjects.has(pathString);

      return (
        <div key={pathString} className="form-fieldset mb-4">
          <div className="form-fieldset-header">
            <button
              className="form-fieldset-title cursor-pointer hover:text-primary flex items-center gap-2"
              onClick={() => toggleObjectExpanded(pathString)}
            >
              <span>{isExpanded ? '▼' : '▶'}</span>
              {humanizeKey(key)}
            </button>
          </div>

          {isExpanded && (
            <div className="space-y-2">
              {Object.keys(value).map((objKey) =>
                renderField(objKey, value[objKey], currentPath)
              )}
            </div>
          )}
        </div>
      );
    }

    return <div key={pathString}>Unsupported field type</div>;
  };

  return (
    <div className="space-y-4">
      {Object.keys(data).map((key) => renderField(key, data[key]))}
    </div>
  );
}
