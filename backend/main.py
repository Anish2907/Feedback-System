from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import users, feedback, dashboard

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

app.include_router(users.router)
app.include_router(feedback.router)
app.include_router(dashboard.router)
