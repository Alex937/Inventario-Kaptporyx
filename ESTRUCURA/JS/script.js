// Función para agregar un nuevo porducto al inventario
function agregarProducto() {
  // Obtenemos los valores de los campos del formulario
  const parte = document.getElementById("parte").value;
  const descripcion = document.getElementById("descripcion").value;
  const cantidad = document.getElementById("cantidad").value;
  const estado = document.getElementById("estado").value;
  const ubicacion = document.getElementById("ubicacion").value;
  // Verificamos que todos los campos estén llenos
  if (parte && descripcion && cantidad && estado && ubicacion) {
    let inventario = JSON.parse(localStorage.getItem("inventario")) || [];
    // Agregamos el nuevo producto al invetario 
    inventario.push({ parte, descripcion, cantidad, estado, ubicacion });
    localStorage.setItem("inventario", JSON.stringify(inventario));

    // Lo reflejamos visualmente en la tablamiercole
    cargarProductos();

    // Limpiamos el formulario luego de agregar
    document.getElementById("formulario-producto").reset();
  } else {
    alert("Por favor, completa todos los campos.");
  }
}

// Función para registrar nuevos  usuarios desde desde el formulario
function registrarUsuario(event) {
  event.preventDefault();

  const nombre = document.getElementById("usuario").value.trim();
  const clave = document.getElementById("clave").value;
  const rol = document.getElementById("rol").value;

  // Validación básica de seuridad
  if (clave.length < 6) {
    alert("La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  // Colocamos si el nombre ya está registrado
  const duplicado = usuarios.some(u => u.nombre.toLowerCase() === nombre.toLowerCase());
  if (duplicado) {
    alert(` El usuario "${nombre}" ya existe.`);
    return;
  }

  // Guardamos el nuevo usuario
  const nuevoUsuario = { nombre, clave, rol };
  usuarios.push(nuevoUsuario);
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  mostrarUsuarios();
  document.querySelector("form").reset();
}

// Muestra los ususrios registrados 
function mostrarUsuarioActivo() {
  const usuarioJSON = sessionStorage.getItem("usuarioActivo");
  if (!usuarioJSON) return;

  const usuario = JSON.parse(usuarioJSON); 

  const bienvenida = document.getElementById("usuarioBienvenido");
  if (bienvenida && usuario?.nombre && usuario?.rol) {
    bienvenida.textContent = ` ${usuario.nombre} (${usuario.rol})`;
  }
}

// Esta funcion se ejecuta automaticamnete  al cargar la página
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
    mostrarBajoStock(); // 
  }
  
  if (path.includes("index")) {
    calcularTotalProductos();
  }

  if (path.includes("inventario")) {
    cargarProductos();
  }

  if (path.includes("entradas")) {
    cargarEntradas(); 
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
  generarGraficaInventario(); 
}
});

// Cierra la sesión y redirige al login
function cerrarSesion() {
  sessionStorage.removeItem("usuarioActivo");
  window.location.href = "login.html";
}

// Carga todos los productos del inventario
function cargarInventario() {
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  inventario.forEach(producto => insertarFila(producto));
}

// Permite buscar productos por palabra clave
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

// Calcular el total de los productos sumando las cantidades incluso si hay productos repetidos
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

// Agrega visualmente una fila a la tabla con los datos del producto 
function insertarFila(producto, index) {
  const tabla = document.getElementById("tabla-inventario").getElementsByTagName("tbody")[0];
  const fila = tabla.insertRow();

  // Obtener el rol del usuario activo
  const usuarioJSON = sessionStorage.getItem("usuarioActivo");
  let rol = "empleado"; // Valor por defecto

  if (usuarioJSON) {
    const usuario = JSON.parse(usuarioJSON);
    rol = usuario.rol?.toLowerCase() || "empleado";
  }

  // Mostrar botones solo si el usuario es administrador
  let accionesHTML = "";
  if (rol === "admin" || rol === "administrador") {
    accionesHTML = `
      <button onclick="editarProducto(${index})">Editar</button>
      <button onclick="eliminarProducto(${index})">Eliminar</button>
    `;
  }
  // Agregar los datos del producto y las acciones a la fila
  fila.innerHTML = `
    <td>${producto.parte}</td>
    <td>${producto.descripcion}</td>
    <td>${producto.cantidad}</td>
    <td>${producto.estado}</td>
    <td>${producto.ubicacion}</td>
    <td>${accionesHTML}</td>
  `;
}

// Carga todos los productos del inventario
function cargarProductos() {
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const tabla = document.getElementById("tabla-inventario").getElementsByTagName("tbody")[0];
  tabla.innerHTML = "";
  inventario.forEach((producto, index) => {
    insertarFila(producto, index);
  });
}

// Función para eliminar producto
function eliminarProducto(index) {
  let inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  inventario.splice(index, 1);
  localStorage.setItem("inventario", JSON.stringify(inventario));
  cargarProductos();
}

//Carga los datos del producto en el formulario para el editarlo 
function editarProducto(index) {
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const producto = inventario[index];

  //Rellena campos del formulario con los datos existentes
  document.getElementById("parte").value = producto.parte;
  document.getElementById("descripcion").value = producto.descripcion;
  document.getElementById("cantidad").value = producto.cantidad;
  document.getElementById("estado").value = producto.estado;
  document.getElementById("ubicacion").value = producto.ubicacion;

  // Guarda el índice para saber si estamos editando
  document.getElementById("btnGuardar").setAttribute("data-index", index);
}

//Guarda un producto nuevo o actualizado
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
    // Si estamos editando un producto
    inventario[parseInt(index)] = { parte, descripcion, cantidad, estado, ubicacion };
    alert("Producto actualizado correctamente.");
  } else {
    // Si es un producto nuevo
    inventario.push({ parte, descripcion, cantidad, estado, ubicacion });
    alert("Producto agregado correctamente.");
  }

  localStorage.setItem("inventario", JSON.stringify(inventario));

  cargarProductos();


  document.getElementById("formulario-producto").reset();
  document.getElementById("btnGuardar").removeAttribute("data-index");
}

// Cargar los productos en la pestaña de entredas
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

// Filtrar porducots por estado (Nuevo, Malos, etc.)
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

// Cargar las opciones disponibles en el boton para registrar una salida
function cargarSelectSalida() {
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const select = document.getElementById("parte-salida");
  if (!select) return;

  select.innerHTML = `<option value="">Selecciona un repuesto</option>`;
  inventario.forEach((item, index) => {
    select.innerHTML += `<option value="${index}">${item.parte} - ${item.descripcion} (${item.cantidad})</option>`;
  });
}

// Registrar salida de repuesto del inventario
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

  // Actualiza el inventario
  inventario[index].cantidad -= cantidadSalida;

  // Registrar la salida
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

// Muestra todas las salidas registradas
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

// Muestra productos "Nuevos" con menos de 3 unidades (Stock bajo)
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

// Genera grafia con cantida de productos por estado usando chart.js
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
    type: 'bar', // Barras
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

