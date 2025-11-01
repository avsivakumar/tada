import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { saveUser, getRegisteredUserEmail, verifyPassword, getUser } from '@/utils/auth';
import { Mail, Lock, CheckCircle2 } from 'lucide-react';

interface AuthScreenProps {
  onAuthenticated: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  useEffect(() => {
    const registeredEmail = getRegisteredUserEmail();
    if (registeredEmail) {
      setIsLogin(true);
      setEmail(registeredEmail);
    } else {
      setIsLogin(false);
      setEmail('');
    }
  }, []);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast({ title: 'Error', description: 'All fields are required', variant: 'destructive' });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    if (password.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }

    saveUser(email, password);
    toast({ title: 'Success', description: 'Account created successfully!' });
    onAuthenticated();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      toast({ title: 'Error', description: 'Password is required', variant: 'destructive' });
      return;
    }

    if (verifyPassword(password)) {
      toast({ title: 'Welcome back!', description: 'Login successful' });
      onAuthenticated();
    } else {
      toast({ title: 'Error', description: 'Incorrect password', variant: 'destructive' });
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const user = getUser();
    const registeredEmail = getRegisteredUserEmail();
    
    if (!user || !registeredEmail) {
      toast({ 
        title: 'Error', 
        description: 'No account found. Please sign up first.',
        variant: 'destructive'
      });
      setLoading(false);
      return;
    }

    if (forgotEmail.toLowerCase() !== registeredEmail.toLowerCase()) {
      toast({ 
        title: 'Error', 
        description: 'Email does not match our records.',
        variant: 'destructive'
      });
      setLoading(false);
      return;
    }

    setTimeout(() => {
      alert(`Your password is: ${user.password}\n\nPlease save it somewhere safe!`);
      toast({ 
        title: 'Password Retrieved', 
        description: 'Your password has been displayed.' 
      });
      setShowForgotPassword(false);
      setForgotEmail('');
      setLoading(false);
    }, 500);
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
            <CardDescription className="text-center">
              Enter your registered email to retrieve your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgotEmail">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="forgotEmail"
                    type="email"
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                Retrieve Password
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotEmail('');
                }}
              >
                Back to Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-center">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin ? 'Enter your password to continue' : 'Sign up to get started with Tada'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full">
              {isLogin ? 'Login' : 'Sign Up'}
            </Button>

            {isLogin && (
              <Button
                type="button"
                variant="link"
                className="w-full text-sm"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
