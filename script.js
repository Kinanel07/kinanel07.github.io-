const scoresContainer = document.getElementById("scores-partes");
const galleryContainer = document.getElementById("gallery-container");
const bodyPartFilter = document.getElementById("body-part-filter");
const methodFilter = document.getElementById("method-filter");

// Fotos: asegúrate que estén en la misma carpeta que HTML
const fotosData = [
    {bodyPart: "Pelvis", method: "REBA", src: "pelvis_reba.jpeg", info: "Pelvis REBA"},
    {bodyPart: "Pelvis", method: "RULA", src: "pelvis_rula.jpeg", info: "Pelvis RULA"},
    {bodyPart: "L5", method: "REBA", src: "l5_reba.jpeg", info: "L5 REBA"},
    {bodyPart: "L5", method: "RULA", src: "l5_rula.jpeg", info: "L5 RULA"},
    {bodyPart: "T8", method: "REBA", src: "upper_reba.jpeg", info: "T8 REBA"},
];

// Mostrar fotos
function displayPhotos() {
    const selectedPart = bodyPartFilter.value;
    const selectedMethod = methodFilter.value;

    const filtered = fotosData.filter(foto =>
        (selectedPart === "all" || foto.bodyPart === selectedPart) &&
        (selectedMethod === "all" || foto.method === selectedMethod)
    );

    galleryContainer.innerHTML = "";
    if (filtered.length === 0) {
        galleryContainer.innerHTML = "<p>No hay fotos para esta selección.</p>";
        return;
    }

    filtered.forEach(foto => {
        const div = document.createElement("div");
        div.classList.add("gallery-item");
        div.innerHTML = `
            <img src="${foto.src}" alt="${foto.bodyPart}" style="width:200px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.3);">
            <p>${foto.info}</p>
        `;
        galleryContainer.appendChild(div);
    });
}

bodyPartFilter.addEventListener("change", displayPhotos);
methodFilter.addEventListener("change", displayPhotos);
displayPhotos();

// Función para leer CSV
async function loadCSV(path) {
    const res = await fetch(path);
    const text = await res.text();
    const lines = text.split("\n").filter(l => l.trim() !== "");
    const headers = lines[0].split(",");
    const rows = lines.slice(1).map(line => {
        const values = line.split(",");
        const obj = {};
        headers.forEach((h,i) => obj[h.trim()] = values[i].trim());
        return obj;
    });
    return { headers, rows };
}

// Color según puntaje (0-3)
function getScoreColor(score) {
    score = parseFloat(score);
    if(score >= 3) return "#ff3b30";
    if(score >= 2) return "#ffcc00";
    return "#34c759";
}

// Mostrar scores por parte y promedio general
function mostrarScoresPartes(rows) {
    scoresContainer.innerHTML = "";
    let totalREBA = 0, totalRULA = 0, count = 0;

    rows.forEach(row => {
        const part = row["Parte"];
        const reba = parseFloat(row["REBA"]) || 0;
        const rula = parseFloat(row["RULA"]) || 0;
        const promedio = ((reba+rula)/2).toFixed(1);

        totalREBA += reba;
        totalRULA += rula;
        count++;

        const div = document.createElement("div");
        div.classList.add("score-part");
        div.innerHTML = `
            <h4>${part}</h4>
            <p>REBA: <span style="color:${getScoreColor(reba)}">${reba}</span></p>
            <p>RULA: <span style="color:${getScoreColor(rula)}">${rula}</span></p>
            <p>Promedio: <span style="color:${getScoreColor(promedio)}">${promedio}</span></p>
        `;
        scoresContainer.appendChild(div);
    });

    const promedioGeneral = ((totalREBA + totalRULA)/(2*count)).toFixed(1);
    const divProm = document.createElement("div");
    divProm.classList.add("score-general-part");
    divProm.innerHTML = `<h3>Promedio General REBA/RULA: <span style="color:${getScoreColor(promedioGeneral)}">${promedioGeneral}</span></h3>`;
    scoresContainer.prepend(divProm);
}

// Inicializar todo
async function init() {
    const data = await loadCSV("RESULTADOS_PUNTAJES-4.csv");
    mostrarScoresPartes(data.rows);
}

init();
