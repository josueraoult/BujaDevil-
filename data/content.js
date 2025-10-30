// data/content.js - Système de base de données intégré pour BujaDevil

// ==================== CONFIGURATION INITIALE ====================
export const SITE_CONFIG = {
  name: 'BujaDevil',
  admin: {
    username: 'root',
    password: 'root',
    name: 'Josué Raoult',
    email: 'raoultjosue2@gmail.com',
    whatsapp: '+25761183143',
    age: 16,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face'
  },
  defaultLanguage: 'fr',
  supportedLanguages: ['fr', 'en', 'es']
}

// ==================== SYSTÈME DE STOCKAGE ====================
class BlogDatabase {
  constructor() {
    this.init()
  }

  init() {
    if (typeof window === 'undefined') return
    
    // Initialiser les données si elles n'existent pas
    if (!localStorage.getItem('bujadevil_data')) {
      const initialData = {
        users: [{
          id: this.generateId(),
          username: SITE_CONFIG.admin.username,
          password: this.hashPassword(SITE_CONFIG.admin.password),
          name: SITE_CONFIG.admin.name,
          email: SITE_CONFIG.admin.email,
          avatar: SITE_CONFIG.admin.avatar,
          role: 'admin',
          age: SITE_CONFIG.admin.age,
          whatsapp: SITE_CONFIG.admin.whatsapp,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        }],
        articles: [],
        comments: [],
        likes: [],
        bookmarks: [],
        sessions: [],
        settings: {
          siteTitle: SITE_CONFIG.name,
          language: 'auto',
          theme: 'system'
        }
      }
      this.saveData(initialData)
    }
  }

