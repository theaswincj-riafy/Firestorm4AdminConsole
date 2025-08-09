import UIEditor from "./ui-editor";
import JsonEditor from "./json-editor";
import AppDetailsEditor from "./app-details-editor";

interface TabContentProps {
  tabKey: string;
  tabData: any;
  fullConfigData?: any;
  selectedApp?: any;
  editorMode: 'ui' | 'json';
  isLocked: boolean;
  onUpdate: (data: any) => void;
  onTabDataUpdate: (tabKey: string, newTabData: any) => void;
  onAppUpdate?: (appData: any) => void;
  validateResult?: { valid: boolean; error?: string } | null;
}

export default function TabContent({
  tabKey,
  tabData,
  fullConfigData,
  selectedApp,
  editorMode,
  isLocked,
  onUpdate,
  onTabDataUpdate,
  onAppUpdate,
  validateResult
}: TabContentProps) {

  const handleUIUpdate = (newTabData: any) => {
    // For UI editor, we need to update the specific tab data within the config structure
    if (newTabData && typeof newTabData === 'object') {
      // Extract the current tab data from referral_json.en structure if needed
      let updatedConfig = { ...fullConfigData };
      
      if (tabKey === 'app-details' || tabKey === 'images') {
        // For special tabs, update at root level
        updatedConfig = { ...updatedConfig, ...newTabData };
      } else {
        // For regular tabs, update within referral_json.en
        if (!updatedConfig.referral_json) updatedConfig.referral_json = {};
        if (!updatedConfig.referral_json.en) updatedConfig.referral_json.en = {};
        updatedConfig.referral_json.en[tabKey] = newTabData;
      }
      
      onUpdate(updatedConfig);
    }
  };

  const handleJsonUpdate = (newConfigData: any) => {
    // Update the full config data
    onUpdate(newConfigData);
  };

  // Special handling for app-details tab
  if (tabKey === 'app-details') {
    return (
      <div className="tab-content h-full flex flex-col">
        <AppDetailsEditor
          data={selectedApp}
          isLocked={isLocked}
          onUpdate={onAppUpdate || (() => {})}
        />
      </div>
    );
  }

  return (
    <div className="tab-content h-full flex flex-col p-4">
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