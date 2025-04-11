import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import mean_squared_error, r2_score
from xgboost import XGBRegressor
from sklearn.multioutput import MultiOutputRegressor
import joblib

def train_model():
    # Load dataset
    df = pd.read_excel("detailed_bend_analysis.xlsx")

    # One-hot encode geometry
    encoder = OneHotEncoder(sparse_output=False)
    geometry_encoded = encoder.fit_transform(df[['Geometry']])
    geometry_df = pd.DataFrame(geometry_encoded, columns=encoder.get_feature_names_out(['Geometry']))

    # Features and targets
    X = pd.concat([
        df[['Mach Number', 'Angle', 'Inlet Velocity (m/s)', 'Inlet Pressure (Pa)']],
        geometry_df
    ], axis=1)

    y = df[['Outlet Velocity (m/s)', 'Outlet Pressure (Pa)', 'Velocity Loss (%)', 'Pressure Loss (%)']]

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train model
    model = MultiOutputRegressor(XGBRegressor(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=6,
        random_state=42
    ))
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    for i, col in enumerate(y.columns):
        print(f"\n--- {col} ---")
        print(f"R² Score: {r2_score(y_test[col], y_pred[:, i]):.4f}")
        print(f"RMSE: {np.sqrt(mean_squared_error(y_test[col], y_pred[:, i])):.2f}")

    # Save model and encoder
    joblib.dump(model, "xgboost_bend_predictor.pkl")
    joblib.dump(encoder, "geometry_encoder.pkl")
    print("\n✅ Model and encoder saved successfully.")

def predict_new_sample(sample_dict):
    # Load model and encoder
    model = joblib.load("xgboost_bend_predictor.pkl")
    encoder = joblib.load("geometry_encoder.pkl")

    # Create DataFrame and encode geometry
    new_sample = pd.DataFrame([sample_dict])
    geom_encoded = encoder.transform(new_sample[['Geometry']])
    geom_df = pd.DataFrame(geom_encoded, columns=encoder.get_feature_names_out(['Geometry']))
    X_new = pd.concat([
        new_sample[['Mach Number', 'Angle', 'Inlet Velocity (m/s)', 'Inlet Pressure (Pa)']],
        geom_df
    ], axis=1)

    # Predict
    prediction = model.predict(X_new)
    return prediction.tolist()

if __name__ == "__main__":
    train_model()

    # Example prediction
    sample = {
        "Mach Number": 0.6,
        "Angle": 0,
        "Inlet Velocity (m/s)": 0.6 * 343,
        "Inlet Pressure (Pa)": 1e5,
        "Geometry": "Circle-Circle"
    }
    result = predict_new_sample(sample)
    print(f"\n🔍 Predicted Output:\n{result}")
