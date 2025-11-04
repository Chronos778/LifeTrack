from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
from datetime import datetime
import time
import threading
import os
import requests
import json

# Import our advanced data structures
from data_structures import health_aggregator, HealthRecord, Doctor, Severity

# Configure Gemini AI
GEMINI_API_KEY = "AIzaSyB-rgGfF6tPBIYRlPSVQPcl35tbieQNvOI"
# Use the actual available models from the API
GEMINI_MODELS = [
    "gemini-2.5-flash",  # Stable version, fast
    "gemini-2.0-flash",  # Alternative stable version
    "gemini-2.5-pro"     # Most capable but slower
]

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Localhost configuration
PORT = 5000

# SQLite database file path
DATABASE = 'phr_database.db'

_write_lock = threading.Lock()

def get_connection(read_only=False):
    """Return a new sqlite3 connection with timeout and row factory.
    read_only is kept for future extension (e.g., URI mode)."""
    # Increase timeout so busy connections wait instead of failing immediately.
    conn = sqlite3.connect(DATABASE, timeout=10, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db_pragmas():
    """Configure WAL mode to reduce write contention."""
    try:
        with get_connection() as conn:
            conn.execute('PRAGMA journal_mode=WAL;')
            conn.execute('PRAGMA synchronous=NORMAL;')
    except Exception as e:
        app.logger.warning(f"Database pragma init failed: {e}")

# Initialize pragmas immediately at import time (Flask version here lacked before_first_request)
init_db_pragmas()

def execute_write(fn, retries=5, base_delay=0.15):
    """Execute a write function with retry/backoff on 'database is locked'."""
    for attempt in range(retries):
        try:
            with _write_lock:  # serialize writes to minimize lock clashes
                return fn()
        except sqlite3.OperationalError as e:
            if 'locked' in str(e).lower() and attempt < retries - 1:
                time.sleep(base_delay * (attempt + 1))
                continue
            raise

# Health check endpoint
@app.route('/', methods=['GET'])
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'LifeTrack Backend is running',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/doctors', methods=['GET'])
def get_doctors():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM doctors")
        doctors = [dict(row) for row in cursor.fetchall()]
    return jsonify(doctors)

@app.route('/users', methods=['GET'])
def get_users():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users")
        users = [dict(row) for row in cursor.fetchall()]
    return jsonify(users)

@app.route('/health_records', methods=['GET'])
def get_health_records():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM health_records")
        records = [dict(row) for row in cursor.fetchall()]
    return jsonify(records)

@app.route('/treatment', methods=['GET'])
def get_treatment():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM treatment")
        treatments = [dict(row) for row in cursor.fetchall()]
    return jsonify(treatments)

# New enhanced endpoints using data structures
@app.route('/users/<int:user_id>/health_summary', methods=['GET'])
def get_user_health_summary(user_id):
    """Get comprehensive health summary using advanced data structures"""
    try:
        summary = health_aggregator.get_user_health_summary(user_id)
        return jsonify(summary)
    except Exception as e:
        return jsonify({'error': f'Failed to get health summary: {str(e)}'}), 500

@app.route('/analytics/system', methods=['GET'])
def get_system_analytics():
    """Get system-wide analytics"""
    try:
        analytics = health_aggregator.get_system_analytics()
        return jsonify(analytics)
    except Exception as e:
        return jsonify({'error': f'Failed to get analytics: {str(e)}'}), 500

@app.route('/treatments/urgent', methods=['GET'])
def get_urgent_treatments():
    """Get urgent treatments using priority queue"""
    try:
        urgent_treatments = health_aggregator.treatment_queue.get_next_urgent_treatments(10)
        overdue_treatments = list(health_aggregator.treatment_queue.get_overdue_treatments())
        
        return jsonify({
            'urgent': urgent_treatments,
            'overdue': overdue_treatments,
            'total_urgent': len(urgent_treatments),
            'total_overdue': len(overdue_treatments)
        })
    except Exception as e:
        return jsonify({'error': f'Failed to get urgent treatments: {str(e)}'}), 500

# POST endpoints for adding new data
@app.route('/health_records', methods=['POST'])
def add_health_record():
    try:
        data = request.json

        def _insert():
            with get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO health_records (user_id, doctor_id, diagnosis, record_date, file_path)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    data['user_id'],
                    data['doctor_id'], 
                    data['diagnosis'],
                    data.get('record_date', datetime.now().strftime('%Y-%m-%d')),
                    data.get('file_path', None)
                ))
                record_id = cursor.lastrowid
                
                # Add to advanced data structures
                record_data = {
                    'record_id': record_id,
                    'user_id': data['user_id'],
                    'doctor_id': data['doctor_id'],
                    'diagnosis': data['diagnosis'],
                    'record_date': data.get('record_date', datetime.now().strftime('%Y-%m-%d')),
                    'file_path': data.get('file_path', None)
                }
                health_aggregator.add_health_record(record_data)
                
                return record_id

        record_id = execute_write(_insert)
        return jsonify({'success': True,'message': 'Health record added successfully','record_id': record_id}), 201
    except Exception as e:
        return jsonify({'success': False,'message': f'Error adding health record: {str(e)}'}), 400

