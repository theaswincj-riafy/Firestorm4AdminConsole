
import UIEditor from "./ui-editor";
import JsonEditor from "./json-editor";

interface TabContentProps {
  tabKey: string;
  tabData: any;
  fullConfigData?: any;
  editorMode: 'ui' | 'json';
  isLocked: boolean;
  onUpdate: (data: any) => void;
  validateResult?: { valid: boolean; error?: string } | null;
}

export default function TabContent({
  tabKey,
  tabData,
  fullConfigData,
  editorMode,
  isLocked,
  onUpdate,
  validateResult
}: TabContentProps) {
  // For JSON editor, always show the full config data to maintain the original API structure
  const jsonEditorData = editorMode === 'json' ? fullConfigData : tabData;

  return (
    <div className="tab-content">
      {editorMode === 'ui' ? (
        <UIEditor
          data={tabData}
          isLocked={isLocked}
          onUpdate={onUpdate}
          tabKey={tabKey}
        />
      ) : (
        <JsonEditor
          data={jsonEditorData}
          isLocked={isLocked}
          onUpdate={onUpdate}
          validateResult={validateResult}
        />
      )}
    </div>
  );
}
