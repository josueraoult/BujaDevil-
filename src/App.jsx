// App.jsx – BujaDevil Blog (tout-en-un, ultra-massif, Stack React + Firebase + Tailwind)
// Inspiré pitch.com/coca-cola, panel admin, gestion posts, commentaires, auth, design 2025
// ⚡️ Prêt pour Vercel, Firebase, et publication GitHub

import React, { useEffect, useState, useRef } from "react";

// Firebase SDK (assume global __firebase_config, __app_id, __initial_auth_token)
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, doc, addDoc, getDocs, query, orderBy, where,
  getDoc, setDoc, deleteDoc, serverTimestamp, updateDoc
} from "firebase/firestore";
import {
  getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject
} from "firebase/storage";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "firebase/auth";

// Utilitaires couleurs & catégories
const PRIMARY = "#ff003c";
const ACCENT = "#07f8ff";
const CATEGORIES = [
  "News Game",
  "App Download",
  "Football News",
  "Tutorial",
  "La Crème Du Gaming",
  "GTA",
  "Jeux",
];

// --- Firebase Init ---
const app = initializeApp(window.__firebase_config || {});
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const appId = window.__app_id || "bujadevil";

// --- Chemins Firestore ---
const postsPath = `artifacts/${appId}/public/data/posts`;
const commentsPath = `artifacts/${appId}/public/data/comments`;

// --- Utils ---
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const formatDate = (date) => {
  try {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date.toDate ? date.toDate() : date;
    return d.toLocaleDateString("fr-FR", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  } catch {
    return "";
  }
};

// --- Context Simulé d'auth ---
function useAuthSimu() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let unsub;
    if (window.__initial_auth_token) {
      signInWithEmailAndPassword(
        auth,
        window.__initial_auth_token.email,
        window.__initial_auth_token.password
      )
        .then(({ user }) => setUser(user))
        .catch(() => setUser(null))
        .finally(() => setChecking(false));
    } else {
      unsub = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setChecking(false);
      });
    }
    return () => unsub && unsub();
  }, []);
  return { user, checking };
}

// --- Loader global ---
function Loader({ text = "Chargement..." }) {
  return (
    <div className="loader-anim my-12">
      <span className="dot"></span>
      <span className="dot"></span>
      <span className="dot"></span>
      <span className="ml-4 text-lg text-[#bbb]">{text}</span>
    </div>
  );
}

// --- HEADER / NAV ---
function Header({ onNavigate, page, isAdmin, onLogout }) {
  return (
    <header className="sticky top-0 z-40 bg-[#101010]/90 blur-bg px-2 md:px-0 flex items-center justify-between h-20 border-b border-[#18181b] shadow-sm">
      <div className="flex items-center">
        <img src="/logo512.png" alt="logo" className="w-10 h-10 rounded-xl mr-3" />
        <span className="text-2xl font-extrabold tracking-tight text-white select-none">
          <span className="coca-red">Buja</span>Devil
        </span>
      </div>
      <nav className="flex gap-2 md:gap-6 items-center">
        <button
          onClick={() => onNavigate("home")}
          className={`font-semibold text-base py-1 px-3 rounded-full transition-colors ${page === "home" ? "bg-[#ff003c] text-white" : "hover:bg-[#232323] text-[#bbb]"}`}
        >
          Accueil
        </button>
        {isAdmin ?
          <button onClick={() => onNavigate("admin")}
            className={`font-semibold text-base py-1 px-3 rounded-full transition-colors ${page === "admin" ? "bg-[#07f8ff] text-black" : "hover:bg-[#232323] text-[#bbb]"}`}>
            Admin
          </button>
        : null}
        <a
          href="https://github.com/josueraoult/buja-devil-blog"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#bbb] hover:text-[#ff003c] font-semibold text-sm"
        >
          GitHub
        </a>
        {isAdmin && onLogout &&
          <button onClick={onLogout} className="ml-3 btn">Déconnexion</button>
        }
      </nav>
    </header>
  );
}

