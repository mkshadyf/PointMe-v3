import { useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import authService from '../services/authService';
import { User } from '../types/user';

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  twoFactorEnabled: boolean;
}

export const useAuth = () => {
  const { user, setUser, isAuthenticated, setIsAuthenticated, session, setSession } = useAuthStore();

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      setSession(response.session);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  }, [setUser, setSession, setIsAuthenticated]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
    } catch (error) {
      throw error;
    }
  }, [setUser, setSession, setIsAuthenticated]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      const response = await authService.register(email, password, name);
      setUser(response.user);
      setSession(response.session);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  }, [setUser, setSession, setIsAuthenticated]);

  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }, [setUser]);

  const updateSecuritySettings = useCallback(async (settings: SecuritySettings) => {
    try {
      await authService.updateSecuritySettings(settings);
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    user,
    isAuthenticated,
    session,
    login,
    logout,
    register,
    updateProfile,
    updateSecuritySettings,
  };
};
