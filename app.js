// ─── Bloque 1: Referencias a elementos del HTML ─────────────────────────────
const inputInicio  = document.getElementById("inputInicio");   // campo de texto: nodo de inicio
const inputDestino = document.getElementById("inputDestino");  // campo de texto: nodo destino
const btnCalcular   = document.getElementById("btnCalcular");  // botón que dispara Dijkstra
const btnReiniciar  = document.getElementById("btnReiniciar"); // botón que borra todo el grafo
const textoCamino   = document.getElementById("textoCamino");  // párrafo donde se muestra el resultado

const modal          = document.getElementById("modalPeso");     // caja emergente para pedir el peso
const modalLabel     = document.getElementById("modalLabel");    // muestra "A → B" dentro del modal
const modalInput     = document.getElementById("modalInput");    // input donde se escribe el peso
const modalConfirmar = document.getElementById("modalConfirmar");// botón "Confirmar" del modal
const modalCancelar  = document.getElementById("modalCancelar"); // botón "Cancelar" del modal

// ─── Bloque 2: Creación del grafo con Cytoscape ─────────────────────────────
// "preset" hace que cada nodo se quede exactamente donde hicimos clic,
// en vez de que Cytoscape reacomode el grafo automáticamente.
const cy = cytoscape({
  container: document.getElementById("cy"), // div donde se dibuja el grafo
  layout: { name: "preset" }, // respeta la posición donde el usuario hizo clic
  style: [
    { selector: "node", style: { // apariencia normal de un nodo
        "background-color": "#4f9bf0", // color de relleno del círculo
        "border-color": "#1b2a4a",
        "border-width": 2,
        label: "data(id)", // muestra el nombre del nodo (A, B, C...) como etiqueta
        color: "white",
        "font-weight": "bold",
        "text-valign": "center", // centra el texto verticalmente dentro del nodo
        "text-halign": "center", // centra el texto horizontalmente dentro del nodo
    }},
    { selector: "node.seleccionado", style: { "background-color": "#e07b00", "border-color": "#7a4200", "border-width": 3 }}, // nodo elegido para formar una arista
    { selector: "node.resaltado", style: { "background-color": "#2e9e5b" }}, // nodo que forma parte del camino más corto
    { selector: "edge", style: { // apariencia normal de una arista
        "curve-style": "straight", // línea recta entre nodos
        "line-color": "#9aa4b5",
        width: 2,
        label: "data(peso)", // muestra el peso de la arista como etiqueta
        "font-size": 12,
        "font-weight": "bold",
        color: "#1b2a4a",
        "text-background-color": "#f4f6fa", // fondo detrás del número para que se lea mejor
        "text-background-opacity": 1,
    }},
    { selector: "edge.resaltado", style: { "line-color": "#2e9e5b", width: 4 }}, // arista que forma parte del camino más corto
  ],
});

// ─── Bloque 3: Estado de interacción y generador de nombres de nodo ────────
// contadorNodos avanza cada vez que se crea un nodo (0→A, 1→B, ..., 26→AA, ...).
// nodoSeleccionado guarda el primer nodo elegido al armar una arista.
let contadorNodos = 0;      // cuenta cuántos nodos se han creado, para generar el siguiente nombre
let nodoSeleccionado = null; // guarda el id del primer nodo clicado al crear una arista

// Convierte un número (0, 1, 2...) en un nombre de nodo tipo Excel (A, B, ..., Z, AA, AB...)
function nombreNodo(n) {
  let nombre = "";
  n++;
  while (n > 0) {
    n--;
    nombre = String.fromCharCode(65 + (n % 26)) + nombre; // 65 = código ASCII de la letra "A"
    n = Math.floor(n / 26);
  }
  return nombre;
}

// ─── Bloque 4: Clic en área vacía → crear nodo ──────────────────────────────
cy.on("tap", (evt) => {
  if (evt.target !== cy) return; // solo si el clic fue en el fondo, no en un nodo/arista
  const nombre = nombreNodo(contadorNodos++); // genera el siguiente nombre disponible
  cy.add({ group: "nodes", data: { id: nombre }, position: evt.position }); // crea el nodo justo donde se hizo clic
});

// ─── Bloque 5: Clic en nodo → seleccionar o conectar con otro nodo ─────────
cy.on("tap", "node", (evt) => {
  const nodo = evt.target; // nodo sobre el que se hizo clic

  if (nodoSeleccionado === null) {
    // Primer clic: solo se marca el nodo como seleccionado
    nodoSeleccionado = nodo.id();
    nodo.addClass("seleccionado"); // lo pinta de naranja
  } else if (nodoSeleccionado === nodo.id()) {
    // Clic sobre el mismo nodo: cancela la selección
    nodo.removeClass("seleccionado");
    nodoSeleccionado = null;
  } else {
    // Segundo clic sobre un nodo distinto: pide el peso y crea la arista
    const origen = nodoSeleccionado;
    cy.getElementById(origen).removeClass("seleccionado"); // le quita el resaltado naranja al primer nodo
    nodoSeleccionado = null;
    pedirPeso(origen, nodo.id()); // abre el modal para ingresar el peso de la conexión
  }
});

