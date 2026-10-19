/* ========================================
   OJO PARA VER LA CONTRASEÑA
   Añade un botón 👁 a cada campo de contraseña
   para mostrar u ocultar lo que se escribe.
   ======================================== */

(function () {
  function añadirOjo(campo) {
    if (campo.dataset.ojo === "1") return;
    campo.dataset.ojo = "1";

    const envoltorio = document.createElement("span");
    envoltorio.style.cssText = "position:relative;display:block;width:100%;";
    campo.parentNode.insertBefore(envoltorio, campo);
    envoltorio.appendChild(campo);

    // Deja espacio a la derecha para que el texto no quede debajo del ojo
    campo.style.paddingRight = "44px";

    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = "👁";
    boton.title = "Mostrar / ocultar contraseña";
    boton.setAttribute("aria-label", "Mostrar u ocultar contraseña");
    boton.style.cssText =
      "position:absolute;right:6px;top:50%;transform:translateY(-50%);" +
      "background:transparent;border:none;cursor:pointer;font-size:18px;" +
      "padding:4px 6px;line-height:1;color:#555;box-shadow:none;" +
      "width:auto;margin:0;";

    boton.addEventListener("click", function () {
      const verla = campo.type === "password";
      campo.type = verla ? "text" : "password";
      boton.textContent = verla ? "🙈" : "👁";
      boton.title = verla ? "Ocultar contraseña" : "Mostrar contraseña";
      campo.focus();
    });

    envoltorio.appendChild(boton);
  }

  function activarOjos() {
    document.querySelectorAll('input[type="password"]').forEach(añadirOjo);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", activarOjos);
  } else {
    activarOjos();
  }
})();
