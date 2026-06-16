def get_feature_importance(feat_imp: list) -> dict:
    """
    Returns feature importance mapping for XAI.
    feat_imp: [suhu, lembap, angin, tekanan]
    """
    return {
        "suhu": feat_imp[0],
        "lembap": feat_imp[1],
        "angin": feat_imp[2],
        "tekanan": feat_imp[3]
    }
