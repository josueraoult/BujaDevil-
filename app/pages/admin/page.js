'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout, LoadingSpinner, EmptyState } from '../../components/layouts/layouts'
import { 
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Button, Input, Textarea, Select, Badge, Modal, Tabs, Pagination,
  ToastProvider, useToast, Table, Skeleton, ProgressBar
} from '../../components/ui/components'
import blogDB, { SITE_CONFIG } from '../../../data/content'
import { formatDate, formatRelativeTime, generateSlug, calculateReadingTime } from '../../lib/utils'

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({})
  const router = useRouter()
  const { addToast } = useToast()

  useEffect(() => {
    checkAuth()
    loadStats()
  }, [])

  const checkAuth = () => {
    const user = blogDB.getCurrentUser()
    if (user && user.role === 'admin') {
      setCurrentUser(user)
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }

  const loadStats = () => {
    const statsData = blogDB.getStats()
    setStats(statsData)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    
    if (loginData.username === 'root' && loginData.password === 'root') {
      // Simuler la connexion admin
      const adminUser = blogDB.loadData().users.find(u => u.username === 'root')
      if (adminUser) {
        blogDB.createSession(adminUser.id)
        setCurrentUser(blogDB.sanitizeUser(adminUser))
        setIsAuthenticated(true)
        addToast({
          title: 'Connexion réussie',
          description: 'Bienvenue dans le panel administrateur',
          variant: 'success'
        })
      }
    } else {
      addToast({
        title: 'Erreur de connexion',
        description: 'Identifiants incorrects',
        variant: 'danger'
      })
    }
  }

  const handleLogout = () => {
    blogDB.logoutUser()
    setIsAuthenticated(false)
    setCurrentUser(null)
    addToast({
      title: 'Déconnexion réussie',
      description: 'Vous avez été déconnecté',
      variant: 'success'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-cyan-50 dark:from-dark-200 dark:to-dark-300 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-gaming rounded-xl flex items-center justify-center text-white text-2xl font-bold mb-4">
                BD
              </div>
              <CardTitle>Connexion Admin</CardTitle>
              <CardDescription>
                Accès réservé à l'administrateur de BujaDevil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  label="Nom d'utilisateur"
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="root"
                  required
                />
                <Input
                  label="Mot de passe"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                />
                <Button type="submit" className="w-full">
                  Se connecter
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex-col space-y-2">
              <div className="text-sm text-gray-500 text-center">
                Identifiants par défaut: root / root
              </div>
              <Button variant="ghost" onClick={() => router.push('/')}>
                ← Retour au site
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
      <AdminLayout 
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        stats={stats}
      />
    </ToastProvider>
  )
}

function AdminLayout({ currentUser, activeTab, setActiveTab, onLogout, stats }) {
  return (
    <div className="min-h-screen admin-panel">
      {/* Header Admin */}
      <header className="bg-white dark:bg-dark-200 border-b border-gray-200 dark:border-dark-300 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-gaming rounded-lg flex items-center justify-center text-white font-bold text-sm">
                BD
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin BujaDevil</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Panel d'administration
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-medium">{currentUser.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {currentUser.role}
                </div>
              </div>
              <Button variant="ghost" onClick={onLogout}>
                Déconnexion
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-8 -mb-px">
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
              { id: 'articles', label: 'Articles', icon: '📝' },
              { id: 'comments', label: 'Commentaires', icon: '💬' },
              { id: 'users', label: 'Utilisateurs', icon: '👥' },
              { id: 'settings', label: 'Paramètres', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && <DashboardTab stats={stats} />}
        {activeTab === 'articles' && <ArticlesTab />}
        {activeTab === 'comments' && <CommentsTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'settings' && <SettingsTab currentUser={currentUser} />}
      </main>
    </div>
  )
}

// Tableau de bord
function DashboardTab({ stats }) {
  const [recentArticles, setRecentArticles] = useState([])
  const [recentComments, setRecentComments] = useState([])
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = () => {
    const articles = blogDB.getArticles({ limit: 5 })
    const comments = blogDB.loadData().comments.slice(0, 5)
    const userNotifications = blogDB.getUserNotifications(blogDB.getCurrentUser().id)
    
    setRecentArticles(articles)
    setRecentComments(comments)
    setNotifications(userNotifications.slice(0, 10))
  }

  const markNotificationAsRead = (notificationId) => {
    blogDB.markNotificationAsRead(notificationId)
    loadDashboardData()
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Articles"
          value={stats.totalArticles || 0}
          description="Total publiés"
          icon="📝"
          color="primary"
        />
        <StatCard
          title="Utilisateurs"
          value={stats.totalUsers || 0}
          description="Membres inscrits"
          icon="👥"
          color="success"
        />
        <StatCard
          title="Commentaires"
          value={stats.totalComments || 0}
          description="Total approuvés"
          icon="💬"
          color="warning"
        />
        <StatCard
          title="Likes"
          value={stats.totalLikes || 0}
          description="Interactions totales"
          icon="❤️"
          color="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Articles récents */}
        <Card>
          <CardHeader>
            <CardTitle>Articles Récents</CardTitle>
            <CardDescription>Les 5 derniers articles publiés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentArticles.map(article => (
                <div key={article.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-dark-300 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium line-clamp-1">{article.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(article.publishedAt)} • {article.views} vues
                    </div>
                  </div>
                  <Badge variant={article.category}>{article.category}</Badge>
                </div>
              ))}
              {recentArticles.length === 0 && (
                <EmptyState message="Aucun article publié" />
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => setActiveTab('articles')}>
              Voir tous les articles
            </Button>
          </CardFooter>
        </Card>

        {/* Commentaires récents */}
        <Card>
          <CardHeader>
            <CardTitle>Commentaires Récents</CardTitle>
            <CardDescription>Les derniers commentaires approuvés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentComments.map(comment => (
                <div key={comment.id} className="p-3 border border-gray-200 dark:border-dark-300 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{comment.author.name}</div>
                    <div className="text-sm text-gray-500">
                      {formatRelativeTime(comment.createdAt)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {comment.content}
                  </p>
                </div>
              ))}
              {recentComments.length === 0 && (
                <EmptyState message="Aucun commentaire" />
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => setActiveTab('comments')}>
              Gérer les commentaires
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications Récentes</CardTitle>
          <CardDescription>Activité récente sur votre blog</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                  notification.read
                    ? 'bg-gray-50 dark:bg-dark-300 border-gray-200 dark:border-dark-400'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                }`}
                onClick={() => markNotificationAsRead(notification.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-sm text-gray-500">
                    {formatRelativeTime(notification.createdAt)}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {notification.message}
                </p>
              </div>
            ))}
            {notifications.length === 0 && (
              <EmptyState message="Aucune notification" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Gestion des articles
function ArticlesTab() {
  const [articles, setArticles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const articlesPerPage = 10
  const { addToast } = useToast()

  useEffect(() => {
    loadArticles()
  }, [])

  const loadArticles = () => {
    setIsLoading(true)
    setTimeout(() => {
      const allArticles = blogDB.getArticles({ status: 'all' })
      setArticles(allArticles)
      setIsLoading(false)
    }, 500)
  }

  const handleCreateArticle = async (articleData) => {
    const currentUser = blogDB.getCurrentUser()
    const result = await blogDB.createArticle(articleData, currentUser.id)
    
    if (result.success) {
      addToast({
        title: 'Article créé',
        description: 'L\'article a été publié avec succès',
        variant: 'success'
      })
      loadArticles()
      setIsCreateModalOpen(false)
    } else {
      addToast({
        title: 'Erreur',
        description: result.error,
        variant: 'danger'
      })
    }
  }

  const handleUpdateArticle = async (articleId, updates) => {
    const currentUser = blogDB.getCurrentUser()
    const result = await blogDB.updateArticle(articleId, updates, currentUser.id)
    
    if (result.success) {
      addToast({
        title: 'Article modifié',
        description: 'L\'article a été mis à jour avec succès',
        variant: 'success'
      })
      loadArticles()
      setEditingArticle(null)
    } else {
      addToast({
        title: 'Erreur',
        description: result.error,
        variant: 'danger'
      })
    }
  }

  const handleDeleteArticle = async (articleId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return
    
    const currentUser = blogDB.getCurrentUser()
    const result = await blogDB.deleteArticle(articleId, currentUser.id)
    
    if (result.success) {
      addToast({
        title: 'Article supprimé',
        description: 'L\'article a été supprimé avec succès',
        variant: 'success'
      })
      loadArticles()
    } else {
      addToast({
        title: 'Erreur',
        description: result.error,
        variant: 'danger'
      })
    }
  }

  // Pagination
  const totalPages = Math.ceil(articles.length / articlesPerPage)
  const startIndex = (currentPage - 1) * articlesPerPage
  const currentArticles = articles.slice(startIndex, startIndex + articlesPerPage)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Articles</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Créez et gérez les articles de votre blog
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          + Nouvel Article
        </Button>
      </div>

      {/* Articles List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-dark-300">
                      <th className="text-left p-4 font-medium">Article</th>
                      <th className="text-left p-4 font-medium">Catégorie</th>
                      <th className="text-left p-4 font-medium">Statut</th>
                      <th className="text-left p-4 font-medium">Vues</th>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentArticles.map(article => (
                      <tr key={article.id} className="border-b border-gray-200 dark:border-dark-300 hover:bg-gray-50 dark:hover:bg-dark-300">
                        <td className="p-4">
                          <div className="font-medium line-clamp-1">{article.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{article.excerpt}</div>
                        </td>
                        <td className="p-4">
                          <Badge variant={article.category}>{article.category}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant={article.status === 'published' ? 'success' : 'warning'}>
                            {article.status === 'published' ? 'Publié' : 'Brouillon'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <span>👁️</span>
                            <span>{article.views}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                          {formatDate(article.publishedAt)}
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEditingArticle(article)}
                            >
                              ✏️
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteArticle(article.id)}
                            >
                              🗑️
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {articles.length === 0 && (
                <div className="p-12 text-center">
                  <EmptyState 
                    message="Aucun article publié"
                    action={
                      <Button onClick={() => setIsCreateModalOpen(true)}>
                        Créer votre premier article
                      </Button>
                    }
                  />
                </div>
              )}
            </>
          )}
        </CardContent>

        {articles.length > 0 && (
          <CardFooter className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {articles.length} article{articles.length > 1 ? 's' : ''} au total
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </CardFooter>
        )}
      </Card>

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || editingArticle) && (
        <ArticleModal
          article={editingArticle}
          onClose={() => {
            setIsCreateModalOpen(false)
            setEditingArticle(null)
          }}
          onSave={editingArticle ? 
            (data) => handleUpdateArticle(editingArticle.id, data) :
            handleCreateArticle
          }
        />
      )}
    </div>
  )
}

// Modal de création/édition d'article
function ArticleModal({ article, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: article?.title || '',
    excerpt: article?.excerpt || '',
    content: article?.content || '',
    category: article?.category || 'news',
    image: article?.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
    status: article?.status || 'published'
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSave(formData)
    } finally {
      setIsLoading(false)
    }
  }

  const categories = [
    { value: 'news', label: 'News' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'apps', label: 'Apps' },
    { value: 'tutorials', label: 'Tutoriels' }
  ]

  const statuses = [
    { value: 'published', label: 'Publié' },
    { value: 'draft', label: 'Brouillon' }
  ]

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={article ? 'Modifier l\'article' : 'Nouvel article'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Titre de l'article"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          <Select
            label="Catégorie"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            options={categories}
          />
        </div>

        <Input
          label="Image (URL)"
          value={formData.image}
          onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
          placeholder="https://example.com/image.jpg"
        />

        <Textarea
          label="Extrait"
          value={formData.excerpt}
          onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
          rows={3}
          required
        />

        <Textarea
          label="Contenu (Markdown supporté)"
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          rows={12}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Statut"
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            options={statuses}
          />
          <div className="flex items-end">
            <div className="text-sm text-gray-500">
              Temps de lecture estimé: {calculateReadingTime(formData.content)} min
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-dark-300">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" loading={isLoading}>
            {article ? 'Modifier' : 'Créer'} l'article
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// Gestion des commentaires
function CommentsTab() {
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadComments()
  }, [])

  const loadComments = () => {
    setIsLoading(true)
    setTimeout(() => {
      const data = blogDB.loadData()
      const commentsWithArticles = data.comments.map(comment => ({
        ...comment,
        article: data.articles.find(a => a.id === comment.articleId)
      }))
      setComments(commentsWithArticles)
      setIsLoading(false)
    }, 500)
  }

  const handleDeleteComment = (commentId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return
    
    const data = blogDB.loadData()
    data.comments = data.comments.filter(c => c.id !== commentId)
    blogDB.saveData(data)
    loadComments()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestion des Commentaires</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Modérez les commentaires de votre blog
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4 p-6">
              {comments.map(comment => (
                <div key={comment.id} className="p-4 border border-gray-200 dark:border-dark-300 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={comment.author.avatar}
                        alt={comment.author.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="font-medium">{comment.author.name}</div>
                        <div className="text-sm text-gray-500">
                          sur "{comment.article?.title || 'Article supprimé'}"
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-gray-500">
                        {formatRelativeTime(comment.createdAt)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {comment.content}
                  </p>
                  <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-gray-200 dark:border-dark-300">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <span>❤️</span>
                      <span>{comment.likes}</span>
                    </div>
                    <Badge variant={comment.isApproved ? 'success' : 'warning'}>
                      {comment.isApproved ? 'Approuvé' : 'En attente'}
                    </Badge>
                  </div>
                </div>
              ))}

              {comments.length === 0 && (
                <EmptyState message="Aucun commentaire" />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Gestion des utilisateurs
function UsersTab() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    setIsLoading(true)
    setTimeout(() => {
      const data = blogDB.loadData()
      setUsers(data.users)
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestion des Utilisateurs</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez les membres de votre communauté
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-dark-300">
                    <th className="text-left p-4 font-medium">Utilisateur</th>
                    <th className="text-left p-4 font-medium">Email</th>
                    <th className="text-left p-4 font-medium">Rôle</th>
                    <th className="text-left p-4 font-medium">Inscription</th>
                    <th className="text-left p-4 font-medium">Dernière connexion</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-gray-200 dark:border-dark-300 hover:bg-gray-50 dark:hover:bg-dark-300">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="p-4">
                        <Badge variant={user.role === 'admin' ? 'primary' : 'default'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {formatRelativeTime(user.lastLogin)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && (
                <div className="p-12 text-center">
                  <EmptyState message="Aucun utilisateur" />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Paramètres
function SettingsTab({ currentUser }) {
  const [settings, setSettings] = useState({})
  const [userData, setUserData] = useState(currentUser)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    const data = blogDB.loadData()
    setSettings(data.settings || {})
    setIsLoading(false)
  }

  const handleSaveSettings = () => {
    const data = blogDB.loadData()
    data.settings = settings
    blogDB.saveData(data)
  }

  const handleUpdateProfile = async () => {
    const result = await blogDB.updateUserProfile(currentUser.id, userData)
    if (result.success) {
      // Recharger la page pour voir les changements
      window.location.reload()
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Paramètres</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configurez votre blog et votre profil
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profil */}
        <Card>
          <CardHeader>
            <CardTitle>Profil Administrateur</CardTitle>
            <CardDescription>Modifiez vos informations personnelles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <img
                src={userData.avatar}
                alt={userData.name}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <div className="font-semibold">{userData.name}</div>
                <div className="text-sm text-gray-500">{userData.role}</div>
              </div>
            </div>

            <Input
              label="Nom complet"
              value={userData.name}
              onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
            />
            <Input
              label="Avatar (URL)"
              value={userData.avatar}
              onChange={(e) => setUserData(prev => ({ ...prev, avatar: e.target.value }))}
            />
            <Input
              label="Email"
              type="email"
              value={userData.email}
              onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleUpdateProfile}>
              Sauvegarder le profil
            </Button>
          </CardFooter>
        </Card>

        {/* Paramètres du site */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres du Site</CardTitle>
            <CardDescription>Configuration générale de votre blog</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nom du site"
              value={settings.siteTitle || SITE_CONFIG.name}
              onChange={(e) => setSettings(prev => ({ ...prev, siteTitle: e.target.value }))}
            />
            <Select
              label="Langue par défaut"
              value={settings.language || 'auto'}
              onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
              options={[
                { value: 'auto', label: 'Automatique' },
                { value: 'fr', label: 'Français' },
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Español' }
              ]}
            />
            <Select
              label="Thème par défaut"
              value={settings.theme || 'system'}
              onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))}
              options={[
                { value: 'system', label: 'Système' },
                { value: 'light', label: 'Clair' },
                { value: 'dark', label: 'Sombre' }
              ]}
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveSettings}>
              Sauvegarder les paramètres
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Outils d'administration */}
      <Card>
        <CardHeader>
          <CardTitle>Outils d'Administration</CardTitle>
          <CardDescription>Actions avancées pour gérer votre blog</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => {
              const data = blogDB.exportData()
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `bujadevil-backup-${new Date().toISOString().split('T')[0]}.json`
              a.click()
            }}>
              📥 Exporter les données
            </Button>
            <Button variant="outline" onClick={() => {
              // Implémentation simplifiée de l'import
              alert('Fonctionnalité d\'import à implémenter')
            }}>
              📤 Importer les données
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Composant de carte de statistique
function StatCard({ title, value, description, icon, color = 'primary' }) {
  const colorClasses = {
    primary: 'bg-primary-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center text-white text-xl`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
      }
