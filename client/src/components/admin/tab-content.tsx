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

  return (
    <div className="tab-content">
      {editorMode === 'ui' ? (
        <UIEditor
          data={tabData}
          isLocked={isLocked}
          onUpdate={(newTabData) => {
            // For UI editor, update only the specific tab data
            if (fullConfigData) {
              const updatedConfig = {
                ...fullConfigData,
                [tabKey]: newTabData
              };
              onUpdate(updatedConfig);
            }
          }}
          tabKey={tabKey}
        />
      ) : (
        <JsonEditor
          data={fullConfigData || tabData}
          isLocked={isLocked}
          onUpdate={onUpdate}
          validateResult={validateResult}
        />
      )}
    </div>
  );
}