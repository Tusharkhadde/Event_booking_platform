import { useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import authService from '@/services/authService';
import profileService from '@/services/profileService';
import { toast } from '@/hooks/useToast';

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    user,
    profile,
    session,
    isAuthenticated,
    isLoading,
    isInitialized,
    login,
    logout: logoutStore,
    setLoading,
    setInitialized,
    setProfile,
    getRole,
    isAdmin,
    isOrganizer,
    isVendor,
  } = useAuthStore();

  // Initialize auth - only runs once
  const initializeAuth = useCallback(async () => {
    // Don't initialize again if already done
    if (isInitialized) {
      return;
    }

    try {
      setLoading(true);
      const currentSession = await authService.getSession();

      if (currentSession && currentSession.user) {
        try {
          const userProfile = await profileService.getProfile(currentSession.user.id);
          login(currentSession.user, currentSession, userProfile);
        } catch (profileError) {
          console.error('Failed to fetch profile:', profileError);
          // User exists but profile fetch failed - still log them in
          login(currentSession.user, currentSession, null);
        }
      } else {
        setInitialized(true);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setInitialized(true);
    }
  }, [isInitialized, login, setLoading, setInitialized]);

  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: async (data) => {
      const result = await authService.signUp(data);
      return result;
    },
    onSuccess: () => {
      toast({
        title: 'Account created!',
        description: 'Please check your email to verify your account.',
        variant: 'success',
      });
      navigate('/login');
    },
    onError: (error) => {
      console.error('Sign up error:', error);
      toast({
        title: 'Sign up failed',
        description: error.message || 'Failed to create account',
        variant: 'destructive',
      });
    },
  });

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: async (data) => {
      const result = await authService.signIn(data);
      return result;
    },
    onSuccess: async (data) => {
      // Log in immediately with session, fetch profile in background
      login(data.user, data.session, null);

      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
        variant: 'success',
      });

      // Fetch profile in background to get role
      let redirectRole = 'customer'; // default role
      try {
        const userProfile = await profileService.getProfile(data.user.id);
        if (userProfile) {
          setProfile(userProfile);
          redirectRole = userProfile.role;
        }
      } catch (profileError) {
        console.error('Failed to fetch profile after login:', profileError);
      }

      // Redirect based on role
      if (redirectRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (redirectRole === 'organizer') {
        navigate('/organizer/dashboard');
      } else if (redirectRole === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/');
      }
    },
    onError: (error) => {
      console.error('Sign in error:', error);
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      });
    },
  });

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: async () => {
      await authService.signOut();
    },
    onSuccess: () => {
      logoutStore();
      queryClient.clear();
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
      navigate('/');
    },
    onError: (error) => {
      console.error('Sign out error:', error);
      // Even if API fails, clear local state
      logoutStore();
      queryClient.clear();
      toast({
        title: 'Logged out',
        description: 'You have been logged out.',
      });
      navigate('/');
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async ({ userId, updates }) => {
      const result = await profileService.updateProfile(userId, updates);
      return result;
    },
    onSuccess: (data) => {
      setProfile(data);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
        variant: 'success',
      });
    },
    onError: (error) => {
      console.error('Update profile error:', error);
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });

  return {
    // State
    user,
    profile,
    session,
    isAuthenticated,
    isLoading,
    isInitialized,

    // Role helpers
    getRole,
    isAdmin,
    isOrganizer,
    isVendor,

    // Actions
    initializeAuth,
    signUp: signUpMutation.mutate,
    signIn: signInMutation.mutate,
    signOut: signOutMutation.mutate,
    updateProfile: updateProfileMutation.mutate,

    // Loading states
    isSigningUp: signUpMutation.isPending,
    isSigningIn: signInMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
  };
}

export default useAuth;