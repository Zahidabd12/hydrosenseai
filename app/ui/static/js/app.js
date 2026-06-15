// --- GLOBAL CONFIGURATION ---
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = '#94a3b8';

// --- DATA STRUCTURE (Based on User's Combined Excel File) ---
const GRID_LATS = [-6.0, -6.5, -7.0, -7.5, -8.0]; // Utara ke Selatan
const GRID_LONS = [111.25, 111.875, 112.50];     // Barat ke Timur

// Koordinat fiktif yang mendekati realitas dataset untuk tab Tren
const LOCATIONS = [
  { name: 'Grid Utara (Laut Jawa)', lat: -6.0, lon: 112.50 },
  { name: 'Gresik / Lamongan', lat: -7.0, lon: 112.50 },
  { name: 'Sidoarjo / Surabaya', lat: -7.5, lon: 112.50 },
  { name: 'Madiun / Ngawi', lat: -7.5, lon: 111.25 },
  { name: 'Malang Selatan', lat: -8.0, lon: 112.50 },
  { name: 'Pacitan', lat: -8.0, lon: 111.25 }
];

let activePage = 'heatmap';
let aggMode = 'bulanan';
let selectedCoord = 2; // Default Sidoarjo/Surabaya
let chartTren, chartPrediksi, chartXAI, chartKlas, chartKlasBulan, chartAnomali;
let isDark = false;

// Variables for Radar Animation
let radarInterval;
let isPlayingRadar = false;
let currentRadarDay = 0; // Simulate 30 days of March 2026

// Function to generate pseudo-realistic rainfall data based on the coordinate and day
function getRainfallValue(lat, lon, dayIndex) {
  // Base calculation utilizing lat/lon positioning and day sequence to create realistic patterns
  const latFactor = (lat + 6.0) * -5; // Semakin selatan (nilai - besar), semakin basah
  const lonFactor = (lon - 111.25) * 8; 
  const timeWave = Math.sin(dayIndex * 0.4) * 15;
  const noise = Math.random() * 8;
  
  // Create storm clusters that move over time
  const stormX = 111.25 + Math.abs(Math.sin(dayIndex * 0.2)) * 1.5;
  const stormY = -8.0 + Math.abs(Math.cos(dayIndex * 0.2)) * 2.0;
  const dist = Math.sqrt(Math.pow(lat - stormY, 2) + Math.pow(lon - stormX, 2));
  const stormEffect = dist < 0.8 ? (0.8 - dist) * 50 : 0;

  const rawVal = 10 + latFactor + lonFactor + timeWave + stormEffect + noise;
  return Math.max(0, Math.min(rawVal, 100)); // Cap between 0 and 100
}

function rainColor(v) {
  if (v < 2) return isDark ? '#1e293b' : '#f8fafc'; // No rain
  if (v < 10) return '#bae6fd'; // Sangat ringan
  if (v < 20) return '#3b82f6'; // Ringan
  if (v < 40) return '#4338ca'; // Sedang-Lebat
  return '#312e81'; // Ekstrem
}

function rainTextColor(v) {
  return v < 10 ? (isDark ? '#e2e8f0' : '#1e293b') : '#ffffff';
}

function classify(r) {
  if (r <= 20) return { label: 'Ringan', cls: 'badge-ringan' };
  if (r <= 50) return { label: 'Sedang', cls: 'badge-sedang' };
  if (r <= 100) return { label: 'Lebat', cls: 'badge-lebat' };
  return { label: 'Sangat Lebat', cls: 'badge-sangat' };
}

// --- UI THEME ---
function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  isDark = document.body.classList.contains('dark-theme');
  document.getElementById('themeBtn').textContent = isDark ? '☀️' : '🌙';
  
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  [chartTren, chartPrediksi, chartKlasBulan, chartAnomali].forEach(chart => {
    if(chart) { chart.options.scales.y.grid.color = gridColor; chart.update(); }
  });
  if(activePage === 'heatmap') renderHeatmapFrame();
}

