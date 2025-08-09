
import { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';

interface JsonEditorProps {
  data: any;
  isLocked: boolean;
  onUpdate: (data: any) => void;
  validateResult?: { valid: boolean; error?: string } | null;
}

export default function JsonEditor({ data, isLocked, onUpdate, validateResult }: JsonEditorProps) {
  const editorRef = useRef<any>(null);
  const [currentValue, setCurrentValue] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize editor value only once when data changes
  useEffect(() => {
    if (data) {
      try {
        const jsonString = JSON.stringify(data, null, 2);
        setCurrentValue(jsonString);
        
        // Update editor if it's already mounted and value is different
        if (editorRef.current && isInitialized) {
          const currentEditorValue = editorRef.current.getValue();
          if (currentEditorValue !== jsonString) {
            editorRef.current.setValue(jsonString);
          }
        }
      } catch (error) {
        console.error('Error stringifying data:', error);
        setCurrentValue('{}');
      }
    }
  }, [data, isInitialized]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    setIsInitialized(true);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!value || isLocked) return;
    
    setCurrentValue(value);
    
    try {
      const parsedData = JSON.parse(value);
      // Only call onUpdate if the parsed data is actually different
      if (JSON.stringify(parsedData) !== JSON.stringify(data)) {
        onUpdate(parsedData);
      }
    } catch (error) {
      // Don't update on invalid JSON, let user fix it
      console.warn('Invalid JSON, not updating:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 border rounded-md overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="json"
          value={currentValue}
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
          options={{
            readOnly: isLocked,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: 'on',
            folding: true,
            wordWrap: 'on',
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
          }}
          theme="vs-dark"
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
