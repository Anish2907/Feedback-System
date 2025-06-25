import type { Feedback, User } from "../types"

const API_BASE_URL = "http://localhost:8000"

export interface LoginRequest {
    email: string
    password: string
}

export interface LoginResponse {
    user: User
    token: string
}

export interface ManagerDashboardResponse {
    employees: User[];
    feedbacks: Feedback[];
}

export interface CreateFeedbackRequest {
    employee_id: string
    strengths: string
    improvements: string
    sentiment: "positive" | "neutral" | "negative"
}

export interface UpdateFeedbackRequest {
    strengths?: string
    improvements?: string
    sentiment?: "positive" | "neutral" | "negative"
}

// API Helper function
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem("authToken")

    const config: RequestInit = {
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
}

// Auth API
export const authAPI = {
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const response = await apiRequest<LoginResponse>("/login", {
            method: "POST",
            body: JSON.stringify(credentials),
        })

        // Store token in localStorage
        localStorage.setItem("authToken", response.token)
        localStorage.setItem("currentUser", JSON.stringify(response.user))

        return response
    },

    async logout(): Promise<void> {
        try {
            await apiRequest("/auth/logout", {
                method: "POST",
            })
        } finally {
            localStorage.removeItem("authToken")
            localStorage.removeItem("currentUser")
        }
    },

    async getCurrentUser(): Promise<User> {
        return apiRequest<User>("/auth/me")
    },
}

// Users API
export const usersAPI = {
    async getTeamMembers(): Promise<User[]> {
        return apiRequest<User[]>("/team")
    },

    async getAllUsers(): Promise<User[]> {
        return apiRequest<User[]>("/users")
    },

    async getUser(userId: string): Promise<User> {
        return apiRequest<User>(`/users/${userId}`)
    }
}

//Dashboard API
export const dashboardAPI = {
    async getManagerDashboardData(): Promise<ManagerDashboardResponse> {
        return apiRequest<ManagerDashboardResponse>("/dashboard");
    }
}

// Feedback API
export const feedbackAPI = {
    async createFeedback(feedbackData: CreateFeedbackRequest): Promise<Feedback> {
        return apiRequest<Feedback>("/feedback", {
            method: "POST",
            body: JSON.stringify(feedbackData),
        })
    },

    async updateFeedback(feedbackId: string, updates: UpdateFeedbackRequest): Promise<Feedback> {
        return apiRequest<Feedback>(`/feedback/${feedbackId}`, {
            method: "PATCH",
            body: JSON.stringify(updates),
        })
    },

    async getFeedbackHistory(): Promise<Feedback[]> {
        return apiRequest<Feedback[]>(`/feedback`)
    },

    async getMyFeedback(): Promise<Feedback[]> {
        return apiRequest<Feedback[]>("/feedback")
    },

    async getTeamFeedback(): Promise<Feedback[]> {
        return apiRequest<Feedback[]>("/feedback/team")
    },

    async acknowledgeFeedback(feedbackId: string): Promise<Feedback> {
        return apiRequest<Feedback>(`/feedback/ack`, {
            method: "POST",
            body: JSON.stringify({ feedback_id: feedbackId })
        })
    },

    async getFeedbackById(feedbackId: string): Promise<Feedback> {
        return apiRequest<Feedback>(`/feedback/${feedbackId}`)
    },
}
