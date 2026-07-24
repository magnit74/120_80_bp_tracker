import sqlite3, json

DB_PATH = "C:/Users/оператор/.local/share/mimocode/mimocode.db"
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# Check message data format
c.execute("""
    SELECT data FROM message 
    WHERE session_id='ses_0e85bba13ffe5exex9JUzD7yCb'
    LIMIT 2
""")
for r in c.fetchall():
    d = json.loads(r[0])
    print(json.dumps(d, indent=2, ensure_ascii=False)[:1000])
    print("---")

# Check part data format too
c.execute("""
    SELECT data FROM part 
    WHERE session_id='ses_0e85bba13ffe5exex9JUzD7yCb'
    LIMIT 3
""")
for r in c.fetchall():
    d = json.loads(r[0])
    print(json.dumps(d, indent=2, ensure_ascii=False)[:1000])
    print("===")

conn.close()
