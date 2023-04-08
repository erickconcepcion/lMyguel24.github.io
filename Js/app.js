let DB;
let editando = false;

const listaTarea = document.querySelector("#listaUL");
const tareaInput = document.querySelector("#tarea");
const formulario = document.querySelector("#formulario");

document.addEventListener("DOMContentLoaded", () => {
  crearDB();

  if (window.indexedDB.open("todo", 1)) {
    obtenerTareas();
  }

  formulario.addEventListener("submit", validarInput);
});

function validarInput(e) {
  e.preventDefault();

  if (tareaInput.value === "") {
    imprimirAlerta("Escribe una Tarea", "error");
    return;
  }
  const tarea = {
    nombre: tareaInput.value,
    completed: false
  };

  tarea.id = Number(Date.now());

  crearNuevaTarea(tarea);
}

function crearNuevaTarea(tarea) {
  const transaction = DB.transaction(["todo"], "readwrite");
  const objectStore = transaction.objectStore("todo");

  if (editando) {
    const parametrosURL = new URLSearchParams(window.location.search);
    idCliente = Number(parametrosURL.get("id"));

    const tareaActualizada = {
      id: idCliente,
      nombre: tareaInput.value,
      completed: tarea.completed
    };

    objectStore.put(tareaActualizada);

    transaction.oncomplete = () => {
      imprimirAlerta("Editado Correctamente");
      formulario.querySelector('button[type="submit"]').textContent =
        "Nueva Tarea";
    };

    transaction.onerror = () => {
      console.log("error");
      return;
    };

    editando = false;

  } else {
    objectStore.add(tarea);

    transaction.oncomplete = function () {
      imprimirAlerta("Se agregó correctamente");
    };

    transaction.onerror = () => {
      console.log("error");
      return;
    };

  }
  obtenerTareas();
}

function obtenerTareas() {
  const abrirConexion = window.indexedDB.open("todo", 1);

  abrirConexion.onerror = function () {
    console.log("hubo un error");
    return;
  };

  abrirConexion.onsuccess = function () {
    limpiarHTML();

    DB = abrirConexion.result;

    const objectStore = DB.transaction("todo").objectStore("todo");

    objectStore.openCursor().onsuccess = function (e) {
      const cursor = e.target.result;

      if (cursor) {
        const { nombre, id, completed } = cursor.value;

        const divTarea = document.createElement("div");
        divTarea.classList.add("list-group-item");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("mr-1");
        checkbox.checked = completed;

        const spanNombre = document.createElement("span");
        spanNombre.innerText = nombre;
        if (completed) {
          spanNombre.classList.add("tareaCompleta");
        }else{
          spanNombre.classList.remove('tareaCompleta');
        }

        const btnEditar = document.createElement("button");
        btnEditar.classList.add("btn", "btn-info", "ml-40", "mr-1");
        btnEditar.innerHTML = `Editar &times`;

        const btnBorrar = document.createElement("button");
        btnBorrar.classList.add("btn", "btn-danger");
        btnBorrar.innerHTML = `Borrar &times`;

        const cursorTarea = cursor.value;

        btnEditar.onclick = () => cargarEdicion(cursorTarea);

        btnBorrar.onclick = () => eliminarTarea(id);

        if(completed){
          btnEditar.disabled = true;
        }

        checkbox.addEventListener("change", () => {
          const transaction = DB.transaction(["todo"], "readwrite");
          const objectStore = transaction.objectStore("todo");

          // actualizar el valor de completed en el objeto cursorTarea
          cursorTarea.completed = checkbox.checked;

          objectStore.put(cursorTarea);

          transaction.oncomplete = () => {
            imprimirAlerta("Tarea actualizada");
            obtenerTareas();
          };

          transaction.onerror = () => {
            console.log("Error al actualizar la tarea");
            return;
          };
        });

        divTarea.appendChild(checkbox);
        divTarea.appendChild(spanNombre);
        divTarea.appendChild(btnEditar);
        divTarea.appendChild(btnBorrar);

        listaTarea.appendChild(divTarea);

        cursor.continue();
      }
    };
  }

  tareaInput.value = "";
  tareaInput.focus();
}


function eliminarTarea(id){
  const transaction = DB.transaction(['todo'], 'readwrite');
  const objectStore = transaction.objectStore('todo');

  objectStore.delete(id);

  transaction.onerror = function(){
    console.log('No se pudo eliminar la tarea');
    return;
  }

  transaction.oncomplete = function(){
    console.log(`Se borro la tarea ${id}`);
    imprimirAlerta('Tarea Eliminada');
  }

  obtenerTareas(); 
}

function cargarEdicion(tarea) {
  const { id, nombre } = tarea;

  window.history.pushState("","",`?id=${id}`);

  tareaInput.value = nombre;


  formulario.querySelector('button[type="submit"]').textContent =
    "Editar Tarea";

  editando = true;
}