// --- HOMEPAGE (Liste des articles) ---
function HomePage({ posts, onOpenPost, filter, setFilter }) {
  return (
    <main className="max-w-5xl mx-auto py-8 px-2 fade-in">
      <h1 className="text-4xl md:text-5xl font-black mb-2 text-shadow">
        La Crème Du Gaming
      </h1>
      <p className="text-[#bbb] mb-8 text-lg max-w-2xl">
        Les dernières actus, tutos, téléchargements & news football. Powered by <b>React</b>.
      </p>
      <div className="flex flex-wrap gap-3 mb-5">
        <button
          onClick={() => setFilter("")}
          className={`btn ${filter === "" ? "bg-[#ff003c] text-white" : "bg-[#232323] text-[#bbb]"}`}>
          Toutes catégories
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`btn ${filter === cat ? "bg-[#07f8ff] text-black" : "bg-[#18181b] text-[#bbb]"}`}>
            {cat}
          </button>
        ))}
      </div>
      <section className="grid-autofill">
        {posts.length === 0 ? (
          <div className="text-[#bbb] col-span-2 text-xl mt-8">Aucun article disponible.</div>
        ) : posts.map((post) => (
          <PostCard key={post.id} post={post} onClick={() => onOpenPost(post)} />
        ))}
      </section>
    </main>
  );
}

// --- POSTCARD (Aperçu article) ---
function PostCard({ post, onClick }) {
  return (
    <div className="card cursor-pointer hover:scale-[1.025] transition-all fade-in" onClick={onClick}>
      {post.thumbnailUrl && (
        <img src={post.thumbnailUrl} alt="" className="w-full h-48 object-cover rounded-xl mb-3" loading="lazy" />
      )}
      <div className="flex gap-2 mb-1">
        <span className="px-3 py-1 bg-[#232323] rounded-full text-xs font-bold uppercase text-[#07f8ff]">{post.category}</span>
        <span className="px-3 py-1 bg-[#232323] rounded-full text-xs text-[#bbb]">{formatDate(post.publishedAt)}</span>
      </div>
      <h2 className="text-xl font-extrabold mt-1 mb-0.5">{post.title}</h2>
      <p className="text-[#bbb] text-base line-clamp-3">{post.content?.slice(0, 140)}{post.content?.length > 140 ? "..." : ""}</p>
      <div className="flex items-center mt-3 text-sm text-[#888]">
        <span className="font-semibold">{post.author || "BujaDevil"}</span>
      </div>
    </div>
  );
}

