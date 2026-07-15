Phase-by-Phase Coding Guide: WonderScout FCThis guide walks you through exactly what code to write, where to put it, and how to run it. By the end of this guide, you will have a fully functioning, local full-stack web application.Phase 1: Local Setup & Data PreparationIn this phase, we establish our directory, prepare our environment, clean the raw Kaggle player data, and seed our relational SQLite database.1.1 Directory StructureCreate a folder on your computer named wonderscout-fc and set up the following empty files:wonderscout-fc/
│
├── players.csv             # <-- Download from Kaggle and place here
├── setup_db.py             # Database creation script
├── main.py                 # FastAPI backend app
└── index.html              # Frontend user interface
1.2 Setup the Database Pipeline (setup_db.py)This script uses Pandas to clean messy currency strings (e.g., converting "€105.5M" to 105500000.0 or "€45K" to 45000.0), handle missing values, engineer our core scouting metrics, and load the dataset into a structured SQLite database.Create and write the following code into setup_db.py:import pandas as pd
import sqlite3
import os

def clean_financial(val):
    """Converts transfer value/wage strings (e.g., €4.5M, €12K) to clean numeric floats."""
    if pd.isna(val):
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    
    val = str(val).replace('€', '').strip()
    if 'M' in val:
        return float(val.replace('M', '')) * 1_000_000
    elif 'K' in val:
        return float(val.replace('K', '')) * 1_000
    try:
        return float(val)
    except ValueError:
        return 0.0

def main():
    csv_filename = 'players.csv'
    db_filename = 'scout_database.db'
    
    if not os.path.exists(csv_filename):
        print(f"Error: '{csv_filename}' not found. Please place your Kaggle dataset in this folder.")
        return

    print("Step 1: Reading raw player dataset...")
    df = pd.read_csv(csv_filename)

    # Standardize column names (Handles variations in Kaggle EA FC datasets)
    rename_rules = {
        'Name': 'name', 'short_name': 'name',
        'Age': 'age',
        'Position': 'position', 'player_positions': 'position',
        'OVR': 'overall', 'Overall': 'overall',
        'Potential': 'potential',
        'Value': 'value', 'value_eur': 'value',
        'Wage': 'wage', 'wage_eur': 'wage',
        'Club': 'club', 'club_name': 'club'
    }
    df.rename(columns=rename_rules, inplace=True)

    # Filter only the essential columns we need to keep queries performant
    essential_cols = ['name', 'age', 'position', 'overall', 'potential', 'value', 'wage', 'club']
    matched_cols = [col for col in essential_cols if col in df.columns]
    df = df[matched_cols].copy()

    print("Step 2: Cleaning string currencies into numeric floats...")
    if 'value' in df.columns:
        df['value'] = df['value'].apply(clean_financial)
    if 'wage' in df.columns:
        df['wage'] = df['wage'].apply(clean_financial)

    print("Step 3: Engineering custom metrics (Growth Margin & Bargain Index)...")
    # Growth Expected = Potential - Overall
    df['growth_expected'] = df['potential'] - df['overall']
    
    # Bargain Index = Potential / Value (Higher score = higher bang-for-buck potential)
    # We assign 0 if value is 0 (Free agents) to prevent division by zero errors
    df['bargain_index'] = df.apply(
        lambda row: (row['potential'] / row['value']) if row['value'] > 0 else 0.0, 
        axis=1
    )

    print(f"Step 4: Seeding SQLite database file '{db_filename}'...")
    conn = sqlite3.connect(db_filename)
    
    # Save to a table named 'players'
    df.to_sql('players', conn, if_exists='replace', index=False)
    conn.close()

    print("\n✅ Phase 1 Complete: Database successfully compiled and indexed!")
    print(f"Total compiled roster items: {len(df)}")

if __name__ == "__main__":
    main()
Phase 2: The FastAPI Backend Engine (main.py)This phase establishes your local backend API. It listens for requests from your browser, securely connects to your local SQLite file, runs an optimized query, and returns JSON formatted responses.Create and write the following code into main.py:from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import sqlite3

app = FastAPI(
    title="WonderScout FC API Engine",
    description="Asynchronous query engine for discovering mathematically undervalued talent."
)

