// Función que se activa al dar clic en "Guardar producto"
function agregarProducto() {
  // Tomamos los valores del formulario
  const parte = document.getElementById("parte").value;
  const descripcion = document.getElementById("descripcion").value;
  const cantidad = document.getElementById("cantidad").value;
  const estado = document.getElementById("estado").value;
  const ubicacion = document.getElementById("ubicacion").value;

  // Verificamos que todos los campos estén llenos
  if (parte && descripcion && cantidad && estado && ubicacion) {
    let inventario = JSON.parse(localStorage.getItem("inventario")) || [];

    // Agregamos el nuevo producto
    inventario.push({ parte, descripcion, cantidad, estado, ubicacion });
    localStorage.setItem("inventario", JSON.stringify(inventario));

    // Volvemos a cargar la tabla y limpiamos el formulario
    cargarProductos();
    document.getElementById("formulario-producto").reset();
  } else {
    alert("Por favor, completa todos los campos.");
  }
}

// Registrar nuevo usuario desde el formulario
function registrarUsuario(event) {
  event.preventDefault();

  const nombre = document.getElementById("usuario").value.trim();
  const clave = document.getElementById("clave").value;
  const rol = document.getElementById("rol").value;

  // Validación: mínimo 6 caracteres para la contraseña
  if (clave.length < 6) {
    alert("La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  // Verificamos si ya existe un usuario con ese nombre
  const duplicado = usuarios.some(u => u.nombre.toLowerCase() === nombre.toLowerCase());
  if (duplicado) {
    alert(`❌ El usuario "${nombre}" ya existe.`);
    return;
  }

  // Creamos el nuevo usuario y lo guardamos
  usuarios.push({ nombre, clave, rol });
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  mostrarUsuarios();
  document.querySelector("form").reset();
}

// Mostrar el nombre y rol del usuario actual en la parte superior
function mostrarUsuarioActivo() {
  const usuarioJSON = sessionStorage.getItem("usuarioActivo");
  if (!usuarioJSON) return;

  const usuario = JSON.parse(usuarioJSON);

  const bienvenida = document.getElementById("usuarioBienvenido");
  if (bienvenida && usuario?.nombre && usuario?.rol) {
    bienvenida.textContent = ` ${usuario.nombre} (${usuario.rol})`;
  }
}

// Al cargar la página, se activa esta función principal
document.addEventListener("DOMContentLoaded", () => {
  mostrarUsuarioActivo();

  const path = window.location.pathname.toLowerCase();
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];

  // Detectamos en qué página estamos y activamos funciones según corresponda
  if (path.includes("index")) {
    calcularTotalProductos();
    mostrarBajoStock();
    generarGraficaInventario(); // Muestra la gráfica estadística en el dashboard
  }

  if (path.includes("inventario")) cargarProductos();
  if (path.includes("entradas")) cargarEntradas();
  if (path.includes("salidas")) {
    cargarSelectSalida();
    mostrarSalidas();
  }

  if (path.includes("recuperados")) cargarPorEstado("recuperado", "tablaRecuperados");
  if (path.includes("malos")) cargarPorEstado("malo", "tablaMalos");
  if (path.includes("obsoletos")) cargarPorEstado("obsoleto", "tablaObsoletos");
  if (path.includes("nuevos")) cargarPorEstado("nuevo", "tablaNuevos");
});

// Función para cerrar sesión del usuario actual
function cerrarSesion() {
  sessionStorage.removeItem("usuarioActivo");
  window.location.href = "login.html";
}

// Carga e inserta todos los productos en la tabla
function cargarProductos() {
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const tabla = document.getElementById("tabla-inventario").getElementsByTagName("tbody")[0];
  tabla.innerHTML = "";

  inventario.forEach((producto, index) => insertarFila(producto, index));
}

// Inserta una fila en la tabla con los datos del producto y botones si es admin
function insertarFila(producto, index) {
  const tabla = document.getElementById("tabla-inventario").getElementsByTagName("tbody")[0];
  const fila = tabla.insertRow();

  const usuarioJSON = sessionStorage.getItem("usuarioActivo");
  let rol = "empleado";

  if (usuarioJSON) {
    const usuario = JSON.parse(usuarioJSON);
    rol = usuario.rol?.toLowerCase() || "empleado";
  }

  let accionesHTML = "";
  if (rol === "admin" || rol === "administrador") {
    accionesHTML = `
      <button onclick="editarProducto(${index})">Editar</button>
      <button onclick="eliminarProducto(${index})">Eliminar</button>
    `;
  }

  fila.innerHTML = `
    <td>${producto.parte}</td>
    <td>${producto.descripcion}</td>
    <td>${producto.cantidad}</td>
    <td>${producto.estado}</td>
    <td>${producto.ubicacion}</td>
    <td>${accionesHTML}</td>
  `;
}

// Permite editar un producto (se llena el formulario con los datos existentes)
function editarProducto(index) {
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const producto = inventario[index];

  document.getElementById("parte").value = producto.parte;
  document.getElementById("descripcion").value = producto.descripcion;
  document.getElementById("cantidad").value = producto.cantidad;
  document.getElementById("estado").value = producto.estado;
  document.getElementById("ubicacion").value = producto.ubicacion;

  document.getElementById("btnGuardar").setAttribute("data-index", index);
}

// Guarda los cambios de edición o agrega uno nuevo
function guardarProducto() {
  const parte = document.getElementById("parte").value;
  const descripcion = document.getElementById("descripcion").value;
  const cantidad = document.getElementById("cantidad").value;
  const estado = document.getElementById("estado").value;
  const ubicacion = document.getElementById("ubicacion").value;

  if (!parte || !descripcion || !cantidad || !estado || !ubicacion) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  let inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const index = document.getElementById("btnGuardar").getAttribute("data-index");

  if (index) {
    inventario[parseInt(index)] = { parte, descripcion, cantidad, estado, ubicacion };
    alert("Producto actualizado correctamente.");
  } else {
    inventario.push({ parte, descripcion, cantidad, estado, ubicacion });
    alert("Producto agregado correctamente.");
  }

  localStorage.setItem("inventario", JSON.stringify(inventario));
  cargarProductos();
  document.getElementById("formulario-producto").reset();
  document.getElementById("btnGuardar").removeAttribute("data-index");
}

// Calcula el total de productos y los que están en bajo stock
function calcularTotalProductos() {
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const conteoPorParte = {};
  let bajoStock = 0;

  inventario.forEach(producto => {
    const clave = producto.parte;
    const cantidad = parseInt(producto.cantidad, 10);

    if (!conteoPorParte[clave]) conteoPorParte[clave] = 0;
    conteoPorParte[clave] += cantidad;

    if (cantidad <= 5) bajoStock++;
  });

  const total = Object.values(conteoPorParte).reduce((a, b) => a + b, 0);

  const totalContainer = document.getElementById("totalProductos");
  if (totalContainer) totalContainer.textContent = `Total productos: ${total}`;

  const bajoStockContainer = document.getElementById("bajoStock");
  if (bajoStockContainer) bajoStockContainer.textContent = `Bajo stock: ${bajoStock}`;
}

// Muestra una tabla con productos "nuevos" que tienen menos de 3 unidades
function mostrarBajoStock() {
  const tabla = document.getElementById("tabla-bajo-stock").getElementsByTagName("tbody")[0];
  tabla.innerHTML = "";

  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];

  inventario.forEach(producto => {
    const cantidad = parseInt(producto.cantidad);
    const esNuevo = producto.estado.toLowerCase() === "nuevo";

    if (cantidad < 3 && esNuevo) {
      const fila = tabla.insertRow();
      fila.insertCell(0).textContent = producto.parte;
      fila.insertCell(1).textContent = producto.descripcion;
      fila.insertCell(2).textContent = producto.cantidad;
    }
  });
}

// Muestra una gráfica de barras con los productos por estado
function generarGraficaInventario() {
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];

  const conteo = { nuevo: 0, recuperado: 0, malo: 0, obsoleto: 0 };

  inventario.forEach(item => {
    const estado = item.estado.toLowerCase();
    if (conteo.hasOwnProperty(estado)) {
      conteo[estado] += parseInt(item.cantidad);
    }
  });

  const ctx = document.getElementById('graficaInventario').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Nuevos', 'Recuperados', 'Malos', 'Obsoletos'],
      datasets: [{
        label: 'Cantidad por Estado',
        data: [
          conteo.nuevo,
          conteo.recuperado,
          conteo.malo,
          conteo.obsoleto
        ],
        backgroundColor: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}
