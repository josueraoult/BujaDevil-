import { NextResponse } from 'next/server'
import blogDB from '../../../data/content'
import { debounce, highlightText, generateSlug } from '../../lib/utils'

// GET /api/search - Recherche avec autocomplétion et filtres
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all'
    const category = searchParams.get('category') || 'all'
    const limit = parseInt(searchParams.get('limit')) || 10
    const page = parseInt(searchParams.get('page')) || 1
    const autocomplete = searchParams.get('autocomplete') === 'true'

    // Si c'est une requête d'autocomplétion
    if (autocomplete && query.length > 0) {
      const suggestions = await getSearchSuggestions(query)
      return NextResponse.json({
        success: true,
        type: 'autocomplete',
        query,
        suggestions
      })
    }

    // Recherche normale
    const searchResults = await performSearch({
      query,
      type,
      category,
      limit,
      page
    })

    return NextResponse.json({
      success: true,
      type: 'search',
      query,
      ...searchResults
    })
  } catch (error) {
    console.error('Search API Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    )
  }
}

// POST /api/search - Recherche avancée avec body JSON
export async function POST(request) {
  try {
    const body = await request.json()
    const {
      query = '',
      type = 'all',
      category = 'all',
      tags = [],
      author = '',
      dateRange = {},
      sortBy = 'relevance',
      limit = 10,
      page = 1
    } = body

    const searchResults = await performAdvancedSearch({
      query,
      type,
      category,
      tags,
      author,
      dateRange,
      sortBy,
      limit,
      page
    })

    return NextResponse.json({
      success: true,
      type: 'advanced_search',
      query,
      ...searchResults
    })
  } catch (error) {
    console.error('Search API POST Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recherche avancée' },
      { status: 500 }
    )
  }
}

// Fonction de recherche principale
async function performSearch(options) {
  const { query, type, category, limit, page } = options
  const data = blogDB.loadData()
  let results = []
  let totalCount = 0

  // Recherche dans les articles
  if (type === 'all' || type === 'articles') {
    const articles = searchArticles(data.articles, query, category)
    results.push(...articles.map(article => ({
      type: 'article',
      ...article,
      excerpt: highlightText(article.excerpt, query),
      _highlight: {
        title: highlightText(article.title, query),
        excerpt: highlightText(article.excerpt, query)
      }
    })))
  }

  // Recherche dans les commentaires
  if (type === 'all' || type === 'comments') {
    const comments = searchComments(data.comments, query)
    results.push(...comments.map(comment => ({
      type: 'comment',
      ...comment,
      content: highlightText(comment.content, query),
      _highlight: {
        content: highlightText(comment.content, query)
      }
    })))
  }

  // Recherche dans les utilisateurs
  if (type === 'all' || type === 'users') {
    const users = searchUsers(data.users, query)
    results.push(...users.map(user => ({
      type: 'user',
      ...user,
      _highlight: {
        name: highlightText(user.name, query),
        email: highlightText(user.email, query)
      }
    })))
  }

  // Trier par pertinence
  results.sort((a, b) => calculateRelevanceScore(b, query) - calculateRelevanceScore(a, query))

  totalCount = results.length

  // Pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedResults = results.slice(startIndex, endIndex)

  // Statistiques de recherche
  const searchStats = {
    total: totalCount,
    articles: results.filter(r => r.type === 'article').length,
    comments: results.filter(r => r.type === 'comment').length,
    users: results.filter(r => r.type === 'user').length
  }

  // Suggestions de recherche liées
  const relatedSuggestions = getRelatedSuggestions(query, data)

  return {
    results: paginatedResults,
    pagination: {
      current: page,
      total: Math.ceil(totalCount / limit),
      hasNext: endIndex < totalCount,
      hasPrev: page > 1,
      totalCount
    },
    stats: searchStats,
    related: relatedSuggestions,
    filters: {
      query,
      type,
      category,
      limit
    }
  }
}

