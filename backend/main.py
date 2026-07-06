from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

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

# ========== User Model ==========
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    created_at = Column(String, default=lambda: datetime.now().isoformat())

# ========== Destination Model ==========

class Destination(Base):
    __tablename__ = "destinations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    rating = Column(Integer, default=5)

class Trip(Base):
    __tablename__ = "trips"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    date_range = Column(String)
    destinations_count = Column(Integer, default=0)
    budget = Column(Integer, default=0)
    rating = Column(Integer, default=5)
    status = Column(String, default="draft")
    created_at = Column(String, default=lambda: datetime.now().isoformat())

Base.metadata.create_all(bind=engine)

# ========== Pydantic Models ==========
# ===== User Pydantic Models =====
class UserRegister(BaseModel):
    email: str
    username: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    created_at: str
    
    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None

# ===== Destination Pydantic Models =====
class DestinationCreate(BaseModel):
    name: str
    description: str
    rating: int = 5

class DestinationResponse(BaseModel):
    id: int
    name: str
    description: str
    rating: int
    
    model_config = ConfigDict(from_attributes=True)

class TripCreate(BaseModel):
    title: str
    date_range: str
    destinations_count: int
    budget: int
    rating: int = 5
    status: str = "draft"

class TripResponse(BaseModel):
    id: int
    title: str
    date_range: str
    destinations_count: int
    budget: int
    rating: int
    status: str
    created_at: str
    
    model_config = ConfigDict(from_attributes=True)

# ========== API Routes ==========
# ===== User Routes =====
@app.post("/auth/register")
def register(user: UserRegister):
    """用户注册"""
    db = SessionLocal()
    
    # 检查邮箱是否已注册
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        db.close()
        return {"error": "邮箱已被注册"}
    
    # 检查用户名是否已存在
    existing_username = db.query(User).filter(User.username == user.username).first()
    if existing_username:
        db.close()
        return {"error": "用户名已存在"}
    
    # 创建新用户
    db_user = User(
        email=user.email,
        username=user.username,
        password=user.password  # 暂时不加密
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    db.close()
    
    return {
        "message": "注册成功",
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "username": db_user.username
        }
    }

@app.post("/auth/login")
def login(user: UserLogin):
    """用户登录"""
    db = SessionLocal()
    
    # 查找用户
    db_user = db.query(User).filter(User.email == user.email).first()
    
    if not db_user:
        db.close()
        return {"error": "邮箱不存在"}
    
    # 验证密码
    if db_user.password != user.password:
        db.close()
        return {"error": "密码错误"}
    
    db.close()
    
    return {
        "message": "登录成功",
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "username": db_user.username
        }
    }

@app.get("/user/{user_id}")
def get_user(user_id: int):
    """获取用户信息"""
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    db.close()
    
    if not user:
        return {"error": "用户不存在"}
    
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "created_at": user.created_at
    }

@app.put("/user/{user_id}")
def update_user(user_id: int, user_data: UserUpdate):
    """修改用户信息"""
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        db.close()
        return {"error": "用户不存在"}
    
    # 更新用户名
    if user_data.username:
        # 检查新用户名是否已存在
        existing_username = db.query(User).filter(
            User.username == user_data.username,
            User.id != user_id
        ).first()
        if existing_username:
            db.close()
            return {"error": "用户名已存在"}
        user.username = user_data.username
    
    # 更新密码
    if user_data.password:
        user.password = user_data.password
    
    db.commit()
    response_data = {
        "message": "修改成功",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username
        }
    }
    
    db.close()
    
    return response_data
    



# ===== Trip Routes =====

@app.get("/trips/recent")  
def get_recent_trips():
    db = SessionLocal()
    trips = db.query(Trip).all()
    db.close()
    
    result = []
    for trip in trips:
        result.append({
            "id": trip.id,
            "title": trip.title,
            "date_range": trip.date_range,
            "destinations_count": trip.destinations_count,
            "budget": trip.budget,
            "rating": trip.rating,
            "status": trip.status
        })
    return result


@app.get("/")
def read_root():
    return {"message": "Welcome to Travel Planner API! ✈️"}

# ===== Destination Routes =====
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

# ===== Trip Routes =====
@app.get("/trips", response_model=List[TripResponse])
def get_trips():
    db = SessionLocal()
    trips = db.query(Trip).order_by(Trip.created_at.desc()).limit(2).all()
    db.close()
    return trips

@app.post("/trips", response_model=TripResponse)
def create_trip(trip: TripCreate):
    db = SessionLocal()
    db_trip = Trip(**trip.dict())
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    db.close()
    return db_trip

@app.put("/trips/{trip_id}")
def update_trip(trip_id: int, trip_data: dict):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        db.close()
        raise HTTPException(status_code=404, detail="Trip not found")
    
    # 更新字段
    if "title" in trip_data:
        trip.title = trip_data["title"]
    if "date_range" in trip_data:
        trip.date_range = trip_data["date_range"]
    if "destinations_count" in trip_data:
        trip.destinations_count = trip_data["destinations_count"]
    if "budget" in trip_data:
        trip.budget = trip_data["budget"]
    if "rating" in trip_data:
        trip.rating = trip_data["rating"]
    if "status" in trip_data:
        trip.status = trip_data["status"]
    
    db.commit()
    db.close()
    return {"message": "Trip updated successfully", "id": trip_id}

@app.get("/trips/{trip_id}", response_model=TripResponse)
def get_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    db.close()
    
    if not trip:
        return {"error": "Trip not found"}
    return trip

@app.delete("/trips/{trip_id}")
def delete_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    
    if not trip:
        db.close()
        return {"error": "Trip not found"}
    
    db.delete(trip)
    db.commit()
    db.close()
    return {"message": "Deletion successful"}

# ===== Statistics Routes =====
@app.get("/stats")
def get_stats():
    db = SessionLocal()
    total_trips = db.query(Trip).count()
    total_destinations = db.query(Destination).count()
    completed_trips = db.query(Trip).filter(Trip.status == "completed").count()
    db.close()
    
    return {
        "total_trips": total_trips,
        "total_destinations": total_destinations,
        "completed_trips": completed_trips
    }



# ========== Main Program Entry ==========
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# if __name__ == "__main__":
#     # 临时调试：直接查询数据库
#     db = SessionLocal()
#     trips = db.query(Trip).all()
#     print(f"总数据数：{len(trips)}")
#     for trip in trips:
#         print(f"ID: {trip.id}, Title: {trip.title}, Status: {trip.status}")
#     db.close()