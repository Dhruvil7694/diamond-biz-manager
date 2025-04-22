import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, CheckCircle2, Key, Shield, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Session {
  id: string;
  device: string;
  location: string;
  active: boolean;
  lastActive: string;
  ip: string;
}

const SecuritySettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    passwordLastChanged: '3 months ago',
    sessions: [
      { 
        id: '1', 
        device: 'Chrome on Windows', 
        location: 'Mumbai, India', 
        active: true, 
        lastActive: 'Now',
        ip: '103.86.xx.xx'
      },
      { 
        id: '2', 
        device: 'Safari on iPhone', 
        location: 'Mumbai, India', 
        active: false, 
        lastActive: '2 days ago',
        ip: '103.86.xx.xx'
      },
      { 
        id: '3', 
        device: 'Firefox on MacOS', 
        location: 'Delhi, India', 
        active: false, 
        lastActive: '5 days ago',
        ip: '110.54.xx.xx'
      }
    ]
  });
  
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  
  // Load security settings from localStorage on component mount
  useEffect(() => {
    const savedSecurity = localStorage.getItem('securitySettings');
    if (savedSecurity) {
      try {
        setSecurity(JSON.parse(savedSecurity));
      } catch (error) {
        console.error('Failed to parse saved security settings', error);
      }
    }
  }, []);
  
  // For demo purposes, simulate generating TOTP secrets
  useEffect(() => {
    if (showTwoFactorDialog && !twoFactorSecret) {
      // Simulate API request to generate TOTP secret
      setTimeout(() => {
        // This would normally come from your backend
        const mockSecret = 'KRTW6UTMKYYEWZLJ';
        setTwoFactorSecret(mockSecret);
        
        // Normally we'd generate a real QR code, but for the demo we'll use a placeholder
        setQrCodeUrl('/api/placeholder/200/200');
      }, 500);
    }
  }, [showTwoFactorDialog, twoFactorSecret]);
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };
  
  const validatePassword = () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation don't match. Please try again.",
        variant: "destructive",
      });
      return false;
    }
    
    if (passwords.new.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return false;
    }
    
    // Additional validation if needed
    const hasUpperCase = /[A-Z]/.test(passwords.new);
    const hasLowerCase = /[a-z]/.test(passwords.new);
    const hasNumber = /[0-9]/.test(passwords.new);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(passwords.new);
    
    if (!(hasUpperCase && hasLowerCase && hasNumber && hasSpecial)) {
      toast({
        title: "Password Not Strong Enough",
        description: "Password must contain uppercase, lowercase, number, and special characters.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const changePassword = async () => {
    if (!validatePassword()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
        variant: "default",
      });
      
      setPasswords({ current: '', new: '', confirm: '' });
      setSecurity(prev => {
        const updated = {
          ...prev,
          passwordLastChanged: 'Just now'
        };
        
        // Save to localStorage
        localStorage.setItem('securitySettings', JSON.stringify(updated));
        
        return updated;
      });
    } catch (error) {
      toast({
        title: "Password Change Failed",
        description: "There was a problem updating your password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const enableTwoFactor = async () => {
    // Normally you'd validate the verification code against the TOTP secret
    if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
      toast({
        title: "Invalid Verification Code",
        description: "Please enter a valid 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call to verify and enable 2FA
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSecurity(prev => {
        const updated = {
          ...prev,
          twoFactorAuth: true
        };
        
        // Save to localStorage
        localStorage.setItem('securitySettings', JSON.stringify(updated));
        
        return updated;
      });
      
      toast({
        title: "Two-Factor Authentication Enabled",
        description: "Your account is now more secure.",
        variant: "default",
      });
      
      setShowTwoFactorDialog(false);
      setVerificationCode('');
    } catch (error) {
      toast({
        title: "Two-Factor Setup Failed",
        description: "There was a problem enabling two-factor authentication.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const disableTwoFactor = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSecurity(prev => {
        const updated = {
          ...prev,
          twoFactorAuth: false
        };
        
        // Save to localStorage
        localStorage.setItem('securitySettings', JSON.stringify(updated));
        
        return updated;
      });
      
      toast({
        title: "Two-Factor Authentication Disabled",
        description: "Two-factor authentication has been turned off.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Failed to Disable",
        description: "There was a problem disabling two-factor authentication.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const endSession = async (sessionId: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSecurity(prev => {
        const updated = {
          ...prev,
          sessions: prev.sessions.filter(session => session.id !== sessionId)
        };
        
        // Save to localStorage
        localStorage.setItem('securitySettings', JSON.stringify(updated));
        
        return updated;
      });
      
      toast({
        title: "Session Ended",
        description: "The selected session has been terminated.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Failed to End Session",
        description: "There was a problem terminating the session.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const refreshSessions = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call to refresh session list
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      toast({
        title: "Sessions Refreshed",
        description: "Your active sessions list has been updated.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "There was a problem refreshing your sessions.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input 
              id="currentPassword"
              name="current"
              type="password"
              value={passwords.current}
              onChange={handlePasswordChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input 
              id="newPassword"
              name="new"
              type="password"
              value={passwords.new}
              onChange={handlePasswordChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input 
              id="confirmPassword"
              name="confirm"
              type="password"
              value={passwords.confirm}
              onChange={handlePasswordChange}
            />
          </div>
          
          <div className="text-xs space-y-1 text-muted-foreground">
            <p>Password requirements:</p>
            <ul className="list-disc ml-4 space-y-0.5">
              <li>At least 8 characters</li>
              <li>Must include uppercase letters</li>
              <li>Must include lowercase letters</li>
              <li>Must include at least one number</li>
              <li>Must include at least one special character</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Last changed: {security.passwordLastChanged}
          </div>
          <Button 
            onClick={changePassword} 
            disabled={isLoading || !passwords.current || !passwords.new || !passwords.confirm}
          >
            {isLoading ? 'Updating...' : (
              <>
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {security.twoFactorAuth ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">Two-factor authentication is enabled</p>
                <p className="text-sm text-green-600 mt-1">Your account is secured with an additional layer of protection.</p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-800">Two-factor authentication is not enabled</p>
                <p className="text-sm text-amber-600 mt-1">Secure your account with an additional verification step.</p>
              </div>
            </div>
          )}
          
          {security.twoFactorAuth ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Authentication app</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active
                </Badge>
              </div>
              <Button 
                variant="outline" 
                onClick={disableTwoFactor}
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={isLoading}
              >
                Disable Two-Factor Authentication
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => {
                setShowTwoFactorDialog(true);
                setTwoFactorSecret('');
                setQrCodeUrl('');
              }} 
              className="w-full"
              disabled={isLoading}
            >
              <Shield className="w-4 h-4 mr-2" />
              Enable Two-Factor Authentication
            </Button>
          )}
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>Manage devices that are logged into your account</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshSessions}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {security.sessions.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No active sessions found.</p>
              </div>
            ) : (
              security.sessions.map((session) => (
                <div 
                  key={session.id} 
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className="font-medium">{session.device}</span>
                      {session.active && (
                        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="flex space-x-4 text-sm text-muted-foreground mt-1">
                      <span>{session.location}</span>
                      <span>·</span>
                      <span>IP: {session.ip}</span>
                      <span>·</span>
                      <span>Last active: {session.lastActive}</span>
                    </div>
                  </div>
                  {!session.active && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => endSession(session.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={isLoading}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      End Session
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Two-Factor Authentication Setup Dialog */}
      <Dialog open={showTwoFactorDialog} onOpenChange={setShowTwoFactorDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app or enter the code manually.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* QR Code Display */}
            <div className="flex flex-col items-center justify-center space-y-4">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="QR Code" className="border p-2 rounded-md" />
              ) : (
                <div className="bg-gray-100 w-[200px] h-[200px] flex items-center justify-center rounded-md">
                  Loading...
                </div>
              )}
              
              {twoFactorSecret && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Manual entry code:</p>
                  <p className="font-mono bg-gray-100 p-2 rounded tracking-wider text-sm">
                    {twoFactorSecret}
                  </p>
                </div>
              )}
            </div>
            
            <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Keep this code secret. For demonstration purposes only.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code from your authenticator app to verify
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button 
              variant="outline" 
              onClick={() => setShowTwoFactorDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={enableTwoFactor}
              disabled={verificationCode.length !== 6 || isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify and Enable'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecuritySettings;