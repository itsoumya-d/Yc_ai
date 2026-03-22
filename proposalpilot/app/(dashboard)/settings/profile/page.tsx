'use client';

import { useState, useRef } from 'react';
import { updateProfile, uploadAvatar, exportAccountData, deleteAccount } from '@/lib/actions/account';
import { useTranslations } from 'next-intl';

export default function ProfilePage() {
  const t = useTranslations('profilePage');
  const tc = useTranslations('common');
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = await updateProfile({ full_name: name });
    setSaving(false);
    setMessage(result?.error ? 'Error: ' + result.error : t('profileUpdated'));
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    const result = await uploadAvatar(formData);
    if (result?.url) setAvatarUrl(result.url);
    setUploading(false);
  }

  async function handleExport() {
    const data = await exportAccountData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'my-account-data.json'; a.click();
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    await deleteAccount();
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('description')}</p>
      </div>

      {/* Avatar section */}
      <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">{t('profilePhoto')}</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">👤</span>
            )}
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {uploading ? t('uploading') : t('changePhoto')}
            </button>
            <p className="mt-1 text-xs text-gray-400">{t('photoHint')}</p>
          </div>
        </div>
      </section>

      {/* Name section */}
      <form onSubmit={handleSave} className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">{t('displayName')}</h2>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t('fullName')}</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('yourFullName')}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {message && <p className="text-sm text-green-600 dark:text-green-400">{message}</p>}
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors"
        >
          {saving ? t('saving') : t('saveChanges')}
        </button>
      </form>

      {/* Data export */}
      <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">{t('yourData')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('dataDescription')}</p>
        <button
          onClick={handleExport}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          {t('exportMyData')}
        </button>
      </section>

      {/* Danger zone */}
      <section className="rounded-xl border border-red-200 dark:border-red-800 p-6 space-y-4">
        <h2 className="font-semibold text-red-600 dark:text-red-400">{t('dangerZone')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('dangerDescription')}</p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            {t('deleteAccount')}
          </button>
        ) : (
          <div className="space-y-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/10">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{t('deleteConfirmation')}</p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? t('deleting') : t('confirmDelete')}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {tc('cancel')}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
