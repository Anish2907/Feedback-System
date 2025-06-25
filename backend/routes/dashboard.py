from fastapi import APIRouter, Depends
from bson import ObjectId
from auth import get_current_user
from database import db

router = APIRouter()

@router.get("/dashboard")
async def dashboard(user=Depends(get_current_user)):
    if user["role"] == "manager":
        # Get all employees under this manager
        employees_cursor = db.users.find({"manager_id": str(user["_id"])})
        employees = []
        async for emp in employees_cursor:
            emp.pop("password", None)
            emp["id"] = str(emp.pop("_id"))
            employees.append(emp)

        # Get all feedbacks written by this manager
        feedback_cursor = db.feedback.find({"manager_id": str(user["_id"])})
        feedbacks = []
        async for fb in feedback_cursor:
            fb["id"] = str(fb.pop("_id"))
            # fb["employeeId"] = str(fb.pop("employee_id"))
            feedbacks.append(fb)

        return {
            "employees": employees,
            "feedbacks": feedbacks
        }

    else:
        # Employee: show timeline of their feedbacks
        fb_list = await db.feedback.find({"employee_id": str(user["_id"])}).sort("created_at", -1).to_list(50)
        for f in fb_list:
            f["id"] = str(f.pop("_id"))
        return fb_list
