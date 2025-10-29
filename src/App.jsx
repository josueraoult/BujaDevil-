import { useState, useEffect } from 'react';

// ============================================================================
// FIREBASE CONFIGURATION
// ============================================================================

let firebaseApp, db, storage, auth;

const initializeFirebase = async () => {
  if (typeof window !== 'undefined' && window.__firebase_config) {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy, Timestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const { getStorage, ref, uploadBytes, getDownloadURL } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js');
    const { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');

    firebaseApp = initializeApp(window.__firebase_config);
    db = getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);
    auth = getAuth(firebaseApp);

    return { db, storage, auth, collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy, Timestamp, ref, uploadBytes, getDownloadURL, signInWithEmailAndPassword, signOut, onAuthStateChanged };
  }
  return null;
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [firebase, setFirebase] = useState(null);

  // Initialize Firebase
  useEffect(() => {
    const init = async () => {
      const fb = await initializeFirebase();
      if (fb) {
        setFirebase(fb);
        setFirebaseReady(true);
        
        // Auth state listener
        fb.onAuthStateChanged(auth, (user) => {
          setUser(user);
        });
      }
      setLoading(false);
    };
    init();
  }, []);

  // Fetch posts
  useEffect(() => {
    if (firebaseReady && firebase) {
      fetchPosts();
    }
  }, [firebaseReady, firebase]);

  const fetchPosts = async () => {
    if (!firebase || !window.__app_id) return;
    try {
      const postsRef = firebase.collection(firebase.db, `artifacts/${window.__app_id}/public/data/posts`);
      const q = firebase.query(postsRef, firebase.orderBy('timestamp', 'desc'));
      const snapshot = await firebase.getDocs(q);
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const navigateTo = (page, post = null) => {
    setCurrentPage(page);
    setSelectedPost(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <Header 
        currentPage={currentPage} 
        navigateTo={navigateTo}
        user={user}
      />

      <main className="relative">
        {loading ? (
          <LoadingScreen />
        ) : currentPage === 'home' ? (
          <HomePage 
            posts={posts}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            navigateTo={navigateTo}
          />
        ) : currentPage === 'post' ? (
          <PostPage 
            post={selectedPost}
            navigateTo={navigateTo}
            firebase={firebase}
            firebaseReady={firebaseReady}
          />
        ) : currentPage === 'admin' ? (
          <AdminPage 
            user={user}
            posts={posts}
            firebase={firebase}
            firebaseReady={firebaseReady}
            fetchPosts={fetchPosts}
            navigateTo={navigateTo}
          />
        ) : null}
      </main>

      <Footer />
    </div>
  );
}

// ============================================================================
// HEADER COMPONENT
// ============================================================================

function Header({ currentPage, navigateTo, user }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-purple-500/20">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            onClick={() => navigateTo('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-xl transform group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                BujaDevil
              </h1>
              <p className="text-xs text-gray-400 font-medium">La Crème du Gaming</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigateTo('home')}
              className={`font-semibold transition-all ${
                currentPage === 'home' 
                  ? 'text-purple-400 border-b-2 border-purple-400' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Accueil
            </button>
            <button
              onClick={() => navigateTo('admin')}
              className={`font-semibold transition-all ${
                currentPage === 'admin' 
                  ? 'text-purple-400 border-b-2 border-purple-400' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {user ? 'Dashboard' : 'Admin'}
            </button>
            {user && (
              <div className="flex items-center space-x-2 bg-purple-600/20 px-4 py-2 rounded-full border border-purple-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-purple-300">Connecté</span>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-purple-500/20 space-y-3">
            <button
              onClick={() => { navigateTo('home'); setIsMenuOpen(false); }}
              className="block w-full text-left px-4 py-2 rounded-lg hover:bg-purple-600/20 transition-colors"
            >
              Accueil
            </button>
            <button
              onClick={() => { navigateTo('admin'); setIsMenuOpen(false); }}
              className="block w-full text-left px-4 py-2 rounded-lg hover:bg-purple-600/20 transition-colors"
            >
              {user ? 'Dashboard' : 'Admin'}
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}

// ============================================================================
// HOME PAGE COMPONENT
// ============================================================================

function HomePage({ posts, selectedCategory, setSelectedCategory, navigateTo }) {
  const categories = [
    { id: 'all', name: 'Tous', icon: '🎮' },
    { id: 'news-game', name: 'News Game', icon: '🎯' },
    { id: 'app-download', name: 'App Download', icon: '📱' },
    { id: 'football-news', name: 'Football News', icon: '⚽' },
    { id: 'tutorial', name: 'Tutorial', icon: '📚' }
  ];

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  return (
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden mb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-purple-900/30"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                La Crème du Gaming
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Découvrez les dernières actualités gaming, tutoriels exclusifs et téléchargements d'applications. Votre source #1 pour tout ce qui touche au gaming moderne.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/5 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10">
                <span className="text-purple-400 font-bold">{posts.length}+</span>
                <span className="text-gray-400 ml-2">Articles</span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10">
                <span className="text-pink-400 font-bold">100%</span>
                <span className="text-gray-400 ml-2">Gratuit</span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10">
                <span className="text-purple-400 font-bold">24/7</span>
                <span className="text-gray-400 ml-2">Mis à jour</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 mb-12">
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Posts Grid */}
      <section className="container mx-auto px-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block p-8 bg-white/5 rounded-2xl border border-white/10">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-400 mb-2">Aucun article</h3>
              <p className="text-gray-500">Aucun article dans cette catégorie pour le moment.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
              <PostCard key={post.id} post={post} navigateTo={navigateTo} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ============================================================================
// POST CARD COMPONENT
// ============================================================================

function PostCard({ post, navigateTo }) {
  const getCategoryIcon = (category) => {
    const icons = {
      'news-game': '🎯',
      'app-download': '📱',
      'football-news': '⚽',
      'tutorial': '📚'
    };
    return icons[category] || '🎮';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'news-game': 'from-purple-500 to-pink-500',
      'app-download': 'from-blue-500 to-cyan-500',
      'football-news': 'from-green-500 to-emerald-500',
      'tutorial': 'from-orange-500 to-red-500'
    };
    return colors[category] || 'from-purple-500 to-pink-500';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
  };

  return (
    <article 
      onClick={() => navigateTo('post', post)}
      className="group cursor-pointer bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20"
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-purple-900/50 to-pink-900/50">
        {post.imageUrl ? (
          <>
            <img 
              src={post.imageUrl} 
              alt={post.title}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-20 h-20 text-white/20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r ${getCategoryColor(post.category)} text-white shadow-lg`}>
            <span className="mr-2">{getCategoryIcon(post.category)}</span>
            {post.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center text-sm text-gray-400 mb-3">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          {formatDate(post.timestamp)}
        </div>

        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all">
          {post.title}
        </h3>

        <p className="text-gray-400 line-clamp-3 mb-4 leading-relaxed">
          {post.content.substring(0, 150)}...
        </p>

        <div className="flex items-center justify-between">
          <span className="text-purple-400 font-semibold flex items-center group-hover:translate-x-2 transition-transform">
            Lire l'article
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
          
          {post.videoUrl && (
            <div className="flex items-center text-sm text-gray-400">
              <svg className="w-5 h-5 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              Vidéo
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ============================================================================
// POST PAGE COMPONENT
// ============================================================================

function PostPage({ post, navigateTo, firebase, firebaseReady }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ name: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (firebaseReady && firebase && post) {
      fetchComments();
    }
  }, [firebaseReady, firebase, post]);

  const fetchComments = async () => {
    if (!firebase || !window.__app_id || !post) return;
    try {
      const commentsRef = firebase.collection(firebase.db, `artifacts/${window.__app_id}/public/data/comments`);
      const q = firebase.query(commentsRef, firebase.where('postId', '==', post.id), firebase.orderBy('timestamp', 'desc'));
      const snapshot = await firebase.getDocs(q);
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.name || !newComment.text || !firebase || !window.__app_id) return;

    setSubmitting(true);
    try {
      const commentsRef = firebase.collection(firebase.db, `artifacts/${window.__app_id}/public/data/comments`);
      await firebase.addDoc(commentsRef, {
        postId: post.id,
        name: newComment.name,
        text: newComment.text,
        timestamp: firebase.Timestamp.now()
      });
      setNewComment({ name: '', text: '' });
      await fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Erreur lors de l\'ajout du commentaire');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!post) return null;

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center text-purple-400 hover:text-purple-300 mb-8 transition-colors group"
        >
          <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux articles
        </button>

        {/* Article Header */}
        <article className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl overflow-hidden border border-white/10 mb-8">
          {/* Featured Image */}
          {post.imageUrl && (
            <div className="relative h-96 overflow-hidden">
              <img 
                src={post.imageUrl} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            </div>
          )}

          <div className="p-8">
            {/* Category & Date */}
            <div className="flex items-center justify-between mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {post.category}
              </span>
              <div className="flex items-center text-gray-400">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {formatDate(post.timestamp)}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight">
              {post.title}
            </h1>

            {/* Content */}
            <div className="prose prose-invert prose-lg max-w-none mb-8">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {/* Video */}
            {post.videoUrl && (
              <div className="mb-8 rounded-xl overflow-hidden">
                <div className="relative pb-[56.25%]">
                  <iframe
                    src={post.videoUrl.replace('watch?v=', 'embed/')}
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* Download Link */}
            {post.downloadUrl && (
              <a
                href={post.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Télécharger le fichier
              </a>
            )}
          </div>
        </article>

        {/* Comments Section */}
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-8 border border-white/10">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <svg className="w-8 h-8 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            Commentaires ({comments.length})
          </h2>

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Votre nom"
                value={newComment.name}
                onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>
            <textarea
              placeholder="Votre commentaire..."
              value={newComment.text}
              onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors mb-4 min-h-[120px]"
              required
            ></textarea>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Publication...' : 'Publier le commentaire'}
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>Aucun commentaire pour le moment. Soyez le premier à commenter !</p>
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                        <span className="font-bold text-lg">{comment.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-semibold">{comment.name}</p>
                        <p className="text-sm text-gray-400">{formatDate(comment.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{comment.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ADMIN PAGE COMPONENT
// ============================================================================

function AdminPage({ user, posts, firebase, firebaseReady, fetchPosts, navigateTo }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [logging, setLogging] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!firebase) return;

    setLogging(true);
    try {
      await firebase.signInWithEmailAndPassword(firebase.auth, email, password);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Login error:', error);
      alert('Erreur de connexion: ' + error.message);
    } finally {
      setLogging(false);
    }
  };

  const handleLogout = async () => {
    if (!firebase) return;
    try {
      await firebase.signOut(firebase.auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-8 border border-white/10">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-2">Connexion Admin</h2>
              <p className="text-gray-400">Accédez au panneau d'administration</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="admin@bujadevil.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={logging}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {logging ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Admin Header */}
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-8 border border-white/10 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Tableau de bord Admin
              </h1>
              <p className="text-gray-400">Gérez vos articles et contenus</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setShowPostForm(!showPostForm)}
            className="p-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105"
          >
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {showPostForm ? 'Fermer le formulaire' : 'Nouvel Article'}
          </button>

          <div className="p-6 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 text-center">
            <div className="text-4xl font-bold text-purple-400 mb-1">{posts.length}</div>
            <div className="text-gray-400">Articles publiés</div>
          </div>

          <div className="p-6 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 text-center">
            <div className="text-4xl font-bold text-pink-400 mb-1">✓</div>
            <div className="text-gray-400">Système actif</div>
          </div>
        </div>

        {/* Post Form */}
        {showPostForm && (
          <PostForm 
            firebase={firebase} 
            firebaseReady={firebaseReady}
            onSuccess={() => {
              setShowPostForm(false);
              fetchPosts();
            }}
          />
        )}

        {/* Posts List */}
        <AdminDashboard 
          posts={posts} 
          firebase={firebase}
          firebaseReady={firebaseReady}
          fetchPosts={fetchPosts}
          navigateTo={navigateTo}
        />
      </div>
    </div>
  );
}

// ============================================================================
// POST FORM COMPONENT
// ============================================================================

function PostForm({ firebase, firebaseReady, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'news-game',
    videoUrl: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [downloadFile, setDownloadFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firebase || !window.__app_id) return;

    setSubmitting(true);
    try {
      let imageUrl = '';
      let downloadUrl = '';

      // Upload image
      if (imageFile) {
        const imageRef = firebase.ref(firebase.storage, `artifacts/${window.__app_id}/images/${Date.now()}_${imageFile.name}`);
        await firebase.uploadBytes(imageRef, imageFile);
        imageUrl = await firebase.getDownloadURL(imageRef);
      }

      // Upload download file
      if (downloadFile) {
        const fileRef = firebase.ref(firebase.storage, `artifacts/${window.__app_id}/files/${Date.now()}_${downloadFile.name}`);
        await firebase.uploadBytes(fileRef, downloadFile);
        downloadUrl = await firebase.getDownloadURL(fileRef);
      }

      // Add post to Firestore
      const postsRef = firebase.collection(firebase.db, `artifacts/${window.__app_id}/public/data/posts`);
      await firebase.addDoc(postsRef, {
        ...formData,
        imageUrl,
        downloadUrl,
        timestamp: firebase.Timestamp.now()
      });

      // Reset form
      setFormData({ title: '', content: '', category: 'news-game', videoUrl: '' });
      setImageFile(null);
      setDownloadFile(null);
      alert('Article publié avec succès !');
      onSuccess();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Erreur lors de la création de l\'article');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-8 border border-white/10 mb-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <svg className="w-7 h-7 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Créer un nouvel article
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Titre de l'article</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
            placeholder="Ex: GTA 6 - Nouvelle bande-annonce"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Catégorie</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="news-game">🎯 News Game</option>
            <option value="app-download">📱 App Download</option>
            <option value="football-news">⚽ Football News</option>
            <option value="tutorial">📚 Tutorial</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Contenu de l'article</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors min-h-[200px]"
            placeholder="Rédigez votre article ici..."
            required
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Image principale</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-600 file:text-white file:cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Fichier à télécharger (optionnel)</label>
            <input
              type="file"
              onChange={(e) => setDownloadFile(e.target.files[0])}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-pink-600 file:text-white file:cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">URL de la vidéo YouTube (optionnel)</label>
          <input
            type="url"
            value={formData.videoUrl}
            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Publication en cours...' : 'Publier l\'article'}
        </button>
      </form>
    </div>
  );
}

// ============================================================================
// ADMIN DASHBOARD COMPONENT
// ============================================================================

function AdminDashboard({ posts, firebase, firebaseReady, fetchPosts, navigateTo }) {
  const handleDelete = async (postId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
    if (!firebase || !window.__app_id) return;

    try {
      const postRef = firebase.doc(firebase.db, `artifacts/${window.__app_id}/public/data/posts`, postId);
      await firebase.deleteDoc(postRef);
      await fetchPosts();
      alert('Article supprimé avec succès');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <svg className="w-7 h-7 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Gestion des articles
      </h2>

      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-xl">Aucun article publié</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition-colors">
              <div className="flex items-center flex-1">
                {post.imageUrl && (
                  <img 
                    src={post.imageUrl} 
                    alt={post.title}
                    className="w-16 h-16 object-cover rounded-lg mr-4"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{post.title}</h3>
                  <div className="flex items-center space-x-3 text-sm text-gray-400">
                    <span className="px-2 py-1 bg-purple-600/20 rounded-full text-purple-400">
                      {post.category}
                    </span>
                    <span>{new Date(post.timestamp?.toDate()).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateTo('post', post)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
                  Voir
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// FOOTER COMPONENT
// ============================================================================

function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-black/50 backdrop-blur-xl mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              BujaDevil
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Votre source #1 pour les actualités gaming, tutoriels et téléchargements d'applications. Restez connecté avec la crème du gaming.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-purple-400">Navigation</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Accueil</a></li>
              <li><a href="#" className="hover:text-white transition-colors">News Game</a></li>
              <li><a href="#" className="hover:text-white transition-colors">App Download</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Football News</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tutoriels</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-purple-400">Suivez-nous</h4>
            <div className="flex space-x-3">
              <a href="#" className="w-10 h-10 bg-white/5 hover:bg-purple-600/20 border border-white/10 rounded-full flex items-center justify-center transition-all transform hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 hover:bg-purple-600/20 border border-white/10 rounded-full flex items-center justify-center transition-all transform hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 hover:bg-purple-600/20 border border-white/10 rounded-full flex items-center justify-center transition-all transform hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 text-center text-gray-400">
          <p>&copy; 2025 BujaDevil - La Crème du Gaming. Tous droits réservés.</p>
          <p className="mt-2 text-sm">Créé avec 🔥 par Josué</p>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// LOADING SCREEN COMPONENT
// ============================================================================

function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 blur-2xl opacity-50 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 p-8 rounded-3xl animate-bounce">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold mt-8 mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          BujaDevil
        </h2>
        <p className="text-gray-400 animate-pulse">Chargement en cours...</p>
      </div>
    </div>
  );
    }
