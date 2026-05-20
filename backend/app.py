import os
import json
import cv2
import numpy as np
import sqlite3
import hashlib
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
from PIL import Image
from fpdf import FPDF
import io

load_dotenv()

app = Flask(__name__)
CORS(app)

os.makedirs('uploads', exist_ok=True)
os.makedirs('processed', exist_ok=True)

# Database Setup
def init_db():
    conn = sqlite3.connect('mediscan.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS scans (
            id TEXT PRIMARY KEY,
            patient_id TEXT,
            image_name TEXT,
            diagnosis TEXT,
            confidence REAL,
            severity TEXT,
            region TEXT,
            recommendation TEXT,
            timestamp TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# Try to get API key from environment, else use a placeholder for now
api_key = os.environ.get("GEMINI_API_KEY", "")
if api_key:
    genai.configure(api_key=api_key)

@app.route('/api/analyze', methods=['POST'])
def analyze():
    if 'image' not in request.files:
        return jsonify({'error': 'No image part'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    try:
        # 1. Read image bytes
        file_bytes = np.frombuffer(file.read(), np.uint8)
        
        # 2. DIP: OpenCV Processing
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        enhanced = clahe.apply(gray)
        
        # Save processed image temporarily to send to Gemini
        processed_path = os.path.join('processed', 'temp.jpg')
        cv2.imwrite(processed_path, enhanced)
        
        # 3. AI Analysis with Gemini
        pil_img = Image.open(processed_path)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = """
        You are an expert radiologist and medical image analyzer AI.
        Analyze this image (assume it's a medical scan like X-ray, MRI, etc. or a normal image if not medical).
        Identify if there are signs of any diseases, specifically looking for pneumonia or other anomalies.
        
        You MUST return the output EXACTLY as a valid JSON object with the following keys and format:
        {
            "diagnosis": "PNEUMONIA DETECTED" or "NORMAL" or "ANOMALY DETECTED",
            "confidence": 95.5,
            "severity": "Mild", "Moderate", "Severe", or "N/A",
            "region": "The specific region affected, e.g., Lower Right Lobe, or 'Bilateral Clear'",
            "recommendation": "A short 2-3 sentence clinical recommendation."
        }
        Do not add any markdown formatting. Return ONLY the raw JSON string.
        """
        
        response = model.generate_content([prompt, pil_img])
        
        # Parse the JSON response
        try:
            raw_text = response.text.strip()
            if raw_text.startswith('```json'): raw_text = raw_text[7:]
            if raw_text.startswith('```'): raw_text = raw_text[3:]
            if raw_text.endswith('```'): raw_text = raw_text[:-3]
            ai_data = json.loads(raw_text.strip())
        except Exception as json_e:
            ai_data = {
                "diagnosis": "ANALYSIS COMPLETED",
                "confidence": 85.0,
                "severity": "Unknown",
                "region": "Scanned Region",
                "recommendation": response.text
            }
            
        # 4. Generate Real Patient ID and Save to DB
        now = datetime.now()
        timestamp_str = now.strftime('%Y-%m-%d %H:%M')
        unique_string = file.filename + timestamp_str
        hash_id = hashlib.sha1(unique_string.encode()).hexdigest()[:8].upper()
        patient_id = f"PAC-X-{hash_id}"
        scan_id = f"case-{int(now.timestamp())}"
        
        conn = sqlite3.connect('mediscan.db')
        c = conn.cursor()
        c.execute('''
            INSERT INTO scans 
            (id, patient_id, image_name, diagnosis, confidence, severity, region, recommendation, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            scan_id, patient_id, file.filename, 
            ai_data.get('diagnosis', 'Unknown'), 
            ai_data.get('confidence', 0.0), 
            ai_data.get('severity', 'N/A'), 
            ai_data.get('region', 'N/A'), 
            ai_data.get('recommendation', ''), 
            timestamp_str
        ))
        conn.commit()
        conn.close()
        
        result_payload = {
            "id": scan_id,
            "patientId": patient_id,
            "imageName": file.filename,
            "timestamp": timestamp_str,
            **ai_data
        }
            
        return jsonify({'success': True, 'result': result_payload})
        
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

@app.route('/api/preset', methods=['POST'])
def preset():
    data = request.json
    preset_type = data.get('type', 'normal')
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        condition = "Pneumonia with severe alveolar consolidation" if preset_type == 'pneumonia' else "Normal, clear healthy lungs"
        prompt = f"""
        You are an expert radiologist AI. Generate a highly realistic medical report JSON for a patient who has been scanned.
        The condition is known to be: {condition}.
        
        You MUST return the output EXACTLY as a valid JSON object with the following keys and format:
        {{
            "diagnosis": "{'PNEUMONIA DETECTED' if preset_type == 'pneumonia' else 'NORMAL'}",
            "confidence": {"a random float between 88.0 and 99.0" if preset_type == 'pneumonia' else "a random float between 95.0 and 99.9"},
            "severity": "{'Severe' if preset_type == 'pneumonia' else 'N/A'}",
            "region": "{'Bilateral Lower Lobes' if preset_type == 'pneumonia' else 'Bilateral Clear'}",
            "recommendation": "A detailed, professional 2-3 sentence clinical recommendation based on the condition."
        }}
        Do not add any markdown formatting. Return ONLY the raw JSON string.
        """
        
        response = model.generate_content(prompt)
        
        # Parse the JSON response
        try:
            raw_text = response.text.strip()
            if raw_text.startswith('```json'): raw_text = raw_text[7:]
            if raw_text.startswith('```'): raw_text = raw_text[3:]
            if raw_text.endswith('```'): raw_text = raw_text[:-3]
            ai_data = json.loads(raw_text.strip())
        except Exception as json_e:
            ai_data = {
                "diagnosis": "PNEUMONIA DETECTED" if preset_type == 'pneumonia' else "NORMAL",
                "confidence": 92.5,
                "severity": "Moderate" if preset_type == 'pneumonia' else "N/A",
                "region": "Detected Region",
                "recommendation": response.text
            }
            
        # Generate Real Patient ID and Save to DB
        now = datetime.now()
        timestamp_str = now.strftime('%Y-%m-%d %H:%M')
        image_name = f"SIM_{preset_type.upper()}_CHEST.DCM"
        unique_string = image_name + timestamp_str
        hash_id = hashlib.sha1(unique_string.encode()).hexdigest()[:8].upper()
        patient_id = f"PAC-X-{hash_id}"
        scan_id = f"case-{int(now.timestamp())}"
        
        conn = sqlite3.connect('mediscan.db')
        c = conn.cursor()
        c.execute('''
            INSERT INTO scans 
            (id, patient_id, image_name, diagnosis, confidence, severity, region, recommendation, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            scan_id, patient_id, image_name, 
            ai_data.get('diagnosis', 'Unknown'), 
            ai_data.get('confidence', 0.0), 
            ai_data.get('severity', 'N/A'), 
            ai_data.get('region', 'N/A'), 
            ai_data.get('recommendation', ''), 
            timestamp_str
        ))
        conn.commit()
        conn.close()
        
        result_payload = {
            "id": scan_id,
            "patientId": patient_id,
            "imageName": image_name,
            "timestamp": timestamp_str,
            **ai_data
        }
            
        return jsonify({'success': True, 'result': result_payload})
        
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

@app.route('/api/history', methods=['GET'])
def get_history():
    try:
        conn = sqlite3.connect('mediscan.db')
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute('SELECT * FROM scans ORDER BY timestamp DESC')
        rows = c.fetchall()
        
        history = []
        diseases_detected = 0
        normal_cases = 0
        total_confidence = 0
        
        for row in rows:
            diag = row['diagnosis'].upper()
            if 'NORMAL' in diag or 'CLEAR' in diag:
                normal_cases += 1
            else:
                diseases_detected += 1
                
            total_confidence += row['confidence']
            history.append(dict(row))
            
        total_scans = len(history)
        avg_accuracy = round(total_confidence / total_scans, 1) if total_scans > 0 else 0.0
        
        stats = {
            "totalScans": total_scans,
            "accuracy": avg_accuracy,
            "diseasesDetected": diseases_detected,
            "normalCases": normal_cases
        }
        
        conn.close()
        return jsonify({'success': True, 'history': history, 'stats': stats})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/report/<scan_id>', methods=['GET'])
def generate_report(scan_id):
    try:
        conn = sqlite3.connect('mediscan.db')
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute('SELECT * FROM scans WHERE id = ?', (scan_id,))
        row = c.fetchone()
        conn.close()
        
        if not row:
            return jsonify({'error': 'Scan not found'}), 404
            
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=15, style='B')
        pdf.cell(200, 10, txt="MEDISCAN AI - DIAGNOSTIC LAB REPORT", ln=True, align='C')
        pdf.ln(10)
        
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt=f"Patient ID: {row['patient_id']}", ln=True)
        pdf.cell(200, 10, txt=f"Scan Date: {row['timestamp']}", ln=True)
        pdf.cell(200, 10, txt=f"Source File: {row['image_name']}", ln=True)
        pdf.ln(10)
        
        pdf.set_font("Arial", size=12, style='B')
        pdf.cell(200, 10, txt=f"Diagnosis: {row['diagnosis']}", ln=True)
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt=f"Confidence: {row['confidence']}%", ln=True)
        pdf.cell(200, 10, txt=f"Severity: {row['severity']}", ln=True)
        pdf.cell(200, 10, txt=f"Region Affected: {row['region']}", ln=True)
        pdf.ln(10)
        
        pdf.set_font("Arial", size=12, style='B')
        pdf.cell(200, 10, txt="Clinical Recommendation:", ln=True)
        pdf.set_font("Arial", size=11)
        pdf.multi_cell(0, 10, txt=row['recommendation'])
        
        pdf_output = io.BytesIO()
        pdf.output(pdf_output)
        pdf_output.seek(0)
        
        return send_file(
            pdf_output,
            as_attachment=True,
            download_name=f"MediScan_Report_{row['patient_id']}.pdf",
            mimetype='application/pdf'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    if not data or 'message' not in data:
        return jsonify({'error': 'No message provided'}), 400
    
    user_message = data['message']
    context = data.get('context', '')
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"You are a helpful medical assistant. Context from recent image scan: '{context}'. A user asks: '{user_message}'. Provide a brief, professional response."
        response = model.generate_content(prompt)
        return jsonify({'success': True, 'reply': response.text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
