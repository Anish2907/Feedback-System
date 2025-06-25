import { useState, useEffect } from "react"
import { useApp } from "../hooks/useApp"
import { useNavigate } from "react-router-dom"
import { dashboardAPI } from "../services/api"
import { Users, MessageSquare, TrendingUp, Plus, LogOut, Eye } from "lucide-react"
import type { User, Feedback } from "../types"

export default function ManagerDashboard() {
    const { currentUser, logoutUser } = useApp()
    const navigate = useNavigate()

    const [teamMembers, setTeamMembers] = useState<User[]>([])
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            setLoading(true)
            // const [membersData, feedbackData] = await Promise.all([usersAPI.getTeamMembers(), feedbackAPI.getTeamFeedback()])
            const { employees, feedbacks } = await dashboardAPI.getManagerDashboardData()

            setTeamMembers(employees)
            setFeedbacks(feedbacks)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load dashboard data")
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        logoutUser();
    }

    const getEmployeeFeedbacks = (employeeId: string) => {
        return feedbacks.filter((f) => f.employee_id === employeeId)
    }

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case "positive":
                return "text-green-600 bg-green-100"
            case "negative":
                return "text-red-600 bg-red-100"
            default:
                return "text-yellow-600 bg-yellow-100"
        }
    }

    const getSentimentStats = () => {
        const total = feedbacks.length
        const positive = feedbacks.filter((f) => f.sentiment === "positive").length
        const neutral = feedbacks.filter((f) => f.sentiment === "neutral").length
        const negative = feedbacks.filter((f) => f.sentiment === "negative").length

        return { total, positive, neutral, negative }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg">
                        <p className="font-medium">Error loading dashboard</p>
                        <p className="text-sm mt-1">{error}</p>
                        <button
                            onClick={loadDashboardData}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const stats = getSentimentStats()

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
                            <p className="text-sm text-gray-600">Welcome back, {currentUser?.name}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Users className="h-8 w-8 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Team Members</p>
                                <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <MessageSquare className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <TrendingUp className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Positive Feedback</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.positive}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Sentiment Breakdown</p>
                                <div className="flex space-x-2 mt-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        +{stats.positive}
                                    </span>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        ={stats.neutral}
                                    </span>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        -{stats.negative}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team Members */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Your Team</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {teamMembers.map((member) => {
                            const memberFeedbacks = getEmployeeFeedbacks(member.id)
                            const latestFeedback = memberFeedbacks.sort(
                                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                            )[0]

                            return (
                                <div key={member.id} className="px-6 py-4 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-indigo-600">
                                                        {member.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">{member.name}</h3>
                                                <p className="text-sm text-gray-500">{member.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-900">
                                                    {memberFeedbacks.length} feedback{memberFeedbacks.length > 1 ? "s" : ""}
                                                </p>
                                                {latestFeedback && (
                                                    <span
                                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(latestFeedback.sentiment)}`}
                                                    >
                                                        {latestFeedback.sentiment}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex space-x-2">
                                                {memberFeedbacks.length !== 0 && <button
                                                    onClick={() => navigate(`/feedback/history/${member.id}`)}
                                                    className="cursor-pointer inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </button>}
                                                <button
                                                    onClick={() => navigate(`/feedback/new/${member.id}`)}
                                                    className="cursor-pointer inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add Feedback
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
