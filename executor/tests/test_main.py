import asyncio
from pathlib import Path

from fastapi.testclient import TestClient
import executor.main as main


class FakeProcess:
    def __init__(self, *, stdout=b"", stderr=b"", returncode=0, delay_seconds=0):
        self._stdout = stdout
        self._stderr = stderr
        self.returncode = returncode
        self._delay_seconds = delay_seconds
        self.killed = False

    async def wait(self):
        return self.returncode

    async def communicate(self):
        if self._delay_seconds:
            await asyncio.sleep(self._delay_seconds)
        return self._stdout, self._stderr

    def kill(self):
        self.killed = True
        self.returncode = -1


def test_health_returns_ok(monkeypatch):
    async def fake_create_subprocess_exec(*cmd, **kwargs):
        if cmd[:2] == ("docker", "pull"):
            return FakeProcess(returncode=0)
        raise AssertionError(f"Unexpected command: {cmd}")

    monkeypatch.setattr(main.asyncio, "create_subprocess_exec", fake_create_subprocess_exec)

    with TestClient(main.app) as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_run_rejects_unsupported_language(monkeypatch):
    async def fake_create_subprocess_exec(*cmd, **kwargs):
        if cmd[:2] == ("docker", "pull"):
            return FakeProcess(returncode=0)
        raise AssertionError(f"Unexpected command: {cmd}")

    monkeypatch.setattr(main.asyncio, "create_subprocess_exec", fake_create_subprocess_exec)

    with TestClient(main.app) as client:
        response = client.post("/run", json={"code": "print('hi')", "language": "javascript"})

    assert response.status_code == 400
    assert response.json() == {"detail": "Unsupported language"}


def test_run_rejects_code_too_long(monkeypatch):
    async def fake_create_subprocess_exec(*cmd, **kwargs):
        if cmd[:2] == ("docker", "pull"):
            return FakeProcess(returncode=0)
        raise AssertionError(f"Unexpected command: {cmd}")

    monkeypatch.setattr(main.asyncio, "create_subprocess_exec", fake_create_subprocess_exec)

    with TestClient(main.app) as client:
        response = client.post("/run", json={"code": "x" * 10001, "language": "python3"})

    assert response.status_code == 400
    assert response.json() == {"detail": "Code too long"}


def test_run_success_returns_output_and_cleans_up(monkeypatch, tmp_path):
    run_id = "11111111-1111-1111-1111-111111111111"
    captured_run_cmd = []

    async def fake_create_subprocess_exec(*cmd, **kwargs):
        if cmd[:2] == ("docker", "pull"):
            return FakeProcess(returncode=0)
        if cmd[:2] == ("docker", "run"):
            captured_run_cmd.append(cmd)
            return FakeProcess(stdout=b"hello\\n", stderr=b"", returncode=0)
        raise AssertionError(f"Unexpected command: {cmd}")

    monkeypatch.setattr(main.asyncio, "create_subprocess_exec", fake_create_subprocess_exec)
    monkeypatch.setattr(main.uuid, "uuid4", lambda: run_id)
    monkeypatch.setattr(main, "RUNS_BASE_DIR", str(tmp_path))

    with TestClient(main.app) as client:
        response = client.post("/run", json={"code": "print('hello')", "language": "python3"})

    assert response.status_code == 200
    assert response.json() == {
        "stdout": "hello\\n",
        "stderr": "",
        "exitCode": 0,
        "timedOut": False,
    }

    assert len(captured_run_cmd) == 1
    cmd = captured_run_cmd[0]
    assert "docker" == cmd[0]
    assert "run" == cmd[1]
    assert f"{tmp_path}/{run_id}:/code:ro" in cmd
    assert not Path(tmp_path / run_id).exists()


def test_run_timeout(monkeypatch, tmp_path):
    async def fake_create_subprocess_exec(*cmd, **kwargs):
        if cmd[:2] == ("docker", "pull"):
            return FakeProcess(returncode=0)
        if cmd[:2] == ("docker", "run"):
            return FakeProcess(delay_seconds=0.05)
        raise AssertionError(f"Unexpected command: {cmd}")

    monkeypatch.setattr(main.asyncio, "create_subprocess_exec", fake_create_subprocess_exec)
    monkeypatch.setattr(main, "TIMEOUT_SECONDS", 0.01)
    monkeypatch.setattr(main, "RUNS_BASE_DIR", str(tmp_path))

    with TestClient(main.app) as client:
        response = client.post("/run", json={"code": "print('hello')", "language": "python3"})

    assert response.status_code == 200
    payload = response.json()
    assert payload["stdout"] == ""
    assert "Execution time limit reached" in payload["stderr"]
    assert payload["exitCode"] == -1
    assert payload["timedOut"] is True


def test_run_truncates_large_output(monkeypatch, tmp_path):
    huge_stdout = b"a" * (main.MAX_OUTPUT_BYTES + 50)
    huge_stderr = b"b" * (main.MAX_OUTPUT_BYTES + 50)

    async def fake_create_subprocess_exec(*cmd, **kwargs):
        if cmd[:2] == ("docker", "pull"):
            return FakeProcess(returncode=0)
        if cmd[:2] == ("docker", "run"):
            return FakeProcess(stdout=huge_stdout, stderr=huge_stderr, returncode=0)
        raise AssertionError(f"Unexpected command: {cmd}")

    monkeypatch.setattr(main.asyncio, "create_subprocess_exec", fake_create_subprocess_exec)
    monkeypatch.setattr(main, "RUNS_BASE_DIR", str(tmp_path))

    with TestClient(main.app) as client:
        response = client.post("/run", json={"code": "print('hello')", "language": "python3"})

    assert response.status_code == 200
    payload = response.json()
    assert len(payload["stdout"]) == main.MAX_OUTPUT_BYTES
    assert len(payload["stderr"]) == main.MAX_OUTPUT_BYTES
    assert payload["timedOut"] is False
