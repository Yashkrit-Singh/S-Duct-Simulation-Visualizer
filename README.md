
#  Aerodynamic Analysis & AI-Based Prediction of S-Duct Performance

**Repository for the ME395 – Engineering Practicum Project**  
**Department of Mechanical Engineering**  
**Submission Date:** 30/04/2025  
**Mentor:** **Dr. Md. Kaleem Khan**  
**Co-Mentor:** **Dr. Ashwani Assam**



##  Team Members

- **Ashish Singh** – 2201ME17  
- **Ashwani Kumar Jha** – 2201ME19  
- **Ayush Soni** – 2201ME22  
- **Bishwamohan Jena** – 2201ME26  
- **Nikhil Singh** – 2201ME42  
- **Yashkrit Singh** – 2201ME76  



##  Project Overview

This project investigates the **aerodynamic performance** of **S-duct geometries** using **CFD simulations** and **AI-based predictive modeling**. It evaluates **28 configurations** (circle-circle, square-circle, etc.) to determine optimal shapes for both **commercial** and **military aircraft**.

We also developed an **interactive web-based platform** for result visualization and a **machine learning model (XGBoost)** to predict outlet flow parameters, minimizing the need for repeated simulations.



##  Objectives

- **Simulate** various S-duct geometries under Mach 0.6 airflow  
- **Analyze** velocity distribution, flow distortion, and pressure recovery  
- **Build** a **web platform** for visualizing simulation results  
- **Train an AI model** for predicting aerodynamic performance  



##  Technologies Used

###  Simulation & Modeling:
- **ANSYS Fluent**
- **SolidWorks**
- **k-ω SST Turbulence Model**

###  Programming & Data:
- **Python** (Pandas, Scikit-learn, XGBoost, Joblib)
- **CFD post-processing scripts**

###  Web Development:
- **React.js**
- **Recharts**
- **Node.js (Back-end)**



##  Key Findings

- **Circle-Circle Geometry**: Ideal for **commercial aircraft** due to high flow uniformity and stability  
- **Square-Circle Geometry**: Preferred for **fighter jets** for better **thrust**, **stealth**, and **integration**



##  AI Model

- **Model:** `XGBoostRegressor` with `MultiOutputRegressor`  
- **Inputs:** Mach number, bend angle, geometry type  
- **Outputs:** Outlet velocity, outlet pressure, velocity loss %, pressure loss %  
- **Accuracy:** High R² values with robust generalization  
- **Deployment:** Model & encoder saved with `joblib` for fast inference
  

##  Web Platform Features

- **Geometry Selector**: Choose from 28 duct types  
- **Live Visualization**: Velocity, pressure, turbulence data  
- **Side-by-Side Comparison** of duct configurations  
- **Report Generation** for simulations  
- **Fully Responsive UI** using **React.js** + **Recharts**



##  Challenges Faced

- **Turbulent 3D Flow Simulation** complexities  
- **High-resolution meshing** for boundary layers  
- **Data preprocessing** and **encoding** for AI model  
- **Integration** of simulation data into a live web platform  



##  Conclusion

By integrating **CFD**, **AI**, and **interactive tools**, this project provides a complete workflow for **fast, accurate**, and **cost-effective** aerodynamic design of **S-ducts**. The hybrid approach bridges **engineering analysis** and **modern software development**.



##  References

- [ScienceDirect - S-Duct Aerodynamics](https://www.sciencedirect.com/science/article/abs/pii/S1270963816313517)  
- [Wikipedia – S-Duct](https://en.wikipedia.org/wiki/S-duct)  
- [YouTube – Visual Explanation 1](https://youtu.be/MJQVpvWBwXg?si=oycIkb3c4b41rUOZ)  
- [YouTube – Visual Explanation 2](https://youtu.be/1woKtFjN-bE?si=bQ1waJTgeUwXjkoi)  


