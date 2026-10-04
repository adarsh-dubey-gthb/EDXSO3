import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
from app.config import CORS_ORIGINS

app = FastAPI(
    title="AI Interview Accelerator API",
    description="Backend service for role & candidate analysis, adaptive 3-level interview simulation, and performance evaluation.",
    version="1.0.0"
)

# CORS Middleware to allow React Vite frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes under /api
app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "name": "AI Interview Accelerator Backend",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "online"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
