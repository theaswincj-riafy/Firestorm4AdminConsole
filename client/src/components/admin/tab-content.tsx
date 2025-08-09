
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
  // For JSON editor, filter out images and appDetails for first 5 tabs
  const getJsonEditorData = () => {
    if (editorMode !== 'json' || !fullConfigData) return tabData;
    
    const firstFiveTabs = [
      'page1_referralPromote',
      'page2_referralStatus', 
      'page3_referralDownload',
      'page4_referralRedeem',
      'notifications'
    ];

    if (firstFiveTabs.includes(tabKey)) {
      // For first 5 tabs, exclude images and appDetails
      const { images, appDetails, ...filteredData } = fullConfigData;
      return filteredData;
    } else {
      // For images and appDetails tabs, show full config
      return fullConfigData;
    }
  };

  const jsonEditorData = getJsonEditorData();

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
