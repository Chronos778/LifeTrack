import sqlite3

# Connect to database
conn = sqlite3.connect('phr_database.db')

# Read and execute SQL file
with open('phr_database.sql', 'r') as f:
    conn.executescript(f.read())

conn.commit()

# Verify data
cur = conn.cursor()
print('✅ Database reinitialized successfully!')
print('━' * 50)
print('Users:', cur.execute('SELECT COUNT(*) FROM users').fetchone()[0])
print('Doctors:', cur.execute('SELECT COUNT(*) FROM doctors').fetchone()[0])
print('Health Records:', cur.execute('SELECT COUNT(*) FROM health_records').fetchone()[0])
print('Treatments:', cur.execute('SELECT COUNT(*) FROM treatment').fetchone()[0])
print('━' * 50)

conn.close()
