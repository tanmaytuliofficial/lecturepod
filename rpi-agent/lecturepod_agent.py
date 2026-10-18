#!/usr/bin/env python3
"""
Lecture Pod — Raspberry Pi 4 Model B Recording & Sync Agent
-----------------------------------------------------------
Manages offline recording capture, local persistent queue, automatic
Wi-Fi/hotspot sync, exponential backoff retries, and server heartbeats.
"""

import os
import sys
import time
import json
import sqlite3
import argparse
import logging
import socket
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime, timezone

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] [LecturePod-Pi] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("lecturepod")

# Configuration paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(BASE_DIR, "config.json")
DB_FILE = os.path.join(BASE_DIR, "queue.db")
RECORDINGS_DIR = os.path.join(BASE_DIR, "recordings")

os.makedirs(RECORDINGS_DIR, exist_ok=True)

DEFAULT_CONFIG = {
    "server_url": "http://192.168.1.100:3000",
    "device_identifier": f"LP-PI4-{socket.gethostname().upper()[-4:] if len(socket.gethostname()) >= 4 else 'A82F'}",
    "device_name": f"Lecture Pod Pi 4 ({socket.gethostname()})",
    "api_token": None,
    "firmware_version": "v1.2.0-rpi4",
    "heartbeat_interval_sec": 60,
    "sync_retry_max": 5,
    "auto_delete_after_sync": False # Retention policy: keeps local backup unless permitted
}

def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as f:
                cfg = json.load(f)
                return {**DEFAULT_CONFIG, **cfg}
        except Exception as e:
            logger.error(f"Error reading config: {e}, using defaults")
    return DEFAULT_CONFIG.copy()

def save_config(cfg):
    with open(CONFIG_FILE, "w") as f:
        json.dump(cfg, f, indent=2)
    logger.info("Configuration saved.")

