from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api import asr, llm, export, pdf
import uvicorn
import sys

app = FastAPI(title="Uteach Audio Summary API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(asr.router, prefix="/v1/asr", tags=["ASR"])
app.include_router(llm.router, prefix="/v1/llm", tags=["LLM"])
app.include_router(export.router, prefix="/v1/export", tags=["Export"])
app.include_router(pdf.router, prefix="/v1/pdf", tags=["PDF"])


@app.get("/")
async def root():
    return {"message": "Uteach Audio Summary API is running"}


if __name__ == "__main__":
    port = 8001
    if "--port" in sys.argv:
        try:
            port_index = sys.argv.index("--port") + 1
            if port_index < len(sys.argv):
                port = int(sys.argv[port_index])
        except (ValueError, IndexError):
            pass

    uvicorn.run("src.main:app", host="0.0.0.0", port=port, reload=True)