function gotoPage(id, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  el.classList.add('active');
  activePage = id;
  
  const titles = { heatmap: 'Peta Radar Spasial — Area Observasi', tren: 'Dinamika Tren Historis NASA POWER', prediksi: 'Mesin Prediksi & XAI (Explainable AI)', intensitas: 'Evaluasi Klasifikasi BMKG', peringatan: 'Sistem Peringatan Dini Bencana', konversi: 'Utilitas Ekstraksi Tanggal' };
  document.getElementById('pageTitle').textContent = titles[id];
  
  setTimeout(() => {
    if(id === 'heatmap') renderHeatmapFrame();
    else if(id === 'tren') initTren();
    else if(id === 'prediksi') runModel();
    else if(id === 'intensitas') initIntensitas();
    else if(id === 'peringatan') renderPeringatan();
    else if(id === 'konversi') initKonversi();
  }, 50);
}

// --- 1. RADAR HEATMAP (DYNAMIC GRID) ---
function renderHeatmapFrame() {
  const container = document.getElementById('gridContainer');
  container.innerHTML = '';
  let maxVal = 0; let totalVal = 0; let riskCount = 0;

  // Add column headers (Longitudes)
  const headerRow = document.createElement('div');
  headerRow.className = 'hmap-col-headers';
  GRID_LONS.forEach(lon => {
    headerRow.innerHTML += `<div class="hmap-col-header">${lon.toFixed(3)}</div>`;
  });
  container.appendChild(headerRow);

  // Add Rows (Latitudes)
  GRID_LATS.forEach(lat => {
    const row = document.createElement('div');
    row.className = 'heatmap-row';
    
    // Y-Axis label
    row.innerHTML += `<div class="hmap-axis">${lat.toFixed(1)}</div>`;
    
    // Cells
    GRID_LONS.forEach(lon => {
      const v = Math.round(getRainfallValue(lat, lon, currentRadarDay) * 10) / 10;
      maxVal = Math.max(maxVal, v);
      totalVal += v;
      if (v > 30) riskCount++;

      const cell = document.createElement('div');
      cell.className = 'hmap-cell';
      cell.style.background = rainColor(v);
      cell.style.color = rainTextColor(v);
      cell.textContent = v < 1 ? '-' : v.toFixed(1);
      
      // Interaction
      cell.onclick = () => {
        const cl = classify(v);
        const wbox = document.getElementById('warnBoxHeatmap');
        wbox.className = 'warn-box ' + (v > 50 ? 'danger' : v > 20 ? 'warning' : 'info');
        wbox.innerHTML = `<span class="warn-icon">📍</span><div>Fokus Area Koordinat <strong>Lat: ${lat}, Lon: ${lon}</strong> — Estimasi Curah Hujan: <strong>${v} mm</strong> <span class="badge ${cl.cls}" style="margin-left:8px">${cl.label}</span></div>`;
      };
      
      row.appendChild(cell);
    });
    container.appendChild(row);
  });

  document.getElementById('hmMax').textContent = maxVal.toFixed(1) + ' mm';
  document.getElementById('hmAvg').textContent = (totalVal / 15).toFixed(1) + ' mm';
  document.getElementById('hmRisk').textContent = riskCount;
  
  const d = new Date(2026, 2, currentRadarDay + 1); // March 2026
  document.getElementById('radarDateLabel').textContent = `${d.getDate()} Maret 2026`;
}

function toggleRadar() {
  const btn = document.getElementById('btnPlayRadar');
  if(isPlayingRadar) {
    clearInterval(radarInterval);
    isPlayingRadar = false;
    btn.innerHTML = '▶ Play Radar Animasi';
    btn.classList.remove('radar-active');
  } else {
    isPlayingRadar = true;
    btn.innerHTML = '⏸ Jeda Radar';
    btn.classList.add('radar-active');
    radarInterval = setInterval(() => {
      currentRadarDay = (currentRadarDay + 1) % 31; // 31 days in March
      renderHeatmapFrame();
    }, 600); // 0.6 second per frame
  }
}

