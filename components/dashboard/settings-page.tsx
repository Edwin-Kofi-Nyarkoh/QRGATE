"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  Bell,
  Shield,
  Globe,
  CreditCard,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showAttendance: true,
    allowMessages: false,
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
    toast({
      title: "Settings updated",
      description: "Your notification preferences have been saved",
    });
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
    toast({
      title: "Settings updated",
      description: "Your privacy settings have been saved",
    });
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch("/api/users/delete-account", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted",
      });

      // Sign out and redirect to home page
      await signOut({ redirect: false });
      router.push("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified about events and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("email", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">
                      Push Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notifications.push}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("push", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important updates via SMS
                    </p>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={notifications.sms}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("sms", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing-notifications">
                      Marketing Communications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional emails and event recommendations
                    </p>
                  </div>
                  <Switch
                    id="marketing-notifications"
                    checked={notifications.marketing}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("marketing", checked)
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Notification Types</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Event Reminders</Label>
                    <Select defaultValue="1day">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1hour">1 hour before</SelectItem>
                        <SelectItem value="1day">1 day before</SelectItem>
                        <SelectItem value="3days">3 days before</SelectItem>
                        <SelectItem value="1week">1 week before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ticket Updates</Label>
                    <Select defaultValue="immediate">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediately</SelectItem>
                        <SelectItem value="daily">Daily digest</SelectItem>
                        <SelectItem value="weekly">Weekly digest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control your privacy and what others can see
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="profile-visible">Public Profile</Label>
                    <p className="text-sm text-muted-foreground">
                      Make your profile visible to other users
                    </p>
                  </div>
                  <Switch
                    id="profile-visible"
                    checked={privacy.profileVisible}
                    onCheckedChange={(checked) =>
                      handlePrivacyChange("profileVisible", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-attendance">
                      Show Event Attendance
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Let others see which events you're attending
                    </p>
                  </div>
                  <Switch
                    id="show-attendance"
                    checked={privacy.showAttendance}
                    onCheckedChange={(checked) =>
                      handlePrivacyChange("showAttendance", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allow-messages">Allow Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow other users to send you messages
                    </p>
                  </div>
                  <Switch
                    id="allow-messages"
                    checked={privacy.allowMessages}
                    onCheckedChange={(checked) =>
                      handlePrivacyChange("allowMessages", checked)
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Data & Analytics</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Analytics Tracking</Label>
                      <p className="text-sm text-muted-foreground">
                        Help us improve by sharing anonymous usage data
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Personalized Recommendations</Label>
                      <p className="text-sm text-muted-foreground">
                        Get event recommendations based on your interests
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
                <CardDescription>
                  Manage your payment methods and billing information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No payment methods
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Add a payment method to make purchasing tickets easier
                  </p>
                  <Button>Add Payment Method</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>
                  View your past transactions and download receipts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No billing history available
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="account">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Account Preferences
                </CardTitle>
                <CardDescription>
                  Manage your account settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select defaultValue="utc">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="est">Eastern Time</SelectItem>
                        <SelectItem value="pst">Pacific Time</SelectItem>
                        <SelectItem value="cet">
                          Central European Time
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-900">Delete Account</h4>
                    <p className="text-sm text-red-700">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your account and remove all your data from our
                          servers, including:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Your profile and personal information</li>
                            <li>All your tickets and order history</li>
                            <li>
                              Any events you've created (if you're an organizer)
                            </li>
                            <li>All associated data and preferences</li>
                          </ul>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Yes, delete my account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
