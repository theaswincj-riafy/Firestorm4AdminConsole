
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { App } from "@shared/schema";

interface SidebarProps {
  apps: App[];
  selectedApp: App | null;
  isLoading: boolean;
  onSelectApp: (app: App) => void;
  onCreateApp: () => void;
  onEditApp: (app: App) => void;
  onDeleteApp: (appId: string) => void;
}

export default function Sidebar({
  apps,
  selectedApp,
  isLoading,
  onSelectApp,
  onCreateApp,
  onEditApp,
  onDeleteApp,
}: SidebarProps) {
  return (
    <aside className="admin-sidebar">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-foreground">
          Apps
        </h2>
      </div>

      {isLoading ? (
        <div className="p-6">
          <div className="animate-pulse">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      ) : apps.length === 0 ? (
        <div className="p-6 text-center">
          <h3 className="text-base font-medium mb-2 text-sidebar-foreground">
            No apps yet
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            No apps available for referral configuration.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {apps.map((app) => (
              <div
                key={app.appId}
                className={`group relative rounded-lg border transition-colors cursor-pointer hover:bg-accent/50 ${
                  selectedApp?.appId === app.appId 
                    ? "bg-blue-100 border-blue-400 shadow-md ring-1 ring-blue-300 dark:bg-blue-900 dark:border-blue-500 dark:ring-blue-600" 
                    : "border-border"
                }`}
                onClick={() => onSelectApp(app)}
              >
                <div className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm text-foreground truncate">
                        {app.appName}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {app.packageName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
