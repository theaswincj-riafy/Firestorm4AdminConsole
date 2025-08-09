
import JsonEditor from './json-editor';
import UIEditor from './ui-editor';

interface TabContentProps {
  activeTab: string;
  currentConfig: any;
  editorMode: 'ui' | 'json';
  isLocked: boolean;
  onConfigUpdate: (data: any) => void;
  validateResult?: { valid: boolean; error?: string } | null;
  tabs: string[];
}

export default function TabContent({
  activeTab,
  currentConfig,
  editorMode,
  isLocked,
  onConfigUpdate,
  validateResult,
  tabs
}: TabContentProps) {
  if (!activeTab || !currentConfig) return null;

  // Define which tabs should show the entire JSON (first 5 tabs)
  const firstFiveTabs = tabs.slice(0, 5);
  const shouldShowEntireJson = firstFiveTabs.includes(activeTab);
  
  // For images and appDetails tabs, keep current implementation (tab-specific data)
  const isImagesOrAppDetails = activeTab === 'images' || activeTab === 'appDetails';
  
  // Determine what data to show
  let dataToShow;
  if (editorMode === 'json' && shouldShowEntireJson && !isImagesOrAppDetails) {
    // Show entire JSON for first 5 tabs (excluding images and appDetails)
    dataToShow = currentConfig;
  } else {
    // Show tab-specific data for UI editor or for images/appDetails tabs
    dataToShow = currentConfig[activeTab];
  }

  const handleUpdate = (newData: any) => {
    if (editorMode === 'json' && shouldShowEntireJson && !isImagesOrAppDetails) {
      // Update the entire config when showing entire JSON
      onConfigUpdate(newData);
    } else {
      // Update only the current tab's data
      onConfigUpdate({
        ...currentConfig,
        [activeTab]: newData
      });
    }
  };

  return (
    <div className="tab-content">
      {editorMode === 'ui' ? (
        <UIEditor
          data={dataToShow}
          isLocked={isLocked}
          onUpdate={handleUpdate}
          tabKey={activeTab}
        />
      ) : (
        <JsonEditor
          data={dataToShow}
          isLocked={isLocked}
          onUpdate={handleUpdate}
          validateResult={validateResult}
        />
      )}
    </div>
  );
}
