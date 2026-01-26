import { create } from 'zustand';
import API_BASE_URL from '../config';

export const useAdminStore = create((set, get) => ({
  user: null,
  isLoggedIn: false,
  isLoading: false,
  error: null,

  loginAdmin: async (email, password) => {
    if (!email || !password) {
        return { success: false, message: "Please fill in all fields." };
    }

    set({ isLoading: true, error: null });
    try {
        const response = await fetch(`${API_BASE_URL}/api/admins/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();

        if (response.ok) {
            set({ user: data.user, isLoggedIn: true, isLoading: false }); 
            return { success: true, message: "Login successful." };
        } else {
            set({ error: data.message || 'Login failed', isLoading: false });
            return { success: false, message: data.message || 'Login failed' };
        }
    } catch (error) {
        set({ error: 'An error occurred during login: ' + error.message, isLoading: false });
        return { success: false, message: 'An error occurred during login.' };
    }
},

logout: async () => {
  const userId = get().user?.id;
  if (!userId) {
      console.error("User ID not found.");
      return; 
  }

  try {
      const response = await fetch(`${API_BASE_URL}/api/admins/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
      });

      if (response.ok) {
          set({ user: null, isLoggedIn: false });
      }
  } catch (error) {
      console.error("Error during logout: ", error);
  }
},

clearError: () => {
    set({ error: null });
},
}));