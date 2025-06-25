import { useState, useEffect } from "react"
import { useApp } from "../hooks/useApp"
import { useNavigate, useParams } from "react-router-dom"
import { feedbackAPI, usersAPI } from "../services/api"
import { ArrowLeft, Edit, Clock, CheckCircle, MessageSquare } from "lucide-react"
import type { User, Feedback } from "../types"

export default function FeedbackHistory() {
    const { currentUser } = useApp()
    const navigate = useNavigate()
    const { employeeId } = useParams()

    const [employee, setEmployee] = useState<User | null>(null)
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const isManager = currentUser?.role === "manager"
    const canViewFeedback = isManager || currentUser?.id === employeeId

    useEffect(() => {
        if (canViewFeedback && employeeId) {
            loadFeedbackHistory()
        } else {
            setLoading(false)
        }
    }, [employeeId, canViewFeedback])

    const loadFeedbackHistory = async () => {
        try {
            setLoading(true)

            const [feedbackData, emp] = await Promise.all([
                feedbackAPI.getFeedbackHistory(),
                usersAPI.getUser(employeeId!)
            ])

            setFeedbacks(feedbackData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
            setEmployee(emp || null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load feedback history")
        } finally {
            setLoading(false)
        }
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

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case "positive":
                return "😊"
            case "negative":
                return "😔"
            default:
                return "😐"
        }
    }

    const formatDate = (dateString: string): string => {
        // Trim microseconds to milliseconds (first 3 digits only)
        const cleaned = dateString?.replace(/\.(\d{3})\d*/, '.$1');
        const date = new Date(cleaned);

        if (isNaN(date.getTime())) return "Invalid Date";

        const day = date.getDate();
        const month = date.toLocaleString("en-US", { month: "long" });
        const year = date.getFullYear();

        return `${day} ${month} ${year}`;
    };




    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading feedback history...</p>
                </div>
            </div>
        )
    }

    if (!employee || !canViewFeedback) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
                    <p className="cursor-pointer mt-2 text-gray-600">You don't have permission to view this feedback.</p>
                    <button
                        onClick={() => navigate("/")}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg">
                        <p className="font-medium">Error loading feedback history</p>
                        <p className="text-sm mt-1">{error}</p>
                        <button
                            onClick={loadFeedbackHistory}
                            className="cursor-pointer mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate("/")}
                                className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Feedback History</h1>
                                <p className="text-sm text-gray-600">
                                    {employee.name} • {feedbacks.length} feedback{feedbacks.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Employee Info */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <span className="text-lg font-medium text-indigo-600">
                                        {employee.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">{employee.name}</h3>
                                <p className="text-sm text-gray-500">{employee.email}</p>
                            </div>
                        </div>

                        {isManager && (
                            <button
                                onClick={() => navigate(`/feedback/new/${employee.id}`)}
                                className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Add New Feedback
                            </button>
                        )}
                    </div>
                </div>

                {/* Feedback Timeline */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Feedback Timeline</h2>
                    </div>

                    {feedbacks.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No feedback yet</h3>
                            <p className="mt-1 text-sm text-gray-500">No feedback has been provided for this employee yet.</p>
                            {isManager && (
                                <button
                                    onClick={() => navigate(`/feedback/new/${employee.id}`)}
                                    className="cursor-pointer mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Add First Feedback
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {feedbacks.map((feedback) => (
                                <div key={feedback.id} className="px-6 py-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-4">
                                                <span className="text-2xl">{getSentimentIcon(feedback.sentiment)}</span>
                                                <span
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(feedback.sentiment)}`}
                                                >
                                                    {feedback.sentiment}
                                                </span>
                                                <div className="flex items-center text-sm text-gray-500 space-x-2">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{formatDate(feedback.created_at)}</span>
                                                </div>
                                                {feedback.updated_at && (
                                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                        Updated {formatDate(feedback.updated_at)}
                                                    </span>
                                                )}
                                                {feedback.acknowledged && (
                                                    <span className="inline-flex items-center text-xs text-green-600">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Acknowledged
                                                    </span>
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                        Strengths & Positive Contributions
                                                    </h4>
                                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                        <p className="text-sm text-gray-700 leading-relaxed">{feedback.strengths}</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                                        Areas for Growth & Development
                                                    </h4>
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                        <p className="text-sm text-gray-700 leading-relaxed">{feedback.improvements}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {isManager && (
                                            <div className="ml-6 flex flex-col space-y-2">
                                                <button
                                                    onClick={() => navigate(`/feedback/edit/${feedback.id}`)}
                                                    className="cursor-pointer inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Edit
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
