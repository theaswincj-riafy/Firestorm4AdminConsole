
import { useEffect, useRef, useCallback } from "react";

interface JsonEditorProps {
  data: any;
  isLocked: boolean;
  onUpdate: (data: any) => void;
  validateResult?: { valid: boolean; error?: string } | null;
}

declare global {
  interface Window {
    monaco: any;
    require: any;
  }
}

export default function JsonEditor({ data, isLocked, onUpdate, validateResult }: JsonEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const isUpdatingRef = useRef(false);
  const lastDataRef = useRef<string>('');

  const handleEditorChange = useCallback(() => {
    if (!editorRef.current || isUpdatingRef.current) return;

    try {
      const editorValue = editorRef.current.getValue();
      const parsedData = JSON.parse(editorValue);
      
      // Prevent infinite loops by checking if data actually changed
      const currentDataString = JSON.stringify(parsedData);
      if (currentDataString !== lastDataRef.current) {
        lastDataRef.current = currentDataString;
        onUpdate(parsedData);
      }
    } catch (error) {
      // Don't update if JSON is invalid - let the validation handle it
    }
  }, [onUpdate]);

  // Initialize Monaco Editor
  useEffect(() => {
    if (!containerRef.current) return;

    const initializeEditor = () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }

      try {
        const initialValue = JSON.stringify(data, null, 2);
        lastDataRef.current = JSON.stringify(data);

        editorRef.current = window.monaco.editor.create(containerRef.current, {
          value: initialValue,
          language: 'json',
          theme: 'vs',
          readOnly: isLocked,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          folding: true
        });

        // Debounce changes to prevent rapid updates
        let changeTimeout: NodeJS.Timeout;
        editorRef.current.onDidChangeModelContent(() => {
          clearTimeout(changeTimeout);
          changeTimeout = setTimeout(handleEditorChange, 300);
        });
      } catch (error) {
        console.error('Error creating Monaco editor:', error);
      }
    };

    // Check if Monaco is already loaded
    if (window.monaco) {
      initializeEditor();
    } else {
      // Load Monaco Editor
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/monaco-editor@0.44.0/min/vs/loader.js';
      script.onload = () => {
        window.require.config({ 
          paths: { vs: 'https://unpkg.com/monaco-editor@0.44.0/min/vs' } 
        });

        window.require(['vs/editor/editor.main'], () => {
          initializeEditor();
        });
      };
      document.head.appendChild(script);
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // Update editor content when data changes externally (from UI Editor)
  useEffect(() => {
    if (!editorRef.current || !data) return;

    try {
      const newDataString = JSON.stringify(data);
      if (newDataString !== lastDataRef.current) {
        const newValue = JSON.stringify(data, null, 2);
        const currentValue = editorRef.current.getValue();
        
        if (currentValue !== newValue) {
          isUpdatingRef.current = true;
          lastDataRef.current = newDataString;
          editorRef.current.setValue(newValue);
          // Reset flag after a short delay
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error updating Monaco editor content:', error);
    }
  }, [data]);

  // Update readonly state when isLocked changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly: isLocked });
    }
  }, [isLocked]);

  return (
    <div className="monaco-container" ref={containerRef} style={{ height: '100%', width: '100%' }} />
  );
}
