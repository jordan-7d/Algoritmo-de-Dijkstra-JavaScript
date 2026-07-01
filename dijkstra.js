// ── Función principal: calcula las distancias mínimas desde "nodoInicio" ──
function dijkstra(grafo, nodoInicio) {
  // 1. Guarda la distancia más corta conocida a cada nodo.
  //    Al inicio, todas son "infinito" porque no las hemos calculado.
  const distancias = {}; // objeto tipo { nodo: distanciaMinima }

  // 2. Guarda si ya visitamos/cerramos un nodo.
  const visitados = {}; // objeto tipo { nodo: true/false }

  // 3. Guarda el nodo anterior en el camino más corto (para reconstruir la ruta).
  const previo = {}; // objeto tipo { nodo: nodoAnterior }

  // 4. Inicializamos todas las distancias en Infinity, excepto el nodo de inicio.
  for (const nodo in grafo) {
    distancias[nodo] = Infinity; // aún no sabemos cómo llegar a este nodo
    previo[nodo] = null; // todavía no tiene un nodo anterior asignado
  }
  distancias[nodoInicio] = 0; // la distancia de un nodo a sí mismo es 0

  // 5. Lista de nodos pendientes por procesar.
  const pendientes = Object.keys(grafo); // arranca con todos los nodos del grafo

  // 6. Mientras queden nodos sin visitar...
  while (pendientes.length > 0) {
    // 6.1 Buscamos el nodo NO visitado con la menor distancia actual
    //     (esto simula la "cola de prioridad").
    let nodoActual = null; // aquí quedará el nodo más cercano encontrado
    let menorDistancia = Infinity; // distancia más baja vista hasta el momento

    for (const nodo of pendientes) {
      if (distancias[nodo] < menorDistancia) {
        menorDistancia = distancias[nodo]; // actualizamos la menor distancia
        nodoActual = nodo; // este nodo pasa a ser el candidato más cercano
      }
    }

    // Si no encontramos ningún nodo alcanzable, terminamos.
    if (nodoActual === null) break; // ya no quedan nodos alcanzables desde el inicio

    // 6.2 Marcamos el nodo actual como visitado y lo sacamos de pendientes.
    visitados[nodoActual] = true; // lo cerramos: ya no se volverá a revisar
    pendientes.splice(pendientes.indexOf(nodoActual), 1); // lo quitamos de la lista de pendientes

    // 6.3 Revisamos cada vecino del nodo actual.
    for (const vecino in grafo[nodoActual]) {
      if (visitados[vecino]) continue; // si ya está cerrado, lo saltamos

      const peso = grafo[nodoActual][vecino]; // peso de la arista actual->vecino
      const distanciaCalculada = distancias[nodoActual] + peso; // distancia total pasando por nodoActual

      // 6.4 Si encontramos un camino más corto hacia el vecino, lo actualizamos.
      if (distanciaCalculada < distancias[vecino]) {
        distancias[vecino] = distanciaCalculada; // guardamos la nueva mejor distancia
        previo[vecino] = nodoActual; // guardamos por dónde llegamos
      }
    }
  }

  // 7. Retornamos las distancias mínimas y el mapa de "previos" para reconstruir rutas.
  return { distancias, previo };
}

/**
 * Función auxiliar: reconstruye el camino más corto hacia un nodo destino
 * usando el objeto "previo" generado por dijkstra().
 */
// ── Reconstruye la ruta completa yendo hacia atrás desde el destino ──
function reconstruirCamino(previo, destino) {
  const camino = []; // aquí se arma la ruta final, en orden correcto
  let actual = destino; // empezamos desde el destino y retrocedemos

  while (actual !== null && actual !== undefined) {
    camino.unshift(actual); // lo agregamos al inicio del arreglo
    actual = previo[actual]; // retrocedemos al nodo anterior
  }

  return camino; // ruta completa desde el inicio hasta el destino
}

// Exportamos las funciones para que app.js pueda usarlas
// (en el navegador quedan disponibles como funciones globales al cargar este script con <script src="dijkstra.js"></script>)
