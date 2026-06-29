function dijkstra(grafo, inicio) {
  const distancias = {};   // distancia más corta conocida a cada nodo
  const visitados = {};    // nodos ya procesados
  const previo = {};       // nodo anterior en el camino más corto

  // Paso 1: poner todas las distancias en infinito, menos el inicio
  for (const nodo in grafo) {
    distancias[nodo] = Infinity;
    previo[nodo] = null;
  }
  distancias[inicio] = 0;

  // Paso 2: repetir hasta visitar todos los nodos
  let nodosPendientes = Object.keys(grafo).length;

  while (nodosPendientes > 0) {
    // Buscar el nodo no visitado con menor distancia
    let actual = null;
    let menor = Infinity;

    for (const nodo in grafo) {
      if (!visitados[nodo] && distancias[nodo] < menor) {
        menor = distancias[nodo];
        actual = nodo;
      }
    }

    if (actual === null) break; // ya no hay nodos alcanzables

    visitados[actual] = true;
    nodosPendientes--;

    // Revisar los vecinos del nodo actual
    for (const vecino in grafo[actual]) {
      const peso = grafo[actual][vecino];
      const nuevaDistancia = distancias[actual] + peso;

      if (nuevaDistancia < distancias[vecino]) {
        distancias[vecino] = nuevaDistancia;
        previo[vecino] = actual;
      }
    }
  }

  return { distancias, previo };
}

// Reconstruye el camino más corto hacia un nodo destino
function obtenerCamino(previo, destino) {
  const camino = [];
  let actual = destino;

  while (actual !== null) {
    camino.unshift(actual);
    actual = previo[actual];
  }

  return camino;
}