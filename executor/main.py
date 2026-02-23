import asyncio
import os
import shutil
import uuid
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

TIMEOUT_SECONDS = 10 # Maximum execution time for code
MAX_OUTPUT_BYTES = 10_000 # 10 KB maximum output size
MEMORY_LIMIT = "64m"
CPU_LIMIT = "0.25"
EXECUTION_IMAGE = "python:3.12-alpine"
SUPPORTED_LANGUAGES = { "python3" }

class RunRequest(BaseModel):
    code: str
    language: str = "python3"

@app.post("/run")
async def run_code(req: RunRequest):
    if req.language not in SUPPORTED_LANGUAGES:
        raise HTTPException(status_code=400, detail="Unsupported language")
    
    if len(req.code) > 10_000:
        raise HTTPException(status_code=400, detail="Code too long")
    
    run_id = str(uuid.uuid4())
    work_dir = f"/tmp/code-runs/{run_id}"
    os.makedirs(work_dir, exist_ok=True)

    try:
        with open(os.path.join(work_dir, "solution.py"), "w") as f:
            f.write(req.code)
        
        cmd = [
            "docker", "run", 
            "--rm", # delete container after execution
            "--network", "none", # no network access
            "--memory", MEMORY_LIMIT,
            "--cpus", CPU_LIMIT,
            "-v", f"{work_dir}:/code:ro", # mounts work_dir to /code in container as read-only
            EXECUTION_IMAGE,

            # Commands to execute inside the container
            "python", "/code/solution.py",
        ]

        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        try:
            stdout, stderr = await asyncio.wait_for(proc.communicate(), 
                                                    timeout=TIMEOUT_SECONDS)
        except asyncio.TimeoutError:
            proc.kill()
            await proc.communicate() # clear communication channels
            return {
                "stdout": "",
                "stderr": f"Execution time limit reached ({TIMEOUT_SECONDS} seconds)",
                "exitCode": -1,
                "timedOut": True,
            }
        
        return {
            "stdout": stdout.decode()[:MAX_OUTPUT_BYTES],
            "stderr": stderr.decode()[:MAX_OUTPUT_BYTES],
            "exitCode": proc.returncode,
            "timedOut": False,
        }

    finally:
        shutil.rmtree(work_dir, ignore_errors=True)

@app.get("/health")
async def health():
    return {"status": "ok"}