@app.route('/treatment', methods=['POST'])
def add_treatment():
    try:
        data = request.json

        def _insert():
            with get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO treatment (record_id, medication, procedure, follow_up_date)
                    VALUES (?, ?, ?, ?)
                """, (
                    data['record_id'],
                    data['medication'],
                    data.get('procedure', None),
                    data.get('follow_up_date', None)
                ))
                treatment_id = cursor.lastrowid
                
                # Add to priority queue if follow-up date exists
                if data.get('follow_up_date'):
                    follow_up_date = datetime.fromisoformat(data['follow_up_date'])
                    # Determine severity from associated health record
                    cursor.execute("SELECT diagnosis FROM health_records WHERE record_id = ?", (data['record_id'],))
                    diagnosis_row = cursor.fetchone()
                    
                    if diagnosis_row:
                        # Create temporary HealthRecord to determine severity
                        temp_record = HealthRecord(
                            record_id=data['record_id'],
                            user_id=0,  # Not needed for severity calculation
                            doctor_id=0,  # Not needed for severity calculation
                            diagnosis=diagnosis_row[0],
                            record_date=datetime.now()
                        )
                        
                        health_aggregator.treatment_queue.add_treatment(
                            treatment_id, follow_up_date, temp_record.severity
                        )
                
                return treatment_id

        treatment_id = execute_write(_insert)
        return jsonify({'success': True,'message': 'Treatment added successfully','treatment_id': treatment_id}), 201
    except Exception as e:
        return jsonify({'success': False,'message': f'Error adding treatment: {str(e)}'}), 400

@app.route('/doctors', methods=['POST'])
def add_doctor():
    try:
        data = request.json

        def _insert():
            with get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO doctors (name, specialization, contact_number, email)
                    VALUES (?, ?, ?, ?)
                """, (
                    data['name'],
                    data.get('specialization', None),
                    data.get('contact_number', None),
                    data.get('email', None)
                ))
                doctor_id = cursor.lastrowid
                
                # Add to doctor analytics
                doctor = Doctor(
                    doctor_id=doctor_id,
                    name=data['name'],
                    specialization=data.get('specialization', ''),
                    contact_number=data.get('contact_number', ''),
                    email=data.get('email', '')
                )
                health_aggregator.doctor_analytics.add_doctor(doctor)
                
                return doctor_id

        doctor_id = execute_write(_insert)
        return jsonify({'success': True,'message': 'Doctor added successfully','doctor_id': doctor_id}), 201
    except Exception as e:
        return jsonify({'success': False,'message': f'Error adding doctor: {str(e)}'}), 400

@app.route('/users', methods=['POST'])
def add_user():
    try:
        data = request.json

        def _insert():
            with get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO users (name, age, gender, contact_number, email, password)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    data['name'],
                    data.get('age', None),
                    data['gender'],
                    data['contact_number'],
                    data['email'],
                    data['password']
                ))
                return cursor.lastrowid

        user_id = execute_write(_insert)
        return jsonify({'success': True,'message': 'User registered successfully','user_id': user_id}), 201
    except Exception as e:
        return jsonify({'success': False,'message': f'Error registering user: {str(e)}'}), 400

# DELETE endpoints for removing data
@app.route('/health_records/<int:record_id>', methods=['DELETE'])
def delete_health_record(record_id):
    try:
        def _delete():
            with get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM treatment WHERE record_id = ?", (record_id,))
                cursor.execute("DELETE FROM health_records WHERE record_id = ?", (record_id,))
                if cursor.rowcount == 0:
                    return False
                return True
        deleted = execute_write(_delete)
        if not deleted:
            return jsonify({'success': False,'message': 'Health record not found'}), 404
        return jsonify({'success': True,'message': 'Health record deleted successfully'}), 200
    except Exception as e:
        return jsonify({'success': False,'message': f'Error deleting health record: {str(e)}'}), 400

