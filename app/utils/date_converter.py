from datetime import datetime, timedelta

def doy_to_date(year: int, doy: int) -> dict:
    """
    Convert Year and Day of Year (DOY) to a standard datetime and human-readable format.
    """
    # 1st Jan of the year
    start_date = datetime(year, 1, 1)
    # Add (doy - 1) days
    target_date = start_date + timedelta(days=doy - 1)
    
    months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
              'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
              
    human_readable = f"{target_date.day} {months[target_date.month - 1]} {year}"
    
    return {
        "iso": target_date.strftime("%Y-%m-%d"),
        "human_readable": human_readable
    }
