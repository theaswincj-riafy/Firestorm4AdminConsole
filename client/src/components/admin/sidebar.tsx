import { useState } from "react";
import { Plus, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { App } from "@shared/schema";

interface SidebarProps {
  apps: App[];
  selectedApp: App | null;
  onAppSelect: (app: App) => void;
  onCreateApp: () => void;
  onEditApp: (app: App) => void;
}

export default function Sidebar({
  apps,
  selectedApp,
  onAppSelect,
  onCreateApp,
  onEditApp
}: SidebarProps) {
  const [lockedApps] = useState<Set<string>>(new Set());

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h2 className="text-lg font-semibold">Apps</h2>
        <Button onClick={onCreateApp} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New App
        </Button>
      </div>

      <div className="sidebar-content">
        {apps.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No apps found</p>
            <p className="text-xs mt-1">Create your first app to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {apps.map((app) => (
              <div
                key={app.appId}
                className={`app-card ${selectedApp?.appId === app.appId ? 'selected' : ''} ${
                  lockedApps.has(app.appId) ? 'locked' : ''
                }`}
                onClick={() => onAppSelect(app)}
              >
                <div className="app-info">
                  <h3 className="app-name">{app.appName}</h3>
                  <p className="package-name">{app.packageName}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditApp(app);
                  }}
                  className="edit-button"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}