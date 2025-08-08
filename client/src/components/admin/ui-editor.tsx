
import { useState } from "react";
import { Plus, X, Code, Trash2, Package, Globe, Smartphone, FileText, Star, Users, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UIEditorProps {
  data: any;
  isLocked: boolean;
  onUpdate: (data: any) => void;
  tabKey?: string;
}

export default function UIEditor({ data, isLocked, onUpdate, tabKey }: UIEditorProps) {
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
                onChange={(e) => updateValue('hero.title', e.target.value)}
                disabled={isLocked}
                placeholder="Enter hero title"
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Textarea
                value={pageData.hero?.subtitle || ''}
                onChange={(e) => updateValue('hero.subtitle', e.target.value)}
                disabled={isLocked}
                placeholder="Enter hero subtitle"
                className="min-h-[80px]"
              />
            </div>
            <div>
              <Label>Badge Text</Label>
              <Input
                value={pageData.hero?.badge || ''}
                onChange={(e) => updateValue('hero.badge', e.target.value)}
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
                      onChange={(e) => updateValue(`benefits.${index}.title`, e.target.value)}
                      disabled={isLocked}
                      placeholder="Enter benefit title"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={benefit.desc || ''}
                      onChange={(e) => updateValue(`benefits.${index}.desc`, e.target.value)}
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
                onChange={(e) => updateValue('share.section_title', e.target.value)}
                disabled={isLocked}
                placeholder="Enter section title"
              />
            </div>
            <div>
              <Label>Primary CTA</Label>
              <Input
                value={pageData.share?.primary_cta || ''}
                onChange={(e) => updateValue('share.primary_cta', e.target.value)}
                disabled={isLocked}
                placeholder="Enter primary call-to-action"
              />
            </div>
            <div>
              <Label>Copy Code CTA</Label>
              <Input
                value={pageData.share?.copy_code_cta || ''}
                onChange={(e) => updateValue('share.copy_code_cta', e.target.value)}
                disabled={isLocked}
                placeholder="Enter copy code button text"
              />
            </div>
            <div>
              <Label>Copy Link CTA</Label>
              <Input
                value={pageData.share?.copy_link_cta || ''}
                onChange={(e) => updateValue('share.copy_link_cta', e.target.value)}
                disabled={isLocked}
                placeholder="Enter copy link button text"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Proof */}
        <Card>
          <CardHeader>
            <CardTitle>Social Proof</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={pageData.social_proof?.title || ''}
                onChange={(e) => updateValue('social_proof.title', e.target.value)}
                disabled={isLocked}
                placeholder="Enter social proof title"
              />
            </div>
            <div>
              <Label>Bullet Points</Label>
              {pageData.social_proof?.bullets?.map((bullet: string, index: number) => (
                <Input
                  key={index}
                  value={bullet}
                  onChange={(e) => {
                    const newBullets = [...(pageData.social_proof.bullets || [])];
                    newBullets[index] = e.target.value;
                    updateValue('social_proof.bullets', newBullets);
                  }}
                  disabled={isLocked}
                  placeholder={`Bullet point ${index + 1}`}
                  className="mb-2"
                />
              )) || <p className="text-muted-foreground text-sm">No bullet points configured</p>}
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
                onChange={(e) => updateValue('header.title', e.target.value)}
                disabled={isLocked}
                placeholder="Enter status title"
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input
                value={pageData.header?.subtitle || ''}
                onChange={(e) => updateValue('header.subtitle', e.target.value)}
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
                      onChange={(e) => updateValue(`milestones.${index}.title`, e.target.value)}
                      disabled={isLocked}
                      placeholder="Enter milestone title"
                    />
                  </div>
                  <div>
                    <Label>Message</Label>
                    <Textarea
                      value={milestone.message || ''}
                      onChange={(e) => updateValue(`milestones.${index}.message`, e.target.value)}
                      disabled={isLocked}
                      placeholder="Enter milestone message"
                    />
                  </div>
                </div>
              </div>
            )) || <p className="text-muted-foreground">No milestones configured</p>}
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>FAQ</CardTitle>
          </CardHeader>
          <CardContent>
            {pageData.faq?.map((faqItem: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 mb-4">
                <div className="space-y-3">
                  <div>
                    <Label>Question</Label>
                    <Input
                      value={faqItem.q || ''}
                      onChange={(e) => updateValue(`faq.${index}.q`, e.target.value)}
                      disabled={isLocked}
                      placeholder="Enter question"
                    />
                  </div>
                  <div>
                    <Label>Answer</Label>
                    <Textarea
                      value={faqItem.a || ''}
                      onChange={(e) => updateValue(`faq.${index}.a`, e.target.value)}
                      disabled={isLocked}
                      placeholder="Enter answer"
                    />
                  </div>
                </div>
              </div>
            )) || <p className="text-muted-foreground">No FAQ items configured</p>}
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
                onChange={(e) => updateValue('hero.title', e.target.value)}
                disabled={isLocked}
                placeholder="Enter download title"
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Textarea
                value={pageData.hero?.subtitle || ''}
                onChange={(e) => updateValue('hero.subtitle', e.target.value)}
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
                      onChange={(e) => updateValue(`feature_highlights.${index}.title`, e.target.value)}
                      disabled={isLocked}
                      placeholder="Enter feature title"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={feature.desc || ''}
                      onChange={(e) => updateValue(`feature_highlights.${index}.desc`, e.target.value)}
                      disabled={isLocked}
                      placeholder="Enter feature description"
                    />
                  </div>
                </div>
              </div>
            )) || <p className="text-muted-foreground">No features configured</p>}
          </CardContent>
        </Card>

        {/* Store CTAs */}
        <Card>
          <CardHeader>
            <CardTitle>Store Download Buttons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Play Store Button Text</Label>
              <Input
                value={pageData.store_ctas?.play_store_button || ''}
                onChange={(e) => updateValue('store_ctas.play_store_button', e.target.value)}
                disabled={isLocked}
                placeholder="Enter Play Store button text"
              />
            </div>
            <div>
              <Label>App Store Button Text</Label>
              <Input
                value={pageData.store_ctas?.app_store_button || ''}
                onChange={(e) => updateValue('store_ctas.app_store_button', e.target.value)}
                disabled={isLocked}
                placeholder="Enter App Store button text"
              />
            </div>
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
                onChange={(e) => updateValue('hero.title', e.target.value)}
                disabled={isLocked}
                placeholder="Enter redeem title"
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input
                value={pageData.hero?.subtitle || ''}
                onChange={(e) => updateValue('hero.subtitle', e.target.value)}
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
                onChange={(e) => updateValue('form.label', e.target.value)}
                disabled={isLocked}
                placeholder="Enter form label"
              />
            </div>
            <div>
              <Label>Placeholder</Label>
              <Input
                value={pageData.form?.placeholder || ''}
                onChange={(e) => updateValue('form.placeholder', e.target.value)}
                disabled={isLocked}
                placeholder="Enter form placeholder"
              />
            </div>
            <div>
              <Label>Primary CTA</Label>
              <Input
                value={pageData.form?.primary_cta || ''}
                onChange={(e) => updateValue('form.primary_cta', e.target.value)}
                disabled={isLocked}
                placeholder="Enter primary button text"
              />
            </div>
            <div>
              <Label>Secondary CTA</Label>
              <Input
                value={pageData.form?.secondary_cta || ''}
                onChange={(e) => updateValue('form.secondary_cta', e.target.value)}
                disabled={isLocked}
                placeholder="Enter secondary button text"
              />
            </div>
          </CardContent>
        </Card>

        {/* Validation Messages */}
        <Card>
          <CardHeader>
            <CardTitle>Validation Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Empty Field Message</Label>
              <Input
                value={pageData.validation?.empty || ''}
                onChange={(e) => updateValue('validation.empty', e.target.value)}
                disabled={isLocked}
                placeholder="Enter empty field message"
              />
            </div>
            <div>
              <Label>Invalid Code Message</Label>
              <Input
                value={pageData.validation?.invalid || ''}
                onChange={(e) => updateValue('validation.invalid', e.target.value)}
                disabled={isLocked}
                placeholder="Enter invalid code message"
              />
            </div>
            <div>
              <Label>Success Message</Label>
              <Input
                value={pageData.validation?.success || ''}
                onChange={(e) => updateValue('validation.success', e.target.value)}
                disabled={isLocked}
                placeholder="Enter success message"
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
                      onChange={(e) => updateValue(`referrer.${index}.title`, e.target.value)}
                      disabled={isLocked}
                      placeholder="Enter notification title"
                    />
                  </div>
                  <div>
                    <Label>Body</Label>
                    <Textarea
                      value={notification.body || ''}
                      onChange={(e) => updateValue(`referrer.${index}.body`, e.target.value)}
                      disabled={isLocked}
                      placeholder="Enter notification body"
                    />
                  </div>
                  <div>
                    <Label>CTA Text</Label>
                    <Input
                      value={notification.cta || ''}
                      onChange={(e) => updateValue(`referrer.${index}.cta`, e.target.value)}
                      disabled={isLocked}
                      placeholder="Enter call-to-action text"
                    />
                  </div>
                </div>
              </div>
            )) || <p className="text-muted-foreground">No referrer notifications configured</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Redeemer Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {notificationData.redeemer?.length > 0 ? 
              notificationData.redeemer.map((notification: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
                  <div className="space-y-3">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={notification.title || ''}
                        onChange={(e) => updateValue(`redeemer.${index}.title`, e.target.value)}
                        disabled={isLocked}
                        placeholder="Enter notification title"
                      />
                    </div>
                    <div>
                      <Label>Body</Label>
                      <Textarea
                        value={notification.body || ''}
                        onChange={(e) => updateValue(`redeemer.${index}.body`, e.target.value)}
                        disabled={isLocked}
                        placeholder="Enter notification body"
                      />
                    </div>
                  </div>
                </div>
              )) : 
              <p className="text-muted-foreground">No redeemer notifications configured</p>
            }
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
                    onChange={(e) => updateValue('logo.url', e.target.value)}
                    disabled={isLocked}
                    placeholder="Enter logo URL"
                  />
                </div>
                <div>
                  <Label>Alt Text</Label>
                  <Input
                    value={imageData.logo?.alt || ''}
                    onChange={(e) => updateValue('logo.alt', e.target.value)}
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
                    onChange={(e) => updateValue('hero.url', e.target.value)}
                    disabled={isLocked}
                    placeholder="Enter hero image URL"
                  />
                </div>
                <div>
                  <Label>Alt Text</Label>
                  <Input
                    value={imageData.hero?.alt || ''}
                    onChange={(e) => updateValue('hero.alt', e.target.value)}
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
                  onChange={(e) => updateValue('appName', e.target.value)}
                  disabled={isLocked}
                  placeholder="Enter app name"
                />
              </div>
              <div>
                <Label>Package Name *</Label>
                <Input
                  value={appData.packageName || ''}
                  onChange={(e) => updateValue('packageName', e.target.value)}
                  disabled={isLocked}
                  placeholder="com.example.app"
                />
              </div>
            </div>

            <div>
              <Label>App Description</Label>
              <Textarea
                value={appData.appDescription || ''}
                onChange={(e) => updateValue('appDescription', e.target.value)}
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
                  onChange={(e) => updateValue('version', e.target.value)}
                  disabled={isLocked}
                  placeholder="1.0.0"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={appData.category || ''}
                  onChange={(e) => updateValue('category', e.target.value)}
                  disabled={isLocked}
                  placeholder="Business"
                />
              </div>
            </div>

            <div>
              <Label>Google Play URL</Label>
              <Input
                value={appData.playUrl || ''}
                onChange={(e) => updateValue('playUrl', e.target.value)}
                disabled={isLocked}
                placeholder="https://play.google.com/store/apps/details?id=..."
              />
            </div>

            <div>
              <Label>App Store URL</Label>
              <Input
                value={appData.appStoreUrl || ''}
                onChange={(e) => updateValue('appStoreUrl', e.target.value)}
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
                      updateValue('features', newFeatures);
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

  // Render content based on the tab key
  if (!tabKey) {
    return <div className="p-8">No tab selected</div>;
  }

  const renderContent = () => {
    switch (tabKey) {
      case 'page1_referralPromote':
        return renderPromoteSharing(data);
      case 'page2_referralStatus':
        return renderReferrerStatus(data);
      case 'page3_referralDownload':
        return renderPromoteDownload(data);
      case 'page4_referralRedeem':
        return renderRedeemCode(data);
      case 'notifications':
        return renderNotifications(data);
      case 'images':
        return renderImages(data);
      case 'appDetails':
        return renderAppDetails(data);
      default:
        return renderEmptyState("Unknown Tab", "This tab content is not recognized.", Package);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto bg-background">
      {renderContent()}
    </div>
  );
}
