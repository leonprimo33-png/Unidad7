// SAVINGS.HUB - Interfaz dinámica con DOM y eventos

// 1. Array inicial de objetos
let productos = [
  { id: 1, nombre: "Funda transparente", precio: 8500, categoria: "Fundas", descripcion: "Protección simple para tu celular.", icono: "📱" },
  { id: 2, nombre: "Funda premium", precio: 12500, categoria: "Fundas", descripcion: "Diseño moderno y resistente.", icono: "✨" },
  { id: 3, nombre: "Smartphone", precio: 285000, categoria: "Celulares", descripcion: "Tecnología para todos los días.", icono: "📲" },
  { id: 4, nombre: "Cargador rápido", precio: 18000, categoria: "Cargadores", descripcion: "Carga práctica y eficiente.", icono: "🔌" },
  { id: 5, nombre: "Cable USB-C", precio: 7500, categoria: "Cargadores", descripcion: "Cable de conexión resistente.", icono: "〰️" },
  { id: 6, nombre: "Perfume clásico", precio: 42000, categoria: "Perfumes", descripcion: "Una fragancia para cada ocasión.", icono: "🧴" },
  { id: 7, nombre: "Perfume urbano", precio: 36500, categoria: "Perfumes", descripcion: "Aroma fresco y moderno.", icono: "🌿" },
  { id: 8, nombre: "Cargador inalámbrico", precio: 24000, categoria: "Cargadores", descripcion: "Comodidad para cargar tus equipos.", icono: "⚡" }
];

// 2. Selección de elementos del DOM
const contenedorItems = document.querySelector("#contenedor-items");
const formulario = document.getElementById("form-producto");
const inputNombre = document.getElementById("nombre");
const inputPrecio = document.getElementById("precio");
const inputCategoria = document.getElementById("categoria");
const inputDescripcion = document.getElementById("descripcion");
const buscador = document.querySelector("#buscador");
const filtroCategoria = document.getElementById("filtro-categoria");
const mensajeFeedback = document.querySelector("#mensaje-feedback");
const mensajeVacio = document.getElementById("mensaje-vacio");
const estadoBusqueda = document.getElementById("estado-busqueda");

// 3. Funciones auxiliares
function escaparHTML(texto) {
  return String(texto).replace(/[&<>"']/g, (caracter) => {
    const caracteres = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return caracteres[caracter];
  });
}

function formatearPrecio(precio) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(precio);
}

function mostrarFeedback(mensaje, esError = false) {
  mensajeFeedback.textContent = mensaje;
  mensajeFeedback.classList.toggle("error", esError);
}

// 4. Renderizado dinámico: recorre el array y crea las tarjetas
function renderizarProductos(lista = productos) {
  contenedorItems.innerHTML = "";

  lista.forEach((producto) => {
    contenedorItems.innerHTML += `
      <article class="tarjeta" data-id="${producto.id}">
        <div class="tarjeta-icono" aria-hidden="true">${producto.icono || "🛍️"}</div>
        <span class="tarjeta-categoria">${escaparHTML(producto.categoria)}</span>
        <h3>${escaparHTML(producto.nombre)}</h3>
        <p class="tarjeta-descripcion">${escaparHTML(producto.descripcion)}</p>
        <div class="tarjeta-pie">
          <span class="precio">${formatearPrecio(producto.precio)}</span>
          <button class="boton-eliminar" type="button" data-accion="eliminar" data-id="${producto.id}">
            Eliminar
          </button>
        </div>
      </article>
    `;
  });

  mensajeVacio.hidden = lista.length !== 0;
  estadoBusqueda.textContent = `${lista.length} ${lista.length === 1 ? "producto encontrado" : "productos encontrados"}`;
}

// 5. Búsqueda y filtro
function filtrarProductos() {
  const texto = buscador.value.trim().toLowerCase();
  const categoria = filtroCategoria.value;

  const productosFiltrados = productos.filter((producto) => {
    const coincideTexto =
      producto.nombre.toLowerCase().includes(texto) ||
      producto.categoria.toLowerCase().includes(texto) ||
      producto.descripcion.toLowerCase().includes(texto);

    const coincideCategoria = categoria === "todos" || producto.categoria === categoria;
    return coincideTexto && coincideCategoria;
  });

  renderizarProductos(productosFiltrados);
}

// Evento de teclado/input: actualiza la búsqueda mientras se escribe
buscador.addEventListener("input", filtrarProductos);
buscador.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape") {
    buscador.value = "";
    filtrarProductos();
  }
});

filtroCategoria.addEventListener("change", filtrarProductos);

// 6. Evento submit: agrega un producto sin recargar la página
formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const nombre = inputNombre.value.trim();
  const precio = Number(inputPrecio.value);
  const categoria = inputCategoria.value;
  const descripcion = inputDescripcion.value.trim();

  if (!nombre || !descripcion || !categoria || !Number.isFinite(precio) || precio <= 0) {
    mostrarFeedback("Completá todos los campos con datos válidos.", true);
    return;
  }

  const nuevoProducto = {
    id: Date.now(),
    nombre: nombre,
    precio: precio,
    categoria: categoria,
    descripcion: descripcion,
    icono: obtenerIcono(categoria)
  };

  productos.push(nuevoProducto);
  formulario.reset();
  buscador.value = "";
  filtroCategoria.value = "todos";
  renderizarProductos();

  const tarjetaNueva = contenedorItems.querySelector(`[data-id="${nuevoProducto.id}"]`);
  if (tarjetaNueva) {
    tarjetaNueva.classList.add("tarjeta-nueva");
  }

  mostrarFeedback(`¡${nombre} se agregó correctamente al catálogo!`);
  inputNombre.focus();
});

// Devuelve un ícono según la categoría seleccionada
function obtenerIcono(categoria) {
  const iconos = {
    Fundas: "📱",
    Celulares: "📲",
    Cargadores: "🔌",
    Perfumes: "🧴"
  };
  return iconos[categoria] || "🛍️";
}

// 7. Evento click: elimina productos usando delegación de eventos
contenedorItems.addEventListener("click", (evento) => {
  const botonEliminar = evento.target.closest('[data-accion="eliminar"]');

  if (!botonEliminar) return;

  const idProducto = Number(botonEliminar.dataset.id);
  const productoEliminado = productos.find((producto) => producto.id === idProducto);

  productos = productos.filter((producto) => producto.id !== idProducto);
  filtrarProductos();

  if (productoEliminado) {
    mostrarFeedback(`Se eliminó "${productoEliminado.nombre}" del catálogo.`);
  }
});

// 8. Primera carga de la interfaz
renderizarProductos();
