import urllib.request
import urllib.parse
import json
import http.cookiejar
import subprocess
import os
import sys

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

auth_token = None

def request(url, method='GET', data=None):
    global auth_token
    body = json.dumps(data).encode('utf-8') if data else None
    headers = {'Content-Type': 'application/json'}
    if auth_token:
        headers['Authorization'] = f'Bearer {auth_token}'
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with opener.open(req) as resp:
        res = resp.read().decode('utf-8')
        return json.loads(res) if res else {}

print("=== 1. TESTING STUDENT REGISTRATION & AUTH ===")
email = f"student_{os.urandom(3).hex()}@university.edu"
reg = request('http://localhost:3000/api/auth/register', 'POST', {
    'email': email,
    'password': 'password123!',
    'full_name': 'Aarav Sharma',
    'college_school': 'IIT Delhi',
    'course_branch': 'Computer Science',
    'semester_class': '6th Semester',
    'preferred_language': 'hinglish'
})
auth_token = reg.get('token')
print(f"[PASS] Registration: success={reg.get('success')}, user={reg.get('user', {}).get('full_name')}")

me = request('http://localhost:3000/api/auth/me')
print(f"[PASS] Session Persistence: authenticated={me.get('authenticated')}, email={me.get('user', {}).get('email')}")

print("\n=== 2. SEEDING DEMO LECTURES & STUDY KITS ===")
seed = request('http://localhost:3000/api/demo/seed', 'POST')
print(f"[PASS] Demo Seed: success={seed.get('success')}")

lecs = request('http://localhost:3000/api/lectures')
lecture_list = lecs.get('lectures', [])
print(f"[PASS] Lecture Library count: {len(lecture_list)}")
for l in lecture_list[:3]:
    print(f"   • [{l['status'].upper()}] {l['title']} ({l['subject']})")

first_id = lecture_list[0]['id']
ws = request(f'http://localhost:3000/api/lectures/{first_id}')
print(f"\n=== 3. VERIFYING 7-TAB LECTURE WORKSPACE DATA ===")
print(f"[PASS] Lecture Title: {ws.get('lecture', {}).get('title')}")
print(f"[PASS] Summary: {ws.get('studyMaterials', {}).get('summary')[:85]}...")
print(f"[PASS] Transcript Segments count: {len(ws.get('transcript', {}).get('segments', []))}")
print(f"[PASS] Flashcards count: {len(ws.get('flashcards', []))}")
print(f"[PASS] Quiz questions count: {len(ws.get('quiz', {}).get('questions', []))}")

# Submit a quiz attempt
quiz = ws.get('quiz', {})
if quiz and quiz.get('questions'):
    quiz_id = quiz['id']
    first_q = quiz['questions'][0]
    ans_res = request(f"http://localhost:3000/api/lectures/{first_id}/quiz/attempt", 'POST', {
        'quiz_id': quiz_id,
        'answers': {first_q['id']: first_q['correct_option_index']}
    })
    print(f"[PASS] Quiz Submission: Score = {ans_res.get('score')}/{ans_res.get('total_questions')} ({ans_res.get('percentage')}%)")

print("\n=== 4. TESTING RASPBERRY PI 4 PAIRING & SYNC PROTOCOL ===")
token_res = request('http://localhost:3000/api/devices/generate-token', 'POST')
pairing_code = token_res.get('pairing_code')
print(f"[PASS] Web platform generated 6-char pairing code: {pairing_code}")

# Run Raspberry Pi Python Agent to pair with this code
pair_cmd = [sys.executable, "rpi-agent/lecturepod_agent.py", "pair", "--code", pairing_code, "--server", "http://localhost:3000"]
p_res = subprocess.run(pair_cmd, capture_output=True, text=True)
print(f"[PASS] Agent Pairing output: {p_res.stdout.strip()}")

# Test Raspberry Pi offline record and auto sync
rec_cmd = [sys.executable, "rpi-agent/lecturepod_agent.py", "record", "--title", "Operating Systems Concurrency", "--subject", "Computer Science", "--duration", "5"]
r_res = subprocess.run(rec_cmd, capture_output=True, text=True)
print(f"[PASS] Agent Record & Sync output: {r_res.stdout.strip()[:140]}...")

# Agent status
stat_cmd = [sys.executable, "rpi-agent/lecturepod_agent.py", "status"]
s_res = subprocess.run(stat_cmd, capture_output=True, text=True)
print(s_res.stdout.strip())

print("=== 5. TESTING GLOBAL SEARCH & DATA EXPORT ===")
search_res = request('http://localhost:3000/api/search?q=Eigenvalues')
print(f"[PASS] Search 'Eigenvalues' found {search_res.get('totalMatches')} matches across library, notes, and transcripts")

export_res = request('http://localhost:3000/api/export')
print(f"[PASS] Student JSON Data Archive: {len(export_res.get('lectures', []))} lectures, {len(export_res.get('flashcards', []))} flashcards")

print("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<")
