import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ==================== GESTION DES CLASSES CSS ====================

/**
 * Combine les classes Tailwind CSS de manière optimale
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// ==================== GESTION DU THÈME ====================

/**
 * Récupère le thème actuel depuis localStorage
 */
export function getStoredTheme() {
  if (typeof window === 'undefined') return 'system'
  try {
    return localStorage.getItem('theme') || 'system'
  } catch {
    return 'system'
  }
}

/**
 * Sauvegarde le thème dans localStorage
 */
export function setStoredTheme(theme) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('theme', theme)
  } catch (error) {
    console.warn('Impossible de sauvegarder le thème:', error)
  }
}

/**
 * Applique le thème au document
 */
export function applyTheme(theme) {
  if (typeof window === 'undefined') return
  
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  const appliedTheme = theme === 'system' ? systemTheme : theme
  
  if (appliedTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  
  // Mettre à jour le meta theme-color
  updateThemeColor(appliedTheme)
}

/**
 * Met à jour la meta tag theme-color
 */
function updateThemeColor(theme) {
  const metaTheme = document.querySelector('meta[name="theme-color"]')
  if (metaTheme) {
    metaTheme.content = theme === 'dark' ? '#1e293b' : '#0ea5e9'
  }
}

// ==================== FORMATAGE DES DATES ====================

/**
 * Formate une date de manière lisible
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }
  
  const mergedOptions = { ...defaultOptions, ...options }
  
  return new Date(date).toLocaleDateString('fr-FR', mergedOptions)
}

/**
 * Formate la date relative (il y a X temps)
 */
export function formatRelativeTime(date) {
  const now = new Date()
  const target = new Date(date)
  const diffInMs = now - target
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) return 'À l\'instant'
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`
  if (diffInHours < 24) return `Il y a ${diffInHours} h`
  if (diffInDays === 1) return 'Hier'
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`
  if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} sem`
  if (diffInDays < 365) return `Il y a ${Math.floor(diffInDays / 30)} mois`
  
  return `Il y a ${Math.floor(diffInDays / 365)} ans`
}

/**
 * Calcule le temps de lecture d'un texte
 */
export function calculateReadingTime(text) {
  const wordsPerMinute = 200
  const wordCount = text.split(/\s+/).length
  const readingTime = Math.ceil(wordCount / wordsPerMinute)
  return readingTime
}

// ==================== MANIPULATION DE TEXTE ====================

/**
 * Tronque un texte avec ellipse
 */
export function truncate(text, maxLength = 150) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Met en majuscule la première lettre
 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Génère un slug à partir d'un texte
 */
export function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

/**
 * Met en évidence les termes de recherche dans un texte
 */
export function highlightText(text, searchTerm) {
  if (!searchTerm) return text
  
  const regex = new RegExp(`(${searchTerm})`, 'gi')
  return text.replace(regex, '<mark class="search-highlight">$1</mark>')
}

// ==================== GESTION DES DONNÉES ====================

/**
 * Débounce une fonction
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Deep clone d'un objet
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Filtre les doublons d'un tableau
 */
export function uniqueBy(array, key) {
  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

/**
 * Groupe les éléments d'un tableau par clé
 */
export function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const group = item[key]
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {})
}

// ==================== VALIDATION ====================

/**
 * Valide un email
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valide une URL
 */
export function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

/**
 * Valide les données de formulaire d'admin
 */
export function validateAdminLogin(username, password) {
  const errors = []
  
  if (!username) errors.push('Nom d\'utilisateur requis')
  if (!password) errors.push('Mot de passe requis')
  if (username !== 'root') errors.push('Nom d\'utilisateur incorrect')
  if (password !== 'root') errors.push('Mot de passe incorrect')
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// ==================== GESTION DES CATÉGORIES ====================

/**
 * Récupère la couleur d'une catégorie
 */
export function getCategoryColor(category) {
  const colors = {
    news: 'accent-news',
    gaming: 'accent-gaming',
    apps: 'accent-apps',
    tutorials: 'accent-tutorials'
  }
  return colors[category] || 'primary'
}

/**
 * Récupère la classe badge pour une catégorie
 */
export function getCategoryBadgeClass(category) {
  const classes = {
    news: 'badge-news',
    gaming: 'badge-gaming',
    apps: 'badge-apps',
    tutorials: 'badge-tutorials'
  }
  return classes[category] || 'badge-primary'
}

// ==================== OPTIMISATIONS PERFORMANCE ====================

/**
 * Fonction de lazy loading pour les images
 */
export function lazyLoadImage(image) {
  if (typeof window === 'undefined') return
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        img.classList.remove('lazy')
        observer.unobserve(img)
      }
    })
  })

  if (image) {
    observer.observe(image)
  }
}

/**
 * Preload les images critiques
 */
export function preloadCriticalImages(imageUrls) {
  if (typeof window === 'undefined') return
  
  imageUrls.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = url
    document.head.appendChild(link)
  })
}

// ==================== GESTION DU SCROLL ====================

/**
 * Scroll fluide vers un élément
 */
export function smoothScrollTo(element, offset = 0) {
  if (typeof window === 'undefined') return
  
  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
  const offsetPosition = elementPosition - offset

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  })
}

/**
 * Calcule la progression de lecture
 */
export function getReadingProgress() {
  if (typeof window === 'undefined') return 0
  
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
  const progress = (scrollTop / docHeight) * 100
  
  return Math.min(100, Math.max(0, progress))
}

// ==================== GÉNÉRATION DE DONNÉES ====================

/**
 * Génère un ID unique
 */
export function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

/**
 * Génère des données mock pour le développement
 */
export function generateMockArticles(count = 10) {
  const categories = ['news', 'gaming', 'apps', 'tutorials']
  const titles = [
    'Les nouvelles tendances du développement web 2025',
    'Review: Le dernier jeu qui révolutionne le gaming',
    'Découverte: Une app qui change la productivité',
    'Tutoriel complet: Maîtriser Next.js 14',
    'Les actualités tech de la semaine',
    'Guide ultime pour optimiser vos performances',
    'Les secrets du développement moderne',
    'Analyse: L\'avenir du mobile gaming',
    'Comparatif: Les meilleurs outils dev 2025',
    'Tips pro: Améliorez votre workflow'
  ]

  return Array.from({ length: count }, (_, i) => {
    const category = categories[i % categories.length]
    return {
      id: generateId(),
      title: titles[i % titles.length],
      slug: generateSlug(titles[i % titles.length]),
      excerpt: `Cet article explore en détail le sujet "${titles[i % titles.length]}" avec des insights exclusifs et des analyses pointues.`,
      content: `# ${titles[i % titles.length]}\n\nContenu détaillé de l'article...`,
      category,
      image: `https://picsum.photos/600/400?random=${i}`,
      author: 'Josué Raoult',
      publishedAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      readingTime: Math.floor(Math.random() * 10) + 3,
      views: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 100),
      isTrending: Math.random() > 0.7
    }
  })
}

