import type React from "react"
import { useState, useEffect } from "react"
import { useApp } from "../hooks/useApp"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { feedbackAPI, usersAPI } from "../services/api"
import { ArrowLeft, Save } from "lucide-react"
import type { User, Feedback } from "../types"

export default function FeedbackForm() {
    const { currentUser } = useApp()
    const navigate = useNavigate()
    const { employeeId, feedbackId } = useParams()

    const [employee, setEmployee] = useState<User | null>(null)
    const [existingFeedback, setExistingFeedback] = useState<Feedback | null>(null)
    const [strengths, setStrengths] = useState("")
    const [improvements, setImprovements] = useState("")
    const [sentiment, setSentiment] = useState<"positive" | "neutral" | "negative">("positive")
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        loadFormData()
    }, [employeeId, feedbackId])

    const loadFormData = async () => {
        try {
            setLoading(true)

            if (feedbackId) {
                // Load existing feedback for editing
                const feedback = await feedbackAPI.getFeedbackById(feedbackId)
                setExistingFeedback(feedback)
                setStrengths(feedback.strengths)
                setImprovements(feedback.improvements)
                setSentiment(feedback.sentiment)

                // Get employee info from team members
                const teamMembers = await usersAPI.getTeamMembers()
                const emp = teamMembers.find((u) => u.id === feedback.employee_id)
                setEmployee(emp || null)
            } else if (employeeId) {
                // Load employee info for new feedback
                const emp = await usersAPI.getUser(employeeId)
                setEmployee(emp || null)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load form data")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError("")

        try {
            if (feedbackId && existingFeedback) {
                await feedbackAPI.updateFeedback(existingFeedback.id, {
                    strengths,
                    improvements,
                    sentiment,
                })
            } else if (employeeId) {
                await feedbackAPI.createFeedback({
                    employee_id: employeeId,
                    strengths,
                    improvements,
                    sentiment,
                })
            }
            navigate("/")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to submit feedback")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading form...</p>
                </div>
            </div>
        )
    }

    if (!employee) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Employee not found</h2>
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

    return (
        currentUser?.role === "manager" ?
            (<div className="min-h-screen bg-gray-50">
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
                                    <h1 className="text-2xl font-bold text-gray-900">{feedbackId ? "Edit Feedback" : "New Feedback"}</h1>
                                    <p className="text-sm text-gray-600">
                                        {feedbackId ? "Update" : "Provide"} feedback for {employee.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">{error}</div>}

                    {/* Employee Info */}
                    <div className="bg-white rounded-lg shadow p-6 mb-8">
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
                    </div>

                    {/* Feedback Form */}
                    <div className="bg-white rounded-lg shadow">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Sentiment */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Overall Sentiment</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[
                                        { value: "positive", label: "Positive", emoji: "😊", color: "green" },
                                        { value: "neutral", label: "Neutral", emoji: "😐", color: "yellow" },
                                        { value: "negative", label: "Needs Improvement", emoji: "😔", color: "red" },
                                    ].map((option) => (
                                        <label
                                            key={option.value}
                                            className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${sentiment === option.value
                                                ? `border-${option.color}-500 ring-2 ring-${option.color}-500 bg-${option.color}-50`
                                                : "border-gray-300 hover:border-gray-400"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="sentiment"
                                                value={option.value}
                                                checked={sentiment === option.value}
                                                onChange={(e) => setSentiment(e.target.value as any)}
                                                className="sr-only"
                                                disabled={submitting}
                                            />
                                            <div className="flex items-center space-x-3">
                                                <span className="text-2xl">{option.emoji}</span>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{option.label}</p>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Strengths */}
                            <div>
                                <label htmlFor="strengths" className="block text-sm font-medium text-gray-700 mb-2">
                                    Strengths & Positive Contributions
                                </label>
                                <textarea
                                    id="strengths"
                                    rows={4}
                                    className="block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Highlight what this team member does well, their key contributions, and areas where they excel..."
                                    value={strengths}
                                    onChange={(e) => setStrengths(e.target.value)}
                                    required
                                    disabled={submitting}
                                />
                            </div>

                            {/* Areas for Improvement */}
                            <div>
                                <label htmlFor="improvements" className="block text-sm font-medium text-gray-700 mb-2">
                                    Areas for Growth & Development
                                </label>
                                <textarea
                                    id="improvements"
                                    rows={4}
                                    className="block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Provide constructive feedback on areas where they can grow, develop new skills, or improve performance..."
                                    value={improvements}
                                    onChange={(e) => setImprovements(e.target.value)}
                                    required
                                    disabled={submitting}
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => navigate("/")}
                                    disabled={submitting}
                                    className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            {feedbackId ? "Updating..." : "Submitting..."}
                                        </div>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            {feedbackId ? "Update Feedback" : "Submit Feedback"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>)
            : (
                <Navigate to={"/"} replace />
            )
    )
}
