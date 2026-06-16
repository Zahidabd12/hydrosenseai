from pydantic import BaseModel
from app.core.xai_interpreter import get_feature_importance

class PredictionRequest(BaseModel):
    suhu: float
    lembap: float
    angin: float
    tekanan: float
    periode: int
    algo: str

def run_inference(req: PredictionRequest):
    """
    Mock inference logic for different models.
    """
    suhu = req.suhu
    lembap = req.lembap
    angin = req.angin
    tekanan = req.tekanan
    
    if req.algo == 'ensemble':
        r = max(0, (lembap - 55) * 1.2 + (33 - suhu) * 1.8 + (angin * 1.2) - (tekanan - 1002) * 0.3)
        acc = 0.94
        feat_imp = [25, 55, 12, 8]
    elif req.algo == 'xgb':
        r = max(0, (lembap - 60) * 1.5 + ((34 - suhu)**2) * 0.5 + angin * 1.5)
        acc = 0.91
        feat_imp = [20, 65, 10, 5]
    else: # lstm
        r = max(0, (lembap - 50) * 0.8 + (34 - suhu) * 2.0 + angin * 0.8)
        acc = 0.88
        feat_imp = [35, 45, 15, 5]
        
    r = round(r, 1)
    margin = r * (1 - acc) * 2
    
    return {
        "prediction": r,
        "ci_lower": round(max(0, r - margin), 1),
        "ci_upper": round(r + margin, 1),
        "accuracy": acc,
        "xai": get_feature_importance(feat_imp)
    }