// ==================== GESTION DES ERREURS ====================

/**
 * Handler d'erreur global
 */
export function errorHandler(error, context = '') {
  console.error(`Erreur dans ${context}:`, error)
  
  // En production, on pourrait envoyer à un service de monitoring
  if (process.env.NODE_ENV === 'production') {
    // Sentry, LogRocket, etc.
  }
  
  return {
    error: true,
    message: error.message,
    context
  }
}

/**
 * Retry une fonction avec backoff exponentiel
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxRetries) throw error
      
      const delay = baseDelay * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

// ==================== HELPERS SPÉCIFIQUES BLOG ====================

/**
 * Trie les articles par trending (algorithme simple)
 */
export function sortByTrending(articles) {
  return articles.sort((a, b) => {
    const scoreA = (a.views * 0.4) + (a.likes * 0.6) + (a.isTrending ? 100 : 0)
    const scoreB = (b.views * 0.4) + (b.likes * 0.6) + (b.isTrending ? 100 : 0)
    return scoreB - scoreA
  })
}

/**
 * Filtre les articles par catégorie
 */
export function filterByCategory(articles, category) {
  if (!category || category === 'all') return articles
  return articles.filter(article => article.category === category)
}

/**
 * Recherche dans les articles
 */
export function searchArticles(articles, query) {
  if (!query) return articles
  
  const searchTerm = query.toLowerCase()
  return articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm) ||
    article.excerpt.toLowerCase().includes(searchTerm) ||
    article.content.toLowerCase().includes(searchTerm)
  )
}

/**
 * Pagine les résultats
 */
export function paginate(items, page = 1, limit = 10) {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  
  return {
    items: items.slice(startIndex, endIndex),
    totalPages: Math.ceil(items.length / limit),
    currentPage: page,
    totalItems: items.length,
    hasNext: endIndex < items.length,
    hasPrev: page > 1
  }
}

// ==================== EXPORT GLOBAL ====================

export default {
  cn,
  getStoredTheme,
  setStoredTheme,
  applyTheme,
  formatDate,
  formatRelativeTime,
  calculateReadingTime,
  truncate,
  capitalize,
  generateSlug,
  highlightText,
  debounce,
  deepClone,
  uniqueBy,
  groupBy,
  isValidEmail,
  isValidUrl,
  validateAdminLogin,
  getCategoryColor,
  getCategoryBadgeClass,
  lazyLoadImage,
  preloadCriticalImages,
  smoothScrollTo,
  getReadingProgress,
  generateId,
  generateMockArticles,
  errorHandler,
  retryWithBackoff,
  sortByTrending,
  filterByCategory,
  searchArticles,
  paginate
      }
