def classify_rainfall(r: float) -> dict:
    """
    Classify rainfall intensity based on BMKG standards.
    """
    if r <= 20:
        return {'label': 'Ringan', 'cls': 'badge-ringan'}
    if r <= 50:
        return {'label': 'Sedang', 'cls': 'badge-sedang'}
    if r <= 100:
        return {'label': 'Lebat', 'cls': 'badge-lebat'}
    return {'label': 'Sangat Lebat', 'cls': 'badge-sangat'}
