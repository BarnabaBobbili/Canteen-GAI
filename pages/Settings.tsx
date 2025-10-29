
import React from 'react';
import Card from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Settings: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">My Profile</h2>
          <div className="space-y-4">
            <Input label="Full Name" value={user?.name} readOnly />
            <Input label="Email Address" value={user?.email} readOnly />
            <Input label="Role" value={user?.role} readOnly />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Change Password</h2>
          <form className="space-y-4">
            <Input label="Current Password" type="password" placeholder="••••••••" />
            <Input label="New Password" type="password" placeholder="••••••••" />
            <Input label="Confirm New Password" type="password" placeholder="••••••••" />
            <div className="pt-2">
              <Button>Update Password</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
