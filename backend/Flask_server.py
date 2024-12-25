from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def process_allocation(processes, partitions, algorithm):
    answer = []
    original_partitions = partitions[:] 
    if algorithm == 'Best-Fit' or algorithm == 'Worst-Fit':
        sorted_partitions = sorted(partitions)
        allocated_partitions = sorted_partitions[:]
    else:
        sorted_partitions = partitions[:]  # Keep original order
        allocated_partitions = partitions[:]

    #print(f"Processing allocation with: Processes={processes}, Partitions={partitions}, Algorithm={algorithm}")

    if algorithm == 'First-Fit':
        for process in processes:
            for i in range(len(allocated_partitions)):
                if allocated_partitions[i] >= process:
                    answer.append([sorted_partitions[i], process])
                    allocated_partitions[i] -= process
                    break
            else:
                answer.append([0, process]) 

    elif algorithm == 'Best-Fit':
        for process in processes:
            best_index = -1
            for i in range(len(allocated_partitions)):
                if allocated_partitions[i] >= process:
                    if best_index == -1 or allocated_partitions[i] < allocated_partitions[best_index]:
                        best_index = i
            if best_index != -1:
                answer.append([sorted_partitions[best_index], process])
                allocated_partitions[best_index] -= process
            else:
                answer.append([0, process]) 

    elif algorithm == 'Worst-Fit':
        for process in processes:
            worst_index = -1
            for i in range(len(allocated_partitions)):
                if allocated_partitions[i] >= process:
                    if worst_index == -1 or allocated_partitions[i] > allocated_partitions[worst_index]:
                        worst_index = i
            if worst_index != -1:
                answer.append([sorted_partitions[worst_index], process])
                allocated_partitions[worst_index] -= process
            else:
                answer.append([0, process])  

    # Prepare the final answer 
    final_answer = []
    partition_allocations = {partition: [] for partition in sorted_partitions}
    unallocated_processes = [0] 

    for alloc in answer:
        if alloc[0] != 0:
            partition_allocations[alloc[0]].append(alloc[1])
        else:
            unallocated_processes.append(alloc[1])  

    for partition in sorted_partitions:
        if partition_allocations[partition]:
            final_answer.append([partition] + partition_allocations[partition])
        else:
            final_answer.append([partition, 0])

    # Add unallocated processes
    if len(unallocated_processes) > 1:
        final_answer.append(unallocated_processes)
    else:
        final_answer.append([0, 0])

    # Restore original partition order for display
    partition_order = {partition: i for i, partition in enumerate(original_partitions)}
    final_answer.sort(key=lambda x: partition_order.get(x[0], float('inf')))

    return final_answer

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