// --- 2. TREN HISTORIS ---
function initTren() {
  const cg = document.getElementById('coordGrid');
  cg.innerHTML = LOCATIONS.map((c, i) => `<div class="coord-cell ${i === selectedCoord ? 'selected' : ''}" onclick="selectCoord(${i})"><div class="coord-name">${c.name}</div><div class="coord-lat">${c.lat}, ${c.lon}</div></div>`).join('');
  renderTrenChart();
}
function selectCoord(i) { selectedCoord = i; initTren(); }
function setAgg(mode, el) { aggMode = mode; document.querySelectorAll('#page-tren .tab').forEach(t => t.classList.remove('active')); el.classList.add('active'); renderTrenChart(); }

function renderTrenChart() {
  const loc = LOCATIONS[selectedCoord];
  let labels = [], data = [];
  
  if (aggMode === 'bulanan') {
    labels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    // Mock realistic monthly averages based on Indonesian climate (Wet in Jan-Feb, Dry in Jul-Aug)
    const baseRain = loc.lat < -7.0 ? 300 : 200; // Selatan lebih basah
    data = [baseRain+50, baseRain, baseRain-80, baseRain-120, 100, 50, 30, 20, 40, 120, baseRain-20, baseRain+20];
    document.getElementById('trenAvg').textContent = (data.reduce((a,b)=>a+b,0)/12).toFixed(1) + ' mm/bln';
    document.getElementById('trenPeriode').textContent = `Agregat Bulanan Rata-rata`;
  } else {
    labels = ['2020', '2021', '2022', '2023', '2024', '2025'];
    // La Nina in 2021/2022 (higher), El Nino in 2023 (lower)
    const baseYr = loc.lat < -7.0 ? 2500 : 1800;
    data = [baseYr, baseYr*1.2, baseYr*1.15, baseYr*0.7, baseYr*0.9, baseYr];
    document.getElementById('trenAvg').textContent = (data.reduce((a,b)=>a+b,0)/6).toFixed(0) + ' mm/thn';
    document.getElementById('trenPeriode').textContent = `Total Curah Hujan Tahunan`;
  }

  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  if (chartTren) chartTren.destroy();
  chartTren = new Chart(document.getElementById('chartTren'), {
    type: 'line',
    data: { labels, datasets: [{ data, borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.1)', borderWidth: 3, pointRadius: 5, pointBackgroundColor: '#ffffff', pointBorderColor: '#2563eb', fill: true, tension: 0.4 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: gridColor }, beginAtZero: true }, x: { grid: { display: false } } } }
  });
}

// --- 3. PREDIKSI ML & XAI ---
function runModel() {
  const suhu = parseFloat(document.getElementById('pSuhu').value);
  const lembap = parseFloat(document.getElementById('pLembap').value);
  const angin = parseFloat(document.getElementById('pAngin').value);
  const tekanan = parseFloat(document.getElementById('pTekanan').value);
  const periode = parseInt(document.getElementById('pPeriode').value);
  const algo = document.getElementById('pAlgo').value;

  document.getElementById('pSuhuVal').textContent = suhu.toFixed(1) + ' °C';
  document.getElementById('pLembapVal').textContent = lembap.toFixed(0) + '%';
  document.getElementById('pAnginVal').textContent = angin.toFixed(1) + ' m/s';
  document.getElementById('pTekananVal').textContent = tekanan.toFixed(0) + ' hPa';

  let R = 0; let acc = 0; let featImp = [0,0,0,0]; // Suhu, Lembap, Angin, Tekanan
  
  if (algo === 'ensemble') {
    R = Math.max(0, (lembap-55)*1.2 + (33-suhu)*1.8 + (angin*1.2) - (tekanan-1002)*0.3);
    acc = 0.94; featImp = [25, 55, 12, 8];
  } else if (algo === 'xgb') {
    R = Math.max(0, (lembap-60)*1.5 + Math.pow(34-suhu, 2)*0.5 + angin*1.5);
    acc = 0.91; featImp = [20, 65, 10, 5];
  } else { // LSTM
    R = Math.max(0, (lembap-50)*0.8 + (34-suhu)*2.0 + angin*0.8);
    acc = 0.88; featImp = [35, 45, 15, 5];
  }
  
  R = Math.round(R * 10) / 10;
  const margin = R * (1 - acc) * 2; // Lebar confidence interval

  document.getElementById('predVal').textContent = R.toFixed(1);
  document.getElementById('predLow').textContent = Math.max(0, R - margin).toFixed(1) + ' mm';
  document.getElementById('predHigh').textContent = (R + margin).toFixed(1) + ' mm';
  document.getElementById('predAcc').textContent = (acc * 100).toFixed(1) + '%';

  const cl = classify(R);
  document.getElementById('predBadge').innerHTML = `<span class="badge ${cl.cls}" style="font-size:14px; padding:8px 20px; border-radius:8px;">${cl.label}</span>`;

  // XAI Chart (Horizontal Bar)
  if (chartXAI) chartXAI.destroy();
  chartXAI = new Chart(document.getElementById('chartXAI'), {
    type: 'bar',
    data: {
      labels: ['Kelembapan', 'Suhu Udara', 'Kec. Angin', 'Tekanan Atm'],
      datasets: [{
        data: [featImp[1], featImp[0], featImp[2], featImp[3]],
        backgroundColor: ['#2563eb', '#e11d48', '#059669', '#8b5cf6'],
        borderRadius: 4, barThickness: 14
      }]
    },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` Kontribusi: ${c.raw}%` } } }, scales: { x: { display: false, max: 100 }, y: { grid: { display: false }, ticks: { font: { weight: '600' } } } } }
  });

  // Prediksi Chart
  const labels = Array.from({length: periode}, (_, i) => `H+${i+1}`);
  const pData = labels.map((_, i) => Math.max(0, Math.round((R * (0.8 + Math.sin(i*0.8)*0.4 + Math.random()*0.2)) * 10) / 10));
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  if (chartPrediksi) chartPrediksi.destroy();
  chartPrediksi = new Chart(document.getElementById('chartPrediksi'), {
    type: 'bar',
    data: { 
      labels, 
      datasets: [
        { label: 'Prediksi (mm)', data: pData, backgroundColor: pData.map(v => v > 100 ? '#7c3aed' : v > 50 ? '#e11d48' : v > 20 ? '#d97706' : '#2563eb'), borderRadius: 6 },
        { label: 'Batas Lebat (50mm)', data: Array(periode).fill(50), type: 'line', borderColor: '#e11d48', borderDash: [6, 6], borderWidth: 2, pointRadius: 0 }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: gridColor } }, x: { grid: { display: false } } } }
  });
}

