// Rutas de los CSV
const csvPosPath = "data/pos.csv";
const csvQuatPath = "data/quat.csv";

// IDs de las tarjetas
const scoreGeneralEl = document.querySelector("#score-general .score-value");
const scoreSuperiorEl = document.querySelector("#score-superior .score-value");
const scoreInferiorEl = document.querySelector("#score-inferior .score-value");
const scoreGeneralMethod = document.querySelector("#score-general .score-method");
const scoreSuperiorMethod = document.querySelector("#score-superior .score-method");
const scoreInferiorMethod = document.querySelector("#score-inferior .score-method");

const recomendacionesContainer = document.getElementById("recomendaciones-container");
const tablaDatosContainer = document.getElementById("tabla-datos");
// Datos de ejemplo: reemplaza con tus rutas y datos reales
// Datos de ejemplo: reemplaza con tus rutas reales
const fotosData = [
    {bodyPart: "Pelvis", src: "fotos/pelvis.jpg", info: "Información Pelvis"},
    {bodyPart: "L5", src: "fotos/l5.jpg", info: "Información L5"},
    {bodyPart: "T8", src: "fotos/t8.jpg", info: "Información T8"},
    {bodyPart: "Head", src: "fotos/head.jpg", info: "Información Head"},
    // Agrega más fotos para cada parte
];

const galleryContainer = document.getElementById("gallery-container");
const bodyPartFilter = document.getElementById("body-part-filter");

function displayPhotos() {
    const selectedPart = bodyPartFilter.value;
    
    // Filtrado
    const filtered = fotosData.filter(foto => selectedPart === "all" || foto.bodyPart === selectedPart);

    // Limpiar contenedor
    galleryContainer.innerHTML = "";

    // Mostrar fotos filtradas
    filtered.forEach(foto => {
        const div = document.createElement("div");
        div.classList.add("gallery-item");
        div.innerHTML = `
            <img src="${foto.src}" alt="${foto.bodyPart}">
            <p>${foto.info}</p>
        `;
        galleryContainer.appendChild(div);
    });
}

// Detectar cambios en el filtro
bodyPartFilter.addEventListener("change", displayPhotos);

// Mostrar todas al cargar
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
        thead.appendChild(th);
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
    const ultimoRow = posData.rows[posData.rows.length-1]; // suponer que la última fila contiene scores finales
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

// Inicializar
init();
