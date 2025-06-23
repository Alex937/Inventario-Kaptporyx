// 👉 Función para agregar productos
function agregarProducto() {
  const parte = document.getElementById("parte").value;
  const descripcion = document.getElementById("descripcion").value;
  const cantidad = document.getElementById("cantidad").value;
  const estado = document.getElementById("estado").value;
  const ubicacion = document.getElementById("ubicacion").value;

  if (parte && descripcion && cantidad && estado && ubicacion) {
    let inventario = JSON.parse(localStorage.getItem("inventario")) || [];
    inventario.push({ parte, descripcion, cantidad, estado, ubicacion });
    localStorage.setItem("inventario", JSON.stringify(inventario));

    // ✅ Solo recarga la tabla, no insertes directamente
    cargarProductos();
    document.getElementById("formulario-producto").reset();
  } else {
    alert("Por favor, completa todos los campos.");
  }
}

// 👉 Función para registrar usuarios desde index.html
function registrarUsuario(event) {
  event.preventDefault();

  const nombre = document.getElementById("usuario").value.trim();
  const clave = document.getElementById("clave").value;
  const rol = document.getElementById("rol").value;

  if (clave.length < 6) {
    alert("La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  const duplicado = usuarios.some(u => u.nombre.toLowerCase() === nombre.toLowerCase());
  if (duplicado) {
    alert(`❌ El usuario "${nombre}" ya existe.`);
    return;
  }

  const nuevoUsuario = { nombre, clave, rol };
  usuarios.push(nuevoUsuario);
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  mostrarUsuarios();
  document.querySelector("form").reset();
}

function mostrarUsuarioActivo() {
  const usuarioJSON = sessionStorage.getItem("usuarioActivo");
  if (!usuarioJSON) return;

  const usuario = JSON.parse(usuarioJSON); // ✅ Parseamos el objeto

  const bienvenida = document.getElementById("usuarioBienvenido");
  if (bienvenida && usuario?.nombre && usuario?.rol) {
    bienvenida.textContent = ` ${usuario.nombre} (${usuario.rol})`;
  }
}

// 👉 Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  mostrarUsuarioActivo();

  const path = window.location.pathname.toLowerCase();
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  let estadoEsperado = "";
  let idTabla = "";

  if (path.includes("inventario")){
    cargarProductos();
  }
  if (path.includes("nuevos")) {
    estadoEsperado = "nuevo";
    idTabla = "tablaNuevos";
  } else if (path.includes("recuperados")) {
    estadoEsperado = "recuperado";
    idTabla = "tablaRecuperados";
  } else if (path.includes("malos")) {
    estadoEsperado = "malo";
    idTabla = "tablaMalos";
  } else if (path.includes("obsoletos")) {
    estadoEsperado = "obsoleto";
    idTabla = "tablaObsoletos";
  }


  if (estadoEsperado && idTabla) {
    const tabla = document.getElementById(idTabla);
    const filtrados = inventario.filter(item => item.estado.toLowerCase() === estadoEsperado);

    filtrados.forEach(producto => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${producto.parte}</td>
        <td>${producto.descripcion}</td>
        <td>${producto.cantidad}</td>
        <td>${producto.estado}</td>
        <td>${producto.ubicacion}</td>
      `;
      tabla.appendChild(fila);
    });
  }

   if (path.includes("index")) {
    calcularTotalProductos();
    mostrarBajoStock(); // ✅ Mostrar solo en el Dashboard
  }
  
  if (path.includes("index")) {
    calcularTotalProductos();
  }

  if (path.includes("inventario")) {
    cargarProductos();
  }

  if (path.includes("entradas")) {
    cargarEntradas(); // ✅ mostrar todo
  }

  if (path.includes("recuperados")) {
    cargarPorEstado("recuperado", "tablaRecuperados");
  }

  if (path.includes("malos")) {
    cargarPorEstado("malo", "tablaMalos");
  }

  if (path.includes("obsoletos")) {
    cargarPorEstado("obsoleto", "tablaObsoletos");
  }

  if (path.includes("nuevos")) {
    cargarPorEstado("nuevo", "tablaNuevos");
  }

  if (window.location.pathname.includes("salidas")) {
  cargarSelectSalida();
  mostrarSalidas();
  }
  if (path.includes("index")) {
  calcularTotalProductos();
  mostrarBajoStock();
  generarGraficaInventario(); // ✅ Agrega esta línea
}
});

// 👉 Función para cerrar sesión calcularTotalProductos();
function cerrarSesion() {
  sessionStorage.removeItem("usuarioActivo");
  window.location.href = "login.html";
}

function cargarInventario() {
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  inventario.forEach(producto => insertarFila(producto));
}

function buscarInventario() {
  const query = document.getElementById("busquedaInput").value.toLowerCase();
  const tabla = document.getElementById("tablaBusqueda");
  const tbody = document.getElementById("resultadosBusqueda");
  tbody.innerHTML = "";

  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];

  const filtrados = inventario.filter(item =>
    item.parte.toLowerCase().includes(query) ||
    item.descripcion.toLowerCase().includes(query) ||
    item.cantidad.toString().includes(query) ||
    item.estado.toLowerCase().includes(query) ||
    item.ubicacion.toLowerCase().includes(query)
  );

  if (filtrados.length === 0) {
    tabla.style.display = "none";
    alert("No se encontraron resultados.");
    return;
  }

filtrados.forEach(producto => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${producto.parte}</td>
      <td>${producto.descripcion}</td>
      <td>${producto.cantidad}</td>
      <td>${producto.estado}</td>
      <td>${producto.ubicacion}</td>
    `;
    tbody.appendChild(fila);
  });

  tabla.style.display = "table";
}
function calcularTotalProductos() {
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];

  const conteoPorParte = {};
  let bajoStock = 0;

  inventario.forEach(producto => {
    const clave = producto.parte;
    const cantidad = parseInt(producto.cantidad, 10);

    // Sumar por parte
    if (!conteoPorParte[clave]) {
      conteoPorParte[clave] = 0;
    }
    conteoPorParte[clave] += cantidad;

    // Contar bajo stock (≤ 5)
    if (cantidad <= 5) {
      bajoStock++;
    }
  });

  const total = Object.values(conteoPorParte).reduce((a, b) => a + b, 0);

  const totalContainer = document.getElementById("totalProductos");
  if (totalContainer) {
    totalContainer.textContent = `Total productos: ${total}`;
  }

  const bajoStockContainer = document.getElementById("bajoStock");
  if (bajoStockContainer) {
    bajoStockContainer.textContent = `Bajo stock: ${bajoStock}`;
  }
}

