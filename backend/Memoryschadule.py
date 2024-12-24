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
        if alloc[0] != 0:  # Allocated process
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

# Example usage
processes = [234, 417, 322, 122]
partitions = [600, 500, 300, 100, 200]  
algorithm = 'First-Fit'

result = process_allocation(processes, partitions, algorithm)
for allocation in result:
    print(allocation)
