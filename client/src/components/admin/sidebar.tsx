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

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {apps.map((app) => (
            <div
              key={app.appId}
              className={`group relative rounded-lg border transition-colors cursor-pointer hover:bg-accent/50 ${
                selectedApp?.appId === app.appId 
                  ? "bg-accent border-accent-foreground/20" 
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
                  <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-blue-100 hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditApp(app);
                      }}
                      title="Edit app"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteApp(app.appId);
                      }}
                      title="Delete app"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="border-t border-sidebar-border p-4">
        <Button onClick={onCreateApp} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Create New App
        </Button>
      </div>
    </aside>
  );
}
