'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MainLayout, LoadingSpinner, EmptyState } from '../../../components/layouts/layouts'
import blogDB from '../../../../data/content'
import { formatDate, calculateReadingTime, getCategoryBadgeClass, cn } from '../../../lib/utils'

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug

  const [article, setArticle] = useState(null)
  const [similarArticles, setSimilarArticles] = useState([])
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const [activeHeading, setActiveHeading] = useState('')

  // États pour les commentaires
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [currentUser] = useState(blogDB.getCurrentUser())

  // États pour les interactions
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showTableOfContents, setShowTableOfContents] = useState(false)

  useEffect(() => {
    if (slug) {
      loadArticle()
    }
  }, [slug])

  useEffect(() => {
    // Barre de progression de lecture
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      setReadingProgress(Math.min(100, Math.max(0, progress)))

      // Mise à jour de la table des matières active
      updateActiveHeading()
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [article])

  const loadArticle = async () => {
    setIsLoading(true)
    
    setTimeout(() => {
      const foundArticle = blogDB.getArticleBySlug(slug)
      
      if (!foundArticle) {
        setIsLoading(false)
        return
      }

      setArticle(foundArticle)
      
      // Charger les articles similaires
      const similar = blogDB.getArticles({ 
        category: foundArticle.category,
        limit: 3 
      }).filter(a => a.id !== foundArticle.id)
      
      setSimilarArticles(similar)
      
      // Charger les commentaires
      loadComments(foundArticle.id)
      
      // Vérifier les interactions utilisateur
      if (currentUser) {
        const data = blogDB.loadData()
        setIsLiked(data.likes?.some(like => 
          like.articleId === foundArticle.id && like.userId === currentUser.id
        ) || false)
        setIsBookmarked(data.bookmarks?.some(bookmark => 
          bookmark.articleId === foundArticle.id && bookmark.userId === currentUser.id
        ) || false)
      }
      
      setIsLoading(false)
    }, 600)
  }

  const loadComments = (articleId) => {
    setIsLoadingComments(true)
    setTimeout(() => {
      const articleComments = blogDB.getArticleComments(articleId)
      setComments(articleComments)
      setIsLoadingComments(false)
    }, 400)
  }

  const handleLike = async () => {
    if (!currentUser) {
      // Rediriger vers la connexion
      return
    }

    await blogDB.toggleLike(article.id, currentUser.id)
    setIsLiked(!isLiked)
    
    // Mettre à jour le compteur localement
    setArticle(prev => ({
      ...prev,
      likes: prev.likes + (isLiked ? -1 : 1)
    }))
  }

  const handleBookmark = async () => {
    if (!currentUser) return

    await blogDB.toggleBookmark(article.id, currentUser.id)
    setIsBookmarked(!isBookmarked)
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !currentUser) return

    setIsSubmittingComment(true)
    
    const result = await blogDB.createComment({
      articleId: article.id,
      content: newComment
    }, currentUser.id)

    if (result.success) {
      setNewComment('')
      loadComments(article.id)
    }
    
    setIsSubmittingComment(false)
  }

  const updateActiveHeading = () => {
    const headings = document.querySelectorAll('h2, h3')
    let currentActive = ''
    
    headings.forEach(heading => {
      const rect = heading.getBoundingClientRect()
      if (rect.top >= 0 && rect.top <= 200) {
        currentActive = heading.id
      }
    })
    
    setActiveHeading(currentActive)
  }

  const generateTableOfContents = () => {
    if (!article) return []
    
    const headings = article.content.match(/^##?\s+(.+)$/gm) || []
    return headings.map(heading => {
      const level = heading.startsWith('## ') ? 2 : 3
      const text = heading.replace(/^##?\s+/, '')
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      return { level, text, id }
    })
  }

  const scrollToHeading = (id) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      })
    }
  }

  const shareArticle = (platform) => {
    const url = window.location.href
    const title = article.title
    const text = article.excerpt

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`
    }

    window.open(shareUrls[platform], '_blank', 'width=600,height=400')
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </MainLayout>
    )
  }

  if (!article) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <EmptyState 
            message="Article non trouvé"
            action={
              <a href="/blog" className="btn-primary">
                Retour au blog
              </a>
            }
          />
        </div>
      </MainLayout>
    )
  }

  const tableOfContents = generateTableOfContents()

  return (
    <MainLayout>
      {/* Barre de progression */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary-500 to-accent-gaming z-50 transition-all duration-150"
        style={{ width: `${readingProgress}%` }}
      />

      <article className="min-h-screen bg-white dark:bg-dark-100">
        {/* Hero de l'article */}
        <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="absolute inset-0">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
          </div>
          
          <div className="container mx-auto px-4 py-24 relative z-10">
            <div className="max-w-4xl mx-auto">
              {/* Catégorie et métadonnées */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className={cn('badge', getCategoryBadgeClass(article.category))}>
                  {article.category}
                </span>
                <span className="text-gray-300">
                  {formatDate(article.publishedAt)}
                </span>
                <span className="text-gray-300">
                  {article.readingTime} min de lecture
                </span>
                <span className="text-gray-300">
                  👁️ {article.views} vues
                </span>
              </div>

              {/* Titre */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {article.title}
              </h1>

              {/* Extrait */}
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                {article.excerpt}
              </p>

              {/* Auteur */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-12 h-12 rounded-full border-2 border-white/20"
                  />
                  <div>
                    <div className="font-semibold">{article.author.name}</div>
                    <div className="text-gray-300 text-sm">
                      Publié le {formatDate(article.publishedAt, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleLike}
                    className={cn(
                      'p-3 rounded-full transition-all duration-200',
                      isLiked
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    )}
                  >
                    {isLiked ? '❤️' : '🤍'} {article.likes}
                  </button>
                  
                  {currentUser && (
                    <button
                      onClick={handleBookmark}
                      className={cn(
                        'p-3 rounded-full transition-all duration-200',
                        isBookmarked
                          ? 'bg-primary-500 text-white shadow-lg'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      )}
                    >
                      {isBookmarked ? '🔖' : '📑'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto lg:grid lg:grid-cols-4 lg:gap-12">
            {/* Table des matières (sidebar) */}
            {tableOfContents.length > 0 && (
              <aside className="hidden lg:block lg:col-span-1">
                <div className="sticky top-24">
                  <div className="bg-gray-50 dark:bg-dark-200 rounded-xl p-6 border border-gray-200 dark:border-dark-300">
                    <h3 className="font-semibold mb-4 flex items-center justify-between">
                      <span>Table des matières</span>
                      <button
                        onClick={() => setShowTableOfContents(!showTableOfContents)}
                        className="lg:hidden p-1 hover:bg-gray-200 dark:hover:bg-dark-300 rounded"
                      >
                        {showTableOfContents ? '↑' : '↓'}
                      </button>
                    </h3>
                    
                    <nav className={cn('space-y-2', showTableOfContents ? 'block' : 'hidden lg:block')}>
                      {tableOfContents.map((item) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          onClick={(e) => {
                            e.preventDefault()
                            scrollToHeading(item.id)
                          }}
                          className={cn(
                            'toc-link block transition-colors duration-200',
                            activeHeading === item.id && 'toc-link-active'
                          )}
                          style={{ marginLeft: item.level === 3 ? '1rem' : '0' }}
                        >
                          {item.text}
                        </a>
                      ))}
                    </nav>
                  </div>

                  {/* Partage social */}
                  <div className="bg-gray-50 dark:bg-dark-200 rounded-xl p-6 border border-gray-200 dark:border-dark-300 mt-4">
                    <h3 className="font-semibold mb-4">Partager</h3>
                    <div className="flex space-x-3">
                      {['twitter', 'facebook', 'linkedin', 'whatsapp'].map(platform => (
                        <button
                          key={platform}
                          onClick={() => shareArticle(platform)}
                          className="p-2 bg-white dark:bg-dark-300 border border-gray-300 dark:border-dark-400 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-400 transition-colors"
                        >
                          {platform === 'twitter' && '🐦'}
                          {platform === 'facebook' && '📘'}
                          {platform === 'linkedin' && '💼'}
                          {platform === 'whatsapp' && '💚'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            )}

            {/* Contenu principal */}
            <div className={cn(
              "lg:col-span-3",
              tableOfContents.length > 0 ? "lg:col-span-3" : "lg:col-span-4"
            )}>
              {/* Contenu de l'article */}
              <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
                <div 
                  className="article-content"
                  dangerouslySetInnerHTML={{ 
                    __html: article.content.replace(/\n/g, '<br>').replace(/^##?\s+(.+)$/gm, (match) => {
                      const level = match.startsWith('###') ? 3 : 2
                      const text = match.replace(/^##?\s+/, '')
                      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                      return `<h${level} id="${id}">${text}</h${level}>`
                    })
                  }}
                />
              </div>

              {/* Tags et interactions */}
              <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-t border-gray-200 dark:border-dark-300 mb-12">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLike}
                    className={cn(
                      'btn inline-flex items-center space-x-2 transition-all duration-200',
                      isLiked
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-400'
                    )}
                  >
                    <span>{isLiked ? '❤️' : '🤍'}</span>
                    <span>J'aime ({article.likes})</span>
                  </button>

                  {currentUser && (
                    <button
                      onClick={handleBookmark}
                      className={cn(
                        'btn inline-flex items-center space-x-2 transition-all duration-200',
                        isBookmarked
                          ? 'bg-primary-500 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-400'
                      )}
                    >
                      <span>{isBookmarked ? '🔖' : '📑'}</span>
                      <span>{isBookmarked ? 'Sauvegardé' : 'Sauvegarder'}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Partager:</span>
                  {['twitter', 'facebook', 'linkedin'].map(platform => (
                    <button
                      key={platform}
                      onClick={() => shareArticle(platform)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors"
                    >
                      {platform === 'twitter' && '🐦'}
                      {platform === 'facebook' && '📘'}
                      {platform === 'linkedin' && '💼'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section commentaires */}
              <section className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold">Commentaires ({comments.length})</h2>
                </div>

                {/* Formulaire de commentaire */}
                {currentUser ? (
                  <form onSubmit={handleSubmitComment} className="mb-8">
                    <div className="flex space-x-4">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Partagez vos pensées..."
                          rows="4"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-dark-400 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all duration-200"
                          required
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            type="submit"
                            disabled={isSubmittingComment || !newComment.trim()}
                            className="btn-primary text-sm"
                          >
                            {isSubmittingComment ? 'Publication...' : 'Publier'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="bg-gray-50 dark:bg-dark-200 rounded-lg p-6 text-center mb-8">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Connectez-vous pour laisser un commentaire
                    </p>
                    <a href="#" className="btn-primary">
                      Se connecter
                    </a>
                  </div>
                )}

                {/* Liste des commentaires */}
                {isLoadingComments ? (
                  <LoadingSpinner />
                ) : comments.length > 0 ? (
                  <div className="space-y-6">
                    {comments.map(comment => (
                      <div key={comment.id} className="comment-card">
                        <div className="flex space-x-4">
                          <img
                            src={comment.author.avatar}
                            alt={comment.author.name}
                            className="w-10 h-10 rounded-full flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="font-semibold">{comment.author.name}</span>
                                <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                                  {formatDate(comment.createdAt, { 
                                    day: 'numeric', 
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Aucun commentaire pour le moment. Soyez le premier à commenter !
                  </div>
                )}
              </section>

              {/* Articles similaires */}
              {similarArticles.length > 0 && (
                <section className="mb-16">
                  <h2 className="text-2xl font-bold mb-8">Articles similaires</h2>
                  <div className="article-grid">
                    {similarArticles.map(article => (
                      <article key={article.id} className="card-gradient p-6 group cursor-pointer">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className={cn('badge', getCategoryBadgeClass(article.category))}>
                            {article.category}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {article.readingTime} min
                          </span>
                        </div>
                        <h3 className="font-semibold mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                          <a href={`/blog/${article.slug}`}>
                            {article.title}
                          </a>
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                          {article.excerpt}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </article>
    </MainLayout>
  )
         }
