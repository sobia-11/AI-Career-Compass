# 🎓 AI Career Compass — Smart University Guidance System

![Python](https://img.shields.io/badge/Python-3.9+-blue?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-2.3+-black?style=flat-square&logo=flask)
![ML](https://img.shields.io/badge/ML-scikit--learn-orange?style=flat-square&logo=scikitlearn)
![Accuracy](https://img.shields.io/badge/Best%20Model-96%25%20Accuracy-brightgreen?style=flat-square)
![Status](https://img.shields.io/badge/Status-Complete-success?style=flat-square)

> AI Lab Semester Project 2026 — A machine learning-powered career guidance system that recommends the best tech career path for university students based on their skills and academic profile.

---

## 🚀 Live Demo

> Run locally — setup instructions below ↓

---

## 📌 What It Does

Students fill out a quick skill assessment (or describe themselves in plain text), and the system:

- Predicts the **best-fit career** from multiple tech tracks
- Shows **Top 3 career recommendations** with confidence scores
- Generates a personalized **Skill Gap Analysis** chart
- Compares all 4 ML models visually
- Downloads a full **PDF report**

---

## 🧠 Machine Learning Models

| Model | Accuracy |
|---|---|
| 🥇 Random Forest | **96.0%** |
| SVM | 93.6% |
| Logistic Regression | 92.8% |
| KNN | 82.0% |

> Best model (Random Forest) is **auto-selected** at runtime.

---

## 🎯 Career Tracks Covered

- 🤖 Artificial Intelligence
- 📊 Data Science
- 🔐 Cyber Security
- 🌐 Web Development
- 📱 Mobile App Development
- ☁️ Cloud Computing
- 🎮 Game Development
- 🖥️ Software Engineering

---

## 🔢 Input Features

| Feature | Range |
|---|---|
| Math Skill | Low / Medium / High |
| Coding Interest | Low / Medium / High |
| Creativity | Low / Medium / High |
| Communication | Low / Medium / High |
| Logical Thinking | Low / Medium / High |
| Tech Interest | Low / Medium / High |
| Teamwork | Low / Medium / High |
| Problem Solving | Low / Medium / High |
| GPA | 0.0 – 4.0 |
| Study Hours/Day | 0.5 – 15 |

---

## ⚡ Two Input Modes

### 1. Dropdown Mode
Select each skill on a slider — quick and structured.

### 2. NLP Free-Text Mode
Write about yourself naturally, e.g.:
> *"I love coding and solving logical puzzles. My GPA is 3.5 and I study 5 hours daily. I find math easy but prefer creative problem-solving over communication."*

The system extracts your profile automatically from your text.

---

## 🛠️ Tech Stack

- **Backend:** Python, Flask
- **ML:** scikit-learn (Random Forest, SVM, Logistic Regression, KNN)
- **Data:** pandas, numpy
- **PDF Reports:** ReportLab
- **Frontend:** HTML5, CSS3, JavaScript, Chart.js
- **Serialization:** joblib

---

## 📁 Project Structure

```
AI-Career-Compass/
├── app.py                                  ← Flask backend
├── career_model.pkl                        ← Trained Random Forest model
├── scaler.pkl                              ← Feature scaler
├── label_encoder.pkl                       ← Career label encoder
├── model_stats.pkl                         ← All 4 model accuracies
├── nlp_module.py                           ← NLP text parser
├── career_guidance_v2.ipynb               ← Training notebook
├── smart_university_guidance_dataset.csv  ← Dataset
├── requirements.txt                        ← Dependencies
├── templates/
│   └── index.html                          ← Main web page
└── static/
    ├── css/style.css                       ← Stylesheet
    └── js/main.js                          ← Frontend logic
```

---

## 🔧 Setup & Run

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/AI-Career-Compass.git
cd AI-Career-Compass

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the app
python app.py

# 4. Open in browser
# http://localhost:5000
```

**Requirements:** Python 3.9+

---

## 📊 Dataset

- **File:** `smart_university_guidance_dataset.csv`
- Custom dataset with 10 skill/academic features
- Multi-class classification (8 career categories)
