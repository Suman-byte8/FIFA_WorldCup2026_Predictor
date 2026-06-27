from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import math
import numpy as np
import os

app = FastAPI(title="World Cup 2026 AI Predictor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. LOAD ONLY THE SIMPLE DICTIONARIES (No Pandas objects, so it won't crash!)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

print("Loading Team Stats...")
with open(os.path.join(BASE_DIR, 'models/latest_stats.pkl'), 'rb') as f:
    latest_stats = pickle.load(f)
with open(os.path.join(BASE_DIR, 'models/team_names.pkl'), 'rb') as f:
    team_names = pickle.load(f)
print("Stats Loaded Successfully!")

# 2. HARDCODE THE AI'S BRAIN (The exact weights your model learned in Notebook 03)
COEFS = {
    "intercept": 0.1294,
    "is_home_advantage": 0.2829,
    "rank_diff": 0.0067,
    "ea_diff": 0.0048,
    "tm_log_diff": 0.0295
}

class MatchRequest(BaseModel):
    home_team: str
    away_team: str
    is_neutral: bool = True

@app.get("/teams")
def get_teams():
    return {"teams": team_names}

@app.post("/predict")
def predict_match(req: MatchRequest):
    if req.home_team not in team_names or req.away_team not in team_names:
        raise HTTPException(status_code=400, detail="Invalid team name provided.")

    # Get the stats from our dictionaries
    h_rank = latest_stats['fifa'].get(req.home_team, 150)
    a_rank = latest_stats['fifa'].get(req.away_team, 150)
    h_ea = latest_stats['ea'].get(req.home_team, 60)
    a_ea = latest_stats['ea'].get(req.away_team, 60)
    h_tm = latest_stats['tm'].get(req.home_team, 1000000)
    a_tm = latest_stats['tm'].get(req.away_team, 1000000)
    
    h_adv = 0 if req.is_neutral else 1

    # Calculate differences
    h_rank_diff = a_rank - h_rank
    h_ea_diff = h_ea - a_ea
    h_tm_diff = np.log1p(h_tm) - np.log1p(a_tm)

    a_rank_diff = h_rank - a_rank
    a_ea_diff = a_ea - h_ea
    a_tm_diff = np.log1p(a_tm) - np.log1p(h_tm)

    # 3. DO THE AI MATH MANUALLY (Poisson Formula)
    home_log_xg = (COEFS["intercept"] + 
                   (COEFS["is_home_advantage"] * h_adv) + 
                   (COEFS["rank_diff"] * h_rank_diff) + 
                   (COEFS["ea_diff"] * h_ea_diff) + 
                   (COEFS["tm_log_diff"] * h_tm_diff))
    
    away_log_xg = (COEFS["intercept"] + 
                   (COEFS["is_home_advantage"] * 0) + 
                   (COEFS["rank_diff"] * a_rank_diff) + 
                   (COEFS["ea_diff"] * a_ea_diff) + 
                   (COEFS["tm_log_diff"] * a_tm_diff))

    # Convert Log to Expected Goals
    home_xG = math.exp(home_log_xg)
    away_xG = math.exp(away_log_xg)

    # Determine Winner
    if home_xG > away_xG + 0.15:
        winner = req.home_team
    elif away_xG > home_xG + 0.15:
        winner = req.away_team
    else:
        winner = "Draw (Penalties Required)"

    return {
        "home_team": req.home_team,
        "away_team": req.away_team,
        "home_xG": round(home_xG, 2),
        "away_xG": round(away_xG, 2),
        "predicted_winner": winner
    }