import { useEffect, useRef } from "react";

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

  useEffect(() => {
    if (!containerRef.current) return;

    // Load Monaco Editor
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/monaco-editor@0.44.0/min/vs/loader.js';
    script.onload = () => {
      window.require.config({ 
        paths: { vs: 'https://unpkg.com/monaco-editor@0.44.0/min/vs' } 
      });
      
      window.require(['vs/editor/editor.main'], () => {
        if (editorRef.current) {
          editorRef.current.dispose();
        }

        editorRef.current = window.monaco.editor.create(containerRef.current, {
          value: JSON.stringify(data, null, 2),
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

        editorRef.current.onDidChangeModelContent(() => {
          try {
            const newData = JSON.parse(editorRef.current.getValue());
            onUpdate(newData);
          } catch (error) {
            // Don't update if JSON is invalid
          }
        });
      });
    };

    document.head.appendChild(script);

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      const currentValue = editorRef.current.getValue();
      const newValue = JSON.stringify(data, null, 2);
      
      if (currentValue !== newValue) {
        editorRef.current.setValue(newValue);
      }
    }
  }, [data]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly: isLocked });
    }
  }, [isLocked]);

  return (
    <div className="monaco-container" ref={containerRef} />
  );
}
