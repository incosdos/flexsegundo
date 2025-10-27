let dbClientes;
let dbPedidos;
let formulario;

const clientes = ["Juan", "Pedro", "Maria", "Carla"];
const pedidos = [];

document.addEventListener("DOMContentLoaded", () => {
    // --- Base de datos CLIENTES ---
    const requestClientes = window.indexedDB.open('ClientesDB', 1);

    requestClientes.onerror = () => {
        console.log("Error al abrir la base de datos CLIENTES");
    };

    requestClientes.onsuccess = (event) => {
        dbClientes = event.target.result;
        console.log("La base de datos CLIENTES está lista");
    };

    requestClientes.onupgradeneeded = (event) => {
        dbClientes = event.target.result;
        const objetoCliente = dbClientes.createObjectStore("cliente", { keyPath: "id", autoIncrement: true });
        objetoCliente.createIndex("nombre", "nombre", { unique: false });
        objetoCliente.createIndex("cedula", "cedula", { unique: false });
        console.log("Objeto CLIENTE creado...");
    };

    formulario = document.getElementById("formularioCliente");
    formulario.addEventListener("submit", agregarCliente);
    document.getElementById("verdatos").addEventListener("click", mostrarCliente );

    // --- Base de datos PEDIDOS ---
    const requestPedidos = window.indexedDB.open('PedidosDB', 1);

    requestPedidos.onerror = () => {
        console.log("Error al abrir la base de datos PEDIDOS");
    };

    requestPedidos.onsuccess = (event) => {
        dbPedidos = event.target.result;
        console.log("La base de datos PEDIDOS está lista");
        llenarCliente();
    };

    requestPedidos.onupgradeneeded = (event) => {
        dbPedidos = event.target.result;
        const objetoPedido = dbPedidos.createObjectStore("pedido", { keyPath: "id", autoIncrement: true });
        objetoPedido.createIndex("producto", "producto", { unique: false });
        objetoPedido.createIndex("cantidad", "cantidad", { unique: false });
        objetoPedido.createIndex("nombreCliente", "nombreCliente", { unique: false });
        console.log("Objeto PEDIDO creado...");
    };
});

function llenarCliente() {
    const selectClientes = document.getElementById("cliente");
    if (!selectClientes) {
        console.error("No se encontró el select con id 'cliente'");
        return;
    }

    console.log(clientes);
    clientes.forEach(cli => {
        const opciones = document.createElement("option");
        opciones.value = cli;
        opciones.textContent = cli;
        selectClientes.appendChild(opciones);
    });
    console.log("Llenado de clientes");
}

function agregarCliente(e) {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value.trim(); // recupera del input su valor del formulario
    const cedula = document.getElementById("cedula").value.trim(); // recupera el valor del input del formulario
        if (!nombre || !cedula) {
        return alert("Todos los campos son obligatorios"); // verifica que no este vacio los datos rellenados ene l input
    }
    const tCliente = dbClientes.transaction("cliente","readwrite"); // la tabla se llama cliente y es una tranccion cliente = tCliente
    const oCliente =  tCliente.objectStore("cliente"); // creamos un objeto cliente = oCliente
    const cliente = {nombre, cedula}; //  recuperamos los datos de nomnre y cedual y lo guardamos en cliente
    const request = oCliente.add(cliente); // se anade los datos recuperados en el objeto oCliente

        requestClientes.onerror = () => {
        console.log("Error en la Tabala Clientes"); // verifica y si no quiere guardar sale este error
    };

    requestClientes.onsuccess = () => {
        console.log("Cliente Agregado");
    };
}

function mostrarCliente(){
    const listaClientes = document.getElementById("lista-clientes");
    listaClientes.innerHTML = "<h2>LISTA CLIENTES</h2>";
     const lecturaClientes = dbClientes.transaction("cliente","readonly");
     const oListaUsuario = lecturaClientes.objectStore("cliente");
     const request = oListaUsuario.openCursor();
     request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor){
            const cliente = cursor.value;
            const div = document.createElement("div");
            div.classList.add("cliente");
            div.innerHTML = `
                <p><strong>Nombre:</strong>${cliente.nombre}</p>
                <p><strong>CI:</strong>${cliente.cedula}</p>
                <button onclick="eliminarCliente(${cliente.id})">Eliminar</button>
            `;
            listaClientes.appendChild(div);
            cursor.continue();
        }
     }
}

function eliminarCliente(id){
    console.log("Este es el id", id);
    const tCliente = dbClientes.transaction("cliente","readwrite");
    const oCliente =  tCliente.objectStore("cliente");
    const request = oCliente.delete(id); 
    request.onsuccess = () => {
        console.log("Cliente Eliminado");
        mostrarCliente();
    };

}