// Recherche avancée
async function performAdvancedSearch(options) {
  const { query, type, category, tags, author, dateRange, sortBy, limit, page } = options
  const data = blogDB.loadData()
  let results = []

  // Base des articles pour la recherche avancée
  let articles = data.articles.filter(article => article.status === 'published')

  // Filtre par recherche textuelle
  if (query) {
    articles = articles.filter(article =>
      article.title.toLowerCase().includes(query.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(query.toLowerCase()) ||
      article.content.toLowerCase().includes(query.toLowerCase())
    )
  }

  // Filtre par catégorie
  if (category && category !== 'all') {
    articles = articles.filter(article => article.category === category)
  }

  // Filtre par tags
  if (tags && tags.length > 0) {
    articles = articles.filter(article =>
      tags.some(tag => 
        article.title.toLowerCase().includes(tag.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(tag.toLowerCase()) ||
        article.content.toLowerCase().includes(tag.toLowerCase())
      )
    )
  }

  // Filtre par auteur
  if (author) {
    articles = articles.filter(article =>
      article.author.name.toLowerCase().includes(author.toLowerCase())
    )
  }

  // Filtre par date
  if (dateRange.start || dateRange.end) {
    articles = articles.filter(article => {
      const articleDate = new Date(article.publishedAt)
      if (dateRange.start && articleDate < new Date(dateRange.start)) return false
      if (dateRange.end && articleDate > new Date(dateRange.end)) return false
      return true
    })
  }

  // Trier les résultats
  switch (sortBy) {
    case 'newest':
      articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      break
    case 'oldest':
      articles.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt))
      break
    case 'popular':
      articles.sort((a, b) => (b.views + b.likes * 10) - (a.views + a.likes * 10))
      break
    case 'relevance':
    default:
      articles.sort((a, b) => calculateRelevanceScore(b, query) - calculateRelevanceScore(a, query))
      break
  }

  const totalCount = articles.length

  // Pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedResults = articles.slice(startIndex, endIndex).map(article => ({
    type: 'article',
    ...article,
    excerpt: highlightText(article.excerpt, query),
    _highlight: {
      title: highlightText(article.title, query),
      excerpt: highlightText(article.excerpt, query)
    }
  }))

  return {
    results: paginatedResults,
    pagination: {
      current: page,
      total: Math.ceil(totalCount / limit),
      hasNext: endIndex < totalCount,
      hasPrev: page > 1,
      totalCount
    },
    stats: {
      total: totalCount,
      articles: totalCount,
      comments: 0,
      users: 0
    },
    filters: {
      query,
      type,
      category,
      tags,
      author,
      dateRange,
      sortBy,
      limit
    }
  }
}

// Recherche dans les articles
function searchArticles(articles, query, category) {
  if (!query) return []

  const searchTerm = query.toLowerCase()
  return articles
    .filter(article => 
      article.status === 'published' &&
      (category === 'all' || article.category === category) &&
      (
        article.title.toLowerCase().includes(searchTerm) ||
        article.excerpt.toLowerCase().includes(searchTerm) ||
        article.content.toLowerCase().includes(searchTerm) ||
        article.author.name.toLowerCase().includes(searchTerm)
      )
    )
    .map(article => ({
      ...article,
      _score: calculateRelevanceScore(article, query)
    }))
}

// Recherche dans les commentaires
function searchComments(comments, query) {
  if (!query) return []

  const searchTerm = query.toLowerCase()
  return comments
    .filter(comment => 
      comment.isApproved &&
      (
        comment.content.toLowerCase().includes(searchTerm) ||
        comment.author.name.toLowerCase().includes(searchTerm)
      )
    )
    .map(comment => ({
      ...comment,
      _score: calculateRelevanceScore(comment, query)
    }))
}

// Recherche dans les utilisateurs
function searchUsers(users, query) {
  if (!query) return []

  const searchTerm = query.toLowerCase()
  return users
    .filter(user =>
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.username.toLowerCase().includes(searchTerm)
    )
    .map(user => ({
      ...user,
      _score: calculateRelevanceScore(user, query)
    }))
}

// Calcul du score de pertinence
function calculateRelevanceScore(item, query) {
  if (!query) return 0

  const searchTerm = query.toLowerCase()
  let score = 0

  if (item.type === 'article' || item.title) {
    // Articles
    if (item.title.toLowerCase().includes(searchTerm)) score += 10
    if (item.excerpt.toLowerCase().includes(searchTerm)) score += 5
    if (item.content.toLowerCase().includes(searchTerm)) score += 3
    if (item.author.name.toLowerCase().includes(searchTerm)) score += 2
    
    // Bonus pour les articles populaires
    score += Math.log((item.views || 0) + 1) * 0.1
    score += (item.likes || 0) * 0.05
  } else if (item.type === 'comment' || item.content) {
    // Commentaires
    if (item.content.toLowerCase().includes(searchTerm)) score += 8
    if (item.author.name.toLowerCase().includes(searchTerm)) score += 4
    score += (item.likes || 0) * 0.1
  } else if (item.type === 'user' || item.name) {
    // Utilisateurs
    if (item.name.toLowerCase().includes(searchTerm)) score += 10
    if (item.email.toLowerCase().includes(searchTerm)) score += 8
    if (item.username.toLowerCase().includes(searchTerm)) score += 6
  }

  return score
}

