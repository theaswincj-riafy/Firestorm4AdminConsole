
import { useEffect, useRef, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';

interface JsonEditorProps {
  data: any;
  isLocked: boolean;
  onUpdate: (data: any) => void;
  validateResult?: { valid: boolean; error?: string } | null;
}

export default function JsonEditor({ data, isLocked, onUpdate, validateResult }: JsonEditorProps) {
  const editorRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [editorValue, setEditorValue] = useState('{}');
  const dataRef = useRef<any>(null);
  const isUpdatingFromProp = useRef(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize editor value only when data prop changes from external source
  useEffect(() => {
    if (isUpdatingFromProp.current) {
      return;
    }

    try {
      // Handle null/undefined data
      const safeData = data || {};
      const currentDataString = JSON.stringify(dataRef.current);
      const newDataString = JSON.stringify(safeData);
      
      if (currentDataString !== newDataString) {
        dataRef.current = safeData;
        const jsonString = JSON.stringify(safeData, null, 2);
        setEditorValue(jsonString);
        
        // Update editor if it's already mounted, but preserve cursor position
        if (editorRef.current && isInitialized) {
          const position = editorRef.current.getPosition();
          const model = editorRef.current.getModel();
          if (model && model.getValue() !== jsonString) {
            // Only update if the new JSON is actually different and not empty
            if (jsonString !== '{}' || model.getValue() === '') {
              isUpdatingFromProp.current = true;
              editorRef.current.setValue(jsonString);
              if (position) {
                editorRef.current.setPosition(position);
              }
              setTimeout(() => {
                isUpdatingFromProp.current = false;
              }, 50);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing data:', error);
      const fallbackJson = '{}';
      setEditorValue(fallbackJson);
      dataRef.current = {};
    }
  }, [data, isInitialized]);

  const handleEditorDidMount = useCallback((editor: any) => {
    editorRef.current = editor;
    setIsInitialized(true);
    
    // Ensure editor has the correct value on mount
    if (data) {
      try {
        const jsonString = JSON.stringify(data, null, 2);
        if (editor.getValue() !== jsonString) {
          editor.setValue(jsonString);
        }
      } catch (error) {
        console.error('Error setting initial editor value:', error);
      }
    }
  }, [data]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (!value || isLocked || isUpdatingFromProp.current) return;
    
    // Clear existing debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Debounce the update to prevent excessive re-renders
    debounceTimeoutRef.current = setTimeout(() => {
      try {
        const parsedData = JSON.parse(value);
        isUpdatingFromProp.current = true;
        onUpdate(parsedData);
        setTimeout(() => {
          isUpdatingFromProp.current = false;
        }, 100);
      } catch (error) {
        // Don't update on invalid JSON, let user fix it
        console.warn('Invalid JSON, not updating:', error);
      }
    }, 300);
  }, [isLocked, onUpdate]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 border rounded-md overflow-hidden relative">
        <Editor
          height="100%"
          defaultLanguage="json"
          value={editorValue}
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
          options={{
            readOnly: isLocked,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: 'on',
            padding: { top: 16, bottom: 16 },
            lineHeight: 20,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            folding: true,
            wordWrap: 'on',
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
          }}
          theme="vs-dark"
          loading={<div className="flex items-center justify-center h-full">Loading editor...</div>}
        />
      </div>
      
      {validateResult && !validateResult.valid && (
        <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
          <strong>Validation Error:</strong> {validateResult.error}
        </div>
      )}
    </div>
  );
}
