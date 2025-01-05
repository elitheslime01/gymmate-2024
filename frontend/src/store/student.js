import { create } from 'zustand'; // Ensure this import is correct

export  const useStudentStore = create((set, get) => ({
    students: [],
    user: null,
    isLoggedIn: false,
    isLoading: false,
    error: null,

    // Function to set students
    setStudents: (newStudents) => {
        console.log("Setting students in the store:", newStudents); // Debug log
        set({ students: newStudents });
    },

    // Function to create a new student
    createStudent: async (studentData) => {
        console.log("Attempting to create a new student:", studentData); // Debug log
        set({ isLoading: true, error: null }); // Start loading and reset error
        try {
            const response = await fetch('http://localhost:5000/api/students', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentData),
            });

            const result = await response.json();

            console.log("Response from server:", result); // Debug log

            if (response.ok) {
                console.log("Student created successfully:", result.data); // Debug log
                set((state) => ({
                    students: [...state.students, result.data], // Add new student to the list
                    isLoading: false, // Stop loading
                }));
                return { success: true }; // Return success
            } else {
                console.error("Error creating student:", result.message); // Debug log
                set({ error: result.message, isLoading: false }); // Set error message
                return { success: false, error: result.message }; // Return failure
            }
        } catch (error) {
            console.error("Error during student creation:", error); // Debug log
            set({ error: error.message, isLoading: false }); // Set error message
            return { success: false, error: error.message }; // Return failure
        }
    },
    
    loginStudent: async (email, password) => {
        // Input validation
        if (!email || !password) {
            return { success: false, message: "Please fill in all fields." };
        }
    
        set({ isLoading: true, error: null });
        try {
            const response = await fetch('http://localhost:5000/api/students/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
    
            if (response.ok) {
                set({ user: data.user, isLoggedIn: true, isLoading: false }); // Store user data
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
      const userId = get().user?.id; // Access the userId from the state
      if (!userId) {
          console.error("User ID not found.");
          return; // Exit if userId is not available
      }
    
      try {
          const response = await fetch('http://localhost:5000/api/students/logout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId }), // Send the user ID
          });
    
          if (response.ok) {
              set({ user: null, isLoggedIn: false }); // Reset the user state
          } else {
              // Handle error if needed
          }
      } catch (error) {
          console.error("Error during logout: ", error);
      }
    },
    
    clearError: () => {
        set({ error: null });
    },
}));