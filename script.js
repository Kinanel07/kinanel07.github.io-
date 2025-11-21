// Rutas de los CSV
// Cargar CSV con puntajes por parte
const resultadosData = await loadCSV("RESULTADOS_PUNTAJES-4.csv");


// Mostrar scores por parte

// IDs de las tarjetas
const scoreGeneralEl = document.querySelector("#score-general .score-value");
const scoreSuperiorEl = document.querySelector("#score-superior .score-value");
const scoreInferiorEl = document.querySelector("#score-inferior .score-value");
const scoreGeneralMethod = document.querySelector("#score-general .score-method");
const scoreSuperiorMethod = document.querySelector("#score-superior .score-method");
const scoreInferiorMethod = document.querySelector("#score-inferior .score-method");

const recomendacionesContainer = document.getElementById("recomendaciones-container");
const tablaDatosContainer = document.getElementById("tabla-datos");

// Fotos con parte y método, ahora todos tienen la propiedad 'method'
const fotosData = [
    {bodyPart: "Pelvis", method: "REBA", src: "pelvis_reba.jpeg", info: "Información Pelvis REBA"},
    {bodyPart: "Pelvis", method: "RULA", src: "pelvis_rula.jpeg", info: "Información Pelvis RULA"},
    {bodyPart: "L5", method: "REBA", src: "l5_reba.jpeg", info: "Información L5 REBA"},
    {bodyPart: "L5", method: "RULA", src: "l5_rula.jpeg", info: "Información L5 RULA"},
    {bodyPart: "T8", method: "REBA", src: "upper_reba.jpeg", info: "Información Upperleg REBA"},
    // Agrega aquí todas tus fotos siguiendo el mismo formato
];

const galleryContainer = document.getElementById("gallery-container");
const bodyPartFilter = document.getElementById("body-part-filter");
const methodFilter = document.getElementById("method-filter");

function displayPhotos() {
    const selectedPart = bodyPartFilter.value;
    const selectedMethod = methodFilter.value;

    // Filtrar fotos según ambos filtros
    const filtered = fotosData.filter(foto =>
        (selectedPart === "all" || foto.bodyPart === selectedPart) &&
        (selectedMethod === "all" || foto.method === selectedMethod)
    );

    galleryContainer.innerHTML = "";

    filtered.forEach(foto => {
        const div = document.createElement("div");
        div.classList.add("gallery-item");
        div.innerHTML = `
            <img src="${foto.src}" alt="${foto.bodyPart}" style="width:200px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.3);">
            <p>${foto.info}</p>
        `;
        galleryContainer.appendChild(div);
    });

    // Si no hay fotos que mostrar
    if(filtered.length === 0){
        galleryContainer.innerHTML = "<p>No hay fotos disponibles para esta selección.</p>";
    }
}

// Inicializar filtros
bodyPartFilter.addEventListener("change", displayPhotos);
methodFilter.addEventListener("change", displayPhotos);

// Mostrar fotos al cargar la página
displayPhotos();

// Función para leer CSV
async function loadCSV(path) {
    const response = await fetch(path);
    const data = await response.text();
    const lines = data.split("\n").filter(line => line.trim() !== "");
    const headers = lines[0].split(",");
    const rows = lines.slice(1).map(line => {
        const values = line.split(",");
        const obj = {};
        headers.forEach((h,i) => {
            obj[h.trim()] = isNaN(values[i]) ? values[i].trim() : parseFloat(values[i]);
        });
        return obj;
    });
    return { headers, rows };
}

// Función para determinar color de score
function getScoreColor(score) {
    if(score >= 70) return "#ff3b30"; // rojo
    if(score >= 40) return "#ffcc00"; // amarillo
    return "#34c759"; // verde
}

// Función para generar recomendaciones básicas según score
function generarRecomendaciones(scores) {
    const recs = [];
    for(const [categoria, valor] of Object.entries(scores)){
        let metodo = "";
        if(categoria === "general") metodo = "RULA";
        if(categoria === "superior") metodo = "REBA";
        if(categoria === "inferior") metodo = "OCRA";

        let texto = "";
        if(valor >= 70) texto = `Riesgo alto en ${categoria} (${metodo}). Se recomienda ajustar postura inmediatamente.`;
        else if(valor >= 40) texto = `Riesgo medio en ${categoria} (${metodo}). Revisar postura y movimientos.`;
        else texto = `Riesgo bajo en ${categoria} (${metodo}). Postura aceptable.`;

        recs.push(texto);
    }
    return recs;
}