// Suggestions d'autocomplétion
async function getSearchSuggestions(query) {
  const data = blogDB.loadData()
  const searchTerm = query.toLowerCase()
  const suggestions = new Set()

  // Suggestions depuis les titres d'articles
  data.articles
    .filter(article => article.status === 'published')
    .forEach(article => {
      if (article.title.toLowerCase().includes(searchTerm)) {
        suggestions.add(article.title)
      }
    })

  // Suggestions depuis les catégories
  const categories = ['news', 'gaming', 'apps', 'tutorials']
  categories.forEach(category => {
    if (category.includes(searchTerm)) {
      suggestions.add(category)
    }
  })

  // Suggestions depuis les tags populaires
  const popularTags = getPopularTags(data)
  popularTags.forEach(tag => {
    if (tag.toLowerCase().includes(searchTerm)) {
      suggestions.add(tag)
    }
  })

  // Suggestions depuis les auteurs
  data.users.forEach(user => {
    if (user.name.toLowerCase().includes(searchTerm)) {
      suggestions.add(user.name)
    }
  })

  return Array.from(suggestions)
    .slice(0, 8)
    .map(suggestion => ({
      text: suggestion,
      type: getSuggestionType(suggestion, data),
      url: getSuggestionUrl(suggestion, data)
    }))
}

// Suggestions liées à la recherche
function getRelatedSuggestions(query, data) {
  const searchTerm = query.toLowerCase()
  const related = new Set()

  // Catégories liées
  const categories = ['news', 'gaming', 'apps', 'tutorials']
  categories.forEach(category => {
    if (hasArticlesInCategory(data.articles, category, searchTerm)) {
      related.add(category)
    }
  })

  // Auteurs liés
  data.users.forEach(user => {
    if (hasArticlesFromAuthor(data.articles, user.id, searchTerm)) {
      related.add(user.name)
    }
  })

  // Tags liés
  const popularTags = getPopularTags(data)
  popularTags.forEach(tag => {
    if (tag.toLowerCase().includes(searchTerm)) {
      related.add(tag)
    }
  })

  return Array.from(related).slice(0, 5)
}

// Tags populaires basés sur le contenu des articles
function getPopularTags(data) {
  const tagCounts = {}
  const allText = data.articles
    .filter(article => article.status === 'published')
    .map(article => `${article.title} ${article.excerpt} ${article.content}`)
    .join(' ')

  // Mots clés communs en développement
  const commonTags = [
    'javascript', 'react', 'nextjs', 'node', 'python', 'html', 'css',
    'tailwind', 'vue', 'angular', 'typescript', 'php', 'java', 'csharp',
    'gaming', 'mobile', 'web', 'design', 'tutorial', 'beginners',
    'advanced', 'performance', 'seo', 'security', 'database'
  ]

  commonTags.forEach(tag => {
    const regex = new RegExp(tag, 'gi')
    const matches = allText.match(regex)
    if (matches) {
      tagCounts[tag] = matches.length
    }
  })

  return Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag]) => tag)
}

// Helper functions
function getSuggestionType(suggestion, data) {
  if (data.articles.some(article => article.title === suggestion)) return 'article'
  if (['news', 'gaming', 'apps', 'tutorials'].includes(suggestion.toLowerCase())) return 'category'
  if (data.users.some(user => user.name === suggestion)) return 'author'
  return 'tag'
}

function getSuggestionUrl(suggestion, data) {
  const type = getSuggestionType(suggestion, data)
  
  switch (type) {
    case 'article':
      const article = data.articles.find(a => a.title === suggestion)
      return article ? `/blog/${article.slug}` : null
    case 'category':
      return `/blog?category=${suggestion.toLowerCase()}`
    case 'author':
      return `/blog?search=${encodeURIComponent(suggestion)}`
    default:
      return `/blog?search=${encodeURIComponent(suggestion)}`
  }
}

function hasArticlesInCategory(articles, category, searchTerm) {
  return articles.some(article =>
    article.category === category &&
    article.status === 'published' &&
    (
      article.title.toLowerCase().includes(searchTerm) ||
      article.excerpt.toLowerCase().includes(searchTerm)
    )
  )
}

function hasArticlesFromAuthor(articles, authorId, searchTerm) {
  return articles.some(article =>
    article.authorId === authorId &&
    article.status === 'published' &&
    (
      article.title.toLowerCase().includes(searchTerm) ||
      article.excerpt.toLowerCase().includes(searchTerm)
    )
  )
}

// OPTIONS pour CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
