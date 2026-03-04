import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Palette, Trash2, Save, Moon, Sun, Monitor } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { userApi } from '../services/api';
import BackButton from '../components/BackButton';
import ConfirmModal from '../components/ConfirmModal';

export default function Settings() {
  const { user, refreshUser, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState(user?.preferences?.notifications ?? true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await userApi.updateProfile({
        name,
        preferences: {
          ...user?.preferences,
          notifications,
        },
      });
      await refreshUser();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    try {
      await userApi.deleteAccount();
      toast.success('Account deleted');
      await logout();
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account preferences
          </p>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Profile Information
              </h2>
            </div>

            <div className="flex items-center gap-4 mb-6">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-secondary" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Appearance
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    theme === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <option.icon className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-amber-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h2>
            </div>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Email Notifications
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive updates about your analyses
                </p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
              </div>
            </label>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Subscription
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Current plan: <span className="font-medium capitalize">{user?.subscription.plan}</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Credits remaining: <span className="font-medium">{user?.subscription.credits}</span>
                </p>
              </div>
              {user?.subscription.plan === 'free' && (
                <button className="btn-primary">Upgrade to Pro</button>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card border-red-200 dark:border-red-900/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Danger Zone
              </h2>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
            >
              Delete Account
            </button>
          </motion.div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
        type="danger"
      />
    </div>
  );
}
