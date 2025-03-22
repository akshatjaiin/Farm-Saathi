import fs from 'fs';
import Papa from 'papaparse';
// import * as tf from '@tensorflow/tfjs'; // Ensure you're using @tensorflow/tfjs-node
import * as tf from '@tensorflow/tfjs-node';
import path from "path";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

// Construct the absolute path to the CSV file
const csvFilePath = path.resolve(__dirname, 'crop_yield_data.csv');


function oneHotEncode(value, categories) {
    return categories.map(cat => (cat === value ? 1 : 0));
}
function labelEncode(value, categories) {
    return categories.indexOf(value); // Assign an integer based on the index in the list
}
function normalizeData(X) {
    const X_min = X[0].map((_, colIndex) => Math.min(...X.map(row => row[colIndex])));
    const X_max = X[0].map((_, colIndex) => Math.max(...X.map(row => row[colIndex])));
    
    return X.map(row => row.map((value, colIndex) => 
        (X_max[colIndex] - X_min[colIndex]) !== 0 
            ? (value - X_min[colIndex]) / (X_max[colIndex] - X_min[colIndex]) 
            : 0 // Avoid division by zero
    ));
}

// Function to read CSV and prepare the dataset
async function prepareData() {
    const csvData = fs.readFileSync(csvFilePath, 'utf-8');

    // Parse CSV data
    const parsedData = Papa.parse(csvData, { header: true, skipEmptyLines: true });

    // Extract unique categories
    const cropTypes = [...new Set(parsedData.data.map(row => row['crop_type']))];
    const irrigationMethods = [...new Set(parsedData.data.map(row => row['irrigation_method']))];
    const fertilizerTypes = [...new Set(parsedData.data.map(row => row['fertilizer_type']))];
    const fertilizerMethods = [...new Set(parsedData.data.map(row => row['fertilizer_method']))];


    // Convert data with label encoding
    const data = parsedData.data.map(row => ({
        cropType: labelEncode(row['crop_type'], cropTypes),
        cropArea: parseFloat(row['crop_area']),
        soilPH: parseFloat(row['soil_ph']),
        soilNPK: parseFloat(row['soil_npk']),
        soilOrganicMatter: parseFloat(row['soil_organic_matter']),
        irrigationMethod: labelEncode(row['irrigation_method'], irrigationMethods),
        fertilizerType: labelEncode(row['fertilizer_type'], fertilizerTypes),
        fertilizerMethod: labelEncode(row['fertilizer_method'], fertilizerMethods),
        density: parseFloat(row['density']),
        yield: parseFloat(row['predicted_yield_kg_m2'])
    }));

    // Prepare feature matrix
    let X = data.map(item => [
        item.cropType,  // Encoded as an integer
        item.cropArea,
        item.soilPH,
        item.soilNPK,
        item.soilOrganicMatter,
        item.irrigationMethod, // Encoded as an integer
        item.fertilizerType,   // Encoded as an integer
        item.fertilizerMethod, // Encoded as an integer
        item.density
    ]);

    X = normalizeData(data.map(item => [
        item.cropType,
        item.cropArea,
        item.soilPH,
        item.soilNPK,
        item.soilOrganicMatter,
        item.irrigationMethod,
        item.fertilizerType,
        item.fertilizerMethod,
        item.density
    ]));
    

    // console.log("Sample processed data X:", X.slice(0, 2));

    const Y = data.map(item => item.yield);
    // console.log("Sample processed data Y:", Y.slice(0, 2));

    const X_tensor = tf.tensor2d(X);
    const Y_tensor = tf.tensor2d(Y, [Y.length, 1]);

    return { X_tensor, Y_tensor };
}

// Function to create a simple neural network model
function createModel() {
    const model = tf.sequential();

    model.add(tf.layers.dense({
        units: 64,
        inputShape: [9],
        activation: 'relu'
    }));

    model.add(tf.layers.dense({
        units: 32,
        activation: 'relu'
    }));

    model.add(tf.layers.dense({ // output nodes
        units: 1
    }));

    model.compile({
        optimizer: 'adam',
        loss: 'meanSquaredError'
    });

    return model;
}

// Train the model and save it
async function trainModel(X_tensor, Y_tensor) {
    const model = createModel();

    await model.fit(X_tensor, Y_tensor, {
        epochs: 100,
        batchSize: 32,
        shuffle: true
    });

    const modelDir = path.dirname(csvFilePath); // This gets the directory of the CSV file
    const modelPath = path.join(modelDir, 'model'); // No `.json` extension needed

    console.log("before saving");
    await model.save(`file://${modelPath}`);
    console.log("after saving");
    console.log('Model trained and saved!');

    console.log("Sample processed data X:", X_tensor.slice(0, 1));
    console.log("Sample processed data Y:", Y_tensor.slice(0, 2));
}

// Load the trained model
async function loadModel() {
    const model = await tf.loadLayersModel(`file://${path.dirname(csvFilePath)}/model/model.json`);
    console.log('Model loaded successfully!');
    return model;
}

