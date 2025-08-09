
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
  // Tabs that should show full JSON response in JSON editor
  const fullJsonTabs = [
    'page1_referralPromote',
    'page2_referralStatus', 
    'page3_referralDownload',
    'page4_referralRedeem',
    'notifications'
  ];

  const shouldShowFullJson = editorMode === 'json' && fullJsonTabs.includes(tabKey);
  const jsonEditorData = shouldShowFullJson ? fullConfigData : tabData;

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
