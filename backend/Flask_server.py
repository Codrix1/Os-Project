from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def process_allocation(processes, partitions, algorithm):
    print(f"Processing allocation with: Processes={processes}, Partitions={partitions}, Algorithm={algorithm}")

    answer = [
        [100 , 10],
        [200 , 20],
        [300 ,0],
        [500, 212, 112],
        [600, 417],
        [0, 426]
    ]

    return answer

@app.route('/')
def index():
    return "Welcome to the Process Allocation Testing Server!", 200

@app.route('/submit', methods=['POST'])
def handle_submit():
    try:
        data = request.get_json()
        print("Received payload:", data)  # Log the payload for debugging
        if not data:
            return jsonify({"error": "Invalid or missing JSON payload."}), 400
        
        processes = data.get("processes")
        partitions = data.get("partitions")
        algorithm = data.get("algorithm")
        print(f"Processes: {processes}, Partitions: {partitions}, Algorithm: {algorithm}")
        
        if not isinstance(processes, list) or not all(isinstance(p, int) for p in processes):
            return jsonify({"error": "Processes must be a list of integers."}), 400
        if not isinstance(partitions, list) or not all(isinstance(p, int) for p in partitions):
            return jsonify({"error": "Partitions must be a list of integers."}), 400
        if algorithm not in ["Worst-Fit", "Best-Fit", "First-Fit"]:
            return jsonify({"error": "Invalid algorithm."}), 400

        allocation_result = process_allocation(processes, partitions, algorithm)
        return jsonify(allocation_result), 200
    except Exception as e:
        app.logger.error("Error processing request: %s", str(e))
        return jsonify({"error": str(e)}), 500
if __name__ == '__main__':
    # Run Flask development server for testing
    app.run(host='0.0.0.0', port=5000, debug=True)
