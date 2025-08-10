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
    // Use onTabDataUpdate for better change detection and to avoid JSON comparison issues
    if (newTabData && typeof newTabData === 'object') {
      onTabDataUpdate(tabKey, newTabData);
    }
  };

  const handleJsonUpdate = (newConfigData: any) => {
    // Update the full config data
    onUpdate(newConfigData);
  };

  // Special handling for JSON editor mode - show full config
  if (editorMode === 'json') {
    return (
      <div className="tab-content h-full flex flex-col overflow-hidden">
        <JsonEditor
          data={fullConfigData}
          isLocked={isLocked}
          onUpdate={handleJsonUpdate}
          validateResult={validateResult}
        />
      </div>
    );
  }

  // Special handling for app-details tab
  if (tabKey === 'app-details') {
    return (
      <div className="tab-content h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          <AppDetailsEditor
            data={selectedApp}
            isLocked={isLocked}
            onUpdate={onAppUpdate || (() => {})}
          />
        </div>
      </div>
    );
  }

  // Special handling for image tab
  if (tabKey === 'image') {
    const ImageEditor = require('./image-editor').default;
    return (
      <div className="tab-content h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <ImageEditor
            data={tabData}
            fullConfigData={fullConfigData}
            selectedApp={selectedApp}
            isLocked={isLocked}
            onUpdate={onUpdate}
            onTabDataUpdate={onTabDataUpdate}
          />
        </div>
      </div>
    );
  }

  // UI Editor mode - show specific tab content
  return (
    <div className="tab-content h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">
        <UIEditor
          data={tabData}
          isLocked={isLocked}
          onUpdate={handleUIUpdate}
          tabKey={tabKey}
        />
      </div>
    </div>
  );
}