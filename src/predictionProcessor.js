import React, { useEffect, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import { useTrackedEntity } from 'TrackedEntityContext'; // Import your existing context
import tracker from 'mark/api/tracker';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Doughnut } from 'react-chartjs-2'; // Import Doughnut chart component
import { Chart, registerables } from 'chart.js'; // Import Chart and registerables
import * as d3 from 'd3';
Chart.register(...registerables); // Register all necessary chart components




/* eslint-disable-next-line no-unused-vars */
const PredictionComponent = () => {
  const { trackedEntityData, updateTrackedEntity } = useTrackedEntity(); // Get tracked entity data from context
  const [predictions, setPredictions] = useState([]);
  const [featureContributions, setFeatureContributions] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Track if predictions are running
  const [hasRunPredictions, setHasRunPredictions] = useState(false); // Track if predictions have been made
  const [averagePrediction, setAveragePrediction] = useState([]);
  const [highestAveragePrediction, setHighestAveragePrediction] = useState([]);
  const [predictedClass, setPredictedClass] = useState('');
  const [dataElementDisplayNames, setDataElementDisplayNames] = useState({}); // Mapping of IDs to display names
  const [error, setError] = useState(null);
  const [featureAttributions, setFeatureAttributions] = useState([]); 
  //const [igValues, setIgValues] = useState([]);
  const [mappedIGValues, setMappedIGValues] = useState([]);
  const [finalAveragedIGValues, setFinalAVerageIGValues] = useState ([]);
  const [isDisplayNamesFetched, setIsDisplayNamesFetched] = useState(false); // Track if display names have been fetched
  

  const silenceWarnings = (...args) => {};

  useEffect(() => {
    silenceWarnings(predictions, averagePrediction);
  }, [predictions, averagePrediction]);

  
  useEffect(() => {
    const fetchDataElementDisplayNames = async () => {
      if (!trackedEntityData) return;
      try {
        const response = await tracker.legacy.GetDataElementsNameByID({ 
          paging: false
         });
        const dataElements = response.data.dataElements;
  
        if (!Array.isArray(dataElements)) {
          throw new Error('Expected dataElements to be an array');
        }
        const displayNameMapping = {};
        dataElements.forEach(element => {
          //console.log('Data Element:', element);
          displayNameMapping[element.id] = element.displayName;
        });
  
        setDataElementDisplayNames(displayNameMapping); // Store the mapping in state
        setIsDisplayNamesFetched(true);
      } catch (error) {
        console.error('Error fetching data element display names:', error);
        setError('Failed to fetch data element display names');
      }
    };
  
    fetchDataElementDisplayNames();
  }, [trackedEntityData]);
  
  
   const runPrediction = useCallback(async () => {
    if (!trackedEntityData ||!isDisplayNamesFetched|| hasRunPredictions) return; // Ensure there's data before processing

    // Use trackedEntityData from context
    const jsonData = trackedEntityData;

    // Step 1: Extract data elements for categorical and numeric columns
    const categoricalColumns = [
      'FZMwpP1ncnZ', 'vvlAUOFU1lc', 'WqWIsCuYw14', 'sVFokCQ8LTV', 'omFhxVHAHW8', 
      'G0m1TnJ9CaB', 'OZkvrZWZL0u', 'zJWyXO06Rhi', 'luQQ9zNTgFM', 'x7uZB9y0Qey',
      'aNj8BNicATN', 'pYsPUUxPn3v', 'FklL99yLd3h', 'EeE2uJluiAY', 'pg6UUMn87eM',
      'H85OvvFGG6i', 'b801bG8cIxt', 't6qq4TXSE7n', 'Wbp0DL9fQYj', 'DHPzkmTcDUv',
      'EoO16H5lLK5', 'YwZN88UJ98d', 'axDtvPeYL2Y', 'hZ4HR3lEOWm', 'UtGpqsuTmrD',
      'rluc10OPm1I', 'jNdLczMvDPT', 'iUyb0JGgeqn', 'k5LrUGjAGD5', 'EDFvw8DsJuH',
      'WLqYnkV6qx1', 'P9DY4UW3BTo', 'e0mTEFrXZDh', 'YhHeRvXzmXJ', 'CxdzmL6vtnx',
      'HHf4Vff0Xrx', 'LRzaAyb2vGk', 'U4jSUZPF0HH', 'f0S6DIqAOE5', 'ywUNEl0vi3Y',
      'K1JiyL94mCT', 'dtRfCJvzZRF', 'cdGuoKHI3fp', 'U0s0Hul9lmX', 'hDaev1EuehO',
      'P6eKotYRIvT', 'mDmVRrzihu0', 'UGznqHuXC8A', 'rHEeM6ha268', 'pDR49oOtJrc',
      'Jl3oWFGGt1U', 'pDoTShM62yi', 'RTKE58980U7', 'IGv6SjkM162', 'fOnOoUvD03d',
      'QzfjeqlwN2c', 'ig3ZDT8Mgus', 'nVaN4Cpoe9Z', 'BQ2qwbH5WXi', 'KAykkHp1p2F',
      'lpJPqjVUToo', 'Aw9p1CCIkqL', 'pD0tc8UxyGg', 'fhEVXFPNNUc',
      'F5P1buF4RHP', 'XzNqEEXo00j', 'Ep0hN5HdQKS', 
    ]; // Replace with actual IDs

    const numericColumns = [
      'E0oIYbS2lcV', 'uIlwmJ26a6N', 'XHkluF3EAg0',
      'HzhDngURGLk', 'vZMCHh6nEBZ', 'Gy1jHsTp9P6',
      'Rj4uJOP4t96', 'DDzcOBJwRnC', 'Ghsh3wqVTif',
      'WBsNDNQUgeX', 'Dq2CKpBrLem', 'CpNmdkKzz8O',
      'xcTT5oXggBZ', 'XwVhny4B7EV', 'dfNv7RZKIml',
    ];

    const extractDataElements = (data, categoricalColumns, numericColumns) => {
      let extractedData = {};

      // Extracting data from enrollments
      if (data.enrollments && Array.isArray(data.enrollments)) {
        data.enrollments.forEach(enrollment => {
          if (enrollment.events && Array.isArray(enrollment.events)) {
            enrollment.events.forEach(event => {
              let eventData = {};
              if (event.dataValues && Array.isArray(event.dataValues)) {
                event.dataValues.forEach(dataValue => {
                  // Check if the dataElement is in specified columns
                  if (categoricalColumns.includes(dataValue.dataElement) || numericColumns.includes(dataValue.dataElement)) {
                    // Initialize array for the dataElement if it doesn't exist
                    if (!eventData[dataValue.dataElement]) {
                      eventData[dataValue.dataElement] = [];
                    }
                    // Push the value to the corresponding array
                    eventData[dataValue.dataElement].push(dataValue.value);
                  }
                });
              }
              extractedData[event.event] = eventData;
            });
          }
        });
      }

      // Log the extracted data
      //console.log('Extracted Data:', extractedData);

      // Initialize processedData as an array to store events
      const processedData = [];

      // Iterate over extractedData to combine values for each data element per event
      Object.entries(extractedData).forEach(([eventName, eventData]) => {
        // Create an object for each event
        const eventEntry = {};

        Object.entries(eventData).forEach(([dataElement, values]) => {
          // Store data elements and their values for the current event
          eventEntry[dataElement] = values;
        });

        // Push the current event entry into processedData
        processedData.push({ event: eventName, data: eventEntry });
      });

      //console.log('Processed Data per Event:', processedData); // Log the new structured output

      return processedData; // Return the consolidated data
    };

    // Extract data elements from jsonData
    const processedData = extractDataElements(jsonData, categoricalColumns, numericColumns);
    //console.log('Final Processed Data:', processedData);

    if (!Array.isArray(processedData) || processedData.length === 0) {
      console.error("Invalid processed data structure:", processedData);
      return; // Early exit if the data is invalid
    }

    // Convert processedData into an array format suitable for label encoding and normalization
    const dataArray = processedData;

    const loadLabelEncoders = async () => {
      const response = await fetch('/label_encoders.json');
      const labelEncoders = await response.json();
      return labelEncoders;
    };

    // Label encode categorical columns
    const labelEncode = async (data, categoricalColumns) => {
      const labelEncoders = await loadLabelEncoders();

      categoricalColumns.forEach(col => {
        if (labelEncoders[col]) { // Only process columns that have encoders
          data.forEach(row => {
            const originalValue = row.data[col];
            //console.log(`original value for ${col}:`, originalValue, `Type: ${typeof originalValue}`);

            // If the value exists in the encoder mapping, substitute it
            if (originalValue in labelEncoders[col]) {
              row.data[col] = labelEncoders[col][originalValue];
              //console.log(`encoded value for ${col}:`, row.data[col], `Type: ${typeof row.data[col]}`);
            } else {
              row.data[col] = 0; // Handle unknown values
              //console.log(`Unknown Value for ${col}. Set to 0.`);
            }
          });
        }
      });
      //console.log('Encoded Data Before Scaling/Normalization:', JSON.stringify(data, null, 2));
      //console.log ('Encoded Data:', data);
      return { data, labelEncoders }; // Data retains the reference to encoder mappings
    };

    const { data: labelEncodedData } = await labelEncode(dataArray, categoricalColumns);

    // Normalize numeric data
    const normalizeData = (data, numericColumns) => {
      const stats = {};

      if (!Array.isArray(data)) {
        console.error("Expected data to be an array, but got:", data);
        return { data: [], stats };
      }

      numericColumns.forEach(col => {
        const values = data.map(row => parseFloat(row.data[col]?.[0] || 0)).filter(val => !isNaN(val));

        if (values.length > 0) {
          const mean = values.reduce((a, b) => a + b, 0) / values.length;
          const std = Math.sqrt(values.map(val => Math.pow(val - mean, 2)).reduce((a, b) => a + b, 0) / values.length);

          stats[col] = { mean, std };

          data.forEach(row => {
            let val = parseFloat(row.data[col]);
            val = isNaN(val) ? 0 : (val - mean) / std;
            row.data[col] = val;
          });
        }
      });

      return { data, stats };
    };

    const { data: normalizedData } = normalizeData(labelEncodedData, numericColumns);

    // Handle missing values
    const handleMissingValues = (data) => {
      data.forEach(row => {
        Object.keys(row.data).forEach(key => {
          if (row.data[key] === undefined || row.data[key] === null) {
            row.data[key] = 0; // Impute missing values with 0
          }
        });
      });

      return data;
    };
      const finalData = handleMissingValues(normalizedData);
    
      const extractTensorInputs = (finalData) => {
        // This function will now return only the first row
        return finalData.map(row=> Object.values(row.data));
        
      };
    //console.log('finalData:', finalData);

    const featureNames = Object.keys(finalData[0].data);
      // Assuming finalData is available and processed
      const tensorInputs = extractTensorInputs(finalData);
      //console.log('tensorInputs:', tensorInputs);
      const loadModel = async () => {
        try {
          const model = await tf.loadLayersModel('/model.json', {weights: 'weights.json'});
            model.compile({
            optimizer: 'adam', // Specify your optimizer
            loss: 'categoricalCrossentropy', // Use appropriate loss based on your model
            metrics: ['accuracy'], // Metrics for tracking
          });return model;
        } catch (error) {
          console.error('Error loading the TensorFlow model:', error);
          return null;
        }
      };
    
      // Load TensorFlow model
      const model = await loadModel();
      if (model) {
          console.log('Running Predictions...');
        // Loop through each tensor input and make predictions
          const predictions = [];
          const allMappedIGValues =[]; //array to store all mapped IG values for averaging
          
                     
          for (let i = 0; i < tensorInputs.length; i++) {
            const inputTensor = tensorInputs[i]; // Create a tensor for the current row
            const reshapedInput = tf.tensor(inputTensor).reshape([1, 1, 82]);
            //console.log('reshaped prediction input:',reshapedInput);
            
            const outputTensor = model.predict(reshapedInput);
              // Get the prediction for the current row 
            const predictionArray = outputTensor.arraySync(); // Extract array
              // If your model is binary classification with two outputs
              // You may need to check the output shape
            const predictionValue = predictionArray[0]; // Get the first output class probabilities

              // For binary classification, usually, you only need the probability for class 1:
            predictions.push(predictionValue.length === 2 ? predictionValue[1] : predictionValue[0]);
            
            const reshapedIGInput = reshapedInput.clone() 
            //console.log('reshapedIGInput',reshapedIGInput);
           // use of Intergrated gradients for feature importance perprediction 
           const runIntegratedGradients = async (model, reshapedIGInput, steps = 50) => {
            const baseline = tf.zeros([1, 1, 82]); 
            const alphas = tf.linspace(0, 1, steps);
            const alphaValues = alphas.dataSync(); // Get the array of alpha values
            //console.log('still a tensor:',reshapedInput);
        
            const interpolatedInputs = alphaValues.map(alpha => {
              reshapedIGInput.data().then(data => {
                console.log('reshapedInput data:', data);
                if (data.some(value => isNaN(value))) {
                    console.error('reshapedIGInput contains NaN values.');
                }
            });
            
            baseline.data().then(data => {
                console.log('baseline data:', data);
                if (data.some(value => isNaN(value))) {
                    console.error('baseline contains NaN values.');
                }
            });
            const newInput = tf.add(baseline, tf.mul(alpha, tf.sub(reshapedIGInput, baseline)));
             newInput.data().then(data => {
                if (data.some(value => isNaN(value))) {
                    console.error('newInput contains NaN values:', data);
                }});
                // Assuming input tensor has a shape of [numFeatures] and you want to add a sequence length of 1
              const reshapedNewInput = newInput.reshape([1, 1, 82]);// Shape: [1, 1,  numFeatures]  
              //console.log('reshaped new Input IG tensor shape:', reshapedNewInput.shape);            
              return reshapedNewInput;
           });
          //console.log('interpolatedInputs:',interpolatedInputs);
          
            let gradientsSum = tf.zerosLike(baseline);
            for (const interpolatedInput of interpolatedInputs) {
              if (interpolatedInput instanceof tf.Tensor) {
                  
                } else {
                  console.error('Interpolated input is not a tensor or is undefined:', interpolatedInput);
                      }
        
              const gradients = tf.variableGrads(() => model.predict(interpolatedInput));
              gradientsSum = tf.add(gradientsSum, gradients.grads);
            }
        
            const avgGradients = gradientsSum.div(steps);
            const integratedGradients = tf.mul(avgGradients, reshapedIGInput.sub(baseline));
            //const igValuesArray = integratedGradients.arraySync();
            //console.log('Integrated Gradients:', igValuesArray);
            return integratedGradients.arraySync();
          }; 
        //contributions by feature. find appropriate way to get contribution by features*********
        // Calculate Integrated Gradients
          const baseline = tf.zerosLike(inputTensor); // Baseline input
          const igValues = await runIntegratedGradients(model, reshapedIGInput, baseline);
          const contributionsArray = igValues[0][0];

          // Map contributions to feature IDs
          const mappedIGValues = contributionsArray.map((value, index) => {
            const featureId = featureNames[index] || `Unknown Feature ${index}`;
            const displayName = dataElementDisplayNames[featureId] || featureId; // Use display name if available
            return {
              featureId: displayName,
              contribution: value
            };
          });
          
          allMappedIGValues.push(mappedIGValues);

          // Calculate final average contribution Set state with averaged value
          // You can also set this result to state or use it as needed
          // or whatever you wish to do with it
          //setIgValues(igValues);
          
          featureAttributions.push(igValues); // Store IG results
          //console.log('featureAttributions:', featureAttributions);
          //setFeatureContributions(featureAttributions);
          //console.log('IG Values:', igValues);
          //console.log ('mapped IG values:', mappedIGValues);
          //console.log('IGvalues:', igValues);
          
        };
    const averagedMappedIGValues = allMappedIGValues.reduce((acc, curr) => {
      curr.forEach((feature, index) => {
        if (!acc[index]) {
          acc[index] = { featureId: feature.featureId, totalContribution: 0, count: 0 };
        }
        acc[index].totalContribution += feature.contribution;
        acc[index].count += 1;
      });
      return acc;
    }, []);
    const finalAveragedIGValues = averagedMappedIGValues.map(feature => {
      const displayName = dataElementDisplayNames[feature.featureId] || feature.featureId;
      return{
      featureId: displayName,
      contribution: feature.totalContribution / feature.count
      };
    }).filter(feature => feature.contribution > 0);
  
    //console.log('Final Averaged IG Values:', finalAveragedIGValues);
      const averagePrediction = predictions.reduce((acc, curr) => 
        acc.map((val, idx) => val + curr[idx]), Array(predictions[0].length).fill(0)
    ).map(val => val / predictions.length);
    
    //console.log('Single average prediction over all events:', averagePrediction);
    // Find the index of the class with the highest average prediction
    const highestPredictionIndex = averagePrediction.indexOf(Math.max(...averagePrediction));
    // Get the highest average prediction value
    const highestAveragePrediction = averagePrediction[highestPredictionIndex];
    console.log('HAP', highestAveragePrediction)
    // Determine predicted class based on average prediction
    const predictedClass = highestAveragePrediction[0] > 0.5 ? 'YES' : 'NO';
    
    setPredictedClass(predictedClass)
    console.log(predictions)
    console.log('Predicted Class:', predictedClass);
  
    setFinalAVerageIGValues(finalAveragedIGValues);
    setPredictions(predictions);
    setFeatureContributions(mappedIGValues);
    setAveragePrediction(averagePrediction);
    setPredictedClass(predictedClass);
    setHighestAveragePrediction(highestAveragePrediction);
    setFeatureAttributions(featureAttributions); // Set the calculated feature attributions
    updateTrackedEntity({predictions});
    setIsLoading(false); // Mark predictions as complete
    setHasRunPredictions(true)

    }
}, [trackedEntityData,hasRunPredictions,isDisplayNamesFetched,updateTrackedEntity,featureAttributions,mappedIGValues,dataElementDisplayNames]);

   

useEffect(() => {
  if (trackedEntityData?.enrollments && !hasRunPredictions ) {
     runPrediction();
  }
},[trackedEntityData, hasRunPredictions, runPrediction]);

// Function to fetch display names from API


// Mapping feature contributions to display names
useEffect(() => {
  const mappedIGValues = featureContributions.map(contribution => 
    contribution.map(value => ({
      ...value,
      featureDisplayName: dataElementDisplayNames[value.featureId] || `Unknown Feature (ID: ${value.featureId})`
    }))
  );
   setMappedIGValues(mappedIGValues); // Store the mapped values
}, [featureContributions, dataElementDisplayNames]); // Add dependencies


const sortedAveragedIGValues = finalAveragedIGValues.sort((a, b) => b.contribution - a.contribution);
useEffect(() => {
  if (sortedAveragedIGValues.length > 0) {
    const svgWidth = 900;
    const svgHeight = 1000;
    const margin = { top: 20, right: 30, bottom: 40, left: 400 };

    // Remove any existing svg before creating a new one
    d3.select("#bar-chart").select("svg").remove();

    const container = d3.select("#bar-chart")
      .append("div")
      .style("overflow-y", "auto") // Enable vertical scrolling
      .style("max-height", "500px"); // Adjust max-height as necessary

    const svg = container.append("svg")
      .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet") // Maintain aspect ratio
      .style("width", "100%")
      .style("height", "auto")
      .style("border", "1px solid #000");

    const x = d3.scaleLinear()
      .domain([0, d3.max(sortedAveragedIGValues, d => d.contribution)]).nice()
      .range([margin.left, svgWidth - margin.right]);

    const y = d3.scaleBand()
      .domain(sortedAveragedIGValues.map(d => d.featureId))
      .range([margin.top, svgHeight - margin.bottom])
      .padding(0.2);

      const bottomAxis = d3.axisBottom(x)
      .tickSize(10)
      .tickPadding(5);

    svg.append("g")
      .attr("transform", `translate(0,${svgHeight - margin.bottom})`)
      .call(bottomAxis);

    // Adjust font size for the bottom axis labels
    svg.selectAll(".tick text")
      .style("font-size", "16px");

      const leftAxis = d3.axisLeft(y)
      .tickSize(10)
      .tickPadding(5);

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(leftAxis);

    // Adjust font size for the left axis labels
    svg.selectAll(".tick text") // Selecting all text in the left axis
      .style("font-size", "16px");

    svg.selectAll(".bar")
      .data(sortedAveragedIGValues)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", margin.left)
      .attr("y", d => y(d.featureId))
      .attr("width", d => x(d.contribution) - margin.left)
      .attr("height", y.bandwidth())
      .attr("fill", "steelblue");
  }
}, [sortedAveragedIGValues]);

const doughnutData = {
  labels: ['Not Likely', 'Likely'],
  datasets: [
    { 
      data: [highestAveragePrediction, 1-highestAveragePrediction], // Assuming highestAveragePrediction is accessible
      backgroundColor: ['#FF6384', '#36A2EB'],
      hoverBackgroundColor: ['#FF6384', '#36A2EB']
    }
   
  ]
};

if (isLoading) {
  return <div>Loading predictions...</div>;
} else if (error) {
  return <div style={{ color: 'red' }}>Error: {error}</div>;
}



return (
  <div className="App_mainCenterCanva">
    
    
    {isLoading ? (
      <p>Loading predictions...</p>
    ) : error ? (
      <p style={{ color: 'red' }}>{error}</p> // Display the error message
    ) : (
      <>
      
      <div className="card mb-3" style={{ width: '100%', padding: '15px' }}>
  <div className="card-body">
    <h5 className="card-title">Prediction Overview</h5>

    <div className="row">
      {/* First Column: Doughnut Chart + Prediction Details */}
      <div className="col-md-5">
        {/* Row 1: Doughnut Chart */}
        <div className="row mb-3">
          <div className="col-12 d-flex justify-content-center">
            <div style={{ width: '200px', height: '200px', background: '#f2f9f9' }}>
              <Doughnut
                data={doughnutData}
                options={{
                  plugins: {
                    legend: {
                      display: true,
                      position: 'top',
                      labels: {
                        font: { size: 18, color: '#333', weight: 'bold' },
                      },
                    },
                  },
                  responsive: true,
                  maintainAspectRatio: false,
                }}
                style={{ width: '200px', height: '200px' }}
              />
            </div>
          </div>
        </div>

        {/* Row 2: Prediction Details */}
        <div className="row">
          <div className="col-12">
            <p className="card-text">
              <strong>Final Prediction Probability:</strong> {highestAveragePrediction}
            </p>
            <p className="card-text">
              Patient Likely to Develop MDRTB: <strong>{predictedClass}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Second Column: Bar Chart for Contributing Factors */}
      <div className="col-md-7">
        {sortedAveragedIGValues.length > 0 && (
          <div style={{ paddingLeft: '10px' }}>
            <div className="card-body">
              <h5>Contributing Factors</h5>
              <h6>(By Integrated Gradients Values)</h6>
              <div
                id="bar-chart"
                style={{
                  overflowY: 'auto',
                  maxHeight: '400px',
                  width: '100%',
                  border: '1px solid #000',
                  background: '#f2f9f9',
                }}
              >
                {/* D3 bar chart will be rendered here */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
</div>
</>
)}
</div>
);

};
export default PredictionComponent;