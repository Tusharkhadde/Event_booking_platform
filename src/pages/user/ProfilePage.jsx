import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  Mail,
  Phone,
  Camera,
  Loader2,
  Shield,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { profileSchema } from '@/validations/authSchema';
import useAuth from '@/hooks/useAuth';
import useAuthStore from '@/store/authStore';
import { getInitials, formatDate } from '@/utils/helpers';
import { toast } from '@/hooks/useToast';

function ProfilePage() {
  const { profile, user } = useAuthStore();
  const { updateProfile, isUpdatingProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || '',
      phone: profile?.phone || '',
      avatar_url: profile?.avatar_url || '',
    },
  });

  const onSubmit = (data) => {
    updateProfile({
      userId: user.id,
      updates: data,
    });
  };

  const getRoleBadgeVariant = (role) => {
    const variants = {
      admin: 'destructive',
      organizer: 'default',
      vendor: 'secondary',
      customer: 'outline',
    };
    return variants[role] || 'outline';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile picture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6 md:flex-row">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(profile?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    <Camera className="mr-2 h-4 w-4" />
                    Change Photo
                  </Button>
                </div>

                {/* Profile Form */}
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex-1 space-y-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="name"
                          placeholder="Enter your name"
                          className="pl-10"
                          {...register('name')}
                          disabled={isUpdatingProfile}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-sm text-destructive">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Email Field (Read-only) */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          value={profile?.email || ''}
                          className="pl-10"
                          disabled
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="phone"
                          placeholder="Enter your phone number"
                          className="pl-10"
                          {...register('phone')}
                          disabled={isUpdatingProfile}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-sm text-destructive">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>

                    {/* Role Badge */}
                    <div className="space-y-2">
                      <Label>Account Type</Label>
                      <div className="flex h-10 items-center">
                        <Badge
                          variant={getRoleBadgeVariant(profile?.role)}
                          className="capitalize"
                        >
                          {profile?.role}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isUpdatingProfile || !isDirty}
                    >
                      {isUpdatingProfile && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Account Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium">
                      {formatDate(profile?.created_at, 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Status</p>
                    <p className="font-medium text-green-600">Active</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    placeholder="Confirm new password"
                  />
                </div>
                <Button type="button" onClick={() => toast({ title: 'Coming Soon', description: 'Password change will be available soon.' })}>
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Currently disabled
                  </p>
                </div>
                <Button variant="outline" onClick={() => toast({ title: 'Coming Soon', description: '2FA will be available soon.' })}>
                  Enable
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationPreference
                title="Email Notifications"
                description="Receive updates via email"
                defaultChecked={true}
              />
              <Separator />
              <NotificationPreference
                title="Event Reminders"
                description="Get reminded before your events"
                defaultChecked={true}
              />
              <Separator />
              <NotificationPreference
                title="Marketing Emails"
                description="Receive promotional content and offers"
                defaultChecked={false}
              />
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="destructive" onClick={() => toast({ title: 'Coming Soon', description: 'Account deletion will be available soon.' })}>
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationPreference({ title, description, defaultChecked }) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button
        variant={checked ? 'default' : 'outline'}
        size="sm"
        onClick={() => setChecked(!checked)}
      >
        {checked ? 'Enabled' : 'Disabled'}
      </Button>
    </div>
  );
}

export default ProfilePage;