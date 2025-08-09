import { Plus, Lock, LockOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { App } from "@shared/schema";

interface SidebarProps {
  apps: App[];
  selectedApp: App | null;
  isLoading: boolean;
  onSelectApp: (app: App) => void;
  onCreateApp: () => void;
}

export default function Sidebar({
  apps,
  selectedApp,
  isLoading,
  onSelectApp,
  onCreateApp
}: SidebarProps) {
  if (isLoading) {
    return (
      <aside className="admin-sidebar">
        <div className="p-6">
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
        <div className="p-6 border-b border-sidebar-border">
          <h2 className="text-base font-semibold text-sidebar-foreground">
            Apps
          </h2>
        </div>

        <div className="p-6 text-center">
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
      </aside>
    );
  }

  return (
    <aside className="admin-sidebar">
      <div className="p-6 border-b border-sidebar-border">
        <h2 className="text-base font-semibold text-sidebar-foreground">
          Apps
        </h2>
      </div>

      <Collapsible defaultOpen>
        <CollapsibleTrigger className="w-full p-4 text-left hover:bg-sidebar-accent transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-sidebar-foreground">All Apps ({apps.length})</span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-3 md:p-4">
            {apps.map((app) => {
              const isLocked = lockedApps[app.appId] || false;

              return (
                <div
                  key={app.appId}
                  className={`group flex items-center justify-between p-2 md:p-3 mb-2 rounded-md cursor-pointer transition-colors ${
                    selectedApp?.appId === app.appId
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                  }`}
                  onClick={() => onSelectApp(app)}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">{app.appName}</h3>
                    <p className="text-xs text-muted-foreground truncate">{app.packageName}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAppLock(app.appId);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    title={isLocked ? "Unlock app" : "Lock app"}
                  >
                    {isLocked ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
                  </Button>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </aside>
  );
}
