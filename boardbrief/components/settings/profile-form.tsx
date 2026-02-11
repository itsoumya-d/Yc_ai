'use client';

import * as React from 'react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import { Upload, Loader2, Check } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface ProfileFormProps {
  user: {
    email?: string;
    full_name?: string;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    email: user.email || '',
    company_name: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const [notificationPreferences, setNotificationPreferences] = useState({
    meetingReminders: true,
    actionItemDueDates: true,
    resolutionUpdates: true,
    weeklyDigest: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setIsSaved(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: 'Image must be less than 2MB', variant: 'destructive' });
        return;
      }

      // Validate file type
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        toast({ title: 'Only PNG and JPEG images are supported', variant: 'destructive' });
        return;
      }

      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();

      // Upload avatar if changed
      let avatarUrl = null;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }

      // Update user metadata
      const updates: any = {
        data: {
          full_name: formData.full_name,
          company_name: formData.company_name,
        },
      };

      if (avatarUrl) {
        updates.data.avatar_url = avatarUrl;
      }

      const { error: updateError } = await supabase.auth.updateUser(updates);

      if (updateError) throw updateError;

      setIsSaved(true);
      toast({ title: 'Profile updated successfully' });

      // Reset saved state after 2 seconds
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error: any) {
      toast({ title: error.message || 'Failed to update profile', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: 'New passwords do not match', variant: 'destructive' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({ title: 'Password must be at least 8 characters', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast({ title: 'Password changed successfully' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordSection(false);
    } catch (error: any) {
      toast({ title: error.message || 'Failed to change password', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationToggle = (key: keyof typeof notificationPreferences) => {
    setNotificationPreferences({
      ...notificationPreferences,
      [key]: !notificationPreferences[key],
    });

    // Save to backend (you'll need to implement this)
    toast({ title: 'Notification preferences updated' });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-navy-900 mb-4">Profile Information</h3>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex items-center gap-4">
            <Avatar
              name={formData.full_name || user.email || 'User'}
              size="lg"
              src={avatarPreview || undefined}
              className="bg-navy-100 text-navy-700"
            />
            <div className="flex-1">
              <label
                htmlFor="avatar-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-navy-100 text-navy-900 rounded-lg text-sm font-medium cursor-pointer hover:bg-navy-200 transition-colors"
              >
                <Upload className="h-4 w-4" />
                Upload Photo
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <p className="text-xs text-navy-600 mt-1">
                PNG or JPEG, max 2MB
              </p>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-navy-700 mb-1">
              Full Name
            </label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-navy-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              disabled
              className="bg-navy-50 cursor-not-allowed"
            />
            <p className="text-xs text-navy-600 mt-1">
              Email cannot be changed
            </p>
          </div>

          {/* Company Name */}
          <div>
            <label htmlFor="company_name" className="block text-sm font-medium text-navy-700 mb-1">
              Company Name
            </label>
            <Input
              id="company_name"
              name="company_name"
              type="text"
              value={formData.company_name}
              onChange={handleInputChange}
              placeholder="Enter your company name"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gold-500 text-navy-900 hover:bg-gold-400"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : isSaved ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Password Change */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-navy-900 mb-4">Change Password</h3>

        {!showPasswordSection ? (
          <Button
            onClick={() => setShowPasswordSection(true)}
            variant="outline"
            className="border-navy-300 text-navy-900 hover:bg-navy-50"
          >
            Change Password
          </Button>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-navy-700 mb-1">
                New Password
              </label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Enter new password"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-navy-700 mb-1">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gold-500 text-navy-900 hover:bg-gold-400"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Changing...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordSection(false)}
                className="border-navy-300 text-navy-900 hover:bg-navy-50"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Notification Preferences */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-navy-900 mb-4">Email Notifications</h3>
        <p className="text-sm text-navy-600 mb-4">
          Choose what updates you want to receive via email
        </p>
        <div className="space-y-3">
          {Object.entries(notificationPreferences).map(([key, value]) => (
            <label
              key={key}
              className="flex items-center justify-between p-3 rounded-lg border border-navy-200 hover:bg-navy-50 cursor-pointer transition-colors"
            >
              <span className="text-sm font-medium text-navy-900">
                {key === 'meetingReminders' && 'Meeting Reminders'}
                {key === 'actionItemDueDates' && 'Action Item Due Dates'}
                {key === 'resolutionUpdates' && 'Resolution Updates'}
                {key === 'weeklyDigest' && 'Weekly Digest'}
              </span>
              <input
                type="checkbox"
                checked={value}
                onChange={() => handleNotificationToggle(key as keyof typeof notificationPreferences)}
                className="h-4 w-4 text-gold-500 border-navy-300 rounded focus:ring-gold-500"
              />
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}
