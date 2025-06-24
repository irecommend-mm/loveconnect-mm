
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Heart, Mail, Lock, User as UserIcon, Play, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import SignupWizard from '@/components/SignupWizard';

const Auth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSignupWizard, setShowSignupWizard] = useState(false);
  const navigate = useNavigate();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Demo user credentials
  const demoCredentials = {
    email: 'demo@loveconnect.com',
    password: 'demo123456'
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          navigate('/');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back! 💕",
        description: "You've been logged in successfully.",
      });
    }

    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: demoCredentials.email,
      password: demoCredentials.password,
    });

    if (error) {
      toast({
        title: "Demo Login Error",
        description: "Demo account not available. Please create your own account.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome to Demo! 🚀",
        description: "You're now exploring with demo account.",
      });
    }

    setLoading(false);
  };

  if (showSignupWizard) {
    return <SignupWizard onComplete={() => setShowSignupWizard(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Modern Logo and Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-pink-200">
                <Heart className="h-12 w-12 text-white" fill="white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              LoveConnect
            </h1>
            <p className="text-gray-600 text-lg font-medium">Find your perfect match</p>
          </div>
        </div>

        {/* Demo Login Card - Prominent */}
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Play className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Try Demo Account</h3>
                <p className="text-white/90 text-sm">Experience LoveConnect instantly</p>
              </div>
              <Button 
                onClick={handleDemoLogin}
                className="w-full h-14 bg-white text-purple-600 hover:bg-gray-50 font-semibold text-lg rounded-2xl shadow-lg"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Continue as Demo User'}
              </Button>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-xs text-white space-y-1">
                <p className="font-medium">Demo Credentials:</p>
                <p>📧 {demoCredentials.email}</p>
                <p>🔐 {demoCredentials.password}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Login/Signup Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-2xl">
                <TabsTrigger value="login" className="text-sm font-semibold py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-sm font-semibold py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-gray-700 font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-12 h-14 border-2 border-gray-200 rounded-2xl focus:border-pink-400 focus:ring-pink-400 text-base"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-gray-700 font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-12 h-14 border-2 border-gray-200 rounded-2xl focus:border-pink-400 focus:ring-pink-400 text-base"
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold text-lg rounded-2xl shadow-lg"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In to LoveConnect'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-6">
                <div className="text-center space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-800">Ready to find love?</h3>
                    <p className="text-gray-600">Join thousands of people finding their perfect match</p>
                  </div>
                  <Button 
                    onClick={() => setShowSignupWizard(true)}
                    className="w-full h-14 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold text-lg rounded-2xl shadow-lg"
                  >
                    <Heart className="h-5 w-5 mr-2" />
                    Start Your Love Journey
                  </Button>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    By signing up, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
