import pytest
from app.utils.date_converter import doy_to_date
from app.utils.bmkg_classifier import classify_rainfall

def test_doy_to_date():
    res = doy_to_date(2026, 88)
    assert res['iso'] == '2026-03-29'
    assert 'Maret' in res['human_readable']

def test_classify_rainfall():
    res1 = classify_rainfall(10)
    assert res1['label'] == 'Ringan'
    
    res2 = classify_rainfall(45)
    assert res2['label'] == 'Sedang'
    
    res3 = classify_rainfall(120)
    assert res3['label'] == 'Sangat Lebat'
