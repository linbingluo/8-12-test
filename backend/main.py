from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel
from typing import List

# ========== Initialize FastAPI Application ==========
app = FastAPI(title="Travel Planner API")

# ========== CORS Configuration ==========
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== Database Configuration ==========
DATABASE_URL = "sqlite:///./travel.db"

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine
)

Base = declarative_base()

# ========== Data Models ==========
class Destination(Base):
    __tablename__ = "destinations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    rating = Column(Integer, default=5)

Base.metadata.create_all(bind=engine)

# ========== Pydantic Models (Request/Response) ==========
class DestinationCreate(BaseModel):
    name: str
    description: str
    rating: int = 5

class DestinationResponse(BaseModel):
    id: int
    name: str
    description: str
    rating: int
    
    class Config:
        from_attributes = True

# ========== API Routes ==========

@app.get("/")
def read_root():
    return {"message": "Welcome to Travel Planner API! ✈️"}

@app.get("/destinations", response_model=List[DestinationResponse])
def get_destinations():
    db = SessionLocal()
    destinations = db.query(Destination).all()
    db.close()
    return destinations

@app.post("/destinations", response_model=DestinationResponse)
def create_destination(destination: DestinationCreate):
    db = SessionLocal()
    db_destination = Destination(**destination.dict())
    db.add(db_destination)
    db.commit()
    db.refresh(db_destination)
    db.close()
    return db_destination

@app.get("/destinations/{destination_id}", response_model=DestinationResponse)
def get_destination(destination_id: int):
    db = SessionLocal()
    destination = db.query(Destination).filter(
        Destination.id == destination_id
    ).first()
    db.close()
    
    if not destination:
        return {"error": "Destination not found"}
    return destination

@app.delete("/destinations/{destination_id}")
def delete_destination(destination_id: int):
    db = SessionLocal()
    destination = db.query(Destination).filter(
        Destination.id == destination_id
    ).first()
    
    if not destination:
        db.close()
        return {"error": "Destination not found"}
    
    db.delete(destination)
    db.commit()
    db.close()
    return {"message": "Deletion successful"}

# ========== Main Program Entry ==========
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)