// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBNsnLXHuDE6LdgUfpi4dnVRSPbI_XGuqI",
  authDomain: "meloud-pagina.firebaseapp.com",
  projectId: "meloud-pagina",
  storageBucket: "meloud-pagina.appspot.com", // Corrige esta línea
  messagingSenderId: "643160705887",
  appId: "1:643160705887:web:f8f67da444faa4059004ea",
  measurementId: "G-JR7YXQV195",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Referencias a elementos del DOM
const loginButton = document.getElementById("login");
const registerButton = document.getElementById("register");
const logoutButton = document.getElementById("logout");
const feed = document.getElementById("feed");
const newPost = document.getElementById("new-post");
const postButton = document.getElementById("post");
const postsList = document.getElementById("posts-list");

// Función para mostrar las publicaciones
async function loadPosts() {
  postsList.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "posts"));
  querySnapshot.forEach((doc) => {
    const li = document.createElement("li");
    li.textContent = doc.data().content;
    postsList.appendChild(li);
  });
}

// Manejar inicio de sesión
loginButton.addEventListener("click", () => {
  const email = prompt("Ingresa tu correo:");
  const password = prompt("Ingresa tu contraseña:");
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Inicio de sesión exitoso");
      loginButton.style.display = "none";
      registerButton.style.display = "none";
      logoutButton.style.display = "inline";
      feed.style.display = "block";
      loadPosts();
    })
    .catch((error) => alert("Error: " + error.message));
});

// Manejar registro de usuario
registerButton.addEventListener("click", () => {
  const email = prompt("Ingresa tu correo:");
  const password = prompt("Crea una contraseña:");
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => alert("Usuario registrado exitosamente"))
    .catch((error) => alert("Error: " + error.message));
});

// Manejar cierre de sesión
logoutButton.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      alert("Sesión cerrada");
      loginButton.style.display = "inline";
      registerButton.style.display = "inline";
      logoutButton.style.display = "none";
      feed.style.display = "none";
    })
    .catch((error) => alert("Error: " + error.message));
});

// Manejar nuevas publicaciones
postButton.addEventListener("click", async () => {
  const content = newPost.value.trim();
  if (content) {
    await addDoc(collection(db, "posts"), { content });
    newPost.value = "";
    loadPosts();
  } else {
    alert("No puedes publicar contenido vacío.");
  }
});