// Función para mostrar tabla de CSV
function mostrarTabla(headers, rows) {
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.fontSize = "0.9em";

    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    headers.forEach(h => {
        const th = document.createElement("th");
        th.textContent = h;
        th.style.padding = "8px";
        th.style.borderBottom = "1px solid #ccc";
        th.style.textAlign = "center";
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    rows.forEach(row => {
        const tr = document.createElement("tr");
        headers.forEach(h => {
            const td = document.createElement("td");
            td.textContent = row[h];
            td.style.padding = "6px";
            td.style.textAlign = "center";
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    tablaDatosContainer.innerHTML = "";
    tablaDatosContainer.appendChild(table);
}

// Función principal
async function init() {
    // Cargar CSV pos.csv
    const posData = await loadCSV(csvPosPath);

    // Tomamos los scores del CSV, ejemplo:
    const ultimoRow = posData.rows[posData.rows.length-1]; 
    const scores = {
        general: ultimoRow['score_general'] || 0,
        superior: ultimoRow['score_superior'] || 0,
        inferior: ultimoRow['score_inferior'] || 0
    };

    // Mostrar scores en las tarjetas
    scoreGeneralEl.textContent = scores.general.toFixed(1);
    scoreGeneralEl.style.color = getScoreColor(scores.general);
    scoreSuperiorEl.textContent = scores.superior.toFixed(1);
    scoreSuperiorEl.style.color = getScoreColor(scores.superior);
    scoreInferiorEl.textContent = scores.inferior.toFixed(1);
    scoreInferiorEl.style.color = getScoreColor(scores.inferior);

    scoreGeneralMethod.textContent = "Método: RULA";
    scoreSuperiorMethod.textContent = "Método: REBA";
    scoreInferiorMethod.textContent = "Método: OCRA";

    // Generar recomendaciones
    const recomendaciones = generarRecomendaciones(scores);
    recomendacionesContainer.innerHTML = "";
    recomendaciones.forEach(r => {
        const p = document.createElement("p");
        p.textContent = r;
        p.style.marginBottom = "10px";
        recomendacionesContainer.appendChild(p);
    });

    // Mostrar tabla de datos
    mostrarTabla(posData.headers, posData.rows);
}

// Lista de partes a mostrar
const bodyParts = [
    "Pelvis", "L5", "L3", "T12", "T8", "Neck",
    "Right Shoulder", "Left Shoulder", "Right Upper Arm", "Left Upper Arm",
    "Right Forearm", "Left Forearm", "Right Lower Leg", "Left Lower Leg",
    "Right Foot", "Left Foot", "Right Hand", "Left Hand"
];

// Contenedor de scores por parte
const scoresContainer = document.getElementById("scores-partes");

function mostrarScoresPartes(rows) {
    scoresContainer.innerHTML = ""; // limpiar contenedor

    let totalReba = 0;
    let totalRula = 0;
    let count = 0;

    rows.forEach(row => {
        const part = row["Parte"];
        const rebaScore = parseFloat(row["REBA"]) || 0;
        const rulaScore = parseFloat(row["RULA"]) || 0;
        const promedio = ((rebaScore + rulaScore) / 2).toFixed(1);

        totalReba += rebaScore;
        totalRula += rulaScore;
        count++;

        const div = document.createElement("div");
        div.classList.add("score-part");

        div.innerHTML = `
            <h4>${part}</h4>
            <p>REBA: <span style="color:${getScoreColor(rebaScore)}">${rebaScore}</span></p>
            <p>RULA: <span style="color:${getScoreColor(rulaScore)}">${rulaScore}</span></p>
            <p>Promedio: <span style="color:${getScoreColor(promedio)}">${promedio}</span></p>
        `;

        scoresContainer.appendChild(div);
    });

    // Mostrar promedio general al inicio
    const promedioGeneral = ((totalReba + totalRula) / (2 * count)).toFixed(1);
    const divPromedio = document.createElement("div");
    divPromedio.classList.add("score-general-part");
    divPromedio.innerHTML = `<h3>Promedio General REBA/RULA: <span style="color:${getScoreColor(promedioGeneral)}">${promedioGeneral}</span></h3>`;
    
    scoresContainer.prepend(divPromedio);
}

// Mostrar scores por parte
mostrarScoresPartes(resultadosData.rows);

// Inicializar todo
init();
