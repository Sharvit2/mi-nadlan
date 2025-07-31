from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional
import os
import uuid
import shutil
from datetime import datetime
from pathlib import Path
import json

app = FastAPI(title="Mi Nadlan API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017/minadlan")
client = AsyncIOMotorClient(MONGO_URL)
db = client.minadlan

# Create uploads directory
UPLOAD_DIR = Path("/app/backend/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Pydantic models
class PropertyBase(BaseModel):
    title: str
    description: str
    property_type: str  # "sale" or "rent"
    price: int
    rooms: int
    size_sqm: int
    street: str
    city: str = "בית שמש"
    balcony: bool = False
    air_conditioning: bool = False
    parking: bool = False
    elevator: bool = False
    renovated: bool = False
    agent_name: str
    images: List[str] = []
    videos: List[str] = []

class Property(PropertyBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class Agent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str = ""
    email: str = ""
    properties_count: int = 0

class OfficeInfo(BaseModel):
    name: str = "מי נדל\"ן"
    address: str = "בן צבי 24, בית שמש"
    description: str = "ב\"מי נדל\"ן\", בן צבי 24, עומד לרשותכם צוות הסוכנים איתמר, מתן, עדן וליטל. אנו מתמחים בשוק הנדל\"ן בבית שמש ומתחייבים למקצועיות, יחס אישי ושקיפות מלאה. בואו להגשים את החלום שלכם איתנו."
    phone: str = "052-1234567"
    email: str = "info@minadlan.co.il"
    whatsapp: str = "052-1234567"
    facebook: str = "https://facebook.com/minadlan"
    instagram: str = "https://instagram.com/minadlan"

# Initialize data on startup
@app.on_event("startup")
async def startup_event():
    # Initialize agents
    agents_data = [
        {"name": "איתמר", "phone": "052-1111111", "email": "itamar@minadlan.co.il"},
        {"name": "מתן", "phone": "052-2222222", "email": "matan@minadlan.co.il"},
        {"name": "עדן", "phone": "052-3333333", "email": "eden@minadlan.co.il"},
        {"name": "ליטל", "phone": "052-4444444", "email": "lital@minadlan.co.il"}
    ]
    
    for agent_data in agents_data:
        existing = await db.agents.find_one({"name": agent_data["name"]})
        if not existing:
            agent = Agent(**agent_data)
            await db.agents.insert_one(agent.dict())

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Mi Nadlan API is running!"}

# Properties endpoints
@app.get("/api/properties")
async def get_properties(
    property_type: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    rooms: Optional[int] = None,
    street: Optional[str] = None
):
    query = {}
    
    if property_type:
        query["property_type"] = property_type
    
    if min_price is not None:
        query.setdefault("price", {})["$gte"] = min_price
    
    if max_price is not None:
        query.setdefault("price", {})["$lte"] = max_price
    
    if rooms is not None:
        query["rooms"] = rooms
    
    if street:
        query["street"] = {"$regex": street, "$options": "i"}
    
    properties = []
    async for prop in db.properties.find(query).sort("created_at", -1):
        prop["_id"] = str(prop["_id"])
        properties.append(prop)
    
    return properties

@app.get("/api/properties/sale")
async def get_sale_properties():
    return await get_properties(property_type="sale")

@app.get("/api/properties/rent")
async def get_rent_properties():
    return await get_properties(property_type="rent")

@app.get("/api/properties/{property_id}")
async def get_property(property_id: str):
    prop = await db.properties.find_one({"id": property_id})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    prop["_id"] = str(prop["_id"])
    return prop

@app.post("/api/properties")
async def create_property(property_data: Property):
    result = await db.properties.insert_one(property_data.dict())
    return {"id": property_data.id, "message": "Property created successfully"}

@app.put("/api/properties/{property_id}")
async def update_property(property_id: str, property_data: PropertyBase):
    update_data = property_data.dict()
    update_data["updated_at"] = datetime.now()
    
    result = await db.properties.update_one(
        {"id": property_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    
    return {"message": "Property updated successfully"}

@app.delete("/api/properties/{property_id}")
async def delete_property(property_id: str):
    result = await db.properties.delete_one({"id": property_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    
    return {"message": "Property deleted successfully"}

# Agents endpoints
@app.get("/api/agents")
async def get_agents():
    agents = []
    async for agent in db.agents.find():
        # Count properties for each agent
        properties_count = await db.properties.count_documents({"agent_name": agent["name"]})
        agent["properties_count"] = properties_count
        agent["_id"] = str(agent["_id"])
        agents.append(agent)
    
    return agents

# Office info endpoint
@app.get("/api/office-info")
async def get_office_info():
    return OfficeInfo().dict()

# File upload endpoint
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return URL
    file_url = f"/uploads/{unique_filename}"
    return {"url": file_url, "filename": unique_filename}

# Simple authentication for agents
@app.post("/api/auth/login")
async def login(agent_name: str = Form(...)):
    agent = await db.agents.find_one({"name": agent_name})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Simple token (in production, use proper JWT)
    token = f"agent-{agent['name']}-{uuid.uuid4()}"
    
    return {
        "token": token,
        "agent": {
            "id": agent["id"],
            "name": agent["name"],
            "phone": agent["phone"],
            "email": agent["email"]
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)