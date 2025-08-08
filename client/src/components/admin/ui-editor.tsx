
import { useState } from "react";
import { Plus, X, Code, Trash2, Package, Globe, Smartphone, FileText, Star, Users, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface UIEditorProps {
  data: any;
  isLocked: boolean;
  onUpdate: (data: any) => void;
}

export default function UIEditor({ data, isLocked, onUpdate }: UIEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("promote-sharing");

  const updateValue = (path: string, value: any) => {
    const newData = JSON.parse(JSON.stringify(data));
    let current = newData;
    const pathArray = path.split('.');

    for (let i = 0; i < pathArray.length - 1; i++) {
      const segment = pathArray[i];
      if (current[segment] === undefined) {
        current[segment] = {};
      }
      current = current[segment];
    }

    const lastSegment = pathArray[pathArray.length - 1];
    current[lastSegment] = value;
    onUpdate(newData);
  };

  const renderEmptyState = (title: string, description: string, icon: any) => {
    const IconComponent = icon;
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <IconComponent className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground max-w-md">{description}</p>
      </div>
    );
  };

  const renderPromoteSharing = (pageData: any) => {
    if (!pageData) return renderEmptyState("No Content Available", "Configure your promotion sharing settings to get started.", MessageSquare);

    return (
      <div className="space-y-8">
        {/* Hero Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              Hero Section
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={pageData.hero?.title || ''}
                onChange={(e) => updateValue('page1_referralPromote.hero.title', e.target.value)}
                disabled={isLocked}
                placeholder="Enter hero title"
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Textarea
                value={pageData.hero?.subtitle || ''}
                onChange={(e) => updateValue('page1_referralPromote.hero.subtitle', e.target.value)}
                disabled={isLocked}
                placeholder="Enter hero subtitle"
                className="min-h-[80px]"
              />
            </div>
            <div>
              <Label>Badge Text</Label>
              <Input
                value={pageData.hero?.badge || ''}
                onChange={(e) => updateValue('page1_referralPromote.hero.badge', e.target.value)}
                disabled={isLocked}
                placeholder="Enter badge text"
              />
            </div>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <Card>
          <CardHeader>
            <CardTitle>Benefits</CardTitle>
            <p className="text-sm text-muted-foreground">Show users the advantages of participating</p>
          </CardHeader>
          <CardContent>
            {pageData.benefits?.map((benefit: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 mb-4">
                <div className="space-y-3">
                  <div>
                    <Label>Benefit Title</Label>
                    <Input
                      value={benefit.title || ''}
                      onChange={(e) => updateValue(`page1_referralPromote.benefits.${index}.title`, e.target.value)}
                      disabled={isLocked}
                      placeholder="Enter benefit title"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={benefit.desc || ''}
                      onChange={(e) => updateValue(`page1_referralPromote.benefits.${index}.desc`, e.target.value)}
                      disabled={isLocked}
                      placeholder="Enter benefit description"
                    />
                  </div>
                </div>
              </div>
            )) || <p className="text-muted-foreground">No benefits configured</p>}
          </CardContent>
        </Card>

        {/* Share Section */}
        <Card>
          <CardHeader>
            <CardTitle>Share Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Section Title</Label>
              <Input
                value={pageData.share?.section_title || ''}
                onChange={(e) => updateValue('page1_referralPromote.share.section_title', e.target.value)}
                disabled={isLocked}
                placeholder="Enter section title"
              />
            </div>
            <div>
              <Label>Primary CTA</Label>
              <Input
                value={pageData.share?.primary_cta || ''}
                onChange={(e) => updateValue('page1_referralPromote.share.primary_cta', e.target.value)}
                disabled={isLocked}
                placeholder="Enter primary call-to-action"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderReferrerStatus = (pageData: any) => {
    if (!pageData) return renderEmptyState("No Status Data", "Set up referrer status tracking to monitor progress.", Users);

    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Status Header
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={pageData.header?.title || ''}
                onChange={(e) => updateValue('page2_referralStatus.header.title', e.target.value)}
                disabled={isLocked}
                placeholder="Enter status title"
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input
                value={pageData.header?.subtitle || ''}
                onChange={(e) => updateValue('page2_referralStatus.header.subtitle', e.target.value)}
                disabled={isLocked}
                placeholder="Enter status subtitle"
              />
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle>Milestones</CardTitle>
            <p className="text-sm text-muted-foreground">Achievement levels for users</p>
          </CardHeader>
          <CardContent>
            {pageData.milestones?.map((milestone: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">Level {milestone.level}</Badge>
                  <span className="text-sm text-muted-foreground">Threshold: {milestone.threshold}</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={milestone.title || ''}
                      onChange={(e) => updateValue(`page2_referralStatus.milestones.${index}.title`, e.target.value)}
                      disabled={isLocked}
                      placeholder="Enter milestone title"
                    />
                  </div>
                  <div>
                    <Label>Message</Label>
                    <Textarea
                      value={milestone.message || ''}
                      onChange={(e) => updateValue(`page2_referralStatus.milestones.${index}.message`, e.target.value)}
                      disabled={isLocked}
                      placeholder="Enter milestone message"
                    />
                  </div>
                </div>
              </div>
            )) || <p className="text-muted-foreground">No milestones configured</p>}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPromoteDownload = (pageData: any) => {
    if (!pageData) return renderEmptyState("No Download Content", "Configure download promotion to drive app installs.", Smartphone);

    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Download Hero
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={pageData.hero?.title || ''}
                onChange={(e) => updateValue('page3_referralDownload.hero.title', e.target.value)}
                disabled={isLocked}
                placeholder="Enter download title"
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Textarea
                value={pageData.hero?.subtitle || ''}
                onChange={(e) => updateValue('page3_referralDownload.hero.subtitle', e.target.value)}
                disabled={isLocked}
                placeholder="Enter download subtitle"
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Feature Highlights */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            {pageData.feature_highlights?.map((feature: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 mb-4">
                <div className="space-y-3">
                  <div>
                    <Label>Feature Title</Label>
                    <Input
                      value={feature.title || ''}
                      onChange={(e) => updateValue(`page3_referralDownload.feature_highlights.${index}.title`, e.target.value)}
                      disabled={isLocked}
                      placeholder="Enter feature title"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={feature.desc || ''}
                      onChange={(e) => updateValue(`page3_referralDownload.feature_highlights.${index}.desc`, e.target.value)}
                      disabled={isLocked}
                      placeholder="Enter feature description"
                    />
                  </div>
                </div>
              </div>
            )) || <p className="text-muted-foreground">No features configured</p>}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderRedeemCode = (pageData: any) => {
    if (!pageData) return renderEmptyState("No Redeem Settings", "Set up code redemption flow for new users.", FileText);

    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Redeem Hero
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={pageData.hero?.title || ''}
                onChange={(e) => updateValue('page4_referralRedeem.hero.title', e.target.value)}
                disabled={isLocked}
                placeholder="Enter redeem title"
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input
                value={pageData.hero?.subtitle || ''}
                onChange={(e) => updateValue('page4_referralRedeem.hero.subtitle', e.target.value)}
                disabled={isLocked}
                placeholder="Enter redeem subtitle"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Form Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Form Label</Label>
              <Input
                value={pageData.form?.label || ''}
                onChange={(e) => updateValue('page4_referralRedeem.form.label', e.target.value)}
                disabled={isLocked}
                placeholder="Enter form label"
              />
            </div>
            <div>
              <Label>Placeholder</Label>
              <Input
                value={pageData.form?.placeholder || ''}
                onChange={(e) => updateValue('page4_referralRedeem.form.placeholder', e.target.value)}
                disabled={isLocked}
                placeholder="Enter form placeholder"
              />
            </div>
            <div>
              <Label>Primary CTA</Label>
              <Input
                value={pageData.form?.primary_cta || ''}
                onChange={(e) => updateValue('page4_referralRedeem.form.primary_cta', e.target.value)}
                disabled={isLocked}
                placeholder="Enter primary button text"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderNotifications = (notificationData: any) => {
    if (!notificationData) return renderEmptyState("No Notifications", "Configure notification settings to engage users.", MessageSquare);

    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Referrer Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notificationData.referrer?.map((notification: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 mb-4">
                <div className="space-y-3">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={notification.title || ''}
                      onChange={(e) => updateValue(`notifications.referrer.${index}.title`, e.target.value)}
                      disabled={isLocked}
                      placeholder="Enter notification title"
                    />
                  </div>
                  <div>
                    <Label>Body</Label>
                    <Textarea
                      value={notification.body || ''}
                      onChange={(e) => updateValue(`notifications.referrer.${index}.body`, e.target.value)}
                      disabled={isLocked}
                      placeholder="Enter notification body"
                    />
                  </div>
                  <div>
                    <Label>CTA Text</Label>
                    <Input
                      value={notification.cta || ''}
                      onChange={(e) => updateValue(`notifications.referrer.${index}.cta`, e.target.value)}
                      disabled={isLocked}
                      placeholder="Enter call-to-action text"
                    />
                  </div>
                </div>
              </div>
            )) || <p className="text-muted-foreground">No referrer notifications configured</p>}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderImages = (imageData: any) => {
    if (!imageData) return renderEmptyState("No Images", "Upload and manage images for your referral program.", Globe);

    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Image Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Logo</h4>
              <div className="space-y-3">
                <div>
                  <Label>URL</Label>
                  <Input
                    value={imageData.logo?.url || ''}
                    onChange={(e) => updateValue('images.logo.url', e.target.value)}
                    disabled={isLocked}
                    placeholder="Enter logo URL"
                  />
                </div>
                <div>
                  <Label>Alt Text</Label>
                  <Input
                    value={imageData.logo?.alt || ''}
                    onChange={(e) => updateValue('images.logo.alt', e.target.value)}
                    disabled={isLocked}
                    placeholder="Enter alt text"
                  />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Hero Image</h4>
              <div className="space-y-3">
                <div>
                  <Label>URL</Label>
                  <Input
                    value={imageData.hero?.url || ''}
                    onChange={(e) => updateValue('images.hero.url', e.target.value)}
                    disabled={isLocked}
                    placeholder="Enter hero image URL"
                  />
                </div>
                <div>
                  <Label>Alt Text</Label>
                  <Input
                    value={imageData.hero?.alt || ''}
                    onChange={(e) => updateValue('images.hero.alt', e.target.value)}
                    disabled={isLocked}
                    placeholder="Enter alt text"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAppDetails = (appData: any) => {
    if (!appData) return renderEmptyState("No App Details", "Configure your app information and metadata.", Package);

    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              App Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>App Name *</Label>
                <Input
                  value={appData.appName || ''}
                  onChange={(e) => updateValue('appDetails.appName', e.target.value)}
                  disabled={isLocked}
                  placeholder="Enter app name"
                />
              </div>
              <div>
                <Label>Package Name *</Label>
                <Input
                  value={appData.packageName || ''}
                  onChange={(e) => updateValue('appDetails.packageName', e.target.value)}
                  disabled={isLocked}
                  placeholder="com.example.app"
                />
              </div>
            </div>

            <div>
              <Label>App Description</Label>
              <Textarea
                value={appData.appDescription || ''}
                onChange={(e) => updateValue('appDetails.appDescription', e.target.value)}
                disabled={isLocked}
                placeholder="Describe your app"
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Version</Label>
                <Input
                  value={appData.version || ''}
                  onChange={(e) => updateValue('appDetails.version', e.target.value)}
                  disabled={isLocked}
                  placeholder="1.0.0"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={appData.category || ''}
                  onChange={(e) => updateValue('appDetails.category', e.target.value)}
                  disabled={isLocked}
                  placeholder="Business"
                />
              </div>
            </div>

            <div>
              <Label>Google Play URL</Label>
              <Input
                value={appData.playUrl || ''}
                onChange={(e) => updateValue('appDetails.playUrl', e.target.value)}
                disabled={isLocked}
                placeholder="https://play.google.com/store/apps/details?id=..."
              />
            </div>

            <div>
              <Label>App Store URL</Label>
              <Input
                value={appData.appStoreUrl || ''}
                onChange={(e) => updateValue('appDetails.appStoreUrl', e.target.value)}
                disabled={isLocked}
                placeholder="https://apps.apple.com/app/..."
              />
            </div>

            <div className="space-y-3">
              <Label>Features</Label>
              {appData.features?.map((feature: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...(appData.features || [])];
                      newFeatures[index] = e.target.value;
                      updateValue('appDetails.features', newFeatures);
                    }}
                    disabled={isLocked}
                    placeholder="Enter feature"
                  />
                </div>
              )) || <p className="text-muted-foreground text-sm">No features configured</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7 mb-8">
          <TabsTrigger value="promote-sharing">Promote Sharing</TabsTrigger>
          <TabsTrigger value="referrer-status">Referrer Status</TabsTrigger>
          <TabsTrigger value="promote-download">Promote Download</TabsTrigger>
          <TabsTrigger value="redeem-code">Redeem Code</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="app-details">App Details</TabsTrigger>
        </TabsList>

        <TabsContent value="promote-sharing" className="space-y-6">
          {renderPromoteSharing(data.page1_referralPromote)}
        </TabsContent>

        <TabsContent value="referrer-status" className="space-y-6">
          {renderReferrerStatus(data.page2_referralStatus)}
        </TabsContent>

        <TabsContent value="promote-download" className="space-y-6">
          {renderPromoteDownload(data.page3_referralDownload)}
        </TabsContent>

        <TabsContent value="redeem-code" className="space-y-6">
          {renderRedeemCode(data.page4_referralRedeem)}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          {renderNotifications(data.notifications)}
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          {renderImages(data.images)}
        </TabsContent>

        <TabsContent value="app-details" className="space-y-6">
          {renderAppDetails(data.appDetails)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
