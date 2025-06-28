from pydantic import BaseModel
from typing import Optional, Literal, List

class UserCreate(BaseModel):
    email: str
    name: str
    password: str
    role: Literal["manager", "employee"]
    managerId: Optional[str] = None  # only for employees

class UserLogin(BaseModel):
    email: str
    password: str

class FeedbackCreate(BaseModel):
    employee_id: str
    strengths: str
    improvements: str
    sentiment: Literal["positive", "neutral", "negative"]

class FeedbackUpdate(BaseModel):
    strengths: Optional[str]
    improvements: Optional[str]
    sentiment: Optional[Literal["positive", "neutral", "negative"]]

class FeedbackAck(BaseModel):
    feedback_id: str
