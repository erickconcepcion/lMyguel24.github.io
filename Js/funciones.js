function limpiarHTML() {
  while (listaTarea.firstChild) {
    listaTarea.removeChild(listaTarea.firstChild);
  }
}

function conectarDB() {
  const abrirConexion = window.indexedDB.open("todo", 1);

  abrirConexion.onerror = function () {
    console.log("hubo un error");
  };

  abrirConexion.onsuccess = function () {
    DB = abrirConexion.result;
  };
}

function imprimirAlerta(mensaje, tipo) {
  const alerta = document.querySelector(".alerta");
  if (!alerta) {
    const divMensaje = document.createElement("div");
    divMensaje.classList.add(
      "px-4",
      "py-3",
      "rounded",
      "max-w-lg",
      "mx-auto",
      "mt-6",
      "text-center",
      "border",
      "alerta"
    );

    if (tipo === "error") {
      divMensaje.classList.add("bg-red-100", "border-red-400", "text-red-700");
    } else {
      divMensaje.classList.add(
        "bg-green-100",
        "border-green-400",
        "text-green-700"
      );
    }

    divMensaje.textContent = mensaje;
    document
      .querySelector(".container")
      .insertBefore(divMensaje, document.querySelector("#formulario"));

    setTimeout(() => {
      divMensaje.remove();
    }, 3000);
  }
}

function crearDB() {
  const crearDB = window.indexedDB.open("todo", 1);

  crearDB.onerror = function () {
    console.log("hubo un error al guardar en la BD");
  };

  crearDB.onsuccess = function () {
    DB = crearDB.result;
  };

  crearDB.onupgradeneeded = function (e) {
    const db = e.target.result;

    const objectStore = db.createObjectStore("todo", {
      keyPath: "id",
      autoIncrement: true,
    });
    objectStore.createIndex("id", "id", { unique: true });
    objectStore.createIndex("nombre", "nombre", { unique: false });
    objectStore.createIndex("completed", "completed", { unique: false });

    console.log("Base de datos Creada");
  };
}
