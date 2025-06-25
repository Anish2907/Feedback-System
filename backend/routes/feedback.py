from fastapi import APIRouter, Depends, HTTPException
from auth import get_current_user
from models import FeedbackCreate, FeedbackUpdate, FeedbackAck
from database import db
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/feedback")
async def give_feedback(data: FeedbackCreate, user=Depends(get_current_user)):
    if user["role"] != "manager":
        raise HTTPException(status_code=403, detail="Only managers allowed")

    emp = await db.users.find_one({"_id": ObjectId(data.employee_id)})
    if not emp or emp.get("manager_id") != str(user["_id"]):
        raise HTTPException(status_code=404, detail="Employee not found in your team")

    feedback = data.model_dump()
    feedback["manager_id"] = str(user["_id"])
    feedback["created_at"] = datetime.utcnow()
    feedback["acknowledged"] = False
    result = await db.feedback.insert_one(feedback)
    return {"id": str(result.inserted_id)}

@router.get("/feedback")
async def list_feedback(user=Depends(get_current_user)):
    if user["role"] == "employee":
        fb = await db.feedback.find({"employee_id": str(user["_id"])}).to_list(100)
    else:
        fb = await db.feedback.find({"manager_id": str(user["_id"])}).to_list(100)
    for f in fb:
        f["id"] = str(f["_id"])
        del f["_id"]
    return fb

@router.patch("/feedback/{fid}")
async def edit_feedback(fid: str, update: FeedbackUpdate, user=Depends(get_current_user)):
    feedback = await db.feedback.find_one({"_id": ObjectId(fid)})
    if not feedback or feedback["manager_id"] != str(user["_id"]):
        raise HTTPException(status_code=403)
    await db.feedback.update_one({"_id": ObjectId(fid)}, {"$set": update.dict(exclude_unset=True)})
    return {"msg": "Updated"}

@router.post("/feedback/ack")
async def acknowledge_feedback(data: FeedbackAck, user=Depends(get_current_user)):
    fb = await db.feedback.find_one({"_id": ObjectId(data.feedback_id)})
    if not fb or fb["employee_id"] != str(user["_id"]):
        raise HTTPException(status_code=403)
    await db.feedback.update_one({"_id": ObjectId(data.feedback_id)}, {"$set": {"acknowledged": True}})
    return {"msg": "Acknowledged"}

@router.get("/feedback/{feedback_id}")
async def get_feedback(feedback_id: str, user=Depends(get_current_user)):
    try:
        fb = await db.feedback.find_one({"_id": ObjectId(feedback_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid feedback ID format")

    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")

    # Authorization check
    if user["role"] == "employee" and fb["employee_id"] != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Access denied")
    if user["role"] == "manager" and fb["manager_id"] != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Access denied")

    fb["id"] = str(fb.pop("_id"))
    return fb