// --- POSTPAGE (Lecture article + commentaires) ---
function PostPage({ post, onBack }) {
  return (
    <main className="max-w-3xl mx-auto py-8 px-2 fade-in">
      <button onClick={onBack} className="btn mb-4">&larr; Retour</button>
      {post.thumbnailUrl && (
        <img src={post.thumbnailUrl} alt="" className="w-full rounded-2xl mb-6 shadow-lg" />
      )}
      <div className="flex flex-wrap gap-2 mb-2">
        <span className="px-3 py-1 bg-[#232323] rounded-full text-xs font-bold uppercase text-[#ff003c]">{post.category}</span>
        <span className="px-3 py-1 bg-[#232323] rounded-full text-xs text-[#bbb]">{formatDate(post.publishedAt)}</span>
      </div>
      <h1 className="text-4xl font-black mb-2 text-shadow">{post.title}</h1>
      <div className="text-[#bbb] mb-6 whitespace-pre-line">{post.content}</div>
      {post.videoUrl && (
        <div className="mb-6">
          <iframe
            src={post.videoUrl.replace("watch?v=", "embed/")}
            title="Vidéo"
            className="w-full aspect-video rounded-xl"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
      {post.downloadUrl &&
        <a href={post.downloadUrl} target="_blank" rel="noopener noreferrer"
          className="btn mb-6 block w-max">Télécharger le fichier</a>
      }
      <CommentSection postId={post.id} />
    </main>
  );
}

// --- COMMENTAIRES ---
function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState({ author: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  // Charger commentaires
  useEffect(() => {
    setLoading(true);
    getDocs(query(collection(db, commentsPath), where("postId", "==", postId), orderBy("createdAt", "desc")))
      .then(snapshot => setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))))
      .finally(() => setLoading(false));
  }, [postId]);

  // Post commentaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!input.author || !input.text) return setError("Remplis tous les champs !");
    setPosting(true);
    try {
      await addDoc(collection(db, commentsPath), {
        ...input,
        postId,
        createdAt: serverTimestamp(),
      });
      setInput({ author: "", text: "" });
      setComments([{ author: input.author, text: input.text, createdAt: new Date() }, ...comments]);
    } catch {
      setError("Erreur lors de l'envoi.");
    }
    setPosting(false);
  };

  return (
    <section className="mt-12 fade-in">
      <h3 className="text-xl font-extrabold mb-2">Commentaires</h3>
      <form className="flex flex-col md:flex-row gap-3 mb-5" onSubmit={handleSubmit}>
        <input
          className="flex-1"
          placeholder="Votre nom/pseudo"
          value={input.author}
          maxLength={32}
          onChange={e => setInput(i => ({ ...i, author: e.target.value }))}
        />
        <input
          className="flex-[2]"
          placeholder="Votre commentaire"
          value={input.text}
          maxLength={500}
          onChange={e => setInput(i => ({ ...i, text: e.target.value }))}
        />
        <button className="btn" type="submit" disabled={posting}>{posting ? "..." : "Envoyer"}</button>
      </form>
      {error && <div className="text-[#ff003c] mb-3">{error}</div>}
      {loading ? <Loader text="Chargement des commentaires..." /> : (
        <div>
          {comments.length === 0 && <div className="text-[#bbb]">Aucun commentaire pour l’instant.</div>}
          {comments.map((c, i) => (
            <div key={i} className="comment fade-in">
              <span className="comment-author">{c.author}</span>
              <span className="comment-date">{formatDate(c.createdAt)}</span>
              <div className="comment-body">{c.text}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// --- FORMULAIRE POST (Création / Edition) ---
function PostForm({ onSave, initial = {}, uploading, onCancel }) {
  const [data, setData] = useState({
    title: initial.title || "",
    content: initial.content || "",
    category: initial.category || CATEGORIES[0],
    videoUrl: initial.videoUrl || "",
    author: initial.author || "",
    publishedAt: initial.publishedAt || new Date(),
    thumbnailUrl: initial.thumbnailUrl || "",
    downloadUrl: initial.downloadUrl || "",
    id: initial.id || null,
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [downloadFile, setDownloadFile] = useState(null);

  // Prévisualisation image
  const handleThumbChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const handleDownloadChange = (e) => {
    setDownloadFile(e.target.files[0]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(d => ({ ...d, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(data, thumbnail, downloadFile);
  };

  return (
    <form className="card max-w-2xl mx-auto fade-in" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-4">{data.id ? "Modifier l'article" : "Nouvel article"}</h2>
      <label>Titre</label>
      <input name="title" value={data.title} onChange={handleChange} maxLength={80} required />
      <label>Contenu</label>
      <textarea name="content" value={data.content} onChange={handleChange} rows={7} required />
      <label>Catégorie</label>
      <select name="category" value={data.category} onChange={handleChange}>
        {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
      </select>
      <label>Lien Vidéo (YouTube, optionnel)</label>
      <input name="videoUrl" value={data.videoUrl} onChange={handleChange} placeholder="https://youtube.com/..." />
      <label>Auteur</label>
      <input name="author" value={data.author} onChange={handleChange} maxLength={32} placeholder="Francis Uliel" />
      <label>Date de publication</label>
      <input name="publishedAt" type="datetime-local"
        value={typeof data.publishedAt === "string"
          ? data.publishedAt.slice(0, 16)
          : new Date(data.publishedAt).toISOString().slice(0, 16)}
        onChange={e => setData(d => ({ ...d, publishedAt: e.target.value }))}
        required
      />
      <label>Image/thumbnail</label>
      <input type="file" accept="image/*" onChange={handleThumbChange} />
      {data.thumbnailUrl && (
        <img src={data.thumbnailUrl} alt="Miniature" className="w-44 h-28 rounded-xl mb-2 mt-2 object-cover" />
      )}
      <label>Fichier à télécharger (optionnel)</label>
      <input type="file" onChange={handleDownloadChange} />
      {data.downloadUrl && (
        <a href={data.downloadUrl} target="_blank" rel="noopener noreferrer" className="btn my-2">Voir le fichier</a>
      )}
      <div className="flex gap-3 mt-4">
        <button className="btn" type="submit" disabled={uploading}>{uploading ? "..." : "Enregistrer"}</button>
        {onCancel && <button className="btn bg-[#18181b] text-[#bbb]" type="button" onClick={onCancel}>Annuler</button>}
      </div>
    </form>
  );
}

// --- LOGIN ADMIN ---
function Login({ onLogin, loading, error }) {
  const [input, setInput] = useState({ email: "", password: "" });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput(i => ({ ...i, [name]: value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(input.email, input.password);
  };
  return (
    <form onSubmit={handleSubmit} className="card max-w-sm mx-auto my-24 fade-in">
      <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
      <label>Email</label>
      <input name="email" value={input.email} onChange={handleChange} type="email" required autoFocus />
      <label>Mot de passe</label>
      <input name="password" value={input.password} onChange={handleChange} type="password" required />
      {error && <div className="text-[#ff003c] mb-2">{error}</div>}
      <button className="btn mt-4 w-full" type="submit" disabled={loading}>{loading ? "..." : "Connexion"}</button>
    </form>
  );
}

// --- ADMIN DASHBOARD (Liste Posts + Edition/Supp) ---
function AdminDashboard({ posts, onEdit, onDelete, onAdd }) {
  return (
    <section className="max-w-5xl mx-auto py-8 px-2 fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black">Panel Admin</h1>
        <button className="btn" onClick={onAdd}>+ Nouvel Article</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-[#f6f6f6] bg-[#18181b] rounded-2xl shadow">
          <thead>
            <tr>
              <th className="py-3 px-2 text-left">Titre</th>
              <th className="py-3 px-2">Catégorie</th>
              <th className="py-3 px-2">Publication</th>
              <th className="py-3 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id} className="border-b border-[#232323] hover:bg-[#232323]">
                <td className="py-2 px-2">{post.title}</td>
                <td className="py-2 px-2">{post.category}</td>
                <td className="py-2 px-2">{formatDate(post.publishedAt)}</td>
                <td className="py-2 px-2 flex gap-2">
                  <button className="btn bg-[#07f8ff] text-black px-3 py-1" onClick={() => onEdit(post)}>Éditer</button>
                  <button className="btn bg-[#ff003c] text-white px-3 py-1" onClick={() => onDelete(post)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && <div className="text-[#bbb] mt-6">Aucun article.</div>}
      </div>
    </section>
  );
}

// --- ADMIN PAGE (auth + dashboard + formulaire) ---
function AdminPage({ user, onLogout }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Charger posts
  const refreshPosts = () => {
    setLoading(true);
    getDocs(query(collection(db, postsPath), orderBy("publishedAt", "desc")))
      .then(snapshot => setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refreshPosts(); }, []);

  // Connexion
  const handleLogin = (email, password) => {
    setAuthLoading(true);
    setLoginError("");
    signInWithEmailAndPassword(auth, email, password)
      .catch(() => setLoginError("Email/mot de passe incorrect"))
      .finally(() => setAuthLoading(false));
  };

  // Sauver (création/édition)
  const handleSave = async (data, thumbnail, downloadFile) => {
    setUploading(true);
    let thumbnailUrl = data.thumbnailUrl;
    let downloadUrl = data.downloadUrl;

    // Upload image thumbnail
    if (thumbnail) {
      const imgRef = storageRef(storage, `${postsPath}/${Date.now()}_${thumbnail.name}`);
      await uploadBytes(imgRef, thumbnail);
      thumbnailUrl = await getDownloadURL(imgRef);
      if (data.thumbnailUrl && data.thumbnailUrl.startsWith("https://")) {
        // Supprime ancienne miniature si existante
        try {
          const old = storageRef(storage, data.thumbnailUrl);
          await deleteObject(old);
        } catch { }
      }
    }

    // Upload fichier à télécharger
    if (downloadFile) {
      const dlRef = storageRef(storage, `${postsPath}/download_${Date.now()}_${downloadFile.name}`);
      await uploadBytes(dlRef, downloadFile);
      downloadUrl = await getDownloadURL(dlRef);
      if (data.downloadUrl && data.downloadUrl.startsWith("https://")) {
        try {
          const old = storageRef(storage, data.downloadUrl);
          await deleteObject(old);
        } catch { }
      }
    }

    const docData = {
      ...data,
      thumbnailUrl,
      downloadUrl,
      publishedAt: typeof data.publishedAt === "string" ? new Date(data.publishedAt) : data.publishedAt,
      updatedAt: serverTimestamp(),
    };

    try {
      if (data.id) {
        // Editer
        const docRef = doc(db, postsPath, data.id);
        await updateDoc(docRef, docData);
      } else {
        // Créer
        await addDoc(collection(db, postsPath), {
          ...docData,
          createdAt: serverTimestamp(),
        });
      }
      setAdding(false);
      setEditing(null);
      refreshPosts();
    } catch (e) {
      alert("Erreur lors de la sauvegarde.");
    }
    setUploading(false);
  };

  // Supprimer post
  const handleDelete = async (post) => {
    if (!window.confirm("Supprimer cet article ?")) return;
    try {
      await deleteDoc(doc(db, postsPath, post.id));
      // Supprimer les fichiers liés
      if (post.thumbnailUrl) {
        try { await deleteObject(storageRef(storage, post.thumbnailUrl)); } catch { }
      }
      if (post.downloadUrl) {
        try { await deleteObject(storageRef(storage, post.downloadUrl)); } catch { }
      }
      refreshPosts();
    } catch {
      alert("Erreur lors de la suppression.");
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} loading={authLoading} error={loginError} />;
  }

  if (adding) {
    return <PostForm onSave={handleSave} uploading={uploading} onCancel={() => setAdding(false)} />;
  }
  if (editing) {
    return <PostForm initial={editing} onSave={handleSave} uploading={uploading} onCancel={() => setEditing(null)} />;
  }

  return (
    <div>
      <AdminDashboard
        posts={posts}
        onAdd={() => setAdding(true)}
        onEdit={setEditing}
        onDelete={handleDelete}
      />
    </div>
  );
}

// --- APP PRINCIPAL ---
export default function App() {
  // SIMULATEUR DE "ROUTING"
  const [page, setPage] = useState("home"); // "home", "post", "admin"
  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("");
  const { user, checking } = useAuthSimu();
  const [loading, setLoading] = useState(true);

  // Charger posts
  useEffect(() => {
    setLoading(true);
    let q = query(collection(db, postsPath), orderBy("publishedAt", "desc"));
    if (filter) q = query(q, where("category", "==", filter));
    getDocs(q)
      .then(snapshot => setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))))
      .finally(() => setLoading(false));
  }, [filter, page]);

  // Navigation
  const handleNavigate = (p) => {
    setPage(p);
    setSelectedPost(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Ouverture article
  const handleOpenPost = (post) => {
    setSelectedPost(post);
    setPage("post");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Déconnexion
  const handleLogout = () => signOut(auth);

  // -- RENDU PRINCIPAL
  return (
    <div className="min-h-screen bg-[#101010]">
      <Header
        onNavigate={handleNavigate}
        page={page}
        isAdmin={!!user}
        onLogout={user ? handleLogout : null}
      />
      <main>
        {/* Loading global */}
        {checking || loading ? (
          <Loader text={checking ? "Vérification..." : "Chargement..."} />
        ) : (
          <>
            {page === "home" && (
              <HomePage
                posts={filter ? posts.filter(p => p.category === filter) : posts}
                onOpenPost={handleOpenPost}
                filter={filter}
                setFilter={setFilter}
              />
            )}
            {page === "post" && selectedPost && (
              <PostPage post={selectedPost} onBack={() => setPage("home")} />
            )}
            {page === "admin" && (
              <AdminPage user={user} onLogout={handleLogout} />
            )}
          </>
        )}
      </main>
      {/* Footer */}
      <footer className="mt-20 py-10 px-2 text-center text-[#888] text-sm fade-in">
        <div>
          © La crème du gaming 2025. Tous droits réservés. | Powered by <b>React</b>, <b>Firebase</b>, <b>Vercel</b>
        </div>
        <div className="mt-2">
          <a href="https://github.com/josueraoult/buja-devil-blog" className="text-[#ff003c] hover:underline" target="_blank" rel="noopener noreferrer">
            Code source sur GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
