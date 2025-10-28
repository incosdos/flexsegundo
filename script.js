let dbClientes;
let dbPedidos;

// Lista de clientes base
const clientes = ["Juan", "Pedro", "Maria", "Carla"];

document.addEventListener("DOMContentLoaded", () => {

    // === Base de datos CLIENTES ===
    const requestClientes = window.indexedDB.open('ClientesDB', 1);

    requestClientes.onerror = () => {
        console.log("Error al abrir la base de datos CLIENTES");
    };

    requestClientes.onsuccess = (event) => {
        dbClientes = event.target.result;
        console.log("✅ Base de datos CLIENTES lista");
    };

    requestClientes.onupgradeneeded = (event) => {
        dbClientes = event.target.result;
        const objetoCliente = dbClientes.createObjectStore("cliente", { keyPath: "id", autoIncrement: true });
        objetoCliente.createIndex("nombre", "nombre", { unique: false });
        objetoCliente.createIndex("cedula", "cedula", { unique: false });
        console.log("📦 Objeto CLIENTE creado...");
    };

    // === Base de datos PEDIDOS ===
    const requestPedidos = window.indexedDB.open('PedidosDB', 1);

    requestPedidos.onerror = () => {
        console.log("Error al abrir la base de datos PEDIDOS");
    };

    requestPedidos.onsuccess = (event) => {
        dbPedidos = event.target.result;
        console.log("Base de datos PEDIDOS lista");
        llenarCliente(); // llenar combo cuando esté lista la BD
    };

    requestPedidos.onupgradeneeded = (event) => {
        dbPedidos = event.target.result;
        const objetoPedido = dbPedidos.createObjectStore("pedido", { keyPath: "id", autoIncrement: true });
        objetoPedido.createIndex("producto", "producto", { unique: false });
        objetoPedido.createIndex("cantidad", "cantidad", { unique: false });
        objetoPedido.createIndex("cliente", "cliente", { unique: false });
        console.log("Objeto PEDIDO creado...");
    };

    // Formularios
    const formularioCliente = document.getElementById("formularioCliente");
    formularioCliente.addEventListener("submit", agregarCliente);

    const formularioPedido = document.getElementById("formularioPedido");
    formularioPedido.addEventListener("submit", agregarPedido);

    // Botones de visualización
    document.getElementById("verdatos").addEventListener("click", mostrarCliente);
    document.getElementById("verdatospedido").addEventListener("click", mostrarPedido);
});


// === Función: Llenar combo de clientes ===
function llenarCliente() {
    const selectClientes = document.getElementById("cliente");
    if (!selectClientes) {
        console.error("No se encontró el <select> con id='cliente'");
        return;
    }

    selectClientes.innerHTML = '<option value="">Seleccione un cliente</option>';

    clientes.forEach(cli => {
        const opcion = document.createElement("option");
        opcion.value = cli;
        opcion.textContent = cli;
        selectClientes.appendChild(opcion);
    });

    console.log("Llenado de clientes realizado");
}


// === Función: Agregar Cliente ===
function agregarCliente(e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const cedula = document.getElementById("cedula").value.trim();

    if (!nombre || !cedula) {
        return alert("Todos los campos son obligatorios");
    }

    const tCliente = dbClientes.transaction("cliente", "readwrite");
    const oCliente = tCliente.objectStore("cliente");
    const cliente = { nombre, cedula };

    const request = oCliente.add(cliente);

    request.onerror = () => console.log("Error al agregar cliente");
    request.onsuccess = () => {
        console.log("Cliente agregado correctamente");
        mostrarCliente();
        e.target.reset();
    };
}


// === Función: Mostrar Clientes ===
function mostrarCliente() {
    const listaClientes = document.getElementById("lista-clientes");
    listaClientes.innerHTML = "<h3> Lista de Clientes</h3>";

    const lecturaClientes = dbClientes.transaction("cliente", "readonly");
    const oListaUsuario = lecturaClientes.objectStore("cliente");
    const request = oListaUsuario.openCursor();

    request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            const cliente = cursor.value;
            const div = document.createElement("div");
            div.classList.add("cliente");
            div.innerHTML = `
                <p><strong>Nombre:</strong> ${cliente.nombre}</p>
                <p><strong>CI:</strong> ${cliente.cedula}</p>
                <button onclick="eliminarCliente(${cliente.id})"> Eliminar</button>
            `;
            listaClientes.appendChild(div);
            cursor.continue();
        }
    };
}


// === Función: Eliminar Cliente ===
function eliminarCliente(id) {
    console.log("Eliminando cliente con ID:", id);

    const tCliente = dbClientes.transaction("cliente", "readwrite");
    const oCliente = tCliente.objectStore("cliente");
    const request = oCliente.delete(id);

    request.onsuccess = () => {
        console.log("Cliente eliminado correctamente");
        mostrarCliente();
    };
    request.onerror = () => console.log("Error al eliminar cliente");
}


// === Función: Agregar Pedido ===
function agregarPedido(e) {
    e.preventDefault();

    const producto = document.getElementById("producto").value.trim();
    const cantidad = document.getElementById("cantidad").value.trim();
    const cliente = document.getElementById("cliente").value.trim();

    if (!producto || !cantidad || !cliente) {
        return alert("Todos los campos son obligatorios");
    }

    const tPedido = dbPedidos.transaction("pedido", "readwrite");
    const oPedido = tPedido.objectStore("pedido");
    const pedido = { producto, cantidad, cliente };

    const request = oPedido.add(pedido);

    request.onerror = (error) => console.log(" Error en la tabla PEDIDOS", error);
    request.onsuccess = () => {
        console.log("Pedido agregado correctamente");
        mostrarPedido();
        e.target.reset();
    };
}


// === Función: Mostrar Pedidos ===
function mostrarPedido() {
    const listaPedidos = document.getElementById("lista");
    listaPedidos.innerHTML = "<h3>Lista de Pedidos</h3>";

    const lecturaPedidos = dbPedidos.transaction("pedido", "readonly");
    const oListaPedido = lecturaPedidos.objectStore("pedido");
    const request = oListaPedido.openCursor();

    request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            const pedido = cursor.value;
            const div = document.createElement("div");
            div.classList.add("pedido");
            div.innerHTML = `
                <p><strong>Producto:</strong> ${pedido.producto}</p>
                <p><strong>Cantidad:</strong> ${pedido.cantidad}</p>
                <p><strong>Cliente:</strong> ${pedido.cliente}</p>
                <p><strong>-------------------------</p>

            `;
            listaPedidos.appendChild(div);
            cursor.continue();
        }
    };
}




