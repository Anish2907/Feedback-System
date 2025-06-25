from fastapi import APIRouter, HTTPException, Depends
from database import db
from auth import hash_pwd, verify_pwd, create_token, get_current_user
from models import UserCreate, UserLogin
from bson import ObjectId

router = APIRouter()

@router.post("/register")
async def register(user: UserCreate):
    if await db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already exists")
    user_dict = user.model_dump()
    user_dict["password"] = hash_pwd(user.password)
    await db.users.insert_one(user_dict)
    return {"msg": "Registered"}

# @router.post("/login")
# async def login(user: UserLogin):
#     found = await db.users.find_one({"email": user.email})
#     if not found or not verify_pwd(user.password, found["password"]):
#         raise HTTPException(status_code=401, detail="Invalid credentials")
#     token = create_token({"sub": user.email})
#     return {"access_token": token, "token_type": "bearer"}

@router.post("/login")
async def login(user: UserLogin):
    found = await db.users.find_one({"email": user.email})
    if not found or not verify_pwd(user.password, found["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Prepare user data (remove password and convert _id)
    found.pop("password", None)
    found["id"] = str(found.pop("_id"))

    # Add manager name if the user is an employee
    if found["role"] == "employee" and "manager_id" in found:
        manager = await db.users.find_one({"_id": ObjectId(found["manager_id"])})
        found["manager_name"] = manager["name"] if manager else None

    token = create_token({"sub": user.email})

    return {
        "user": found,
        "token": token
    }

@router.get("/users/{user_id}")
async def get_user(user_id: str):
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.pop("password", None)
    user["id"] = str(user.pop("_id"))

    return user

@router.get("/team")
async def get_team_employees(user=Depends(get_current_user)):
    if user["role"] != "manager":
        raise HTTPException(status_code=403, detail="Only managers can access their team")

    employees_cursor = db.users.find({"manager_id": str(user["_id"]), "role": "employee"})
    employees = []
    async for emp in employees_cursor:
        emp.pop("password", None)
        emp["id"] = str(emp.pop("_id"))
        employees.append(emp)

    return employees
