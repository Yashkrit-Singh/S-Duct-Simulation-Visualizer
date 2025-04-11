from flask import Flask, request, jsonify
import joblib
import pandas as pd
from flask_cors import CORS
import traceback

# Load model and encoder
try:
    model = joblib.load("xgboost_bend_predictor.pkl")
    encoder = joblib.load("geometry_encoder.pkl")
    print("Model and encoder loaded successfully.")
except Exception as e:
    print("Error loading model or encoder:", e)
    exit()

app = Flask(__name__)

# Allow requests from your React dev server
CORS(app, resources={r"/predict": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        print("Received data:", data)
        
        # Validate input keys
        required_keys = ["Mach Number", "Angle", "Inlet Velocity (m/s)", "Inlet Pressure (Pa)", "Geometry"]
        for key in required_keys:
            if key not in data:
                raise ValueError(f"Missing key in input: {key}")
        
        # Create input DataFrame matching the expected input by the model
        input_df = pd.DataFrame([{
            "Mach Number": data["Mach Number"],
            "Angle": data["Angle"],
            "Inlet Velocity (m/s)": data["Inlet Velocity (m/s)"],
            "Inlet Pressure (Pa)": data["Inlet Pressure (Pa)"],
            "Geometry": data["Geometry"]
        }])
        print("Input DataFrame:")
        print(input_df)
        
        # One-hot encode the Geometry column
        geometry_encoded = encoder.transform(input_df[['Geometry']])
        geometry_columns = encoder.get_feature_names_out(['Geometry'])
        geometry_df = pd.DataFrame(geometry_encoded, columns=geometry_columns)
        
        # Combine with the other numerical features
        X = pd.concat([input_df.drop(columns=["Geometry"]), geometry_df], axis=1)
        print("Features for prediction:")
        print(X)
        
        # Perform prediction
        prediction = model.predict(X)[0]
        print("Raw prediction:", prediction)
        # Convert each prediction value to native float (if needed) before jsonify
        response = {
            "Outlet Velocity (m/s)": float(prediction[0]),
            "Outlet Pressure (Pa)": float(prediction[1]),
            "Velocity Loss (%)": float(prediction[2]),
            "Pressure Loss (%)": float(prediction[3])
        }
        return jsonify(response)
    
    except Exception as e:
        error_message = traceback.format_exc()
        print("Prediction error:\n", error_message)
        return jsonify({"error": str(e), "trace": error_message}), 500

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