# Crucial: Enable CORS (Cross-Origin Resource Sharing) 
# This lets our local 'index.html' frontend fetch data safely from 'localhost:8000'
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits requests from any origin (ideal for local testing)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def fetch_scouted_players(position: str, max_price: float, min_potential: int):
    """Executes a target SQL search against our SQLite database file."""
    conn = sqlite3.connect('scout_database.db')
    conn.row_factory = sqlite3.Row  # Enables column-name-to-key dict mapping
    cursor = conn.cursor()
    
    # SQL query: filters by attributes, sorts by Bargain Index, pulls top 10 matches
    query = """
        SELECT name, age, position, overall, potential, value, wage, club, growth_expected, bargain_index
        FROM players
        WHERE position LIKE ?
          AND value <= ?
          AND potential >= ?
        ORDER BY bargain_index DESC
        LIMIT 10;
    """
    
    # Adds SQL wildcards to find matching substrings (e.g., searching "CAM" inside "CAM, CM")
    position_wildcard = f"%{position}%"
    
    cursor.execute(query, (position_wildcard, max_price, min_potential))
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

@app.get("/api/scout")
async def scout_endpoint(
    position: str = Query("CAM", description="Target player position (e.g., ST, CAM, CB)"),
    max_price: float = Query(20000000.0, description="Maximum spending limit in Euros"),
    min_potential: int = Query(84, description="Minimum baseline developmental potential")
):
    """Exposes our scouting logic out to the web client."""
    try:
        players = fetch_scouted_players(position, max_price, min_potential)
        return {
            "status": "success",
            "count": len(players),
            "data": players
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Database query failed: {str(e)}"
        }