// 👉 Función para insertar fila con botones de editar/eliminar
function insertarFila(producto, index) {
  const tabla = document.getElementById("tabla-inventario").getElementsByTagName("tbody")[0];
  const fila = tabla.insertRow();

  // ✅ Recuperar usuario desde sessionStorage
  const usuarioJSON = sessionStorage.getItem("usuarioActivo");
  let rol = "empleado"; // Valor por defecto

  if (usuarioJSON) {
    const usuario = JSON.parse(usuarioJSON);
    rol = usuario.rol?.toLowerCase() || "empleado";
  }

  // ✅ Solo los administradores pueden editar/eliminar
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

// 👉 Cargar los productos al cargar la página
function cargarProductos() {
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const tabla = document.getElementById("tabla-inventario").getElementsByTagName("tbody")[0];
  tabla.innerHTML = "";
  inventario.forEach((producto, index) => {
    insertarFila(producto, index);
  });
}

// 👉 Función para eliminar producto
function eliminarProducto(index) {
  let inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  inventario.splice(index, 1);
  localStorage.setItem("inventario", JSON.stringify(inventario));
  cargarProductos();
}

function editarProducto(index) {
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const producto = inventario[index];

  document.getElementById("parte").value = producto.parte;
  document.getElementById("descripcion").value = producto.descripcion;
  document.getElementById("cantidad").value = producto.cantidad;
  document.getElementById("estado").value = producto.estado;
  document.getElementById("ubicacion").value = producto.ubicacion;

  // 👉 Guarda el índice en el botón unificado
  document.getElementById("btnGuardar").setAttribute("data-index", index);
}

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
    // 👉 Modo edición
    inventario[parseInt(index)] = { parte, descripcion, cantidad, estado, ubicacion };
    alert("Producto actualizado correctamente.");
  } else {
    // 👉 Modo nuevo
    inventario.push({ parte, descripcion, cantidad, estado, ubicacion });
    alert("Producto agregado correctamente.");
  }

  localStorage.setItem("inventario", JSON.stringify(inventario));

  cargarProductos();

  // ✅ Limpia el formulario y estado
  document.getElementById("formulario-producto").reset();
  document.getElementById("btnGuardar").removeAttribute("data-index");
}

