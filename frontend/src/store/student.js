import { create } from 'zustand';
import API_BASE_URL from '../config';

export  const useStudentStore = create((set, get) => ({
    students: [],
    user: null,
    isLoggedIn: false,
    isLoading: false,
    error: null,

    // Function to set students
    setStudents: (newStudents) => {
        console.log("Setting students in the store:", newStudents); 
        set({ students: newStudents });
    },

    // Function to create a new student
    createStudent: async (studentData) => {
        console.log("Attempting to create a new student:", studentData); 
        set({ isLoading: true, error: null }); 
        try {
            const response = await fetch(`${API_BASE_URL}/api/students`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentData),
            });

            const result = await response.json();

            console.log("Response from server:", result); 

            if (response.ok) {
                console.log("Student created successfully:", result.data); 
                set((state) => ({
                    students: [...state.students, result.data], 
                    isLoading: false, 
                }));
                return { success: true }; 
            } else {
                console.error("Error creating student:", result.message);
                set({ error: result.message, isLoading: false }); 
                return { success: false, error: result.message }; 
            }
        } catch (error) {
            console.error("Error during student creation:", error); 
            set({ error: error.message, isLoading: false }); 
            return { success: false, error: error.message }; 
        }
    },
    
    loginStudent: async (email, password) => {
        if (!email || !password) {
            return { success: false, message: "Please fill in all fields." };
        }
    
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`${API_BASE_URL}/api/students/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                // Store user data and userId in localStorage
                localStorage.setItem('userId', data.user._id);
                localStorage.setItem('userData', JSON.stringify(data.user));
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
        const { user } = get();
        if (!user?._id) {
            console.error("User ID not found.");
            return false;
        }
    
        try {
            const response = await fetch(`${API_BASE_URL}/api/students/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id }),
            });
    
            if (response.ok) {
                // Clear localStorage
                localStorage.removeItem('userId');
                localStorage.removeItem('userData');
                set({ user: null, isLoggedIn: false });
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error during logout:", error);
            return false;
        }
    },
    
    clearError: () => {
        set({ error: null });
    },
}));