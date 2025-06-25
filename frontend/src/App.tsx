import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./components/Login"
import FeedbackForm from "./components/FeedbackForm"
import FeedbackHistory from "./components/FeedbackHistory"
import AppContextProvider from "./context/AppContext"
import { useApp } from "./hooks/useApp"
import RequireAuth from "./components/RequireAuth"
import Dashboard from "./components/Dashboard"

// const AppContext = createContext<AppContextType | null>(null)

// export const useApp = () => {
//   const context = useContext(AppContext)
//   if (!context) throw new Error("useApp must be used within AppProvider")
//   return context
// }

function App() {
  const { currentUser } = useApp();
  // const [currentUser, setCurrentUser] = useState<User | null>(null)
  // const [users] = useState<User[]>(mockUsers)
  // const [feedbacks, setFeedbacks] = useState<Feedback[]>(mockFeedbacks)

  // useEffect(() => {
  //   const savedUser = localStorage.getItem("currentUser")
  //   if (savedUser) {
  //     setCurrentUser(JSON.parse(savedUser))
  //   }
  // }, [])

  // const login = (email: string, password: string): boolean => {
  //   // Simple mock authentication
  //   const user = users.find((u) => u.email === email)
  //   if (user && password === "password") {
  //     setCurrentUser(user)
  //     localStorage.setItem("currentUser", JSON.stringify(user))
  //     return true
  //   }
  //   return false
  // }

  // const logout = () => {
  //   setCurrentUser(null)
  //   localStorage.removeItem("currentUser")
  // }

  // const submitFeedback = (feedbackData: Omit<Feedback, "id" | "createdAt" | "updatedAt">) => {
  //   const newFeedback: Feedback = {
  //     ...feedbackData,
  //     id: Date.now().toString(),
  //     createdAt: new Date().toISOString(),
  //     updatedAt: new Date().toISOString(),
  //   }
  //   setFeedbacks((prev) => [...prev, newFeedback])
  // }

  // const updateFeedback = (id: string, updates: Partial<Feedback>) => {
  //   setFeedbacks((prev) =>
  //     prev.map((f) => (f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f)),
  //   )
  // }

  // const acknowledgeFeedback = (id: string) => {
  //   setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, acknowledged: true } : f)))
  // }

  // const contextValue: AppContextType = {
  //   currentUser,
  //   users,
  //   feedbacks,
  //   login,
  //   logout,
  //   submitFeedback,
  //   updateFeedback,
  //   acknowledgeFeedback,
  // }

  return (
    <AppContextProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <Login />} />

            <Route element={<RequireAuth />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/feedback/new/:employeeId" element={<FeedbackForm />} />
              <Route path="/feedback/edit/:feedbackId" element={<FeedbackForm />} />
              <Route path="/feedback/history/:employeeId" element={<FeedbackHistory />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AppContextProvider>
  )
}

export default App
