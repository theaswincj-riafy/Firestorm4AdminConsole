import { Plus, Edit2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { App } from "@shared/schema";

interface SidebarProps {
  apps: App[];
  selectedApp: App | null;
  isLoading: boolean;
  onSelectApp: (app: App) => void;
  onCreateApp: () => void;
  onEditApp: (app: App) => void;
}

export default function Sidebar({
  apps,
  selectedApp,
  isLoading,
  onSelectApp,
  onCreateApp,
  onEditApp,
}: SidebarProps) {
  const [isAppsCollapsed, setIsAppsCollapsed] = useState(false);

  if (isLoading) {
    return (
      <aside className="admin-sidebar">
        <div className="p-4 md:p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-16 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  if (apps.length === 0) {
    return (
      <aside className="admin-sidebar">
        <Collapsible open={!isAppsCollapsed} onOpenChange={setIsAppsCollapsed}>
          <CollapsibleTrigger asChild>
            <div className="p-4 md:p-6 border-b border-sidebar-border flex items-center justify-between cursor-pointer hover:bg-sidebar-accent/50 transition-colors">
              <h2 className="text-base font-semibold text-sidebar-foreground">
                Apps
              </h2>
              {isAppsCollapsed ? (
                <ChevronDown className="w-4 h-4 text-sidebar-foreground" />
              ) : (
                <ChevronUp className="w-4 h-4 text-sidebar-foreground" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>

        <div className="p-4 md:p-6 text-center">
              <h3 className="text-base font-medium mb-2 text-sidebar-foreground">
                No apps yet
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Create your first app to get started with referral configuration.
              </p>
              <Button onClick={onCreateApp} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create App
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </aside>
    );
  }

  return (
    <aside className="admin-sidebar">
      <Collapsible open={!isAppsCollapsed} onOpenChange={setIsAppsCollapsed}>
        <CollapsibleTrigger asChild>
          <div className="p-4 md:p-6 border-b border-sidebar-border flex items-center justify-between cursor-pointer hover:bg-sidebar-accent/50 transition-colors">
            <h2 className="text-base font-semibold text-sidebar-foreground">
              Apps ({apps.length})
            </h2>
            {isAppsCollapsed ? (
              <ChevronDown className="w-4 h-4 text-sidebar-foreground" />
            ) : (
              <ChevronUp className="w-4 h-4 text-sidebar-foreground" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-3 md:p-4">
            {apps.map((app) => (
              <div
                key={app.appId}
                className={`app-item group ${selectedApp?.appId === app.appId ? "active" : ""}`}
                onClick={() => onSelectApp(app)}
              >
                <div className="app-info min-w-0 flex-1">
                  <h3 className="truncate">{app.appName}</h3>
                  <p className="truncate">{app.packageName}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditApp(app);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </aside>
  );
}
