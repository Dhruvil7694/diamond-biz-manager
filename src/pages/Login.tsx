
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Gem, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // Handle login
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-diamond-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-diamond-300 to-diamond-600 mb-4 shadow-lg">
            <Gem className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-diamond-900">Diamond Business Management System</h1>
          <p className="text-diamond-600 mt-2">Sign in to access your dashboard</p>
        </div>
        
        <Card className="shadow-lg border-diamond-100">
          <CardHeader>
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address or Username</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="hiren.patel@example.com or Hiren Patel"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-diamond-200 focus-visible:ring-diamond-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-diamond-200 focus-visible:ring-diamond-500"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button 
                type="submit" 
                className="w-full bg-diamond-600 hover:bg-diamond-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Sign In
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Demo Account:</p>
          <p>Username: Hiren Patel</p>
          <p>Password: Hp#9879225849</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
