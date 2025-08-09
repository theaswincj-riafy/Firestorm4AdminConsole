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

    // Check if Monaco is already loaded
    if (window.monaco && !editorRef.current) {
      try {
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
      } catch (error) {
        console.error('Error creating Monaco editor:', error);
      }
      return;
    }

    // Load Monaco Editor if not already loaded
    if (!window.monaco) {
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

          try {
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
          } catch (error) {
            console.error('Error creating Monaco editor:', error);
          }
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

  // Update editor content when data changes
  useEffect(() => {
    if (editorRef.current && data) {
      try {
        const currentValue = editorRef.current.getValue();
        const newValue = JSON.stringify(data, null, 2);
        
        // Only update if the content is actually different
        if (currentValue !== newValue) {
          // Temporarily remove the change listener to prevent infinite loop
          const currentModel = editorRef.current.getModel();
          if (currentModel) {
            currentModel.pushEditOperations([], [{
              range: currentModel.getFullModelRange(),
              text: newValue
            }], () => null);
          }
        }
      } catch (error) {
        console.error('Error updating Monaco editor content:', error);
      }
    }
  }, [data]);

  // Update readonly state when isLocked changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly: isLocked });
    }
  }, [isLocked]);

  return (
    <div className="monaco-container" ref={containerRef} />
  );
}