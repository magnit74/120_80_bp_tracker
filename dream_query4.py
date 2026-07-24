import sqlite3, json

DB_PATH = "C:/Users/оператор/.local/share/mimocode/mimocode.db"
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# Get key sessions for this project
KEY_SESSIONS = [
    'ses_0e85bba13ffe5exex9JUzD7yCb',
    'ses_0e8d8448affeOsLmaFbHFkdeFo',
    'ses_0ed2d8a6effenYnSW5fBm4aWCu',
]

for sid in KEY_SESSIONS:
    print(f"\n{'='*80}")
    print(f"SESSION: {sid}")
    c.execute("SELECT id, title FROM session WHERE id=?", (sid,))
    s = c.fetchone()
    if s:
        print(f"Title: {s[1]}")
    
    # Get user messages
    c.execute("""
        SELECT m.id, substr(json_extract(m.data, '$.content'), 1, 500)
        FROM message m
        WHERE m.session_id = ?
        AND json_extract(m.data, '$.role') = 'user'
        ORDER BY m.time_created
    """, (sid,))
    print("\nUser messages:")
    for r in c.fetchall():
        if r[1] and len(r[1].strip()) > 5:
            print(f"  [{r[0]}] {r[1][:300]}")

    # Get assistant messages (summary)
    c.execute("""
        SELECT m.id, substr(json_extract(m.data, '$.content'), 1, 500)
        FROM message m
        WHERE m.session_id = ?
        AND json_extract(m.data, '$.role') = 'assistant'
        ORDER BY m.time_created
    """, (sid,))
    print("\nAssistant messages (summary):")
    for r in c.fetchall():
        if r[1] and len(r[1].strip()) > 5:
            print(f"  [{r[0]}] {r[1][:300]}")

# Also check the old project sessions
print("\n\n=== OLD PROJECT 65ee4c51 SESSIONS ===")
c.execute("SELECT id, title, time_created FROM session WHERE project_id='65ee4c51-de74-455d-a523-6b3c6f8eceb8' ORDER BY time_created DESC")
for r in c.fetchall():
    print(f"  {r[0]} | {r[2]} | {r[1]}")

conn.close()
