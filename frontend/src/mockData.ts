import type { Feedback, User } from "./types"

// Mock data
export const mockUsers: User[] = [
    { id: "1", name: "Sarah Johnson", email: "sarah@company.com", role: "manager" },
    { id: "2", name: "Mike Chen", email: "mike@company.com", role: "employee", managerId: "1" },
    { id: "3", name: "Emily Davis", email: "emily@company.com", role: "employee", managerId: "1" },
    { id: "4", name: "Alex Rodriguez", email: "alex@company.com", role: "employee", managerId: "1" },
    { id: "5", name: "David Wilson", email: "david@company.com", role: "manager" },
    { id: "6", name: "Lisa Thompson", email: "lisa@company.com", role: "employee", managerId: "5" },
]

export const mockFeedbacks: Feedback[] = [
    {
        id: "1",
        managerId: "1",
        employeeId: "2",
        strengths:
            "Excellent problem-solving skills and great team collaboration. Always delivers high-quality code on time.",
        improvements:
            "Could benefit from taking more initiative in leading technical discussions and mentoring junior developers.",
        sentiment: "positive",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
        acknowledged: true,
    },
    {
        id: "2",
        managerId: "1",
        employeeId: "3",
        strengths: "Outstanding communication skills and excellent attention to detail. Great at documenting processes.",
        improvements: "Would like to see more proactive approach to identifying and solving problems before they escalate.",
        sentiment: "positive",
        createdAt: "2024-01-10T14:30:00Z",
        updatedAt: "2024-01-10T14:30:00Z",
        acknowledged: false,
    },
    {
        id: "3",
        managerId: "1",
        employeeId: "4",
        strengths: "Very creative and brings innovative solutions to complex problems. Strong technical skills.",
        improvements: "Needs to improve time management and meeting deadlines consistently.",
        sentiment: "neutral",
        createdAt: "2024-01-08T09:15:00Z",
        updatedAt: "2024-01-08T09:15:00Z",
        acknowledged: true,
    },
]