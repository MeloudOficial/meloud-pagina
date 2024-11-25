// Importar las funciones necesarias de Firebase
import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, getDocs, updateDoc, doc 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBNsnLXHuDE6LdgUfpi4dnVRSPbI_XGuqI",
  authDomain: "meloud-pagina.firebaseapp.com",
  projectId: "meloud-pagina",
  storageBucket: "meloud-pagina.appspot.com",
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
const sidebar = document.querySelector(".sidebar");
const newPost = document.getElementById("new-post");
const postButton = document.getElementById("post");
const postsList = document.getElementById("posts-list");

// Función para actualizar la interfaz según el estado del usuario
function updateUI(user) {
  if (user) {
    // Usuario autenticado
    loginButton.style.display = "none";
    registerButton.style.display = "none";
    logoutButton.style.display = "inline-block";
    feed.style.display = "block";
    sidebar.style.display = "block";
    loadPosts();
  } else {
    // Usuario no autenticado
    loginButton.style.display = "inline-block";
    registerButton.style.display = "inline-block";
    logoutButton.style.display = "none";
    feed.style.display = "none";
    sidebar.style.display = "none";
  }
}

// Escuchar cambios en el estado del usuario
onAuthStateChanged(auth, (user) => {
  updateUI(user);
});

// Manejar inicio de sesión
loginButton.addEventListener("click", () => {
  const email = prompt("Ingresa tu correo:");
  const password = prompt("Ingresa tu contraseña:");

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Inicio de sesión exitoso");
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
});

// Manejar registro de usuario
registerButton.addEventListener("click", () => {
  const email = prompt("Ingresa tu correo:");
  const password = prompt("Crea una contraseña:");

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Usuario registrado exitosamente");
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
});

// Manejar cierre de sesión
logoutButton.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      alert("Sesión cerrada");
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
});

// Cargar publicaciones de la base de datos
async function loadPosts() {
  postsList.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "posts"));
  querySnapshot.forEach((doc) => {
    const li = document.createElement("li");
    li.classList.add("post");

    const postContent = document.createElement("div");
    postContent.classList.add("post-content");
    postContent.textContent = doc.data().content;

    const postActions = document.createElement("div");
    postActions.classList.add("post-actions");
    postActions.innerHTML = `
      <button class="like-btn" onclick="toggleLike('${doc.id}')">
        👍 ${doc.data().likes || 0} Me gusta
      </button>
    `;

    const commentsSection = document.createElement("div");
    commentsSection.classList.add("comments-section");
    commentsSection.innerHTML = `
      <input type="text" id="comment-input-${doc.id}" class="comment-input" placeholder="Deja un comentario...">
      <button onclick="postComment('${doc.id}')" class="comment-btn">Comentar</button>
      <ul id="comments-list-${doc.id}" class="comments-list"></ul>
    `;

    li.appendChild(postContent);
    li.appendChild(postActions);
    li.appendChild(commentsSection);
    postsList.appendChild(li);

    loadComments(doc.id); // Cargar comentarios para cada publicación
  });
}

// Manejar nuevas publicaciones
postButton.addEventListener("click", async () => {
  const content = newPost.value.trim();
  if (content) {
    await addDoc(collection(db, "posts"), { content, likes: 0 });
    newPost.value = "";
    loadPosts();
  } else {
    alert("No puedes publicar contenido vacío.");
  }
});

// Función para agregar un comentario
async function postComment(postId) {
  const commentInput = document.getElementById(`comment-input-${postId}`);
  const content = commentInput.value.trim();
  if (content) {
    await addDoc(collection(db, `posts/${postId}/comments`), { content });
    commentInput.value = "";
    loadComments(postId);
  }
}

// Cargar comentarios de la base de datos
async function loadComments(postId) {
  const querySnapshot = await getDocs(collection(db, `posts/${postId}/comments`));
  const commentsList = document.getElementById(`comments-list-${postId}`);
  commentsList.innerHTML = "";
  querySnapshot.forEach((doc) => {
    const li = document.createElement("li");
    li.classList.add("comment-item");
    li.textContent = doc.data().content;
    commentsList.appendChild(li);
  });
}

// Cambiar el estado del like
async function toggleLike(postId) {
  const postRef = doc(db, "posts", postId);
  const postDoc = await postRef.get();
  const currentLikes = postDoc.data().likes || 0;
  await updateDoc(postRef, { likes: currentLikes + 1 });
  loadPosts();
}
