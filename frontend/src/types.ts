// Types
export interface User {
    id: string
    name: string
    email: string
    role: "manager" | "employee"
    managerId?: string
    managerName?: string
}

export interface Feedback {
    id: string
    managerId: string
    employee_id: string
    strengths: string
    improvements: string
    sentiment: "positive" | "neutral" | "negative"
    created_at: string
    updated_at: string
    acknowledged: boolean
}

// Context
// export interface AppContextType {
//     currentUser: User | null
//     users: User[]
//     feedbacks: Feedback[]
//     login: (email: string, password: string) => boolean
//     logout: () => void
//     submitFeedback: (feedback: Omit<Feedback, "id" | "createdAt" | "updatedAt">) => void
//     updateFeedback: (id: string, updates: Partial<Feedback>) => void
//     acknowledgeFeedback: (id: string) => void
// }
export interface AppContextType {
    currentUser: User | null
    loginUser: (userData: User) => void
    logoutUser: () => void
}