// --- 4. KLASIFIKASI PAGE ---
function initIntensitas() {
  if (chartKlas) chartKlas.destroy();
  chartKlas = new Chart(document.getElementById('chartKlas'), {
    type: 'doughnut',
    data: { labels: ['Ringan', 'Sedang', 'Lebat', 'Sangat Lebat'], datasets: [{ data: [1845, 620, 210, 45], backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'], borderWidth: 0, hoverOffset: 8 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'right', labels: { usePointStyle: true, padding: 20, font: {family: "'Inter', sans-serif"} } } } }
  });

  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  if (chartKlasBulan) chartKlasBulan.destroy();
  chartKlasBulan = new Chart(document.getElementById('chartKlasBulan'), {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
      datasets: [
        { label: 'Ringan', data: [12, 10, 15, 20, 25, 28, 30, 29, 25, 18, 15, 12], backgroundColor: '#10b981', borderRadius: 2 },
        { label: 'Sedang', data: [10, 12, 10, 8, 5, 2, 1, 2, 4, 8, 10, 12], backgroundColor: '#f59e0b', borderRadius: 2 },
        { label: 'Lebat', data: [6, 5, 4, 2, 1, 0, 0, 0, 1, 3, 4, 5], backgroundColor: '#ef4444', borderRadius: 2 },
        { label: 'Sangat Lebat', data: [3, 1, 2, 0, 0, 0, 0, 0, 0, 2, 1, 2], backgroundColor: '#8b5cf6', borderRadius: 2 }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, grid: { color: gridColor } } } }
  });
}

// --- 5. PERINGATAN PAGE ---
function renderPeringatan() { updateThreshold(); }
function updateThreshold() {
  const banjir = parseInt(document.getElementById('thBanjir').value);
  const longsor = parseInt(document.getElementById('thLongsor').value);
  const waspada = parseInt(document.getElementById('thWaspada').value);

  document.getElementById('thBanjirVal').textContent = banjir + ' mm';
  document.getElementById('thLongsorVal').textContent = longsor + ' mm';
  document.getElementById('thWaspadaVal').textContent = waspada + ' mm';

  // Simulasi nilai prediksi real-time untuk grid
  const predData = [24, 88, 120, 45, 15, 62]; 
  let html = '', maxVal = 0;
  
  LOCATIONS.forEach((c, i) => {
    const v = predData[i % predData.length];
    maxVal = Math.max(maxVal, v);
    let status = 'Aman Terkendali', cls = 'badge-ringan';
    if (v > banjir) { status = 'BAHAYA BANJIR'; cls = 'badge-lebat'; }
    else if (v > longsor) { status = 'POTENSI LONGSOR'; cls = 'badge-sedang'; }
    else if (v > waspada) { status = 'SIAGA'; cls = 'badge-info'; }
    
    html += `<div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--border);">
      <div><div style="font-weight:700; font-size:14px; margin-bottom:2px;">${c.name}</div><div style="font-size:12px; color:var(--text3); font-family:var(--mono);">${c.lat}, ${c.lon}</div></div>
      <div style="text-align:right;"><div style="font-family:var(--mono); font-weight:700; font-size:16px; margin-bottom:6px; color:var(--text1);">${v} mm</div><span class="badge ${cls}">${status}</span></div>
    </div>`;
  });
  
  document.getElementById('statusList').innerHTML = html;
  
  const ma = document.getElementById('mainAlert');
  if (maxVal > banjir) ma.innerHTML = `<div class="warn-box danger"><span class="warn-icon">🚨</span><div><strong>TINDAKAN DARURAT DIPERLUKAN!</strong> Inferensi mesin mendeteksi presipitasi melampaui ambang batas banjir kritis (${banjir} mm). Segera teruskan data ke BNPB.</div></div>`;
  else if (maxVal > waspada) ma.innerHTML = `<div class="warn-box warning"><span class="warn-icon">⚠</span><div><strong>STATUS KUNING.</strong> Anomali terdeteksi di atas ambang waspada. Siagakan instrumen observasi darat.</div></div>`;
  else ma.innerHTML = `<div class="warn-box ok"><span class="warn-icon">✓</span><div><strong>SISTEM STABIL.</strong> Seluruh metrik grid berada di bawah ambang mitigasi yang ditentukan.</div></div>`;

  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  if (chartAnomali) chartAnomali.destroy();
  const hist = Array.from({length: 30}, (_, i) => Math.round(15 + Math.sin(i*0.4)*10 + Math.random()*8));
  const pred = Array.from({length: 30}, (_, i) => Math.round(hist[i] + (i>20 ? i*3 : Math.random()*5)));
  
  chartAnomali = new Chart(document.getElementById('chartAnomali'), {
    type: 'line',
    data: {
      labels: Array.from({length: 30}, (_, i) => `Mar ${i+1}`),
      datasets: [
        { label: 'Baseline (Mean Historis)', data: hist, borderColor: '#94a3b8', borderWidth: 2, pointRadius: 0, tension: 0.4 },
        { label: 'Prediksi ML', data: pred, borderColor: '#2563eb', borderWidth: 3, pointRadius: 4, pointBackgroundColor: pred.map(v => v > banjir ? '#e11d48' : '#fff'), pointBorderColor: '#2563eb', tension: 0.4 },
        { label: 'Threshold Kritis', data: Array(30).fill(banjir), borderColor: '#e11d48', borderDash: [6, 6], borderWidth: 2, pointRadius: 0 }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: gridColor } }, x: { grid: { display: false }, ticks: { maxTicksLimit: 15 } } } }
  });
}

