'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { updateUserProfile } from '@/lib/actions/neighborhoods'
import { User as UserIcon, Mail, Shield, LogOut, Save, CheckCircle } from 'lucide-react'
import type { User } from '@/types/database'
import { formatDate } from '@/lib/utils'

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const router = useRouter()

  async function loadUser() {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    setCurrentUser(profile as User)
    setFullName(profile?.full_name ?? '')
    setLoading(false)
  }

  useEffect(() => { loadUser() }, [])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    setSaved(false)

    const { error } = await updateUserProfile({ fullName: fullName.trim() || undefined })

    setSaving(false)
    if (error) {
      setSaveError(error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      loadUser()
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    setChangingPassword(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    setChangingPassword(false)

    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 4000)
    }
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading || !currentUser) {
    return (
      <div>
        <PageHeader title="Settings" />
        <div className="space-y-4 animate-pulse">
          <div className="h-40 bg-gray-200 rounded-xl" />
          <div className="h-56 bg-gray-100 rounded-xl" />
        </div>
      </div>
    )
  }

  const roleLabels: Record<string, string> = {
    admin: 'Admin',
    moderator: 'Moderator',
    member: 'Member',
  }

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and preferences" />

      <div className="space-y-5 max-w-2xl">
        {/* Profile overview */}
        <Card>
          <CardContent className="py-5">
            <div className="flex items-center gap-4">
              <Avatar
                src={currentUser.avatar_url}
                name={currentUser.full_name ?? currentUser.email}
                size="xl"
              />
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {currentUser.full_name ?? 'Neighbor'}
                </h2>
                <p className="text-sm text-gray-500">{currentUser.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={currentUser.role === 'admin' ? 'default' : 'secondary'}>
                    {roleLabels[currentUser.role] ?? currentUser.role}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    Member since {formatDate(currentUser.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserIcon size={16} className="text-green-600" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <Mail size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{currentUser.email}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed here</p>
              </div>

              {saveError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {saveError}
                </p>
              )}

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={saving} size="sm">
                  <Save size={14} />
                  {saving ? 'Saving...' : 'Save changes'}
                </Button>
                {saved && (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle size={14} />
                    Saved!
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change password */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield size={16} className="text-green-600" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="At least 8 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Repeat new password"
                />
              </div>

              {passwordError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {passwordError}
                </p>
              )}
              {passwordSuccess && (
                <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-1">
                  <CheckCircle size={13} />
                  Password updated successfully
                </p>
              )}

              <Button type="submit" disabled={changingPassword} size="sm" variant="outline">
                {changingPassword ? 'Updating...' : 'Update password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-red-100">
          <CardHeader>
            <CardTitle className="text-base text-red-600">Account Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Sign out of your account on this device.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut size={14} />
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
