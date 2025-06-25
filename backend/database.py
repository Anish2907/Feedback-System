from motor.motor_asyncio import AsyncIOMotorClient
from os import getenv

client = AsyncIOMotorClient(getenv("MONGODB_URI", "mongodb://localhost:27017"))
db = client.feedback_db
