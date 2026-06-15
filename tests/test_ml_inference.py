import pytest
from app.core.ml_engine import run_inference, PredictionRequest

def test_run_inference():
    req = PredictionRequest(
        suhu=31.5,
        lembap=85.0,
        angin=8.0,
        tekanan=1008.0,
        periode=7,
        algo='ensemble'
    )
    
    res = run_inference(req)
    assert "prediction" in res
    assert "ci_lower" in res
    assert "ci_upper" in res
    assert "accuracy" in res
    assert "xai" in res
    assert res['accuracy'] == 0.94
