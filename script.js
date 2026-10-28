const form = document.getElementById("form");
const campos = ["nombre", "correo", "telefono", "nacimiento", "clave", "clave2", "terminos"];

// Cada regla devuelve un mensaje de error, o "" si el campo es válido.
const reglas = {
  nombre: (v) => {
    v = v.trim();
    if (!v) return "Escribe tu nombre completo.";
    if (v.split(/\s+/).length < 2) return "Incluye al menos nombre y apellido.";
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' -]+$/.test(v)) return "Usa solo letras.";
    return "";
  },
  correo: (v) => {
    if (!v.trim()) return "Escribe tu correo.";
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "El correo no tiene un formato válido.";
  },
  telefono: (v) => {
    if (!v.trim()) return "Escribe tu celular.";
    return /^09\d{8}$/.test(v.trim()) ? "" : "Debe tener 10 dígitos y empezar con 09.";
  },
  nacimiento: (v) => {
    if (!v) return "Selecciona tu fecha de nacimiento.";
    const hoy = new Date(), n = new Date(v);
    let edad = hoy.getFullYear() - n.getFullYear();
    if (hoy < new Date(hoy.getFullYear(), n.getMonth(), n.getDate())) edad--;
    if (edad < 0 || edad > 110) return "La fecha no es válida.";
    return edad >= 18 ? "" : "Debes ser mayor de 18 años.";
  },
  clave: (v) => {
    if (v.length < 8) return "Mínimo 8 caracteres.";
    if (!/[A-Z]/.test(v)) return "Agrega una mayúscula.";
    if (!/\d/.test(v)) return "Agrega un número.";
    if (!/[^A-Za-z0-9]/.test(v)) return "Agrega un símbolo (por ejemplo ! o #).";
    return "";
  },
  clave2: (v) => (v === form.clave.value && v ? "" : "Las contraseñas no coinciden."),
  terminos: () => (form.terminos.checked ? "" : "Debes aceptar las condiciones para continuar."),
};

function validar(nombre) {
  const input = form[nombre];
  const mensaje = reglas[nombre](input.type === "checkbox" ? "" : input.value);
  const aviso = input.closest(".field").querySelector(".error");
  aviso.textContent = mensaje;
  if (input.type !== "checkbox") {
    input.classList.toggle("invalid", !!mensaje);
    input.classList.toggle("valid", !mensaje);
  }
  return !mensaje;
}

// Validación en vivo: al salir del campo y mientras se corrige un error.
campos.forEach((nombre) => {
  const input = form[nombre];
  input.addEventListener("blur", () => validar(nombre));
  input.addEventListener("input", () => {
    if (input.classList.contains("invalid") || input.type === "checkbox") validar(nombre);
    if (nombre === "clave") { medirClave(input.value); if (form.clave2.value) validar("clave2"); }
  });
});

// Medidor de fortaleza de contraseña
function medirClave(v) {
  const puntos = [v.length >= 8, /[A-Z]/.test(v), /\d/.test(v), /[^A-Za-z0-9]/.test(v), v.length >= 12].filter(Boolean).length;
  const niveles = [["0%", "Usa mayúscula, número y símbolo."], ["20%", "Muy débil"], ["40%", "Débil"], ["60%", "Aceptable"], ["80%", "Buena"], ["100%", "Excelente"]];
  const barra = document.getElementById("meter-bar");
  barra.style.width = v ? niveles[puntos][0] : "0%";
  barra.style.background = puntos < 3 ? "var(--error)" : puntos < 5 ? "#d9a21b" : "var(--ok)";
  document.getElementById("meter-text").textContent = v ? "Seguridad: " + niveles[puntos][1] : niveles[0][1];
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const resultados = campos.map(validar);       // valida todos para mostrar todos los errores
  const primerError = campos.find((_, i) => !resultados[i]);
  if (primerError) return form[primerError].focus();

  document.getElementById("exito-texto").textContent =
    `Gracias, ${form.nombre.value.trim().split(" ")[0]}. Te enviaremos los detalles a ${form.correo.value.trim()}.`;
  form.hidden = true;
  document.getElementById("exito").hidden = false;
});

document.getElementById("otro").addEventListener("click", () => {
  form.reset();
  form.querySelectorAll("input").forEach((i) => i.classList.remove("valid", "invalid"));
  form.querySelectorAll(".error").forEach((e) => (e.textContent = ""));
  medirClave("");
  document.getElementById("exito").hidden = true;
  form.hidden = false;
});