// ─── Bloque 6: Clic derecho → eliminar nodo o arista ────────────────────────
cy.on("cxttap", "node, edge", (evt) => {
  evt.target.remove(); // quita el elemento (nodo o arista) del grafo
  cy.elements().removeClass("resaltado"); // limpia cualquier camino resaltado anterior
  textoCamino.textContent = "—"; // reinicia el texto del resultado
});

// ─── Bloque 7: Modal para ingresar el peso de una arista ───────────────────
function pedirPeso(origen, destino) {
  modalLabel.textContent = `${origen} → ${destino}`; // indica qué nodos se están conectando
  modalInput.value = "";
  modal.classList.remove("oculto"); // muestra el modal
  modalInput.focus(); // pone el cursor listo para escribir

  modalConfirmar.onclick = () => {
    const peso = parseFloat(modalInput.value); // convierte el texto ingresado a número
    if (isNaN(peso) || peso <= 0) {
      alert("Ingresa un peso válido (número mayor a 0).");
      return;
    }
    // Crea la arista en Cytoscape con id único "origen-destino"
    cy.add({ group: "edges", data: { id: `${origen}-${destino}`, source: origen, target: destino, peso } });
    modal.classList.add("oculto"); // cierra el modal
  };

  modalCancelar.onclick = () => {
    modal.classList.add("oculto"); // cierra el modal sin crear la arista
  };

  modalInput.onkeydown = (e) => {
    if (e.key === "Enter") modalConfirmar.click(); // permite confirmar con la tecla Enter
  };
}

// ─── Bloque 8: Construir el objeto "grafo" que espera dijkstra.js ──────────
// Cytoscape guarda nodos y aristas por su cuenta; aquí los traducimos
// a la lista de adyacencia { origen: { destino: peso, ... }, ... }.
function construirGrafo() {
  const grafo = {};
  cy.nodes().forEach((n) => (grafo[n.id()] = {})); // crea una entrada vacía por cada nodo
  cy.edges().forEach((e) => {
    const { source, target, peso } = e.data(); // extrae origen, destino y peso de cada arista
    grafo[source][target] = peso; // conexión en un sentido
    grafo[target][source] = peso; // y en el otro (grafo no dirigido)
  });
  return grafo;
}

// ─── Bloque 9: Calcular Dijkstra y resaltar el camino más corto ────────────
btnCalcular.addEventListener("click", () => {
  const inicio  = inputInicio.value.trim().toUpperCase();  // nombre del nodo de inicio, normalizado
  const destino = inputDestino.value.trim().toUpperCase(); // nombre del nodo destino, normalizado
  const grafo = construirGrafo(); // arma la lista de adyacencia actual

  if (!grafo[inicio] || !grafo[destino]) {
    alert("Esos nodos no existen en el grafo.");
    return;
  }

  const { distancias, previo } = dijkstra(grafo, inicio); // ejecuta el algoritmo (definido en dijkstra.js)
  const camino = reconstruirCamino(previo, destino); // arma la ruta completa hasta el destino

  // Limpiamos el resaltado anterior antes de pintar el nuevo camino
  cy.elements().removeClass("resaltado");

  if (distancias[destino] === Infinity) {
    textoCamino.textContent = `No hay camino de ${inicio} a ${destino}.`;
  } else {
    textoCamino.textContent = `${camino.join(" → ")}  (total: ${distancias[destino]})`;
    camino.forEach((nodo, i) => {
      cy.getElementById(nodo).addClass("resaltado"); // pinta de verde cada nodo del camino
      if (i > 0) {
        // pinta de verde la arista entre el nodo anterior y el actual (en cualquiera de los dos sentidos)
        cy.edges(`[source = "${camino[i - 1]}"][target = "${nodo}"], [source = "${nodo}"][target = "${camino[i - 1]}"]`)
          .addClass("resaltado");
      }
    });
  }
});

// ─── Bloque 10: Reiniciar el grafo por completo ─────────────────────────────
btnReiniciar.addEventListener("click", () => {
  cy.elements().remove();   // borra todos los nodos y aristas
  nodoSeleccionado = null;  // limpia cualquier selección pendiente
  contadorNodos = 0;        // reinicia el generador de nombres (vuelve a empezar en "A")
  textoCamino.textContent = "—"; // reinicia el texto del resultado
});
