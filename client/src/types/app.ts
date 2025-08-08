import { z } from "zod";

// App types for frontend-only project
export interface App {
  id: string;
  appId: string;
  name: string;
  appName: string;
  packageName: string;
  description?: string;
  appDescription?: string;
  playUrl?: string;
  appStoreUrl?: string;
  config: Record<string, any>;
  meta?: {
    appDescription?: string;
    playUrl?: string;
    appStoreUrl?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export const appFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  packageName: z.string().optional(),
  appName: z.string().optional(),
  appDescription: z.string().optional(),
  playUrl: z.string().optional(),
  appStoreUrl: z.string().optional(),
});

export type AppFormData = z.infer<typeof appFormSchema>;