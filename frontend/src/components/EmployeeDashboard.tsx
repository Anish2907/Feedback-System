import { useState, useEffect } from "react"
import { useApp } from "../hooks/useApp"
import { feedbackAPI } from "../services/api"
import { MessageSquare, CheckCircle, AlertCircle, LogOut } from "lucide-react"
import type { Feedback } from "../types"

export default function EmployeeDashboard() {
    const { currentUser, logoutUser } = useApp()

    const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null)

    useEffect(() => {
        loadMyFeedback()
    }, [])

    const loadMyFeedback = async () => {
        try {
            setLoading(true)
            const feedbackData = await feedbackAPI.getMyFeedback()
            setFeedbacks(feedbackData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load feedback")
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        logoutUser();
    }

    const handleAcknowledgeFeedback = async (feedbackId: string) => {
        try {
            setAcknowledgingId(feedbackId)
            const updatedFeedback = await feedbackAPI.acknowledgeFeedback(feedbackId)

            // Update the feedback in the local state
            setFeedbacks((prev) => prev.map((f) => (f.id === feedbackId ? updatedFeedback : f)))
        } catch (err) {
            console.error("Error acknowledging feedback:", err)
            setError(err instanceof Error ? err.message : "Failed to acknowledge feedback")
        } finally {
            setAcknowledgingId(null)
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const unacknowledgedCount = feedbacks.filter((f) => !f.acknowledged).length

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your feedback...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Feedback</h1>
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

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="cursor-pointer bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                        {error}
                        <button onClick={() => setError("")} className="ml-4 text-sm underline hover:no-underline">
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <MessageSquare className="h-8 w-8 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                                <p className="text-2xl font-bold text-gray-900">{feedbacks.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-8 w-8 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Unacknowledged</p>
                                <p className="text-2xl font-bold text-gray-900">{unacknowledgedCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Acknowledged</p>
                                <p className="text-2xl font-bold text-gray-900">{feedbacks.length - unacknowledgedCount}</p>
                            </div>
                        </div>
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
                            <p className="mt-1 text-sm text-gray-500">Your manager hasn't provided any feedback yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {feedbacks.map((feedback) => (
                                <div key={feedback.id} className="px-6 py-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-3">
                                                <span className="text-2xl">{getSentimentIcon(feedback.sentiment)}</span>
                                                <span
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(feedback.sentiment)}`}
                                                >
                                                    {feedback.sentiment}
                                                </span>
                                                <span className="text-sm text-gray-500">{formatDate(feedback.created_at)}</span>
                                                {feedback.updated_at && (
                                                    <span className="text-xs text-gray-400">(updated)</span>
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="text-sm font-medium text-green-800 mb-2">Strengths</h4>
                                                    <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">{feedback.strengths}</p>
                                                </div>

                                                <div>
                                                    <h4 className="text-sm font-medium text-blue-800 mb-2">Areas for Improvement</h4>
                                                    <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">{feedback.improvements}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="ml-6 flex flex-col items-end space-y-2">
                                            {!feedback.acknowledged && (
                                                <button
                                                    onClick={() => handleAcknowledgeFeedback(feedback.id)}
                                                    disabled={acknowledgingId === feedback.id}
                                                    className="cursor-pointer inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {acknowledgingId === feedback.id ? (
                                                        <div className="flex items-center">
                                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                                            Acknowledging...
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Acknowledge
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                            {feedback.acknowledged && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Acknowledged
                                                </span>
                                            )}
                                        </div>
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
