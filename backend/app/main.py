from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api import endpoints

app = FastAPI(
    title="Oxford Nexus API",
    description="API for the Banking Executive Dashboard (Lakehouse Backend)",
    version="1.0.0",
)

# CORS Configuration
# Allow the frontend (running on default Vite port 5173) to access the API
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(endpoints.router, prefix="/api/v1")


@app.get("/health")
def health_check():
    """Health check endpoint to verify backend status."""
    return {"status": "ok", "service": "Oxford Nexus Backend"}


if __name__ == "__main__":
    import uvicorn

    # Run server with reloading enabled for development
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