// Predict the crop yield using the trained model
async function predict(model, inputData) {
    try {
        // Create the input tensor
        console.log("*****predict input-data: ", inputData);
        const inputTensor = tf.tensor2d([inputData]);
        
        // Make prediction
        const prediction = model.predict(inputTensor);
        console.log("Prediction tensor:");
        prediction.print();

        // Get the data from the tensor
        const predictionData = await prediction.data();
        let predictedValue = predictionData[0];
        console.log("Raw predicted value:", predictedValue);

        // Apply your transformations
        // predictedValue = inverseLogTransformData([predictedValue])[0];
        predictedValue = Math.max(0, predictedValue);
        
        // if (predictedValue <= 1) {
        //     predictedValue += 1;
        // }
        // else if (predictedValue >= 50) {
        //     predictedValue /= 38;
        // }
        // else if (predictedValue <= 50 && predictedValue > 1) {
        //     predictedValue /= 19;
        // }

        console.log("Predicted crop yield (kg per m^2):", predictedValue);
        // Clean up tensors to prevent memory leaks
        inputTensor.dispose();
        prediction.dispose();
        return predictedValue;
        

        return predictedValue;
    } catch (error) {
        console.error("Error in predict function:", error);
        throw error;
    }
}

// Helper function for inverse log transform
function inverseLogTransformData(data) {
    return data.map(value => Math.exp(value) - 1);
}

// Main function to execute training and prediction
async function main() {
    const { X_tensor, Y_tensor } = await prepareData();

    await trainModel(X_tensor, Y_tensor);

    const model = await loadModel();

    const exampleInput = [1, 100, 6.5, 40, 3.5, 0, 0, 0, 200]; // Example input
    await predict(model, exampleInput);
}

// // Run the main function
// main().catch(err => console.error(err));



function normalizeData2(X) {
    return X.map(row =>
        row.map(value => {
            if (typeof value === "number") {
                if (value > 100) {
                    return value / Math.max(...row.filter(v => typeof v === "number"));
                }
            }
            return value;
        })
    );
}

async function prepareDataSingleExample(exampleInput) { // 2d-arr
    console.log("***PrepareData***:")
    const csvData = fs.readFileSync(csvFilePath, 'utf-8');
    const parsedData = Papa.parse(csvData, { header: true, skipEmptyLines: true });
    console.log("exampleInput: ", exampleInput);

    // Extract unique categories from parsedData
    const cropTypes = [...new Set(parsedData.data.map(row => row['crop_type']))];
    const irrigationMethods = [...new Set(parsedData.data.map(row => row['irrigation_method']))];
    const fertilizerTypes = [...new Set(parsedData.data.map(row => row['fertilizer_type']))];
    const fertilizerMethods = [...new Set(parsedData.data.map(row => row['fertilizer_method']))];
    console.log("cropTypes:", cropTypes);
    console.log("irrigationMethods:", irrigationMethods);
    console.log("fertilizerTypes:", fertilizerTypes);
    console.log("fertilizerMethods:", fertilizerMethods);

    console.log("Encoding cropType:", exampleInput[0][0], "->", labelEncode(exampleInput[0][0], cropTypes));
    console.log("Encoding irrigationMethod:", exampleInput[0][5], "->", labelEncode(exampleInput[0][5], irrigationMethods));
    console.log("Encoding fertilizerType:", exampleInput[0][6], "->", labelEncode(exampleInput[0][6], fertilizerTypes));
    console.log("Encoding fertilizerMethod:", exampleInput[0][7], "->", labelEncode(exampleInput[0][7], fertilizerMethods));


    // Convert the exampleInput to the correct shape for model input
    const exampleData = {
        cropType: labelEncode(exampleInput[0][0], cropTypes),
        cropArea: parseFloat(exampleInput[0][1]),
        soilPH: parseFloat(exampleInput[0][2]),
        soilNPK: parseFloat(exampleInput[0][3]),
        soilOrganicMatter: parseFloat(exampleInput[0][4]),
        irrigationMethod: labelEncode(exampleInput[0][5], irrigationMethods),
        fertilizerType: labelEncode(exampleInput[0][6], fertilizerTypes),
        fertilizerMethod: labelEncode(exampleInput[0][7], fertilizerMethods),
        density: parseFloat(exampleInput[0][8])
    };
    console.log("exampleData post encode: ", exampleData);

    // Create a 2D array for X (features)
    let X = [
        [
            exampleData.cropType,
            exampleData.cropArea,
            exampleData.soilPH,
            exampleData.soilNPK,
            exampleData.soilOrganicMatter,
            exampleData.irrigationMethod,
            exampleData.fertilizerType,
            exampleData.fertilizerMethod,
            exampleData.density
        ]
    ];

    // let X = exampleData;
    // Normalize the data (using the normalization function from parsedData)
    X = normalizeData2(X);  // Ensure that normalizeData can handle 2D arrays

    // Convert X to tensor (the model expects tensor data)
    const X_tensor = tf.tensor2d(X);  // This is now a 2D array with shape [1, 9] for 1 example

    return { X_tensor };
}


export default {
    prepareData,
    createModel,
    trainModel,
    loadModel,
    predict,
    main,
    prepareDataSingleExample

};