Phase 3 & 4: Frontend UI & Client Integration (index.html)This single file contains the entire user interface and client logic. It renders a futuristic sports UI utilizing Tailwind CSS v4 and uses native JavaScript to fetch data from your FastAPI endpoints.Create and write the following code into index.html:<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WonderScout FC</title>
    <!-- Tailwind CSS v4 Engine -->
    <script src="[https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4](https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4)"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen font-sans antialiased selection:bg-emerald-500/30">

    <div class="flex flex-col lg:flex-row min-h-screen">
        
        <!-- Sidebar Controls Area -->
        <aside class="w-full lg:w-96 bg-slate-900/50 p-8 border-b lg:border-b-0 lg:border-r border-slate-800/80 backdrop-blur-xl flex flex-col justify-between">
            <div>
                <div class="flex items-center gap-3 mb-2">
                    <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h1 class="text-2xl font-black uppercase tracking-wider text-emerald-400">WonderScout FC</h1>
                </div>
                <p class="text-slate-400 text-xs mb-8 leading-relaxed">Algorithmic scouting engine for sourcing high-value global transfers.</p>
                
                <div class="space-y-6">
                    <!-- Dropdown: Position -->
                    <div>
                        <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Tactical Position</label>
                        <select id="positionSelect" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition">
                            <option value="ST">Striker (ST)</option>
                            <option value="CAM" selected>Attacking Mid (CAM)</option>
                            <option value="CM">Central Mid (CM)</option>
                            <option value="RW">Right Winger (RW)</option>
                            <option value="LW">Left Winger (LW)</option>
                            <option value="CB">Center Back (CB)</option>
                            <option value="GK">Goalkeeper (GK)</option>
                        </select>
                    </div>

                    <!-- Slider: Max Price -->
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Max Transfer Budget</label>
                            <span id="priceVal" class="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">€20.0M</span>
                        </div>
                        <input id="priceSlider" type="range" min="100000" max="80000000" step="500000" value="20000000" class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500">
                    </div>

                    <!-- Slider: Min Potential -->
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Min Rating Potential</label>
                            <span id="potentialVal" class="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">84</span>
                        </div>
                        <input id="potentialSlider" type="range" min="80" max="95" step="1" value="84" class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500">
                    </div>
                </div>
            </div>

            <button id="scoutAction" class="w-full mt-8 bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-extrabold uppercase tracking-widest py-4 rounded-xl transition duration-200 shadow-xl shadow-emerald-500/10 cursor-pointer text-xs">
                Run Algorithmic Query
            </button>
        </aside>

        <!-- Right Side Results Feed -->
        <main class="flex-1 p-8 lg:p-12 max-w-7xl">
            <div class="flex justify-between items-baseline mb-8 border-b border-slate-800 pb-4">
                <h2 class="text-lg font-bold tracking-tight text-slate-200">Scouted Targets <span class="text-slate-500 font-normal text-sm ml-1">(Sorted by Bargain Efficiency Index)</span></h2>
                <div id="resultsCount" class="text-xs font-mono text-slate-500">0 records returned</div>
            </div>

            <!-- Output Container Grid -->
            <div id="resultsGrid" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <!-- Fallback Initial State -->
                <div class="col-span-full py-24 text-center text-slate-600 text-sm">
                    Configure parameters and initiate the database query to parse transfer selections.
                </div>
            </div>
        </main>
    </div>

    <!-- Active Interface Wiring Script -->
    <script>
        // Update price display live as user interacts with budget slider
        const priceSlider = document.getElementById('priceSlider');
        const priceVal = document.getElementById('priceVal');
        priceSlider.addEventListener('input', (e) => {
            const millions = (e.target.value / 1_000_000).toFixed(1);
            priceVal.textContent = `€${millions}M`;
        });

        // Update potential display live as user interacts with potential slider
        const potentialSlider = document.getElementById('potentialSlider');
        const potentialVal = document.getElementById('potentialVal');
        potentialSlider.addEventListener('input', (e) => {
            potentialVal.textContent = e.target.value;
        });

        // Trigger scouting search on query execution
        document.getElementById('scoutAction').addEventListener('click', async () => {
            const position = document.getElementById('positionSelect').value;
            const maxPrice = priceSlider.value;
            const minPotential = potentialSlider.value;

            const grid = document.getElementById('resultsGrid');
            const countLabel = document.getElementById('resultsCount');

            // Set loading animation
            grid.innerHTML = `
                <div class="col-span-full py-24 text-center">
                    <span class="inline-block w-8 h-8 rounded-full border-4 border-slate-800 border-t-emerald-400 animate-spin mb-4"></span>
                    <p class="text-xs text-slate-500 uppercase tracking-widest font-mono animate-pulse">Running Database Ingestion...</p>
                </div>
            `;

            try {
                const response = await fetch(`http://127.0.0.1:8000/api/scout?position=${position}&max_price=${maxPrice}&min_potential=${minPotential}`);
                const payload = await response.json();

                if (payload.status === 'success' && payload.data.length > 0) {
                    countLabel.textContent = `${payload.count} records returned`;
                    grid.innerHTML = ''; // Wipe out loading spinner

                    payload.data.forEach(player => {
                        const costMillions = (player.value / 1_000_000).toFixed(2);
                        const cleanScore = (player.bargain_index * 100_000).toFixed(0);

                        grid.innerHTML += `
                            <div class="bg-slate-900/30 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-5 transition duration-300 shadow-lg flex flex-col justify-between group">
                                <div>
                                    <div class="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 class="font-bold text-slate-100 group-hover:text-emerald-400 transition duration-200 text-base">${player.name}</h3>
                                            <p class="text-xs text-slate-500 font-medium">${player.club || 'Free Agent'}</p>
                                        </div>
                                        <span class="bg-emerald-500/5 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-500/10">${player.position}</span>
                                    </div>

                                    <div class="grid grid-cols-2 gap-3 mb-4">
                                        <div class="bg-slate-950/40 rounded-lg p-2.5 border border-slate-850">
                                            <span class="block text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1">Rating/Potential</span>
                                            <span class="text-xs font-bold text-slate-200">${player.overall} <span class="text-emerald-400">➔ ${player.potential}</span></span>
                                        </div>
                                        <div class="bg-slate-950/40 rounded-lg p-2.5 border border-slate-850">
                                            <span class="block text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1">Total Development</span>
                                            <span class="text-xs font-bold text-emerald-400">+${player.growth_expected} OVR</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex justify-between items-center border-t border-slate-800/50 pt-3 mt-1">
                                    <div>
                                        <span class="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Transfer Cost</span>
                                        <span class="text-sm font-extrabold text-slate-200">€${costMillions}M</span>
                                    </div>
                                    <div class="text-right">
                                        <span class="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Efficiency Score</span>
                                        <span class="text-xs font-black text-emerald-400">${cleanScore} pts</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                } else {
                    countLabel.textContent = '0 records returned';
                    grid.innerHTML = `
                        <div class="col-span-full py-24 text-center">
                            <p class="text-slate-500 text-sm">No player records intercepted. Expand search parameters.</p>
                        </div>
                    `;
                }
            } catch (err) {
                console.error(err);
                grid.innerHTML = `
                    <div class="col-span-full py-24 text-center">
                        <p class="text-red-400 text-sm font-medium mb-1">Execution Failure: Handshake connection failed.</p>
                        <p class="text-xs text-slate-600">Ensure your FastAPI local server terminal is running (`uvicorn main:app --reload`).</p>
                    </div>
                `;
            }
        });
    </script>
</body>
</html>
Phase 5: Execution CommandsFollow this simple execution order in your terminal to see the app come to life:# 1. Install required packages
pip install pandas fastapi uvicorn

# 2. Compile your dataset and build 'scout_database.db'
python setup_db.py

# 3. Spin up the FastAPI server
uvicorn main:app --reload
Now, navigate to your folder and open index.html in your web browser. You have a completely custom, full-stack analytical web app ready to run!