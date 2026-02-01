import { create } from "zustand";
import API_BASE_URL from "../config";

const useUserManagementStore = create((set, get) => ({
  users: [],
  isLoading: false,
  error: null,
  viewType: "admin", // "admin" | "student"

  setViewType: (type) => set({ viewType: type }),

  fetchUsers: async (type) => {
    const viewType = type || get().viewType;
    set({ isLoading: true, error: null, viewType });

    const endpoint = viewType === "student" ? `${API_BASE_URL}/api/students` : `${API_BASE_URL}/api/admins`;

    const safeParse = async (response) => {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error("userManagement.fetchUsers: failed to parse JSON", {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          parseError: parseError.message,
          preview: text?.slice(0, 200),
        });
        return { raw: text, parseError: parseError.message };
      }
    };

    try {
      const response = await fetch(endpoint);
      const result = await safeParse(response);

      if (response.ok && (result?.success || Array.isArray(result))) {
        // Some student endpoints may return raw arrays
        const data = result?.data || result || [];
        set({ users: data || [], isLoading: false });
      } else {
        console.error("userManagement.fetchUsers: request failed", {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          body: result,
        });
        set({
          error: result?.message || result?.parseError || "Failed to load users.",
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("userManagement.fetchUsers: network or fetch error", {
        endpoint,
        message: error.message,
      });
      set({ error: error.message, isLoading: false });
    }
  },

  createUser: async (userData) => {
    // Creation is only wired for admins; hide button in UI for students.
    set({ isLoading: true, error: null });
    const timestamp = new Date().toISOString();
    const payload = {
      ...userData,
      _activeStat: userData?._activeStat ?? true,
      _dateReg: timestamp,
      _lastLogin: timestamp,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result?.success) {
        set((state) => ({
          users: [...state.users, result.data],
          isLoading: false,
        }));
        return { success: true };
      }

      set({
        error: result?.message || "Unable to create user.",
        isLoading: false,
      });
      return { success: false, message: result?.message };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, message: error.message };
    }
  },

  updateUser: async (userId, updates) => {
    const viewType = get().viewType;
    const endpoint = viewType === "student" ? `${API_BASE_URL}/api/students/${userId}` : `${API_BASE_URL}/api/admins/${userId}`;
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const result = await response.json();

      if (response.ok && result?.success) {
        set((state) => ({
          users: state.users.map((u) => (u._id === userId ? result.data : u)),
          isLoading: false,
        }));
        return { success: true };
      }

      set({ error: result?.message || "Unable to update user.", isLoading: false });
      return { success: false, message: result?.message };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, message: error.message };
    }
  },

  deleteUser: async (userId) => {
    const viewType = get().viewType;
    const endpoint = viewType === "student" ? `${API_BASE_URL}/api/students/${userId}` : `${API_BASE_URL}/api/admins/${userId}`;
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      const result = await response.json();

      if (response.ok && result?.success) {
        set((state) => ({
          users: state.users.filter((u) => u._id !== userId),
          isLoading: false,
        }));
        return { success: true };
      }

      set({ error: result?.message || "Unable to delete user.", isLoading: false });
      return { success: false, message: result?.message };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, message: error.message };
    }
  },
}));

export default useUserManagementStore;
