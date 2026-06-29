// Grafo vacío (se llena con nodos y conexiones del usuario)
let grafo = {};

// Elementos del HTML (inputs, botones y salida)
const inputNodoA = document.getElementById("inputNodoA");
const inputNodoB = document.getElementById("inputNodoB");
const inputPeso = document.getElementById("inputPeso");
const btnAgregar = document.getElementById("btnAgregar");
const btnReiniciar = document.getElementById("btnReiniciar");
const listaConexiones = document.getElementById("listaConexiones");

const inputInicio = document.getElementById("inputInicio");
const inputDestino = document.getElementById("inputDestino");
const btnCalcular = document.getElementById("btnCalcular");
const resultado = document.getElementById("resultado");

// Agregar una conexión al grafo
btnAgregar.addEventListener("click", () => {
  const nodoA = inputNodoA.value.trim().toUpperCase();
  const nodoB = inputNodoB.value.trim().toUpperCase();
  const peso = parseFloat(inputPeso.value);

  // Validar datos ingresados
  if (nodoA === "" || nodoB === "") {
    alert("Escribe los dos nodos de la conexión.");
    return;
  }

  // Validar peso numérico
  if (isNaN(peso) || peso <= 0) {
    alert("El peso debe ser un número mayor a 0.");
    return;
  }

  // Crear nodos si no existen
  if (!grafo[nodoA]) grafo[nodoA] = {};
  if (!grafo[nodoB]) grafo[nodoB] = {};

  // Conexión en ambos sentidos
  grafo[nodoA][nodoB] = peso;
  grafo[nodoB][nodoA] = peso;

  // Limpiar inputs
  inputNodoA.value = "";
  inputNodoB.value = "";
  inputPeso.value = "";

  actualizarListaConexiones();
});

// Mostrar conexiones en pantalla
function actualizarListaConexiones() {
  listaConexiones.innerHTML = "";

  const conexionesMostradas = new Set(); // evitar duplicados

  // Recorrer grafo
  for (const nodoA in grafo) {
    for (const nodoB in grafo[nodoA]) {

      const clave1 = nodoA + "-" + nodoB;
      const clave2 = nodoB + "-" + nodoA;

      // Evitar repetir conexión
      if (conexionesMostradas.has(clave1) || conexionesMostradas.has(clave2)) continue;
      conexionesMostradas.add(clave1);

      // Mostrar conexión
      const item = document.createElement("li");
      item.textContent = `${nodoA} - ${nodoB} : ${grafo[nodoA][nodoB]}`;
      listaConexiones.appendChild(item);
    }
  }

  // Si no hay datos
  if (listaConexiones.children.length === 0) {
    listaConexiones.innerHTML = "<li><em>Aún no hay conexiones</em></li>";
  }
}

// Reiniciar grafo completo
btnReiniciar.addEventListener("click", () => {
  grafo = {};
  actualizarListaConexiones();
  resultado.innerHTML = "";
});

// Calcular ruta más corta (Dijkstra)
btnCalcular.addEventListener("click", () => {
  const inicio = inputInicio.value.trim().toUpperCase();
  const destino = inputDestino.value.trim().toUpperCase();

  // Validar nodos existentes
  if (!grafo[inicio] || !grafo[destino]) {
    resultado.innerHTML = "<p>Ese nodo no existe en el grafo. Revisa las conexiones agregadas.</p>";
    return;
  }

  // Ejecutar Dijkstra
  const { distancias, previo } = dijkstra(grafo, inicio);
  const camino = obtenerCamino(previo, destino);

  // Si no hay ruta
  if (distancias[destino] === Infinity) {
    resultado.innerHTML = `<p>No existe un camino entre ${inicio} y ${destino}.</p>`;
    return;
  }

  // Mostrar resultado final
  resultado.innerHTML = `
    <p><strong>Distancia más corta de ${inicio} a ${destino}:</strong> ${distancias[destino]}</p>
    <p><strong>Camino:</strong> ${camino.join(" → ")}</p>
  `;
});