import { z } from "zod";

export const appFormSchema = z.object({
  packageName: z.string().min(1, "Package name is required"),
  appName: z.string().min(1, "App name is required"),
  appDescription: z.string().min(1, "App description is required"),
  playUrl: z.string().url().optional().or(z.literal("")),
  appStoreUrl: z.string().url().optional().or(z.literal(""))
});

export type AppFormData = z.infer<typeof appFormSchema>;

export interface AppMeta {
  description?: string;
  playUrl?: string;
  appStoreUrl?: string;
}

export interface App {
  appId: string;
  appName: string;
  packageName: string;
  meta?: AppMeta;
}

export interface ConfigTab {
  [key: string]: any;
}

export interface AppConfig {
  [tabKey: string]: ConfigTab;
}

export interface TranslateResult {
  lang: string;
  status: string;
}

export interface RegenerateResult {
  tabKey: string;
  newSubtree: any;
}

export interface SaveResult {
  saved: boolean;
  revisedAt: string;
}
