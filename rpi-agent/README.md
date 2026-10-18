# Lecture Pod — LecturePod Device Hardware Agent

The **LecturePod Agent** runs locally on the physical LecturePod Device. It is designed to capture audio recordings inside classrooms completely offline, store them safely in a persistent local SQLite queue, and automatically sync them with the student's cloud web platform as soon as Wi-Fi, hotspot, or campus internet becomes reachable.

---

## 1. Hardware Architecture & Requirements

- **Processor:** LecturePod Embedded SoC / ARM64 Platform (2GB, 4GB, or 8GB RAM)
- **Audio Input:** USB Condenser Microphone or I2S MEMS Microphone Hat (e.g. INMP441)
- **Status Indicator:** Standard onboard LED or I2C OLED display (optional)
- **Physical Controls:** Momentary push-button connected to GPIO 17 (pin 11) for one-touch record start/stop
- **Storage:** Class 10 High-Endurance MicroSD card (32GB+) formatted with LecturePod Edge OS (64-bit)

---

## 2. Installation on LecturePod Device

1. Clone or copy the `rpi-agent` directory to your LecturePod Device:
   ```bash
   scp -r rpi-agent device@lecturepod.local:/home/device/lecturepod-agent
   ```

2. SSH into your LecturePod Device (or open a terminal via VNC/serial):
   ```bash
   ssh device@lecturepod.local
   cd /home/device/lecturepod-agent
   ```

3. Ensure Python 3.9+ is installed:
   ```bash
   python3 --version
   ```

---

## 3. How to Pair with Your Student Account

1. Open your Lecture Pod student web dashboard: `http://<your-server-ip>:3000/devices`.
2. Click **"Pair New Device"** to generate a secure 6-character pairing code (e.g., `LP-7824`).
3. On the LecturePod Device terminal, run:
   ```bash
   python3 lecturepod_agent.py pair --code LP-7824 --server http://192.168.1.100:3000
   ```
4. The LecturePod Device connects to the server, exchanges the code for a permanent cryptographically signed API token, and writes `config.json`. The dashboard will immediately reflect the paired device status!

---

## 4. Recording Classroom Lectures (Offline)

You can trigger a recording without any active internet connection:
```bash
python3 lecturepod_agent.py record --title "Fourier Transforms" --subject "Signals & Systems" --duration 3600
```
- Audio is saved into `/home/device/lecturepod-agent/recordings/`.
- Metadata is inserted into the local persistent queue (`queue.db`).
- If internet is unavailable, it remains safely queued. No recordings are lost.

---

## 5. Automatic Synchronization

To trigger synchronization manually:
```bash
python3 lecturepod_agent.py sync
```

To check current status and offline queue counts:
```bash
python3 lecturepod_agent.py status
```

---

## 6. Running as an Automatic Background Daemon

To ensure the LecturePod Device automatically syncs whenever it detects Wi-Fi or a phone hotspot, run the daemon:
```bash
python3 lecturepod_agent.py daemon
```

To install it as an automatic system service that starts on boot:
```bash
sudo cp lecturepod.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable lecturepod.service
sudo systemctl start lecturepod.service
sudo systemctl status lecturepod.service
```

---

## 7. Sync Protocol & Data Integrity Guarantees

1. **Idempotent Registration:** Every recording generates a unique `device_recording_id`. Repeated sync attempts will never create duplicate lectures on the server.
2. **Server Acknowledgment (ACK):** The local agent never deletes or purges any recording until the server replies with a confirmed HTTP 200 ACK and verified hash.
3. **Exponential Backoff:** If the Wi-Fi connection drops mid-upload, the agent retries with exponential backoff intervals ($2, 4, 8, 16, 32, 60$ seconds) to avoid bandwidth thrashing.
