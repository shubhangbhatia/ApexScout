from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from typing import Optional

app = FastAPI(
    title="WonderScout FC API Engine — Pro Edition",
    description="Expanded API engine featuring dynamic query parameters, pagination, and player detail retrieval."
)

# Enable CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from local client instances
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_NAME = "scout_database.db"

def get_db_connection():
    """Establishes connection to the SQLite database with dictionary rows enabled."""
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/api/scout")
async def scout_endpoint(
    name: Optional[str] = Query(None, description="Filter by player name (partial match)"),
    position: Optional[str] = Query(None, description="Filter by tactical position (e.g., ST, CAM, CB)"),
    max_price: Optional[float] = Query(None, description="Maximum market value cap in Euros"),
    max_wage: Optional[float] = Query(None, description="Maximum weekly wage cap in Euros"),
    max_age: Optional[int] = Query(None, description="Maximum age of player"),
    min_potential: Optional[int] = Query(80, description="Minimum baseline target potential"),
    min_skill_moves: Optional[int] = Query(None, description="Minimum skill moves"),
    min_weak_foot: Optional[int] = Query(None, description="Minimum weak foot"),
    pre_contract_only: Optional[bool] = Query(False, description="Only players with <=1 year contract"),
    sort_by: str = Query("bargain_index", description="Column to sort by (bargain_index, potential, overall, growth_expected, value)"),
    limit: int = Query(10, ge=1, le=100, description="Number of records to return"),
    offset: int = Query(0, ge=0, description="Pagination offset for database records")
):
    """
    Scouts the local database using dynamic SQL parameters based on filter matrices.
    Returns paginated data sorted by specified metric.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Whitelist sorting columns to protect against SQL Injection
        allowed_sort_columns = {
            "bargain_index": "bargain_index DESC",
            "potential": "potential DESC",
            "overall": "overall DESC",
            "growth_expected": "growth_expected DESC",
            "value": "value ASC", # Sorting by value ascending prioritizes cheapest options
            "wage": "wage ASC"
        }
        
        sort_clause = allowed_sort_columns.get(sort_by, "bargain_index DESC")
        
        # Build query constraints dynamically
        query_parts = ["SELECT * FROM players WHERE 1=1"]
        params = []
        
        if name:
            query_parts.append("AND name LIKE ?")
            params.append(f"%{name}%")
            
        if position:
            query_parts.append("AND position LIKE ?")
            params.append(f"%{position}%")
            
        if max_price is not None:
            query_parts.append("AND value <= ?")
            params.append(max_price)
            
        if max_wage is not None:
            query_parts.append("AND wage <= ?")
            params.append(max_wage)
            
        if max_age is not None:
            query_parts.append("AND age <= ?")
            params.append(max_age)
            
        if min_potential is not None:
            query_parts.append("AND potential >= ?")
            params.append(min_potential)
            
        if min_skill_moves is not None:
            query_parts.append("AND skill_moves >= ?")
            params.append(min_skill_moves)
            
        if min_weak_foot is not None:
            query_parts.append("AND weak_foot >= ?")
            params.append(min_weak_foot)
            
        if pre_contract_only:
            query_parts.append("AND contract_years_left <= 1")
            
        # Append sorting, limit, and pagination configurations
        query_parts.append(f"ORDER BY {sort_clause}")
        query_parts.append("LIMIT ? OFFSET ?")
        params.extend([limit, offset])
        
        full_query = " ".join(query_parts)
        cursor.execute(full_query, tuple(params))
        rows = cursor.fetchall()
        
        # Fetch the total count for pagination metadata
        count_query_parts = ["SELECT COUNT(*) as total FROM players WHERE 1=1"]
        count_params = []
        
        # Re-apply filters to count query (excluding pagination/sorting)
        if name:
            count_query_parts.append("AND name LIKE ?")
            count_params.append(f"%{name}%")
        if position:
            count_query_parts.append("AND position LIKE ?")
            count_params.append(f"%{position}%")
        if max_price is not None:
            count_query_parts.append("AND value <= ?")
            count_params.append(max_price)
        if max_wage is not None:
            count_query_parts.append("AND wage <= ?")
            count_params.append(max_wage)
        if max_age is not None:
            count_query_parts.append("AND age <= ?")
            count_params.append(max_age)
        if min_potential is not None:
            count_query_parts.append("AND potential >= ?")
            count_params.append(min_potential)
        if min_skill_moves is not None:
            count_query_parts.append("AND skill_moves >= ?")
            count_params.append(min_skill_moves)
        if min_weak_foot is not None:
            count_query_parts.append("AND weak_foot >= ?")
            count_params.append(min_weak_foot)
        if pre_contract_only:
            count_query_parts.append("AND contract_years_left <= 1")
            
        cursor.execute(" ".join(count_query_parts), tuple(count_params))
        total_count = cursor.fetchone()["total"]
        
        conn.close()
        
        return {
            "status": "success",
            "pagination": {
                "total_records": total_count,
                "limit": limit,
                "offset": offset,
                "has_more": (offset + limit) < total_count
            },
            "data": [dict(row) for row in rows]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database execution failure: {str(e)}")

@app.get("/api/player/{player_id}")
async def get_player_details(player_id: str):
    """
    Fetches the complete profile and advanced attributes (pace, shooting, passing, 
    defending, physical) for a specific player_id.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM players WHERE player_id = ?", (player_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row is None:
            raise HTTPException(status_code=404, detail=f"Player with ID '{player_id}' not found.")
            
        return {
            "status": "success",
            "data": dict(row)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database lookup failure: {str(e)}")

@app.get("/api/player/{player_id}/similar")
async def get_similar_players(player_id: str):
    """
    Returns the 3 most comparable alternatives using a similarity algorithm.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM players WHERE player_id = ?", (player_id,))
        player = cursor.fetchone()
        
        if player is None:
            conn.close()
            raise HTTPException(status_code=404, detail=f"Player with ID '{player_id}' not found.")
            
        # Get up to 3 similar players
        # Compare by position first, then difference in overall and value
        cursor.execute('''
            SELECT * FROM players 
            WHERE position = ? AND player_id != ?
            ORDER BY ABS(overall - ?) + ABS(value - ?) / 1000000 ASC
            LIMIT 3
        ''', (player['position'], player_id, player['overall'], player['value']))
        
        rows = cursor.fetchall()
        conn.close()
        
        return {
            "status": "success",
            "data": [dict(row) for row in rows]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database execution failure: {str(e)}")