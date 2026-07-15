import pandas as pd
import sqlite3  
import os
from sklearn.ensemble import RandomForestRegressor
import numpy as np

def clean_financal(val):
    """Converts transfer value/wage strings (e.g., €4.5M, €12K) to clean numeric floats."""
    if pd.isna(val):
        return 0.0
    if isinstance(val , (int,float)):
        return float(val)
    
    val = str(val).replace('€', " ").strip()
    if 'M' in val:
        return float(val.replace('M', ' ')) * 1_000_000
    elif 'K' in val:
        return float(val.replace('K', ' ')) * 1_000
    try:
        return float(val)
    except ValueError:
        return 0.0

def train_ml_models(old_csv_path):
    print("Step 1: Training Machine Learning models on historical data...")
    df_train = pd.read_csv(old_csv_path)
    
    # Clean training data
    df_train.rename(columns={'Age': 'age', 'Overall': 'overall', 'Potential': 'potential', 'Value': 'value', 'Wage': 'wage'}, inplace=True)
    df_train['value'] = df_train['value'].apply(clean_financal)
    df_train['wage'] = df_train['wage'].apply(clean_financal)
    
    # Features: Age and Overall Rating
    X = df_train[['age', 'overall']]
    
    # Train Potential Model
    y_pot = df_train['potential']
    model_pot = RandomForestRegressor(n_estimators=100, random_state=42)
    model_pot.fit(X, y_pot)
    
    # Train Value Model
    y_val = df_train['value']
    model_val = RandomForestRegressor(n_estimators=100, random_state=42)
    model_val.fit(X, y_val)
    
    # Train Wage Model
    y_wage = df_train['wage']
    model_wage = RandomForestRegressor(n_estimators=100, random_state=42)
    model_wage.fit(X, y_wage)
    
    print(f"-> Models trained successfully on {len(df_train)} historical records.")
    return model_pot, model_val, model_wage

def main():
    old_csv = 'players.csv'
    new_csv = 'EAFC26.csv'
    db_filename = 'scout_database.db'

    if not os.path.exists(old_csv) or not os.path.exists(new_csv):
        print(f"Error: Missing CSV files. Please ensure both '{old_csv}' and '{new_csv}' exist.")
        return
        
    # 1. Train models
    model_pot, model_val, model_wage = train_ml_models(old_csv)
    
    # 2. Process EAFC26 Data
    print("Step 2: Processing EAFC 26 raw attributes...")    
    df = pd.read_csv(new_csv)
    
    # Map EA FC 26 specific columns
    rename_rules = {
        'Name': 'name',
        'Age': 'age',
        'Position': 'position',
        'OVR': 'overall',
        'Team': 'club',
        'PAC': 'pace',
        'SHO': 'shooting',
        'PAS': 'passing',
        'DEF': 'defending',
        'PHY': 'physical',
        'card': 'photo_url',
        'Weak foot': 'weak_foot',
        'Skill moves': 'skill_moves',
        'play style': 'playstyles'
    }
    df.rename(columns=rename_rules, inplace=True)

    # Filter essential columns
    essential_cols = ['name', 'age', 'position', 'overall', 'club', 'pace', 'shooting', 'passing', 'defending', 'physical', 'photo_url', 'weak_foot', 'skill_moves', 'playstyles']
    matched_cols = [col for col in essential_cols if col in df.columns]
    df = df[matched_cols].copy()
    
    # Drop records missing critical info
    df.dropna(subset=['age', 'overall'], inplace=True)
    
    # 3. Predict Missing Stats
    print("Step 3: Predicting Potential, Value, and Wage via Machine Learning...")
    X_new = df[['age', 'overall']]
    
    df['potential'] = np.round(model_pot.predict(X_new)).astype(int)
    # Ensure potential is never lower than current overall
    df['potential'] = np.maximum(df['potential'], df['overall'])
    
    df['value'] = np.round(model_val.predict(X_new), 2)
    df['wage'] = np.round(model_wage.predict(X_new), 2)

    print("Step 4: Engineering custom metrics (Growth Margin, Bargain Index, Seasons to Peak)...")
    # Growth Expected = Potential - Overall
    df['growth_expected'] = df['potential'] - df['overall']
    # Bargain Index = Potential / Value (Higher score = higher bang-for-buck potential)
    df['bargain_index'] = df.apply(
        lambda row: (row['potential'] / row['value']) if row['value'] > 0 else 0.0, 
        axis=1
    )
    # Seasons to Peak = max(0, 27 - Age)
    df['seasons_to_peak'] = np.maximum(0, 27 - df['age'])
    
    # Generate Player IDs
    df['player_id'] = range(1, len(df) + 1)
    
    # Simulate contract_years_left (0 to 5)
    df['contract_years_left'] = np.random.randint(0, 6, size=len(df))

    print(f"Step 5: Seeding SQLite database file '{db_filename}'...")
    conn = sqlite3.connect(db_filename)
    
    # Save to a table named 'players'
    df.to_sql('players', conn, if_exists='replace', index=False)
    conn.close()

    print("\nPhase 1 Complete: Database successfully compiled and indexed with ML Predictions!")
    print(f"Total EA FC 26 players inserted: {len(df)}")

if __name__ == "__main__":
    main()