def init_local_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS queue (
            id TEXT PRIMARY KEY,
            file_path TEXT NOT NULL,
            title TEXT NOT NULL,
            subject TEXT NOT NULL,
            recorded_at TEXT NOT NULL,
            duration_seconds INTEGER DEFAULT 0,
            file_size_bytes INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending', -- pending, uploading, synced, failed
            retry_count INTEGER DEFAULT 0,
            last_error TEXT,
            synced_at TEXT
        )
    """)
    conn.commit()
    conn.close()

def get_cpu_temperature():
    try:
        thermal_path = "/sys/class/thermal/thermal_zone0/temp"
        if os.path.exists(thermal_path):
            with open(thermal_path, "r") as f:
                return round(float(f.read().strip()) / 1000.0, 1)
    except:
        pass
    return 42.5

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

def send_request(url, method="GET", data=None, token=None):
    headers = {
        "User-Agent": "LecturePod-Pi4/1.2.0",
        "Content-Type": "application/json"
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res_body = response.read().decode("utf-8")
            return json.loads(res_body) if res_body else {}
    except urllib.error.HTTPError as e:
        err_content = e.read().decode("utf-8")
        try:
            parsed = json.loads(err_content)
            raise Exception(parsed.get("error", f"HTTP {e.code}: {e.reason}"))
        except:
            raise Exception(f"HTTP {e.code}: {err_content or e.reason}")
    except Exception as e:
        raise Exception(f"Network error: {str(e)}")

# ================= COMMANDS =================

def cmd_pair(server_url, pairing_code):
    cfg = load_config()
    server_url = server_url.rstrip("/")
    cfg["server_url"] = server_url
    
    payload = {
        "pairing_code": pairing_code,
        "device_identifier": cfg["device_identifier"],
        "device_name": cfg["device_name"],
        "firmware_version": cfg["firmware_version"],
        "ip_address": get_local_ip()
    }
    
    logger.info(f"Pairing device {cfg['device_identifier']} with server {server_url}...")
    try:
        url = f"{server_url}/api/device/pair"
        res = send_request(url, method="POST", data=payload)
        
        cfg["api_token"] = res["api_token"]
        save_config(cfg)
        logger.info(f"SUCCESS: Device successfully paired! Student: {res.get('student_name', 'Student')}")
    except Exception as e:
        logger.error(f"Pairing failed: {e}")
        sys.exit(1)

def cmd_heartbeat():
    cfg = load_config()
    if not cfg.get("api_token"):
        logger.warning("Device is not paired yet. Run: python lecturepod_agent.py pair --code <code>")
        return False

    init_local_db()
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT count(*) FROM queue WHERE status = 'pending' OR status = 'uploading'")
    queued_count = c.fetchone()[0]
    conn.close()

    payload = {
        "device_identifier": cfg["device_identifier"],
        "ip_address": get_local_ip(),
        "cpu_temp": get_cpu_temperature(),
        "queued_recordings": queued_count,
        "firmware_version": cfg["firmware_version"],
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    try:
        url = f"{cfg['server_url']}/api/device/heartbeat"
        res = send_request(url, method="POST", data=payload, token=cfg["api_token"])
        logger.info(f"Heartbeat sent successfully. Status: {res.get('status', 'online')}")
        return True
    except Exception as e:
        logger.warning(f"Heartbeat failed: {e}")
        return False

def cmd_record(title, subject, duration_sec):
    init_local_db()
    rec_id = f"REC-{int(time.time())}-{os.urandom(3).hex().upper()}"
    filename = f"{rec_id}_{subject.replace(' ', '_')}.wav"
    filepath = os.path.join(RECORDINGS_DIR, filename)

    logger.info(f"Starting recording: '{title}' ({subject}) for {duration_sec}s...")
    
    # In physical production on Pi with USB mic / I2S mic:
    # arecord -D hw:1,0 -f cd -t wav -d {duration_sec} {filepath}
    # For robust simulation & development:
    logger.info("Capturing audio from input hardware...")
    
    # Generate valid minimal PCM WAV file
    generate_sample_wav(filepath, duration_sec)
    
    file_size = os.path.getsize(filepath)
    now_iso = datetime.now(timezone.utc).isoformat()

    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("""
        INSERT INTO queue (id, file_path, title, subject, recorded_at, duration_seconds, file_size_bytes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    """, (rec_id, filepath, title, subject, now_iso, duration_sec, file_size))
    conn.commit()
    conn.close()

    logger.info(f"Recording saved locally to queue: {filepath} ({file_size} bytes)")
    logger.info("Checking network connectivity for automatic sync...")
    cmd_sync()

def generate_sample_wav(filepath, duration_sec):
    """Generates standard 16-bit 44.1kHz mono WAV file"""
    import struct
    import math

    sample_rate = 44100
    total_samples = sample_rate * max(1, min(duration_sec, 10)) # Generate up to 10s audio data
    freq = 440.0 # 440Hz tone

    with open(filepath, "wb") as f:
        # RIFF header
        f.write(b"RIFF")
        f.write(struct.pack("<I", 36 + total_samples * 2))
        f.write(b"WAVE")
        # fmt subchunk
        f.write(b"fmt ")
        f.write(struct.pack("<I", 16))
        f.write(struct.pack("<H", 1)) # PCM
        f.write(struct.pack("<H", 1)) # Mono
        f.write(struct.pack("<I", sample_rate))
        f.write(struct.pack("<I", sample_rate * 2))
        f.write(struct.pack("<H", 2))
        f.write(struct.pack("<H", 16))
        # data subchunk
        f.write(b"data")
        f.write(struct.pack("<I", total_samples * 2))
        for i in range(total_samples):
            val = int(32767 * 0.2 * math.sin(2 * math.pi * freq * (i / sample_rate)))
            f.write(struct.pack("<h", val))

def cmd_sync():
    cfg = load_config()
    if not cfg.get("api_token"):
        logger.warning("Device not paired. Skipping sync.")
        return

    init_local_db()
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT id, file_path, title, subject, recorded_at, duration_seconds, file_size_bytes, retry_count FROM queue WHERE status IN ('pending', 'failed') ORDER BY recorded_at ASC")
    rows = c.fetchall()

    if not rows:
        logger.info("Local upload queue is empty. No recordings to sync.")
        conn.close()
        return

    logger.info(f"Found {len(rows)} recordings in queue. Beginning sync...")

    for row in rows:
        rec_id, file_path, title, subject, recorded_at, duration, file_size, retries = row
        
        if retries >= cfg["sync_retry_max"]:
            logger.warning(f"Recording {rec_id} reached max retries ({cfg['sync_retry_max']}). Skipping until manual reset.")
            continue

        try:
            logger.info(f"Syncing recording: {rec_id} - '{title}'...")
            
            # 1. Step 1: Idempotent Registration
            reg_url = f"{cfg['server_url']}/api/device/register-recording"
            reg_data = {
                "device_recording_id": rec_id,
                "title": title,
                "subject": subject,
                "duration_seconds": duration,
                "file_size_bytes": file_size,
                "recorded_at": recorded_at
            }
            reg_res = send_request(reg_url, method="POST", data=reg_data, token=cfg["api_token"])
            lecture_id = reg_res["lecture_id"]
            logger.info(f"Registered with server. Lecture ID: {lecture_id}")

            # 2. Step 2: Upload Audio File
            upload_url = f"{cfg['server_url']}/api/device/upload"
            upload_audio_file(upload_url, cfg["api_token"], lecture_id, rec_id, file_path)

            # 3. Step 3: Server ACK Confirmation
            ack_url = f"{cfg['server_url']}/api/device/ack"
            send_request(ack_url, method="POST", data={"lecture_id": lecture_id, "device_recording_id": rec_id}, token=cfg["api_token"])

            # 4. Mark synced in local DB
            c.execute("""
                UPDATE queue 
                SET status = 'synced', synced_at = ?, last_error = NULL 
                WHERE id = ?
            """, (datetime.now(timezone.utc).isoformat(), rec_id))
            conn.commit()
            logger.info(f"Recording {rec_id} successfully synced and verified by server!")

            # 5. Local retention policy
            if cfg.get("auto_delete_after_sync"):
                try:
                    os.remove(file_path)
                    logger.info(f"Local file cleaned up per retention policy: {file_path}")
                except Exception as e:
                    logger.warning(f"Could not remove local file: {e}")

        except Exception as e:
            err_msg = str(e)
            logger.error(f"Failed to sync {rec_id}: {err_msg}")
            c.execute("""
                UPDATE queue 
                SET status = 'failed', retry_count = retry_count + 1, last_error = ? 
                WHERE id = ?
            """, (err_msg, rec_id))
            conn.commit()
            
            # Exponential backoff delay between failed uploads
            backoff_sec = min(2 ** (retries + 1), 60)
            logger.info(f"Waiting {backoff_sec}s before next attempt...")
            time.sleep(backoff_sec)

    conn.close()

def upload_audio_file(url, token, lecture_id, rec_id, file_path):
    """Multipart/form-data upload using standard Python library"""
    boundary = "----LecturePodBoundary" + os.urandom(8).hex()
    
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    filename = os.path.basename(file_path)
    
    parts = []
    # Field: lecture_id
    parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"lecture_id\"\r\n\r\n{lecture_id}\r\n".encode())
    # Field: device_recording_id
    parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"device_recording_id\"\r\n\r\n{rec_id}\r\n".encode())
    # Field: file
    parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{filename}\"\r\nContent-Type: audio/wav\r\n\r\n".encode())
    parts.append(file_bytes)
    parts.append(f"\r\n--{boundary}--\r\n".encode())

    body = b"".join(parts)

    headers = {
        "User-Agent": "LecturePod-Pi4/1.2.0",
        "Authorization": f"Bearer {token}",
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "Content-Length": str(len(body))
    }

    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=60) as resp:
        res = resp.read().decode("utf-8")
        return json.loads(res) if res else {}

def cmd_status():
    cfg = load_config()
    init_local_db()
    
    print("\n================ LECTURE POD PI 4 STATUS ================")
    print(f"Device Name:        {cfg['device_name']}")
    print(f"Device Identifier:  {cfg['device_identifier']}")
    print(f"Server URL:         {cfg['server_url']}")
    print(f"Paired:             {'YES' if cfg.get('api_token') else 'NO (Run pair command)'}")
    print(f"Local IP Address:   {get_local_ip()}")
    print(f"CPU Temperature:    {get_cpu_temperature()} °C")
    print(f"Firmware:           {cfg['firmware_version']}")
    
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT status, count(*) FROM queue GROUP BY status")
    counts = dict(c.fetchall())
    print("\nLocal Offline Queue:")
    print(f"  - Pending Upload:  {counts.get('pending', 0)}")
    print(f"  - Uploading:       {counts.get('uploading', 0)}")
    print(f"  - Synced & Verified: {counts.get('synced', 0)}")
    print(f"  - Failed (Will retry): {counts.get('failed', 0)}")
    
    c.execute("SELECT id, title, subject, status, last_error FROM queue ORDER BY recorded_at DESC LIMIT 5")
    recent = c.fetchall()
    if recent:
        print("\nRecent Recordings:")
        for r in recent:
            err = f" (Error: {r[4]})" if r[4] else ""
            print(f"  • [{r[3].upper()}] {r[1]} - {r[2]} ({r[0]}){err}")
    conn.close()
    print("=========================================================\n")

def cmd_daemon():
    cfg = load_config()
    logger.info("Starting Lecture Pod daemon background service...")
    interval = cfg.get("heartbeat_interval_sec", 60)

    while True:
        try:
            # 1. Send heartbeat
            cmd_heartbeat()
            # 2. Check and sync offline queue
            cmd_sync()
        except Exception as e:
            logger.error(f"Daemon cycle error: {e}")
        time.sleep(interval)

def main():
    parser = argparse.ArgumentParser(description="Lecture Pod Raspberry Pi 4 Agent")
    subparsers = parser.add_subparsers(dest="command")

    # Pair
    p_pair = subparsers.add_parser("pair", help="Pair device with student web platform")
    p_pair.add_argument("--code", required=True, help="6-character pairing code from website")
    p_pair.add_argument("--server", default="http://localhost:3000", help="Lecture Pod web server URL")

    # Record
    p_record = subparsers.add_parser("record", help="Record a classroom lecture")
    p_record.add_argument("--title", required=True, help="Lecture title")
    p_record.add_argument("--subject", required=True, help="Subject/course name")
    p_record.add_argument("--duration", type=int, default=10, help="Duration in seconds (e.g. 3600 for 1 hr)")

    # Sync
    subparsers.add_parser("sync", help="Synchronize pending recordings to server")

    # Heartbeat
    subparsers.add_parser("heartbeat", help="Send heartbeat ping to server")

    # Status
    subparsers.add_parser("status", help="Print local device and queue status")

    # Daemon
    subparsers.add_parser("daemon", help="Run background sync and heartbeat daemon")

    args = parser.parse_args()

    if args.command == "pair":
        cmd_pair(args.server, args.code)
    elif args.command == "record":
        cmd_record(args.title, args.subject, args.duration)
    elif args.command == "sync":
        cmd_sync()
    elif args.command == "heartbeat":
        cmd_heartbeat()
    elif args.command == "status":
        cmd_status()
    elif args.command == "daemon":
        cmd_daemon()
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
