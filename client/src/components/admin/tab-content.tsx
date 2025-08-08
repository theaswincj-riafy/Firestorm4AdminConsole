
import UIEditor from "./ui-editor";
import JsonEditor from "./json-editor";

interface TabContentProps {
  tabKey: string;
  tabData: any;
  editorMode: 'ui' | 'json';
  isLocked: boolean;
  onUpdate: (data: any) => void;
  validateResult?: { valid: boolean; error?: string } | null;
}

export default function TabContent({
  tabKey,
  tabData,
  editorMode,
  isLocked,
  onUpdate,
  validateResult
}: TabContentProps) {
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
          data={tabData}
          isLocked={isLocked}
          onUpdate={onUpdate}
          validateResult={validateResult}
        />
      )}
    </div>
  );
}
