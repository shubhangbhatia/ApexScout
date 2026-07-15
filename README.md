# ⚽ ApexScout: EA FC 26 Scouting & Analytics

ApexScout is an advanced, full-stack football player scouting web application designed around the EA FC 26 database. By leveraging historical player data and Machine Learning, it provides deep analytics, custom scouting metrics, and smart recommendations to help you find the perfect players for your squad.

---

## ✨ Key Features

- 🧠 **Machine Learning Predictions:** Predicts missing player statistics (Potential, Market Value, Wage) based on age and overall rating using Random Forest Regression models trained on historical data.
- 📊 **Custom Scouting Metrics:**
  - **Growth Expected:** Predicts a player's overall rating growth ceiling.
  - **Bargain Index:** Calculates the ratio of potential to market value to identify high-ROI hidden gems.
  - **Seasons to Peak:** Estimates the number of years before a player reaches their prime.
- 🎯 **Advanced Search & Filtering:** Granular search capabilities including overall, potential, position, minimum skill moves/weak foot, and a special "Pre-Contract Eligible" filter for players in their final contract year.
- 🤖 **Smart Similar Recommendations:** Uses a custom similarity algorithm to suggest alternative players based on overall, potential, position, and value.
- 📝 **Custom Squad Shortlists:** Create and manage multiple customized shortlists (e.g., "Summer Targets", "Youth Academy") to organize your scouting effectively.

## 🛠️ Tech Stack

### Backend (Data & ML)
- **Python 3.11+**
- **Pandas & NumPy** (Data processing and feature engineering)
- **Scikit-Learn** (Random Forest Regressor for stat predictions)
- **SQLite** (Lightweight, file-based database)

### Frontend
- **React.js** (Bootstrapped with Vite)
- **Vanilla CSS** (Custom responsive design)
- **JavaScript (ES6+)**

---

## 🚀 Getting Started

Follow these steps to run ApexScout locally on your machine.

### 1. Clone the Repository
```bash
git clone https://github.com/shubhangbhatia/ApexScout.git
cd ApexScout
```

### 2. Setup the Database & ML Models
The application requires the database to be seeded and ML models to be trained. Ensure you have the raw CSV files (`EAFC26.csv` and `players.csv`) in the root directory.

```bash
# Install Python dependencies
pip install pandas numpy scikit-learn

# Run the ML training and database setup script
python setup_db.py
```
*Note: This will generate a `scout_database.db` file with fully populated player data.*

### 3. Start the Backend Server
Run the Python backend server (ensure whatever web framework you are using is installed, e.g., Flask/FastAPI).

```bash
# Start the backend API
python main.py
```

### 4. Run the React Frontend
Open a new terminal window and navigate to the frontend directory:

```bash
cd frontend

# Install Node.js dependencies
npm install

# Start the Vite development server
npm run dev
```

The app will typically be available at `http://localhost:5173`.

---

## 📂 Project Structure
- `setup_db.py`: Data cleaning, ML model training, and SQLite database seeder.
- `main.py`: Backend server handling API requests and similarity algorithms.
- `scout_database.db`: The generated SQLite database.
- `EAFC26.csv` / `players.csv`: Raw player datasets.
- `/frontend`: React frontend application containing components like `PlayerCard`, `Sidebar`, and `PlayerModal`.

## 📄 Notes & License
This project is a personal side project designed for analyzing virtual football players. All EA FC player data and imagery belong to Electronic Arts Inc.
