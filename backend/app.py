from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
from datetime import datetime
import time
import threading
import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import our advanced data structures
from data_structures import health_aggregator, HealthRecord, Doctor, Severity

# Configure Hugging Face Inference API
HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY', 'your-huggingface-api-key-here')
# Use Hugging Face Router endpoint (OpenAI-compatible)
HUGGINGFACE_API_URL = "https://router.huggingface.co/v1/chat/completions"
# Alternative models to try if primary fails
HUGGINGFACE_MODELS = [
    "mistralai/Mistral-7B-Instruct-v0.2",  # Reliable and powerful
    "meta-llama/Llama-3.2-3B-Instruct",  # Fast alternative
    "HuggingFaceH4/zephyr-7b-beta"  # Good fallback
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
        app.logger.error(f'Failed to get health summary: {str(e)}')
        return jsonify({'error': 'Failed to get health summary'}), 500

@app.route('/analytics/system', methods=['GET'])
def get_system_analytics():
    """Get system-wide analytics"""
    try:
        analytics = health_aggregator.get_system_analytics()
        return jsonify(analytics)
    except Exception as e:
        app.logger.error(f'Failed to get analytics: {str(e)}')
        return jsonify({'error': 'Failed to get analytics'}), 500

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
        app.logger.error(f'Failed to get urgent treatments: {str(e)}')
        return jsonify({'error': 'Failed to get urgent treatments'}), 500

# POST endpoints for adding new data
@app.route('/health_records', methods=['POST'])
def add_health_record():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

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
        app.logger.error(f'Error adding health record: {str(e)}')
        return jsonify({'success': False,'message': 'Error adding health record'}), 400

@app.route('/treatment', methods=['POST'])
def add_treatment():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

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
                if data.get('follow_up_date') and treatment_id is not None:
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
        app.logger.error(f'Error adding treatment: {str(e)}')
        return jsonify({'success': False,'message': 'Error adding treatment'}), 400

@app.route('/doctors', methods=['POST'])
def add_doctor():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

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
                if doctor_id is not None:
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
        app.logger.error(f'Error adding doctor: {str(e)}')
        return jsonify({'success': False,'message': 'Error adding doctor'}), 400

@app.route('/users', methods=['POST'])
def add_user():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

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
        app.logger.error(f'Error registering user: {str(e)}')
        return jsonify({'success': False,'message': 'Error registering user'}), 400

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
        app.logger.error(f'Error deleting health record: {str(e)}')
        return jsonify({'success': False,'message': 'Error deleting health record'}), 400

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
        app.logger.error(f'Error deleting treatment: {str(e)}')
        return jsonify({'success': False,'message': 'Error deleting treatment'}), 400

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
        if result and result.get('status') == 'NOT_FOUND':
            return jsonify({'success': False, 'message': 'Doctor not found'}), 404
        return jsonify({
            'success': True,
            'message': 'Doctor and related data deleted successfully',
            'details': {
                'health_records_deleted': result.get('records_deleted', 0) if result else 0,
                'treatments_deleted': result.get('treatments_deleted', 0) if result else 0
            }
        }), 200
    except Exception as e:
        app.logger.error(f'Error deleting doctor: {str(e)}')
        return jsonify({'success': False,'message': 'Error deleting doctor'}), 400

# ============== UPDATE ENDPOINTS ==============
@app.route('/doctors/<int:doctor_id>', methods=['PUT'])
def update_doctor(doctor_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        def _update():
            with get_connection() as conn:
                cursor = conn.cursor()
                
                # Check if doctor exists
                cursor.execute("SELECT 1 FROM doctors WHERE doctor_id = ?", (doctor_id,))
                if cursor.fetchone() is None:
                    return {'status': 'NOT_FOUND'}
                
                # Update doctor
                cursor.execute("""
                    UPDATE doctors 
                    SET name = ?, specialization = ?, contact_number = ?, email = ?
                    WHERE doctor_id = ?
                """, (
                    data.get('name'),
                    data.get('specialization'),
                    data.get('contact_number'),
                    data.get('email'),
                    doctor_id
                ))
                
                return {'status': 'UPDATED'}

        result = execute_write(_update)
        if result and result.get('status') == 'NOT_FOUND':
            return jsonify({'success': False, 'message': 'Doctor not found'}), 404
        
        return jsonify({'success': True, 'message': 'Doctor updated successfully'}), 200
    except Exception as e:
        app.logger.error(f'Error updating doctor: {str(e)}')
        return jsonify({'success': False, 'message': 'Error updating doctor'}), 400

@app.route('/health_records/<int:record_id>', methods=['PUT'])
def update_health_record(record_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        def _update():
            with get_connection() as conn:
                cursor = conn.cursor()
                
                # Check if record exists
                cursor.execute("SELECT 1 FROM health_records WHERE record_id = ?", (record_id,))
                if cursor.fetchone() is None:
                    return {'status': 'NOT_FOUND'}
                
                # Update health record
                cursor.execute("""
                    UPDATE health_records 
                    SET doctor_id = ?, diagnosis = ?, record_date = ?, file_path = ?
                    WHERE record_id = ?
                """, (
                    data.get('doctor_id'),
                    data.get('diagnosis'),
                    data.get('record_date'),
                    data.get('file_path'),
                    record_id
                ))
                
                return {'status': 'UPDATED'}

        result = execute_write(_update)
        if result and result.get('status') == 'NOT_FOUND':
            return jsonify({'success': False, 'message': 'Health record not found'}), 404
        
        return jsonify({'success': True, 'message': 'Health record updated successfully'}), 200
    except Exception as e:
        app.logger.error(f'Error updating health record: {str(e)}')
        return jsonify({'success': False, 'message': 'Error updating health record'}), 400

@app.route('/treatment/<int:treatment_id>', methods=['PUT'])
def update_treatment(treatment_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        def _update():
            with get_connection() as conn:
                cursor = conn.cursor()
                
                # Check if treatment exists
                cursor.execute("SELECT 1 FROM treatment WHERE treatment_id = ?", (treatment_id,))
                if cursor.fetchone() is None:
                    return {'status': 'NOT_FOUND'}
                
                # Update treatment
                cursor.execute("""
                    UPDATE treatment 
                    SET medication = ?, procedure = ?, follow_up_date = ?
                    WHERE treatment_id = ?
                """, (
                    data.get('medication'),
                    data.get('procedure'),
                    data.get('follow_up_date'),
                    treatment_id
                ))
                
                return {'status': 'UPDATED'}

        result = execute_write(_update)
        if result and result.get('status') == 'NOT_FOUND':
            return jsonify({'success': False, 'message': 'Treatment not found'}), 404
        
        return jsonify({'success': True, 'message': 'Treatment updated successfully'}), 200
    except Exception as e:
        app.logger.error(f'Error updating treatment: {str(e)}')
        return jsonify({'success': False, 'message': 'Error updating treatment'}), 400

# ============== AI HEALTH INSIGHTS ENDPOINT ==============
@app.route('/api/health-insights/<int:user_id>', methods=['GET'])
def get_health_insights(user_id):
    """Generate personalized health insights using Hugging Face AI"""
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
        
        # Prepare data for AI analysis with enhanced prompt
        
        # Get most recent records
        recent_records = records[:15] if len(records) > 15 else records
        recent_treatments = treatments[:15] if len(treatments) > 15 else treatments
        
        # Extract unique diagnoses
        unique_diagnoses = list(set([r['diagnosis'] for r in records]))
        
        # Calculate time span
        if records:
            oldest_date = min([r['record_date'] for r in records if r['record_date']])
            newest_date = max([r['record_date'] for r in records if r['record_date']])
            time_span = f"from {oldest_date} to {newest_date}"
        else:
            time_span = "recent period"
        
        health_summary = f"""
You are a healthcare analytics AI assistant. Analyze this patient's medical history and provide actionable health insights.

PATIENT HEALTH PROFILE:
- Total Health Records: {len(records)}
- Active Treatments: {len(treatments)}
- Healthcare Providers: {len(doctors)} specialists
- Time Period: {time_span}
- Unique Conditions: {len(unique_diagnoses)}

DETAILED HEALTH RECORDS (Most Recent):
{chr(10).join([f"• {r['record_date']}: {r['diagnosis']} → Treated by Dr. {r['doctor_name']} ({r['specialization']})" for r in recent_records])}

CURRENT/RECENT TREATMENTS:
{chr(10).join([f"• {t['medication']} - {t['diagnosis']}" + (f" | Next follow-up: {t['follow_up_date']}" if t.get('follow_up_date') else " | Completed") for t in recent_treatments])}

SPECIALIST CONSULTATIONS:
{chr(10).join([f"• Dr. {d['name']} - {d['specialization']}" for d in doctors])}

UNIQUE CONDITIONS DIAGNOSED:
{chr(10).join([f"• {diagnosis}" for diagnosis in unique_diagnoses[:10]])}

ANALYSIS REQUIRED:
Provide a comprehensive health analysis in JSON format with these exact keys:

1. "summary" (string): A 3-4 sentence overview highlighting the patient's main health concerns, chronic conditions being managed, and overall health trajectory.

2. "trends" (array of 5 strings): Identify specific patterns such as:
   - Recurring conditions (seasonal patterns, chronic disease progression)
   - Frequency of specialist visits (which specialists, why)
   - Medication adherence indicators
   - Related conditions (comorbidities, risk factors)
   - Time-based patterns (months with more visits, seasonal issues)

3. "recommendations" (array of 5 strings): Provide specific, actionable advice:
   - Preventive care steps based on diagnosed conditions
   - Lifestyle modifications for chronic conditions
   - Tests or screenings due based on history
   - Medication management tips
   - When to schedule follow-ups or see specialists

IMPORTANT:
- Be specific and reference actual diagnoses/treatments
- Focus on practical, actionable insights
- Highlight any concerning patterns requiring attention
- Be encouraging but realistic
- Use medical terminology appropriately but explain clearly

Output ONLY valid JSON in this exact format:
{{
  "summary": "string",
  "trends": ["string1", "string2", "string3", "string4", "string5"],
  "recommendations": ["string1", "string2", "string3", "string4", "string5"]
}}
        """
        
        # Generate insights using Hugging Face Router API (OpenAI-compatible)
        headers = {
            'Authorization': f'Bearer {HUGGINGFACE_API_KEY}',
            'Content-Type': 'application/json'
        }
        payload = {
            "model": HUGGINGFACE_MODELS[0],
            "messages": [
                {"role": "user", "content": health_summary}
            ],
            "max_tokens": 800,
            "temperature": 0.3
        }
        
        hf_response = None
        last_error = None
        
        # Try each model until one works
        for model_name in HUGGINGFACE_MODELS:
            try:
                payload["model"] = model_name
                hf_response = requests.post(HUGGINGFACE_API_URL, headers=headers, json=payload, timeout=60)
                
                if hf_response.status_code == 200:
                    break  # Success! Use this model
                else:
                    last_error = hf_response.text
            except Exception as e:
                last_error = str(e)
                continue
        
        if not hf_response or hf_response.status_code != 200:
            raise Exception(f"All Hugging Face models failed. Last error: {last_error}")
        
        # Parse AI response from Hugging Face (OpenAI format)
        response_data = hf_response.json()
        ai_text = response_data['choices'][0]['message']['content']
        
        # Try to extract JSON from response
        import json
        import re
        
        app.logger.info(f"AI Response: {ai_text[:200]}...")  # Log first 200 chars for debugging
        
        # Clean up markdown code blocks if present
        ai_text_cleaned = re.sub(r'```json\s*|\s*```', '', ai_text)
        
        # Look for JSON in the response
        json_match = re.search(r'\{[^{}]*"summary"[^{}]*"trends"[^{}]*"recommendations"[^{}]*\}', ai_text_cleaned, re.DOTALL)
        
        if json_match:
            try:
                ai_insights = json.loads(json_match.group())
                # Ensure we have all required fields
                if not all(key in ai_insights for key in ['summary', 'trends', 'recommendations']):
                    raise ValueError("Missing required fields")
                # Ensure trends and recommendations are lists with at least some items
                if not isinstance(ai_insights['trends'], list) or len(ai_insights['trends']) == 0:
                    ai_insights['trends'] = ['Health data analysis in progress']
                if not isinstance(ai_insights['recommendations'], list) or len(ai_insights['recommendations']) == 0:
                    ai_insights['recommendations'] = ['Continue regular health monitoring']
            except Exception as e:
                app.logger.warning(f"JSON parsing failed: {e}, attempting fallback parsing")
                # Fallback: Try to parse structured text
                ai_insights = {
                    'summary': ai_text[:400] if len(ai_text) > 400 else ai_text,
                    'trends': ['Analyzing your health patterns...'],
                    'recommendations': ['Keep maintaining your health records']
                }
        else:
            app.logger.warning("No JSON found in AI response, using fallback")
            # Smart fallback - try to extract meaningful content
            lines = [line.strip() for line in ai_text.split('\n') if line.strip()]
            ai_insights = {
                'summary': lines[0] if lines else 'Health data analysis complete.',
                'trends': [line.lstrip('•-*123456789. ') for line in lines[1:6] if line] or ['Regular health monitoring detected'],
                'recommendations': [line.lstrip('•-*123456789. ') for line in lines[6:11] if line] or ['Keep updating your health records']
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
            'message': 'Error generating insights',
            'insights': {
                'summary': 'Unable to generate insights at this time.',
                'trends': [],
                'recommendations': ['Try again later'],
                'statistics': {'total_records': 0, 'total_doctors': 0, 'total_treatments': 0}
            }
        }), 500

# ============== VOICE-TO-RECORD AI PARSING ENDPOINT ==============
@app.route('/api/parse-voice-record', methods=['POST'])
def parse_voice_record():
    """Parse voice input and extract medical record information using Hugging Face AI"""
    try:
        data = request.get_json()
        voice_text = data.get('text', '')
        user_id = data.get('user_id')
        
        if not voice_text:
            return jsonify({
                'success': False,
                'message': 'No voice input provided'
            }), 400
        
        # Get user's doctors for context
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT doctor_id, name, specialization FROM doctors")
            all_doctors = [dict(row) for row in cursor.fetchall()]
        
        # Create prompt for AI to parse the voice input
        doctors_list = "\n".join([f"- Dr. {d['name']} (ID: {d['doctor_id']}, {d['specialization']})" for d in all_doctors])
        
        parse_prompt = f"""
You are a medical record parser. Extract structured information from this voice input.

VOICE INPUT: "{voice_text}"

AVAILABLE DOCTORS IN SYSTEM:
{doctors_list}

TASK: Extract and return ONLY valid JSON in this exact format:
{{
  "doctor_id": <number or null>,
  "doctor_name": "<extracted name or null>",
  "diagnosis": "<main condition/reason for visit>",
  "date": "<YYYY-MM-DD format or today's date if not mentioned>",
  "medication": "<ONLY medication name, no dosage/strength>",
  "dosage": "<ONLY dosage instructions like '500mg twice daily', no medication name>",
  "follow_up_date": "<YYYY-MM-DD or null>",
  "confidence": "High|Medium|Low"
}}

CRITICAL RULES:
1. Match doctor_id from the available doctors list if doctor name is mentioned
2. If doctor not in list, set doctor_id to null but include doctor_name
3. Extract diagnosis as concisely as possible
4. Use today's date (2025-11-05) if no date mentioned
5. Set confidence based on how clear the input is
6. If medication/dosage not mentioned, use null
7. IMPORTANT: Keep medication and dosage SEPARATE:
   - medication field: ONLY the drug name (e.g., "Paracetamol", "Ibuprofen")
   - dosage field: ONLY the amount and frequency (e.g., "500mg twice daily", "10ml every 6 hours")
8. Output ONLY the JSON, no other text

Examples:
Input: "I saw Dr. Smith for fever yesterday, he gave me paracetamol 500mg twice a day"
Output: {{"doctor_id": 1, "doctor_name": "Smith", "diagnosis": "Fever", "date": "2025-11-04", "medication": "Paracetamol", "dosage": "500mg twice daily", "follow_up_date": null, "confidence": "High"}}

Input: "visited Dr. Williams for diabetes check, prescribed metformin 850 milligrams once daily"
Output: {{"doctor_id": 2, "doctor_name": "Williams", "diagnosis": "Diabetes check-up", "date": "2025-11-05", "medication": "Metformin", "dosage": "850mg once daily", "follow_up_date": null, "confidence": "High"}}
"""
        
        # Call Hugging Face Router API (OpenAI-compatible)
        headers = {
            'Authorization': f'Bearer {HUGGINGFACE_API_KEY}',
            'Content-Type': 'application/json'
        }
        payload = {
            "model": HUGGINGFACE_MODELS[0],
            "messages": [
                {"role": "user", "content": parse_prompt}
            ],
            "max_tokens": 500,
            "temperature": 0.2
        }
        
        hf_response = None
        
        # Try each model
        for model_name in HUGGINGFACE_MODELS:
            try:
                payload["model"] = model_name
                hf_response = requests.post(HUGGINGFACE_API_URL, headers=headers, json=payload, timeout=60)
                
                if hf_response.status_code == 200:
                    break
            except Exception as e:
                continue
        
        if not hf_response or hf_response.status_code != 200:
            raise Exception("AI parsing failed")
        
        # Parse AI response from Hugging Face (OpenAI format)
        response_data = hf_response.json()
        ai_text = response_data['choices'][0]['message']['content']
        
        # Extract JSON from response
        import json
        import re
        from datetime import datetime
        
        # Clean markdown
        ai_text_cleaned = re.sub(r'```json\s*|\s*```', '', ai_text)
        
        # Find JSON
        json_match = re.search(r'\{[^{}]*\}', ai_text_cleaned, re.DOTALL)
        
        if json_match:
            parsed_data = json.loads(json_match.group())
            
            # Validate and set defaults
            if not parsed_data.get('date'):
                parsed_data['date'] = datetime.now().strftime('%Y-%m-%d')
            
            if not parsed_data.get('diagnosis'):
                parsed_data['diagnosis'] = 'General Consultation'
            
            # If doctor_id is null but doctor_name exists, try to find matching doctor
            if not parsed_data.get('doctor_id') and parsed_data.get('doctor_name'):
                doctor_name_lower = parsed_data['doctor_name'].lower()
                for doc in all_doctors:
                    if doctor_name_lower in doc['name'].lower():
                        parsed_data['doctor_id'] = doc['doctor_id']
                        break
            
            return jsonify({
                'success': True,
                'parsed_data': parsed_data,
                'message': 'Voice input parsed successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Could not parse voice input. Please speak more clearly or try again.'
            }), 400
            
    except Exception as e:
        app.logger.error(f"Error parsing voice record: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error processing voice input'
        }), 500

# ============== VOICE-TO-DOCTOR AI PARSING ENDPOINT ==============
@app.route('/api/parse-voice-doctor', methods=['POST'])
def parse_voice_doctor():
    """Parse voice input and extract doctor information using Hugging Face AI"""
    try:
        data = request.get_json()
        voice_text = data.get('text', '')
        user_id = data.get('user_id')
        
        if not voice_text:
            return jsonify({
                'success': False,
                'message': 'No voice input provided'
            }), 400
        
        # Create prompt for AI to parse the voice input for doctor information
        parse_prompt = f"""
You are a doctor information parser. Extract structured information from this voice input about a doctor.

VOICE INPUT: "{voice_text}"

Extract the following information and return ONLY valid JSON (no markdown):
{{
  "name": "Doctor's full name (required)",
  "specialization": "Medical specialization (required, e.g., Cardiologist, Dermatologist, General Physician)",
  "phone": "Phone number if mentioned, or null",
  "email": "Email address if mentioned, or null",
  "address": "Clinic/Hospital address if mentioned, or null",
  "notes": "Any additional notes or specialties mentioned, or null",
  "confidence": 0.0 to 1.0
}}

INSTRUCTIONS:
1. Extract doctor's name (required) - look for "Dr." prefix or context
2. Extract specialization (required) - the medical field
3. Extract phone number if mentioned (format: numbers only or with dashes)
4. Extract email if mentioned
5. Extract address/location if mentioned
6. Add any additional relevant information to notes
7. Set confidence based on clarity of information
8. Return ONLY the JSON object, no other text

Examples:
- "Dr. Sarah Johnson cardiologist phone 555-0123" → name: "Dr. Sarah Johnson", specialization: "Cardiologist", phone: "555-0123"
- "Add Dr. Patel, he's a dermatologist at City Hospital" → name: "Dr. Patel", specialization: "Dermatologist", address: "City Hospital"
- "New doctor Michael Chen, neurologist, email mchen@hospital.com" → name: "Dr. Michael Chen", specialization: "Neurologist", email: "mchen@hospital.com"

Return ONLY the JSON. No explanations.
"""
        
        print(f"\n{'='*50}")
        print(f"🎤 VOICE DOCTOR PARSING REQUEST")
        print(f"{'='*50}")
        print(f"📝 Voice Text: {voice_text}")
        print(f"👤 User ID: {user_id}")
        
        # Try Hugging Face models
        parsed_data = None
        last_error = None
        
        headers = {
            'Authorization': f'Bearer {HUGGINGFACE_API_KEY}',
            'Content-Type': 'application/json'
        }
        payload = {
            "model": HUGGINGFACE_MODELS[0],
            "messages": [
                {"role": "user", "content": parse_prompt}
            ],
            "max_tokens": 500,
            "temperature": 0.2
        }
        
        for model_name in HUGGINGFACE_MODELS:
            try:
                print(f"\n🤖 Trying model: {model_name}")
                payload["model"] = model_name
                response = requests.post(HUGGINGFACE_API_URL, headers=headers, json=payload, timeout=60)
                
                if response and response.status_code == 200:
                    response_data = response.json()
                    # Extract generated text from OpenAI format
                    response_text = response_data['choices'][0]['message']['content'].strip()
                    
                    print(f"📤 AI Response: {response_text}")
                    
                    # Try to extract JSON from markdown code blocks
                    if '```json' in response_text:
                        json_start = response_text.find('```json') + 7
                        json_end = response_text.find('```', json_start)
                        response_text = response_text[json_start:json_end].strip()
                    elif '```' in response_text:
                        json_start = response_text.find('```') + 3
                        json_end = response_text.find('```', json_start)
                        response_text = response_text[json_start:json_end].strip()
                    
                    # Remove any leading/trailing whitespace and newlines
                    response_text = response_text.strip()
                    
                    parsed_data = json.loads(response_text)
                    print(f"✅ Successfully parsed with {model_name}")
                    break
                    
            except Exception as model_error:
                last_error = str(model_error)
                print(f"⚠️ Model {model_name} failed: {last_error}")
                continue
        
        if parsed_data:
            # Ensure required fields with defaults
            if not parsed_data.get('name'):
                parsed_data['name'] = 'Unknown Doctor'
            
            if not parsed_data.get('specialization'):
                parsed_data['specialization'] = 'General Physician'
            
            print(f"\n✅ PARSED DOCTOR DATA:")
            print(f"👨‍⚕️ Name: {parsed_data.get('name')}")
            print(f"🏥 Specialization: {parsed_data.get('specialization')}")
            print(f"📞 Phone: {parsed_data.get('phone', 'N/A')}")
            print(f"📧 Email: {parsed_data.get('email', 'N/A')}")
            print(f"📍 Address: {parsed_data.get('address', 'N/A')}")
            print(f"📝 Notes: {parsed_data.get('notes', 'N/A')}")
            confidence = parsed_data.get('confidence', 0)
            if isinstance(confidence, (int, float)):
                print(f"🎯 Confidence: {confidence:.2f}")
            else:
                print(f"🎯 Confidence: {confidence}")
            
            return jsonify({
                'success': True,
                'parsed_data': parsed_data,
                'message': 'Voice input parsed successfully'
            }), 200
        else:
            # Fallback: Basic parsing if AI fails
            print(f"\n⚠️ All AI models failed, using fallback parser. Last error: {last_error}")
            
            # Simple regex-based extraction
            import re
            
            # Extract doctor name (look for "Dr." or "Doctor")
            name_match = re.search(r'(?:Dr\.?|Doctor)\s+([A-Za-z]+(?:\s+[A-Za-z]+)*)', voice_text, re.IGNORECASE)
            name = name_match.group(0) if name_match else "Unknown Doctor"
            
            # Extract specialization (common medical specializations)
            specializations = ['cardiologist', 'dermatologist', 'neurologist', 'pediatrician', 
                             'orthopedic', 'psychiatrist', 'general physician', 'surgeon']
            specialization = 'General Physician'
            for spec in specializations:
                if spec.lower() in voice_text.lower():
                    specialization = spec.title()
                    break
            
            # Extract phone (numbers)
            phone_match = re.search(r'\b\d{3}[-.\s]?\d{4,5}\b|\b\d{6,10}\b', voice_text)
            phone = phone_match.group(0) if phone_match else None
            
            # Extract email
            email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', voice_text)
            email = email_match.group(0) if email_match else None
            
            fallback_data = {
                'name': name,
                'specialization': specialization,
                'phone': phone,
                'email': email,
                'address': None,
                'notes': f"Parsed from: {voice_text}",
                'confidence': 0.5
            }
            
            print(f"\n✅ FALLBACK PARSED DATA:")
            print(f"👨‍⚕️ Name: {fallback_data['name']}")
            print(f"🏥 Specialization: {fallback_data['specialization']}")
            
            return jsonify({
                'success': True,
                'parsed_data': fallback_data,
                'message': 'Voice input parsed successfully (basic mode)'
            }), 200
            
    except Exception as e:
        app.logger.error(f"Error parsing voice doctor: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error processing voice input'
        }), 500

if __name__ == '__main__':
    # Run on localhost only
    # Debug mode should only be enabled in development
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='127.0.0.1', port=PORT, debug=debug_mode)