// --- 6. KONVERSI PAGE (DATA UTILITY) ---
let batchData = [];
function initKonversi() { runConv(); renderBatchTable(); }

function runConv() {
  const year = parseInt(document.getElementById('convYear').value) || 2026;
  const doy = parseInt(document.getElementById('convDoy').value) || 1;
  const d = new Date(year, 0, doy);
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  document.getElementById('convResult').innerHTML = `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
      <div><div style="font-size:12px; color:var(--text3); margin-bottom:6px; font-weight:600;">Standard Datetime (ISO 8601)</div><div style="font-size:24px; font-weight:700; font-family:var(--mono); color:var(--accent);">${d.toISOString().slice(0,10)}</div></div>
      <div><div style="font-size:12px; color:var(--text3); margin-bottom:6px; font-weight:600;">Human Readable (ID)</div><div style="font-size:20px; font-weight:700; color:var(--text1);">${d.getDate()} ${months[d.getMonth()]} ${year}</div></div>
    </div>`;
  
  document.getElementById('convCode').innerHTML = `<span style="color:#a5b4fc">import</span> pandas <span style="color:#a5b4fc">as</span> pd\n\n<span style="color:#6ee7b7"># Script konversi DOY (Day of Year) ke Datetime untuk preprocessing Time-Series</span>\ndf[<span style="color:#fcd34d">'Date'</span>] = pd.to_datetime(\n  df[<span style="color:#fcd34d">'YEAR'</span>].astype(str) + <span style="color:#fcd34d">'-'</span> + df[<span style="color:#fcd34d">'DOY'</span>].astype(str),\n  format=<span style="color:#fcd34d">'%Y-%j'</span>\n)`;
}

