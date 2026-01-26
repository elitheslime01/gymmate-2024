import { create } from "zustand";
import API_BASE_URL from '../config';

const useFeedbackStore = create((set, get) => ({
  feedback: [],
  isLoading: false,
  error: null,
  filters: {
    startDate: "",
    endDate: "",
    search: "",
    category: "",
    status: "",
    sentiment: "",
  },

  setFilters: (updates) =>
    set((state) => ({ filters: { ...state.filters, ...updates } })),

  fetchFeedback: async () => {
    const { filters } = get();
    const params = new URLSearchParams();

    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.search) params.append("search", filters.search);
    if (filters.category) params.append("category", filters.category);
    if (filters.status) params.append("status", filters.status);
    if (filters.sentiment) params.append("sentiment", filters.sentiment);

  set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch feedback");
      }

      const result = await response.json();
      set({ feedback: result.data || [], isLoading: false });
    } catch (error) {
      console.error("Error fetching feedback:", error);
      set({ error: error.message || "Unexpected error", isLoading: false });
    }
  },

  clearFeedback: () => set({ feedback: [] }),
}));

export default useFeedbackStore;
