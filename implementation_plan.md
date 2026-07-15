# Feature Expansion Implementation Plan

This plan outlines the integration of 5 massive new features requested for EA FC 26 players.

## Proposed Changes

### 1. Database & Backend Updates
#### [MODIFY] [setup_db.py](file:///C:/Users/SHUBHANG/OneDrive/Desktop/Personal/Projects/ApexScout/setup_db.py)
- **PlayStyles, Weak Foot, Skill Moves**: The `EAFC26.csv` file actually contains `play style`, `Weak foot`, and `Skill moves` columns! We will extract these and map them to the database.
- **Contract Expiry**: Since contract data isn't in the base dataset, we will randomly simulate a `contract_years_left` metric (0 to 5 years) for all players to enable the "Pre-Contract" filter feature.

#### [MODIFY] [main.py](file:///C:/Users/SHUBHANG/OneDrive/Desktop/Personal/Projects/ApexScout/main.py)
- Update the API's SQL queries to return the new fields (`weak_foot`, `skill_moves`, `playstyles`, `contract_years_left`).
- **New API Endpoint**: `GET /api/player/{id}/similar` which uses a similarity algorithm (comparing overall, potential, position, and value) to return the 3 most comparable alternatives.

### 2. Frontend UI: Player Cards & Modals
#### [MODIFY] [PlayerCard.jsx](file:///C:/Users/SHUBHANG/OneDrive/Desktop/Personal/Projects/ApexScout/frontend/src/components/PlayerCard.jsx)
- Render small **star ratings** for Weak Foot (WF) and Skill Moves (SM).
- Add an indicator badge if a player is in the final year of their contract (Pre-Contract Eligible).

#### [MODIFY] [PlayerModal.jsx](file:///C:/Users/SHUBHANG/OneDrive/Desktop/Personal/Projects/ApexScout/frontend/src/components/PlayerModal.jsx)
- **PlayStyles Panel**: Parse the `playstyles` string and render individual, beautifully styled badges for each playstyle (e.g., Finesse Shot, Quick Step).
- **Similar Alternatives**: Call the new `/similar` API endpoint and render 3 mini-cards at the bottom of the modal, allowing the user to click them and instantly open their profiles.

### 3. Frontend UI: Advanced Filtering
#### [MODIFY] [Sidebar.jsx](file:///C:/Users/SHUBHANG/OneDrive/Desktop/Personal/Projects/ApexScout/frontend/src/components/Sidebar.jsx)
- **New Filters**: Add a slider/dropdown for Minimum Skill Moves, Minimum Weak Foot, and a toggle switch for "Pre-Contract Eligible Only (<= 1 Year Left)".
- Note: We will implement this so that it respects the "Run Global Query" button.

### 4. Multiple Shortlists (Squad Builder)
#### [MODIFY] [App.jsx](file:///C:/Users/SHUBHANG/OneDrive/Desktop/Personal/Projects/ApexScout/frontend/src/App.jsx)
- Refactor the current single `favorites` array into a robust `shortlists` object containing multiple lists (e.g., `Default`, `Summer Targets`, `Youth Academy`).
- Create a UI to add/delete custom shortlists and switch between viewing them.
- When clicking the star on a player card, open a tiny popover asking *which* shortlist to add the player to.

## User Review Required

> [!WARNING]  
> Modifying the database schema requires running `python setup_db.py` again, which takes a few seconds to rebuild the machine learning models and re-seed the SQLite database.

> [!IMPORTANT]  
> Regarding **Multiple Shortlists**, how would you prefer the UI when you click the "Star" button on a player card? 
> **Option A**: It instantly adds to the currently active shortlist.
> **Option B**: It pops up a small dropdown menu asking which shortlist you want to put them in.