function renderBatchTable() {
  batchData = [];
  let currentDoy = 1;
  for(let m=0; m<20; m++){
    const d = new Date(2026, 0, currentDoy);
    const dateStr = d.toISOString().slice(0,10) + ' 00:00:00';
    
    // Simulate rows for the specific LAT/LON grid from the provided file
    GRID_LATS.forEach(lat => {
      GRID_LONS.forEach(lon => {
        // Just take a subset so table isn't massively long initially
        if(lat === -7.5 && Math.random() > 0.5) {
          batchData.push({ date: dateStr, lat: lat, lon: lon, prec: (Math.random() * 25).toFixed(2) });
        }
      });
    });
    currentDoy += 5;
  }
  document.getElementById('batchBody').innerHTML = batchData.map(r => `<tr style="border-bottom:1px solid var(--border); transition: background 0.2s;"><td style="padding:14px 16px; font-family:var(--mono); color:var(--accent); font-weight:600;">${r.date}</td><td style="padding:14px 16px; font-family:var(--mono)">${r.lat.toFixed(1)}</td><td style="padding:14px 16px; font-family:var(--mono)">${r.lon.toFixed(3)}</td><td style="padding:14px 16px; text-align:right; font-family:var(--mono); font-weight:700; color:var(--text1);">${r.prec}</td></tr>`).join('');
}

function exportCSV() {
  if (!batchData.length) return;
  const headers = ['Date', 'LAT', 'LON', 'PRECTOTCORR'];
  const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + '\n' + batchData.map(e => `${e.date},${e.lat},${e.lon},${e.prec}`).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "combined_precipitation_data_extract.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Init
setTimeout(() => { gotoPage('heatmap', document.querySelector('.nav-item.active')); }, 100);