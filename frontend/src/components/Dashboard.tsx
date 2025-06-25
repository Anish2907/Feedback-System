import { useApp } from "../hooks/useApp";
import EmployeeDashboard from "./EmployeeDashboard";
import ManagerDashboard from "./ManagerDashboard";

function Dashboard() {
    const { currentUser } = useApp();

    return (
        currentUser?.role === "manager" ? <ManagerDashboard /> : <EmployeeDashboard />
    )
}

export default Dashboard;