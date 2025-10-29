import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const LoginPage: React.FC = () => {
  const [formType, setFormType] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(email, password);
    if (!success) {
      setError('Invalid email or password.');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
    }
    if (!name.trim()) {
        setError("Name is required.");
        return;
    }
    setLoading(true);
    const success = await signup(name, email, password);
    if (!success) {
        setError('Could not create account. The email might already be in use.');
    }
    // On success, the AuthContext will handle redirect.
    setLoading(false);
  };

  const toggleFormType = () => {
    setFormType(prev => (prev === 'login' ? 'signup' : 'login'));
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">CanteenOS</h1>
          <p className="mt-2 text-sm text-gray-600">
            {formType === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {error && <p className="text-sm text-center text-red-500">{error}</p>}

        {formType === 'login' ? (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <Input id="name" name="name" type="text" required placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Input id="email-address-signup" name="email" type="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Input id="password-signup" name="password" type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div>
                <Input id="confirm-password" name="confirm-password" type="password" required placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </div>
            <div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </div>
          </form>
        )}
        
        <div className="text-sm text-center">
          <button onClick={toggleFormType} className="font-medium text-primary-600 hover:text-primary-500">
            {formType === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
