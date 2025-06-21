function iniciarSesion(event) {
  event.preventDefault();

  const usuarioIngresado = document.getElementById("loginUsuario").value.trim();
  const claveIngresada = document.getElementById("loginClave").value;
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  const usuario = usuarios.find(u => u.nombre === usuarioIngresado && u.clave === claveIngresada);

  if (usuario) {
    sessionStorage.setItem("usuarioActivo", JSON.stringify(usuario));
    window.location.href = "index.html";
  } else {
    document.getElementById("mensajeError").textContent = "Usuario o contraseña incorrectos.";
  }
}

function registrarUsuario(event) {
  event.preventDefault();

  const nombre = document.getElementById("registroUsuario").value.trim();
  const clave = document.getElementById("registroClave").value;
  const rol = document.getElementById("registroRol").value;
  const mensaje = document.getElementById("mensajeRegistro");

  if (clave.length < 6) {
    mensaje.style.color = "red";
    mensaje.textContent = "La contraseña debe tener al menos 6 caracteres.";
    return;
  }

  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  // Verificar si el nombre ya existe (sin distinguir mayúsculas/minúsculas)
  const yaExiste = usuarios.some(u => u.nombre.toLowerCase() === nombre.toLowerCase());

  if (yaExiste) {
    mensaje.style.color = "red";
    mensaje.textContent = `El usuario "${nombre}" ya existe. Intenta con otro nombre.`;
    return;
  }

  const nuevoUsuario = { nombre, clave, rol };
  usuarios.push(nuevoUsuario);
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  mensaje.style.color = "green";
  mensaje.textContent = "✅ Usuario registrado exitosamente.";
  document.querySelector("form").reset();
}