function cargarEntradas() {
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const tabla = document.getElementById("tablaEntradas").getElementsByTagName("tbody")[0];
  tabla.innerHTML = ""; // Limpiar antes

  inventario.forEach(producto => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${producto.parte}</td>
      <td>${producto.descripcion}</td>
      <td>${producto.cantidad}</td>
      <td>${producto.estado}</td>
      <td>${producto.ubicacion}</td>
    `;
    tabla.appendChild(fila);
  });
}

function cargarPorEstado(estadoEsperado, idTabla) {
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const tabla = document.getElementById(idTabla).getElementsByTagName("tbody")[0];
  tabla.innerHTML = "";

  const filtrados = inventario.filter(item => item.estado.toLowerCase() === estadoEsperado.toLowerCase());

  filtrados.forEach(producto => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${producto.parte}</td>
      <td>${producto.descripcion}</td>
      <td>${producto.cantidad}</td>
      <td>${producto.estado}</td>
      <td>${producto.ubicacion}</td>
    `;
    tabla.appendChild(fila);
  });
}

// 👉 Cargar repuestos disponibles en el select
function cargarSelectSalida() {
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const select = document.getElementById("parte-salida");
  if (!select) return;

  select.innerHTML = `<option value="">Selecciona un repuesto</option>`;
  inventario.forEach((item, index) => {
    select.innerHTML += `<option value="${index}">${item.parte} - ${item.descripcion} (${item.cantidad})</option>`;
  });
}

// 👉 Registrar salida
document.getElementById("formulario-salida").addEventListener("submit", function (e) {
  e.preventDefault();

  const index = document.getElementById("parte-salida").value;
  const cantidadSalida = parseInt(document.getElementById("cantidad-salida").value);
  const tipo = document.getElementById("tipo-salida").value;

  let inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  let salidas = JSON.parse(localStorage.getItem("salidas")) || [];

  if (!inventario[index] || cantidadSalida > parseInt(inventario[index].cantidad)) {
    alert("Cantidad inválida o mayor al inventario.");
    return;
  }

  // 🧮 Restar cantidad
  inventario[index].cantidad -= cantidadSalida;

  // ✅ Registrar salida
  salidas.push({
    parte: inventario[index].parte,
    descripcion: inventario[index].descripcion,
    estado:inventario[index].estado,
    cantidad: cantidadSalida,
    tipo: tipo,
    fecha: new Date().toLocaleString()
  });

  localStorage.setItem("inventario", JSON.stringify(inventario));
  localStorage.setItem("salidas", JSON.stringify(salidas));

  alert("Salida registrada correctamente.");
  document.getElementById("formulario-salida").reset();
  cargarSelectSalida(); // actualizar el select
  mostrarSalidas();     // si tienes una tabla abajo
});

function mostrarSalidas() {
  const salidas = JSON.parse(localStorage.getItem("salidas")) || [];
  const tabla = document.getElementById("tabla-salidas")?.getElementsByTagName("tbody")[0];
  if (!tabla) return;

  tabla.innerHTML = "";
  salidas.forEach(item => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${item.parte}</td>
      <td>${item.descripcion}</td>
      <td>${item.estado}</td>
      <td>${item.cantidad}</td>
      <td>${item.tipo}</td>
      <td>${item.fecha}</td>
    `;
    tabla.appendChild(fila);
  });
}
  function mostrarBajoStock() {
    const tabla = document.getElementById("tabla-bajo-stock").getElementsByTagName("tbody")[0];
    tabla.innerHTML = ""; // Limpiar tabla

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

function generarGraficaInventario() {
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];

  const conteo = {
    nuevo: 0,
    recuperado: 0,
    malo: 0,
    obsoleto: 0
  };

  inventario.forEach(item => {
    const estado = item.estado.toLowerCase();
    if (conteo.hasOwnProperty(estado)) {
      conteo[estado] += parseInt(item.cantidad);
    }
  });

  const ctx = document.getElementById('graficaInventario').getContext('2d');
  new Chart(ctx, {
    type: 'bar', // Cambia a 'bar' si prefieres barras
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
        backgroundColor: [
          '#3498db', // Azul - Nuevos
          '#2ecc71', // Verde - Recuperados
          '#e74c3c', // Rojo - Malos
          '#f39c12'  // Naranja - Obsoletos
        ]
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

