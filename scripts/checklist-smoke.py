"""Exercise the three downloadable projects on a fresh filesystem."""
import http.cookiejar
import json
import os
import re
import ssl
import subprocess
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from contextlib import contextmanager
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def dotnet(folder, *args):
    return subprocess.check_output(["dotnet", *args], cwd=folder, text=True).strip()


@contextmanager
def server(folder, url, client):
    proc = subprocess.Popen(["dotnet", "run", "--no-build", "--no-launch-profile",
                             "--", "--urls", url], cwd=folder)
    try:
        for _ in range(120):
            if proc.poll() is not None:
                raise RuntimeError(f"{folder.name} exited before startup: {proc.returncode}")
            try:
                with client.open(url, timeout=2):
                    break
            except urllib.error.URLError:
                time.sleep(0.25)
        else:
            raise TimeoutError(url)
        yield
    finally:
        proc.terminate()
        proc.wait(timeout=15)


def cli(folder):
    def run(*args):
        return dotnet(folder, "run", "--no-build", "--", *args)
    assert "No tasks yet." in run("list")
    assert "Added: Check the weather" in run("add", "Check the weather")
    assert "1 [ ] Check the weather" in run("list")
    assert "Completed: Check the weather" in run("complete", "1")
    assert "1 [x] Check the weather" in run("list")


def web(folder):
    certificate = folder.parent / "localhost.pem"
    dotnet(folder, "dev-certs", "https", "--export-path", str(certificate),
           "--format", "PEM")
    client = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()),
        urllib.request.HTTPSHandler(context=ssl.create_default_context(cafile=str(certificate))))
    url = "https://localhost:7043"
    with server(folder, url, client):
        page = client.open(url).read().decode()
        assert "Check the weather" in page
        for handler, fields, expected in [
                ("Add", {"Title": "Fill the water bottles"}, "0 of 2 complete"),
                ("Status", {"id": "2", "complete": "true"}, "1 of 2 complete"),
                ("Status", {"id": "2"}, "0 of 2 complete")]:
            token = re.search(r'name="__RequestVerificationToken"[^>]+value="([^"]+)"', page)[1]
            fields["__RequestVerificationToken"] = token
            page = client.open(url + "/?handler=" + handler,
                               urllib.parse.urlencode(fields).encode()).read().decode()
            assert expected in page and "Fill the water bottles" in page


def api(folder):
    url = "http://localhost:5086"
    client = urllib.request.build_opener()
    dotnet(folder, "run", "--no-build", "--", "init")
    with server(folder, url, client):
        req = urllib.request.Request(url + "/tasks", data=b'{"title":"Check the weather"}',
                                     headers={"Content-Type": "application/json"})
        with client.open(req) as response:
            assert response.status == 201
            path = response.headers["Location"]
            item = json.load(response)
        assert path == f"/tasks/{item['id']}" and not item["complete"]
        assert json.load(client.open(urllib.request.Request(url + path + "/complete", method="PUT")))["complete"]
        req.data = b'{"title":""}'
        try:
            client.open(req)
        except urllib.error.HTTPError as error:
            assert error.code == 400
        else:
            raise AssertionError("Empty title accepted")
    with server(folder, url, client):
        assert json.load(client.open(url + "/tasks")) == [{**item, "complete": True}]


with tempfile.TemporaryDirectory() as temp:
    work = Path(temp)
    (work / "global.json").write_text(json.dumps({"sdk": {"version": "10.0.403", "rollForward": "disable"}}))
    os.environ["ASPNETCORE_ENVIRONMENT"] = "Development"
    assert dotnet(work, "--version") == "10.0.403"
    with zipfile.ZipFile(ROOT / "site/public/ships-checklist.zip") as archive:
        archive.extractall(work)
    for name, check in [("Web", web), ("Cli", cli), ("Api", api)]:
        folder = work / name
        guide = ROOT / f"site/learn/ships-checklist/{name.lower()}.md"
        assert guide.read_text(encoding="utf-8") == (folder / "README.md").read_text(encoding="utf-8")
        subprocess.run(["dotnet", "build"], cwd=folder, check=True)
        check(folder)
        print(f"{name} walkthrough passed with SDK 10.0.403", flush=True)