@app.route('/treatment/<int:treatment_id>', methods=['DELETE'])
def delete_treatment(treatment_id):
    try:
        def _delete():
            with get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM treatment WHERE treatment_id = ?", (treatment_id,))
                if cursor.rowcount == 0:
                    return False
                return True
        deleted = execute_write(_delete)
        if not deleted:
            return jsonify({'success': False,'message': 'Treatment not found'}), 404
        return jsonify({'success': True,'message': 'Treatment deleted successfully'}), 200
    except Exception as e:
        return jsonify({'success': False,'message': f'Error deleting treatment: {str(e)}'}), 400

@app.route('/doctors/<int:doctor_id>', methods=['DELETE'])
def delete_doctor(doctor_id):
    try:
        def _delete():
            """Cascade delete doctor:
            1. Collect all health record IDs for this doctor.
            2. Delete related treatments.
            3. Delete related health records.
            4. Delete doctor.
            Returns dict with counts or status flags.
            """
            with get_connection() as conn:
                cursor = conn.cursor()

                # Confirm doctor exists first
                cursor.execute("SELECT 1 FROM doctors WHERE doctor_id = ?", (doctor_id,))
                if cursor.fetchone() is None:
                    return {'status': 'NOT_FOUND'}

                # Gather related health records
                cursor.execute("SELECT record_id FROM health_records WHERE doctor_id = ?", (doctor_id,))
                rec_rows = cursor.fetchall()
                record_ids = [row[0] for row in rec_rows]

                treatments_deleted = 0
                records_deleted = 0

                if record_ids:
                    # Delete treatments referencing those records (chunk if large)
                    # (Using simple approach; record_ids list is usually small for this app.)
                    placeholders = ','.join(['?'] * len(record_ids))
                    cursor.execute(f"DELETE FROM treatment WHERE record_id IN ({placeholders})", record_ids)
                    treatments_deleted = cursor.rowcount

                    # Delete health records
                    cursor.execute(f"DELETE FROM health_records WHERE record_id IN ({placeholders})", record_ids)
                    records_deleted = cursor.rowcount

                # Finally delete doctor
                cursor.execute("DELETE FROM doctors WHERE doctor_id = ?", (doctor_id,))
                doctor_deleted = cursor.rowcount

                return {
                    'status': 'DELETED' if doctor_deleted else 'NOT_FOUND',
                    'records_deleted': records_deleted,
                    'treatments_deleted': treatments_deleted
                }

        result = execute_write(_delete)
        if result.get('status') == 'NOT_FOUND':
            return jsonify({'success': False, 'message': 'Doctor not found'}), 404
        return jsonify({
            'success': True,
            'message': 'Doctor and related data deleted successfully',
            'details': {
                'health_records_deleted': result.get('records_deleted', 0),
                'treatments_deleted': result.get('treatments_deleted', 0)
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False,'message': f'Error deleting doctor: {str(e)}'}), 400

# ============== AI HEALTH INSIGHTS ENDPOINT ==============
@app.route('/api/health-insights/<int:user_id>', methods=['GET'])
def get_health_insights(user_id):
    """Generate personalized health insights using Gemini AI"""
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            
            # Fetch user's health records
            cursor.execute("""
                SELECT hr.*, d.name as doctor_name, d.specialization 
                FROM health_records hr
                LEFT JOIN doctors d ON hr.doctor_id = d.doctor_id
                WHERE hr.user_id = ?
                ORDER BY hr.record_date DESC
            """, (user_id,))
            records = [dict(row) for row in cursor.fetchall()]
            
            # Fetch user's treatments
            cursor.execute("""
                SELECT t.*, hr.diagnosis 
                FROM treatment t
                LEFT JOIN health_records hr ON t.record_id = hr.record_id
                WHERE hr.user_id = ?
                ORDER BY t.treatment_id DESC
            """, (user_id,))
            treatments = [dict(row) for row in cursor.fetchall()]
            
            # Fetch visited doctors
            cursor.execute("""
                SELECT DISTINCT d.* 
                FROM doctors d
                INNER JOIN health_records hr ON d.doctor_id = hr.doctor_id
                WHERE hr.user_id = ?
            """, (user_id,))
            doctors = [dict(row) for row in cursor.fetchall()]
        
        # If no data, return default insights
        if not records and not treatments:
            return jsonify({
                'success': True,
                'insights': {
                    'summary': 'Welcome to LifeTrack! Start by adding your first health record to receive personalized insights.',
                    'trends': [],
                    'recommendations': ['Add your first doctor visit', 'Record any ongoing treatments', 'Upload medical documents'],
                    'statistics': {
                        'total_records': 0,
                        'total_doctors': 0,
                        'total_treatments': 0
                    }
                }
            }), 200
        
        # Prepare data for AI analysis
        health_summary = f"""
        Analyze this patient's health data and provide insights:
        
        HEALTH RECORDS ({len(records)} total):
        {chr(10).join([f"- {r['record_date']}: {r['diagnosis']} (Dr. {r['doctor_name']}, {r['specialization']})" for r in records[:10]])}
        
        TREATMENTS ({len(treatments)} total):
        {chr(10).join([f"- {t['medication']} for {t['diagnosis']}" + (f" (Follow-up: {t['follow_up_date']})" if t.get('follow_up_date') else "") for t in treatments[:10]])}
        
        DOCTORS VISITED ({len(doctors)} total):
        {chr(10).join([f"- Dr. {d['name']} ({d['specialization']})" for d in doctors])}
        
        Provide:
        1. A brief summary (2-3 sentences)
        2. 3-5 health trends or patterns you notice
        3. 3-5 personalized recommendations
        
        Format as JSON with keys: summary, trends (array), recommendations (array)
        Be encouraging, professional, and focus on actionable insights.
        """
        
        # Generate insights using Gemini AI v1beta API - try multiple models
        headers = {'Content-Type': 'application/json'}
        payload = {
            "contents": [{
                "parts": [{
                    "text": health_summary
                }]
            }]
        }
        
        gemini_response = None
        last_error = None
        
        # Try each model until one works
        for model_name in GEMINI_MODELS:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
                gemini_response = requests.post(url, headers=headers, json=payload, timeout=30)
                
                if gemini_response.status_code == 200:
                    break  # Success! Use this model
                else:
                    last_error = gemini_response.text
            except Exception as e:
                last_error = str(e)
                continue
        
        if not gemini_response or gemini_response.status_code != 200:
            raise Exception(f"All Gemini models failed. Last error: {last_error}")
        
        # Parse AI response
        response_data = gemini_response.json()
        ai_text = response_data['candidates'][0]['content']['parts'][0]['text']
        
        # Try to extract JSON from response, or create structured response
        import json
        import re
        
        # Look for JSON in the response
        json_match = re.search(r'\{.*\}', ai_text, re.DOTALL)
        if json_match:
            try:
                ai_insights = json.loads(json_match.group())
            except:
                # If JSON parsing fails, create structured response from text
                ai_insights = {
                    'summary': ai_text[:300],
                    'trends': ['Pattern analysis based on your records'],
                    'recommendations': ['Continue tracking your health data']
                }
        else:
            # Parse text response into structured format
            lines = ai_text.split('\n')
            ai_insights = {
                'summary': lines[0] if lines else 'Health data analysis complete.',
                'trends': [line.strip('- ').strip() for line in lines if line.strip().startswith('-')][:5] or ['Regular health monitoring detected'],
                'recommendations': [line.strip('- ').strip() for line in lines if line.strip().startswith('-')][5:10] or ['Keep updating your health records']
            }
        
        # Add statistics
        insights_response = {
            'success': True,
            'insights': {
                'summary': ai_insights.get('summary', 'Analysis complete'),
                'trends': ai_insights.get('trends', [])[:5],
                'recommendations': ai_insights.get('recommendations', [])[:5],
                'statistics': {
                    'total_records': len(records),
                    'total_doctors': len(doctors),
                    'total_treatments': len(treatments),
                    'recent_visits': len([r for r in records if r['record_date'] and r['record_date'].startswith('2025')])
                }
            }
        }
        
        return jsonify(insights_response), 200
        
    except Exception as e:
        app.logger.error(f"Error generating health insights: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error generating insights: {str(e)}',
            'insights': {
                'summary': 'Unable to generate insights at this time.',
                'trends': [],
                'recommendations': ['Try again later'],
                'statistics': {'total_records': 0, 'total_doctors': 0, 'total_treatments': 0}
            }
        }), 500

if __name__ == '__main__':
    # Run on localhost only
    app.run(host='127.0.0.1', port=PORT, debug=True)