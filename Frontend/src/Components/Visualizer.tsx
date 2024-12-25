import React, { useState,  useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import anime from "animejs/lib/anime.es.js";

type FitAlgorithm = "Worst-Fit" | "Best-Fit" | "First-Fit";

function Visualizer() {
  const [input1, setInput1] = useState<string>("");
  const [input2, setInput2] = useState<string>("");
  const [processes, setProcesses] = useState<number[]>([]);
  const [partitions, setPartitions] = useState<number[]>([]);
  const [fitAlgorithm, setFitAlgorithm] = useState<FitAlgorithm>("Worst-Fit");
  const [data, setData] = useState<number[][]>([]);
  const [error, setError] = useState<string>("");



  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setter(event.target.value);
  };

  const validateAndAddList = (type: "process" | "partition") => {
    const input = type === "process" ? input1 : input2;
    const setList = type === "process" ? setProcesses : setPartitions;
    const clearInput = type === "process" ? setInput1 : setInput2;

    if (!input.trim()) {
      setError(`${type === "process" ? "Process" : "Partition"} input cannot be empty.`);
      return;
    }

    if (!/^\d+$/.test(input)) {
      setError(`${type === "process" ? "Process" : "Partition"} input must be numeric.`);
      return;
    }

    const newValue = parseInt(input, 10);
    setList((prev) => {
      const updatedList = [...prev, newValue];
      setTimeout(() => {
        anime({
          targets: `.list-group-item-${type}-${updatedList.length - 1}`,
          opacity: [0, 1],
          translateY: [-20, 0],
          duration: 500,
          easing: "easeOutExpo",
        });
      }, 0);
      return updatedList;
    });
    clearInput("");
    setError("");
  };
  const removeLastEntry = (type: "process" | "partition") => {
    const setList = type === "process" ? setProcesses : setPartitions;
    const list = type === "process" ? processes : partitions;
  
    if (list.length === 0) return; // Do nothing if the list is empty
  
    const lastIndex = list.length - 1; // Get the index of the last item
  
    // Animate the last item
    anime({
      targets: `.list-group-item-${type}-${lastIndex}`,
      opacity: [1, 0],
      translateX: [0, -50],
      duration: 500,
      easing: "easeInExpo",
      complete: () => {
        // Remove the last item after the animation completes
        setList((prev) => prev.slice(0, -1));
      },
    });
  };
  
  const sendDataToServer = async () => {
    if (processes.length === 0 || partitions.length === 0) {
      setError("Processes and partitions cannot be empty.");
      return;
    }
  
    const payload = { processes, partitions, algorithm: fitAlgorithm };
    console.log("Payload:", payload);
    try {
      const response = await fetch("http://127.0.0.1:5000/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      const result = await response.json();
  
      console.log("Server Response:", result);
  
      const validateServerResponse = (response: any): response is number[][] => {
        return (
          Array.isArray(response) &&
          response.every(
            (item) => Array.isArray(item) && item.every((value) => typeof value === "number")
          )
        );
      };
  
      if (validateServerResponse(result)) {
        setData(result);
        setError("");
      } else {
        console.error("Unexpected response format:", result);
        setError("Invalid response format received from the server.");
      }
    } catch (err: any) {
      setError("Failed to send data to the server: " + err.message);
    }
  };

  useEffect(() => {
    if (data.length > 0) {
      // First animation
      anime({
        targets: ".process",
        opacity: [0]// Stagger the animation
      });
      anime({
        targets: ".parent",
        translateY: [-20, 0],
        opacity: [0, 1], 
        easing: "easeOutExpo",
        delay: anime.stagger(400),
        complete: function() {
          anime({
            targets: ".process",
            duration:2000,
            translateX:[-10 , 0],
            opacity: [0, 1], 
            delay: anime.stagger(200),
            easing: "easeOutExpo",
          });
        }
      });

    }
  }, [data]);

  return (
    <div className="container mt-4">
      <div className="row mb-3 align-items-center">
        <h1 className="text-center text-4xl md:text-5xl font-extrabold text-white">
          Memory Management Demo
        </h1>
      </div>

      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}

      {/* Input Section for Processes */}
      <div
        className="row-2"
      ></div>
      <div className="row mb-3 align-items-center">
        <div className="col-6">
          <input
            type="text"
            className="form-control"
            placeholder="Enter process (numeric)"
            value={input1}
            onChange={handleInputChange(setInput1)}
          />
        </div>
        <div className="col-3">
          <button
            className="btn btn-primary w-100"
            onClick={() => validateAndAddList("process")}
          >
            Add Process
          </button>
        </div>
        <div className="col-3">
          <button
            className="btn btn-danger w-100"
            onClick={() => removeLastEntry("process")}
          >
            Remove Last
          </button>
        </div>
      </div>
      {/* Input Section for Partitions */}
      <div className="row mb-3 align-items-center">
        <div className="col-6">
          <input
            type="text"
            className="form-control"
            placeholder="Enter partition (numeric)"
            value={input2}
            onChange={handleInputChange(setInput2)}
          />
        </div>
        <div className="col-3">
          <button
            className="btn btn-primary w-100"
            onClick={() => validateAndAddList("partition")}
          >
            Add Partition
          </button>
        </div>
        <div className="col-3">
          <button
            className="btn btn-danger w-100"
            onClick={() => removeLastEntry("partition")}
          >
            Remove Last
          </button>
        </div>
      </div>
      {/* Fit Algorithm Selector */}
      <div className="row mb-3 align-items-center">
        <div className="col-3">
        <select
          className="form-select"
          value={fitAlgorithm}
          onChange={(event) => setFitAlgorithm(event.target.value as FitAlgorithm)}
        >
          <option value="Worst-Fit">Worst-Fit</option>
          <option value="Best-Fit">Best-Fit</option>
          <option value="First-Fit">First-Fit</option>
        </select>

        </div>
        <div className="col-3">
          <button className="btn btn-success w-100" onClick={sendDataToServer}>
            Submit Data to Server
          </button>
        </div>
      </div>
      {/* Display Lists */}
      <div className="row">
        <div className="col-3">
          <h5>Processes</h5>
          <ul className="list-group">
            {processes.map((process, index) => (
              <li key={index} className={`list-group-item list-group-item-process-${index}`}>
                {process}
              </li>
            ))}
          </ul>
        </div>
        <div className="col-3">
          <h5 className="text-center  text-white">Partitions</h5>
          <ul className="list-group">
            {partitions.map((partition, index) => (
              <li key={index} className= {`list-group-item list-group-item-partition-${index}`} >
                {partition}
              </li>
            ))}
          </ul>
        </div>
        <div className="col-6">
          {data.map((item, parentIndex) => {
            const parentSize = item[0]; // Parent partition size
            const processes = item.slice(1); // Child processes

            // Check if all processes are 0
            const hasNoProcesses = processes.every((process) => process === 0);

            return (
              <div key={parentIndex} className="mb-4">
                <div
                  className={`bg-light border mb-2 parent`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    paddingTop:"3px",
                    width: "100%",
                    borderRadius: "7px",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "bold",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "8px", // Space between parent name and "No Process"
                    }}
                  >
                    {parentSize === 0
                      ? "These processes will wait:"
                      : `Partition: ${parentSize}`}
                    {hasNoProcesses && (
                      <span style={{ fontWeight: "normal", color: "gray" }}>
                        (No Process)
                      </span>
                    )}
                  </div>
                  <div
                    className="process-container"
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "2px",
                    }}
                  >
                    {processes.map((process, processIndex) => {
                        if (process === 0) return null; // Skip if process is 0

                        // Calculate width percentage based on parent size
                        const widthPercentage =
                          parentSize > 0 ? `${(process / parentSize) * 100}%` : "100%";

                        return (
                          <div
                            key={processIndex}
                            className={` bg-blue text-black border process`}
                            style={{
                              borderRadius: "5px",
                              flex: `0 0 ${widthPercentage}`, // Dynamic width
                              textAlign: "center",
                            }}
                          >
                            {process}
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default Visualizer;
