import UIEditor from "./ui-editor";
import JsonEditor from "./json-editor";

interface TabContentProps {
  tabKey: string;
  tabData: any;
  fullConfigData?: any;
  editorMode: 'ui' | 'json';
  isLocked: boolean;
  onUpdate: (data: any) => void;
  onTabDataUpdate: (tabKey: string, newTabData: any) => void;
  validateResult?: { valid: boolean; error?: string } | null;
}

export default function TabContent({
  tabKey,
  tabData,
  fullConfigData,
  editorMode,
  isLocked,
  onUpdate,
  onTabDataUpdate,
  validateResult
}: TabContentProps) {

  const handleUIUpdate = (newTabData: any) => {
    // Update the tab data which will trigger a config update
    if (newTabData && typeof newTabData === 'object') {
      onTabDataUpdate(tabKey, newTabData);
    }
  };

  const handleJsonUpdate = (newConfigData: any) => {
    // Update the full config data
    onUpdate(newConfigData);
  };

  return (
    <div className="tab-content">
      {editorMode === 'ui' ? (
        <UIEditor
          data={tabData}
          isLocked={isLocked}
          onUpdate={handleUIUpdate}
          tabKey={tabKey}
        />
      ) : (
        <JsonEditor
          data={fullConfigData}
          isLocked={isLocked}
          onUpdate={handleJsonUpdate}
          validateResult={validateResult}
        />
      )}
    </div>
  );
}