from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from database import db
import bcrypt
import os

SECRET = os.getenv("JWT_SECRET", "secret123")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def hash_pwd(pwd):
    return bcrypt.hashpw(pwd.encode(), bcrypt.gensalt()).decode()

def verify_pwd(pwd, hashed):
    return bcrypt.checkpw(pwd.encode(), hashed.encode())

def create_token(data: dict, expires=60):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET, algorithm="HS256")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        user = await db.users.find_one({"email": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