  // Générer un ID unique
  generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36)
  }

  // Hacher le mot de passe (basique pour le moment)
  hashPassword(password) {
    return btoa(unescape(encodeURIComponent(password)))
  }

  // Vérifier le mot de passe
  verifyPassword(password, hashedPassword) {
    return this.hashPassword(password) === hashedPassword
  }

  // Sauvegarder les données
  saveData(data) {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('bujadevil_data', JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      return false
    }
  }

  // Charger les données
  loadData() {
    if (typeof window === 'undefined') return { users: [], articles: [], comments: [] }
    try {
      const data = localStorage.getItem('bujadevil_data')
      return data ? JSON.parse(data) : { users: [], articles: [], comments: [] }
    } catch (error) {
      console.error('Erreur chargement:', error)
      return { users: [], articles: [], comments: [] }
    }
  }

  // ==================== GESTION DES UTILISATEURS ====================
  async registerUser(userData) {
    const data = this.loadData()
    const existingUser = data.users.find(u => 
      u.email === userData.email || u.username === userData.username
    )

    if (existingUser) {
      return { success: false, error: 'Utilisateur déjà existant' }
    }

    const newUser = {
      id: this.generateId(),
      ...userData,
      password: this.hashPassword(userData.password),
      role: 'user',
      avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=0ea5e9&color=fff`,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }

    data.users.push(newUser)
    this.saveData(data)

    // Créer une session
    this.createSession(newUser.id)

    return { success: true, user: this.sanitizeUser(newUser) }
  }

  async loginUser(identifier, password) {
    const data = this.loadData()
    const user = data.users.find(u => 
      u.email === identifier || u.username === identifier
    )

    if (!user || !this.verifyPassword(password, user.password)) {
      return { success: false, error: 'Identifiants incorrects' }
    }

    // Mettre à jour lastLogin
    user.lastLogin = new Date().toISOString()
    this.saveData(data)

    // Créer une session
    this.createSession(user.id)

    return { success: true, user: this.sanitizeUser(user) }
  }

  createSession(userId) {
    const data = this.loadData()
    const session = {
      id: this.generateId(),
      userId,
      token: this.generateId(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours
      createdAt: new Date().toISOString()
    }

    data.sessions = data.sessions.filter(s => s.userId !== userId) // Supprimer sessions existantes
    data.sessions.push(session)
    this.saveData(data)

    if (typeof window !== 'undefined') {
      localStorage.setItem('bujadevil_session', session.token)
    }

    return session
  }

  getCurrentUser() {
    if (typeof window === 'undefined') return null
    
    const token = localStorage.getItem('bujadevil_session')
    if (!token) return null

    const data = this.loadData()
    const session = data.sessions.find(s => s.token === token)
    
    if (!session || new Date(session.expiresAt) < new Date()) {
      this.logoutUser()
      return null
    }

    const user = data.users.find(u => u.id === session.userId)
    return user ? this.sanitizeUser(user) : null
  }

  logoutUser() {
    if (typeof window === 'undefined') return
    
    const token = localStorage.getItem('bujadevil_session')
    if (token) {
      const data = this.loadData()
      data.sessions = data.sessions.filter(s => s.token !== token)
      this.saveData(data)
      localStorage.removeItem('bujadevil_session')
    }
  }

  sanitizeUser(user) {
    const { password, ...sanitized } = user
    return sanitized
  }

  updateUserProfile(userId, updates) {
    const data = this.loadData()
    const userIndex = data.users.findIndex(u => u.id === userId)
    
    if (userIndex === -1) return { success: false, error: 'Utilisateur non trouvé' }

    data.users[userIndex] = { ...data.users[userIndex], ...updates }
    this.saveData(data)

    return { success: true, user: this.sanitizeUser(data.users[userIndex]) }
  }

  // ==================== GESTION DES ARTICLES ====================
  async createArticle(articleData, authorId) {
    const data = this.loadData()
    const author = data.users.find(u => u.id === authorId)
    
    if (!author) return { success: false, error: 'Auteur non trouvé' }

    const slug = this.generateSlug(articleData.title)
    const existingArticle = data.articles.find(a => a.slug === slug)
    
    if (existingArticle) {
      return { success: false, error: 'Un article avec ce titre existe déjà' }
    }

    const newArticle = {
      id: this.generateId(),
      ...articleData,
      slug,
      author: this.sanitizeUser(author),
      authorId,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      readingTime: this.calculateReadingTime(articleData.content),
      status: 'published'
    }

    data.articles.unshift(newArticle)
    this.saveData(data)

    return { success: true, article: newArticle }
  }

  async updateArticle(articleId, updates, userId) {
    const data = this.loadData()
    const articleIndex = data.articles.findIndex(a => a.id === articleId)
    
    if (articleIndex === -1) return { success: false, error: 'Article non trouvé' }

    const article = data.articles[articleIndex]
    
    // Vérifier les permissions
    if (article.authorId !== userId && !this.isAdmin(userId)) {
      return { success: false, error: 'Non autorisé' }
    }

    if (updates.title && updates.title !== article.title) {
      updates.slug = this.generateSlug(updates.title)
    }

    data.articles[articleIndex] = {
      ...article,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.saveData(data)
    return { success: true, article: data.articles[articleIndex] }
  }

  async deleteArticle(articleId, userId) {
    const data = this.loadData()
    const articleIndex = data.articles.findIndex(a => a.id === articleId)
    
    if (articleIndex === -1) return { success: false, error: 'Article non trouvé' }

    const article = data.articles[articleIndex]
    
    // Vérifier les permissions
    if (article.authorId !== userId && !this.isAdmin(userId)) {
      return { success: false, error: 'Non autorisé' }
    }

    // Supprimer les commentaires associés
    data.comments = data.comments.filter(c => c.articleId !== articleId)
    // Supprimer les likes associés
    data.likes = data.likes.filter(l => l.articleId !== articleId)

    data.articles.splice(articleIndex, 1)
    this.saveData(data)

    return { success: true }
  }

  getArticles(options = {}) {
    const data = this.loadData()
    let articles = [...data.articles]

    // Filtrer par catégorie
    if (options.category && options.category !== 'all') {
      articles = articles.filter(a => a.category === options.category)
    }

    // Filtrer par statut
    if (options.status) {
      articles = articles.filter(a => a.status === options.status)
    } else {
      articles = articles.filter(a => a.status === 'published')
    }

    // Recherche
    if (options.search) {
      const searchTerm = options.search.toLowerCase()
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(searchTerm) ||
        a.excerpt.toLowerCase().includes(searchTerm) ||
        a.content.toLowerCase().includes(searchTerm)
      )
    }

    // Trier
    if (options.sort === 'popular') {
      articles.sort((a, b) => (b.views + b.likes * 10) - (a.views + a.likes * 10))
    } else if (options.sort === 'trending') {
      articles.sort((a, b) => {
        const scoreA = this.calculateTrendingScore(a)
        const scoreB = this.calculateTrendingScore(b)
        return scoreB - scoreA
      })
    } else {
      articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    }

    // Pagination
    if (options.page && options.limit) {
      const start = (options.page - 1) * options.limit
      const end = start + options.limit
      articles = articles.slice(start, end)
    }

    return articles
  }

  getArticleBySlug(slug) {
    const data = this.loadData()
    const article = data.articles.find(a => a.slug === slug)
    
    if (article) {
      // Incrémenter les vues
      article.views = (article.views || 0) + 1
      this.saveData(data)
    }

    return article
  }

  getArticlesByAuthor(authorId) {
    const data = this.loadData()
    return data.articles.filter(a => a.authorId === authorId && a.status === 'published')
  }

  // ==================== GESTION DES COMMENTAIRES ====================
  async createComment(commentData, userId) {
    const data = this.loadData()
    const user = data.users.find(u => u.id === userId)
    const article = data.articles.find(a => a.id === commentData.articleId)

    if (!user) return { success: false, error: 'Utilisateur non trouvé' }
    if (!article) return { success: false, error: 'Article non trouvé' }

    const newComment = {
      id: this.generateId(),
      ...commentData,
      author: this.sanitizeUser(user),
      authorId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      isApproved: true
    }

    data.comments.unshift(newComment)
    this.saveData(data)

    return { success: true, comment: newComment }
  }

  getArticleComments(articleId) {
    const data = this.loadData()
    return data.comments
      .filter(c => c.articleId === articleId && c.isApproved)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  // ==================== INTERACTIONS ====================
  async toggleLike(articleId, userId) {
    const data = this.loadData()
    const existingLike = data.likes.find(l => l.articleId === articleId && l.userId === userId)
    
    if (existingLike) {
      // Retirer le like
      data.likes = data.likes.filter(l => l !== existingLike)
      const article = data.articles.find(a => a.id === articleId)
      if (article) article.likes = Math.max(0, (article.likes || 0) - 1)
    } else {
      // Ajouter le like
      data.likes.push({
        id: this.generateId(),
        articleId,
        userId,
        createdAt: new Date().toISOString()
      })
      const article = data.articles.find(a => a.id === articleId)
      if (article) article.likes = (article.likes || 0) + 1
    }

    this.saveData(data)
    return { success: true }
  }

  async toggleBookmark(articleId, userId) {
    const data = this.loadData()
    const existingBookmark = data.bookmarks.find(b => b.articleId === articleId && b.userId === userId)
    
    if (existingBookmark) {
      data.bookmarks = data.bookmarks.filter(b => b !== existingBookmark)
    } else {
      data.bookmarks.push({
        id: this.generateId(),
        articleId,
        userId,
        createdAt: new Date().toISOString()
      })
    }

    this.saveData(data)
    return { success: true }
  }

  // ==================== UTILITAIRES ====================
  generateSlug(title) {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  calculateReadingTime(content) {
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  calculateTrendingScore(article) {
    const ageInHours = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60)
    const viewsScore = article.views || 0
    const likesScore = (article.likes || 0) * 10
    const freshnessScore = Math.max(0, 100 - ageInHours) // Plus récent = score plus élevé
    
    return viewsScore + likesScore + freshnessScore
  }

  isAdmin(userId) {
    const data = this.loadData()
    const user = data.users.find(u => u.id === userId)
    return user && user.role === 'admin'
  }

  // ==================== STATISTIQUES ====================
  getStats() {
    const data = this.loadData()
    return {
      totalArticles: data.articles.length,
      totalUsers: data.users.length,
      totalComments: data.comments.length,
      totalLikes: data.likes.length,
      popularArticles: this.getArticles({ sort: 'popular', limit: 5 })
    }
  }

  // ==================== GESTION DES LANGUES ====================
  detectUserLanguage() {
    if (typeof window === 'undefined') return SITE_CONFIG.defaultLanguage
    
    const browserLang = navigator.language || navigator.userLanguage
    const primaryLang = browserLang.split('-')[0]
    
    return SITE_CONFIG.supportedLanguages.includes(primaryLang) 
      ? primaryLang 
      : SITE_CONFIG.defaultLanguage
  }

  updateLanguagePreference(language) {
    const data = this.loadData()
    data.settings.language = language
    this.saveData(data)
    return { success: true }
  }

  // ==================== EXPORT ====================
  exportData() {
    return this.loadData()
  }

  importData(importedData) {
    try {
      this.saveData(importedData)
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Erreur importation' }
    }
  }
}

// Instance globale de la base de données
const blogDB = new BlogDatabase()

// Export des fonctions principales
export default blogDB

// Export des fonctions utilitaires pour un usage direct
export const {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateUserProfile,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticles,
  getArticleBySlug,
  getArticlesByAuthor,
  createComment,
  getArticleComments,
  toggleLike,
  toggleBookmark,
  getStats,
  detectUserLanguage,
  updateLanguagePreference,
  exportData,
  importData
} = blogDB

// Données mock pour le développement initial
export const MOCK_ARTICLES = [
  {
    id: 'sample_1',
    title: 'Bienvenue sur BujaDevil',
    slug: 'bienvenue-sur-bujadevil',
    excerpt: 'Découvrez le blog moderne de Josué Raoult dédié à la tech, gaming et développement.',
    content: `# Bienvenue sur BujaDevil 👋

Bienvenue sur mon blog personnel ! Je suis Josué Raoult, un passionné de technologie de 16 ans.

## Ce que vous trouverez ici

- **News** : Les dernières actualités tech
- **Gaming** : Reviews et analyses de jeux
- **Apps** : Démonstrations d'applications
- **Tutoriels** : Guides pas à pas

## À propos de moi

Âge: 16 ans
Email: raoultjosue2@gmail.com
WhatsApp: +25761183143

Restez connecté pour du contenu frais et excitant ! 🚀`,
    category: 'news',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
    author: SITE_CONFIG.admin,
    authorId: 'admin_root',
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    views: 1,
    likes: 0,
    readingTime: 2,
    status: 'published'
  }
]

// Initialiser avec un article de bienvenue si la base est vide
if (typeof window !== 'undefined') {
  const data = blogDB.loadData()
  if (data.articles.length === 0) {
    MOCK_ARTICLES.forEach(article => {
      blogDB.createArticle(article, data.users[0]?.id)
    })
  }
      }
