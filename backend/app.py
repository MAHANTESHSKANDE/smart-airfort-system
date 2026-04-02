from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import time
import json

app = Flask(__name__)
CORS(app)

# Mock database
flights_data = [
    {"id": 1, "flight": "AI101", "status": "On Time", "gate": "A12", "eta": "14:30", "destination": "Delhi"},
    {"id": 2, "flight": "BA202", "status": "Delayed", "gate": "B05", "eta": "15:45", "destination": "London"},
    {"id": 3, "flight": "UA303", "status": "On Time", "gate": "C08", "eta": "16:20", "destination": "New York"},
    {"id": 4, "flight": "SQ404", "status": "Boarding", "gate": "D15", "eta": "17:10", "destination": "Singapore"}
]

@app.route('/api/flights')
def flights():
    # Simulate real-time updates
    for flight in flights_data:
        if flight["status"] == "On Time" and random.random() < 0.1:
            flight["status"] = random.choice(["Delayed", "Boarding"])
    return jsonify(flights_data)

@app.route('/api/runway')
def runway():
    return jsonify({
        "runway_1": random.choice(["Occupied", "Available", "Landing"]),
        "runway_2": random.choice(["Occupied", "Available", "Takeoff"]),
        "last_updated": time.strftime("%H:%M:%S")
    })

@app.route('/api/congestion')
def congestion():
    return jsonify({
        "level": random.choice(["Low", "Medium", "High", "Critical"]),
        "passenger_count": random.randint(500, 2500),
        "color": random.choice(["green", "yellow", "orange", "red"])
    })

@app.route('/api/stats')
def stats():
    return jsonify({
        "total_flights": len(flights_data),
        "on_time": len([f for f in flights_data if f["status"] == "On Time"]),
        "delayed": len([f for f in flights_data if f["status"] == "Delayed"]),
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message', '').lower()
    responses = {
        'status': 'Our flight status updates every 30 seconds. Check the dashboard!',
        'delay': 'Delays are shown in real-time. Contact airline for compensation info.',
        'runway': 'Runway status updates live. Green = Available, Red = Occupied.',
        'default': "Ask me about flight status, runway availability, or congestion levels!"
    }
    
    for key, response in responses.items():
        if key in user_message:
            return jsonify({"response": response})
    return jsonify({"response": responses['default']})

if __name__ == "__main__":
    app.run(debug=True, port=5000)