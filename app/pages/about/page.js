'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '../../components/layouts/layouts'
import blogDB, { SITE_CONFIG } from '../../../data/content'
import { formatRelativeTime } from '../../lib/utils'

export default function AboutPage() {
  const [currentUser] = useState(blogDB.getCurrentUser())
  const [stats, setStats] = useState({})
  const [activeTab, setActiveTab] = useState('bio')
  const [isEditing, setIsEditing] = useState(false)
  const [adminData, setAdminData] = useState(SITE_CONFIG.admin)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = () => {
    const statsData = blogDB.getStats()
    setStats(statsData)
  }

  const handleSaveProfile = async () => {
    if (currentUser?.role === 'admin') {
      const result = await blogDB.updateUserProfile(currentUser.id, adminData)
      if (result.success) {
        setIsEditing(false)
        // Recharger la page pour voir les changements
        window.location.reload()
      }
    }
  }

  // Timeline data
  const timeline = [
    {
      year: "2024",
      title: "Lancement de BujaDevil",
      description: "Création et développement de la plateforme de blog moderne avec Next.js et technologies cloud.",
      icon: "🚀",
      type: "project"
    },
    {
      year: "2023",
      title: "Apprentissage approfondi",
      description: "Maîtrise des frameworks modernes : React, Next.js, Tailwind CSS et développement fullstack.",
      icon: "📚",
      type: "education"
    },
    {
      year: "2022",
      title: "Premiers pas en développement",
      description: "Découverte de la programmation web et création des premiers projets personnels.",
      icon: "💻",
      type: "discovery"
    },
    {
      year: "2021",
      title: "Passion naissante pour la tech",
      description: "Intérêt croissant pour les nouvelles technologies et le développement de solutions digitales.",
      icon: "❤️",
      type: "passion"
    }
  ]

  // Compétences techniques
  const technicalSkills = [
    {
      category: "Frontend",
      skills: [
        { name: "React/Next.js", level: 90 },
        { name: "JavaScript/TypeScript", level: 85 },
        { name: "Tailwind CSS", level: 95 },
        { name: "HTML/CSS", level: 90 }
      ]
    },
    {
      category: "Backend",
      skills: [
        { name: "Node.js", level: 80 },
        { name: "API REST", level: 85 },
        { name: "Bases de données", level: 75 },
        { name: "Authentication", level: 80 }
      ]
    },
    {
      category: "Outils & DevOps",
      skills: [
        { name: "Git/GitHub", level: 85 },
        { name: "Vercel/Netlify", level: 90 },
        { name: "Figma", level: 70 },
        { name: "SEO", level: 80 }
      ]
    }
  ]

  // Intérêts et passions
  const interests = [
    {
      category: "Gaming",
      items: ["Développement de jeux", "E-sports", "Game design", "Réalité virtuelle"],
      icon: "🎮"
    },
    {
      category: "Technologie",
      items: ["IA & Machine Learning", "DevOps", "Cybersécurité", "Mobile Development"],
      icon: "🤖"
    },
    {
      category: "Création",
      items: ["UI/UX Design", "Animation web", "3D Modeling", "Content Creation"],
      icon: "🎨"
    },
    {
      category: "Apprentissage",
      items: ["Nouvelles technologies", "Méthodologies Agile", "Open Source", "Mentorat"],
      icon: "📖"
    }
  ]

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-gaming text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-48 -translate-x-48"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Photo et stats */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <img
                    src={adminData.avatar}
                    alt={adminData.name}
                    className="w-64 h-64 rounded-2xl object-cover border-4 border-white/20 shadow-2xl"
                  />
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="absolute bottom-4 right-4 bg-primary-500 hover:bg-primary-600 text-white p-2 rounded-full shadow-lg transition-colors"
                    >
                      ✏️
                    </button>
                  )}
                </div>

                {/* Stats rapides */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="text-2xl font-bold">{stats.totalArticles || 0}</div>
                    <div className="text-white/80 text-sm">Articles</div>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="text-2xl font-bold">{stats.totalUsers || 1}</div>
                    <div className="text-white/80 text-sm">Membres</div>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="text-2xl font-bold">{stats.totalComments || 0}</div>
                    <div className="text-white/80 text-sm">Commentaires</div>
                  </div>
                </div>
              </div>

              {/* Présentation */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
                  <span className="text-sm">👋 Bienvenue sur mon blog</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Je suis <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">{adminData.name}</span>
                </h1>

                <p className="text-xl text-blue-100 mb-6 leading-relaxed">
                  Développeur passionné de {adminData.age} ans, créateur de BujaDevil. 
                  J'aime partager mes connaissances en développement web, gaming et nouvelles technologies.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href="/blog" 
                    className="btn bg-white text-primary-600 hover:bg-gray-100 px-6 py-3 font-semibold transition-all duration-300 hover:scale-105"
                  >
                    Explorer mes articles
                  </a>
                  <a 
                    href="#contact" 
                    className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 px-6 py-3 font-semibold transition-all duration-300"
                  >
                    Me contacter
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation des sections */}
      <section className="sticky top-16 z-30 bg-white dark:bg-dark-100 border-b border-gray-200 dark:border-dark-300">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {[
              { id: 'bio', label: 'Bio', icon: '👤' },
              { id: 'timeline', label: 'Parcours', icon: '📅' },
              { id: 'skills', label: 'Compétences', icon: '💻' },
              { id: 'interests', label: 'Passions', icon: '❤️' },
              { id: 'contact', label: 'Contact', icon: '📞' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-semibold'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section Bio */}
      {activeTab === 'bio' && (
        <section className="py-16 bg-white dark:bg-dark-100">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12">
                {/* Bio principale */}
                <div>
                  <h2 className="text-3xl font-bold mb-6">Qui suis-je ?</h2>
                  
                  {isEditing && currentUser?.role === 'admin' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Nom complet</label>
                        <input
                          type="text"
                          value={adminData.name}
                          onChange={(e) => setAdminData(prev => ({ ...prev, name: e.target.value }))}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Avatar URL</label>
                        <input
                          type="url"
                          value={adminData.avatar}
                          onChange={(e) => setAdminData(prev => ({ ...prev, avatar: e.target.value }))}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          value={adminData.email}
                          onChange={(e) => setAdminData(prev => ({ ...prev, email: e.target.value }))}
                          className="input"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button onClick={handleSaveProfile} className="btn-primary">
                          Sauvegarder
                        </button>
                        <button onClick={() => setIsEditing(false)} className="btn-secondary">
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="prose prose-lg dark:prose-invert mb-8">
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          Passionné par la technologie depuis mon plus jeune âge, j'ai découvert 
                          le développement web il y a plusieurs années et cette passion ne m'a jamais quitté.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          À {adminData.age} ans, je consacre mon temps à apprendre, expérimenter et 
                          partager mes connaissances à travers ce blog. Mon objectif est de créer 
                          du contenu utile et accessible pour la communauté des développeurs.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          Quand je ne code pas, vous me trouverez probablement en train d'explorer 
                          de nouveaux jeux vidéo, de tester les dernières applications mobiles ou 
                          de suivre l'actualité tech.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg px-4 py-2">
                          <div className="text-sm text-primary-600 dark:text-primary-400">Âge</div>
                          <div className="font-semibold">{adminData.age} ans</div>
                        </div>
                        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg px-4 py-2">
                          <div className="text-sm text-primary-600 dark:text-primary-400">Localisation</div>
                          <div className="font-semibold">En ligne 🌍</div>
                        </div>
                        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg px-4 py-2">
                          <div className="text-sm text-primary-600 dark:text-primary-400">Statut</div>
                          <div className="font-semibold">Développeur</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Philosophie */}
                <div>
                  <h3 className="text-2xl font-bold mb-6">Ma Philosophie</h3>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-accent-apps/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        💡
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Apprendre en faisant</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Je crois fermement que la meilleure façon d'apprendre est de se lancer 
                          dans des projets concrets et d'apprendre de ses erreurs.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-accent-tutorials/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        🤝
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Partager la connaissance</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          La connaissance n'a de valeur que lorsqu'elle est partagée. 
                          Ce blog est ma contribution à la communauté des développeurs.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-accent-gaming/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        🚀
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Innovation constante</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Je m'efforce de toujours rester à jour avec les dernières technologies 
                          et tendances du développement web.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section Timeline */}
      {activeTab === 'timeline' && (
        <section className="py-16 bg-gray-50 dark:bg-dark-200">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">Mon Parcours</h2>
              
              <div className="relative">
                {/* Ligne verticale */}
                <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary-500 to-accent-gaming"></div>

                {/* Événements */}
                <div className="space-y-12">
                  {timeline.map((item, index) => (
                    <div
                      key={index}
                      className={`relative flex items-center ${
                        index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                      }`}
                    >
                      {/* Point sur la timeline */}
                      <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 bg-primary-500 rounded-full border-4 border-white dark:border-dark-200 z-10"></div>

                      {/* Contenu */}
                      <div className={`ml-16 md:ml-0 md:w-5/12 ${
                        index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'
                      }`}>
                        <div className="card p-6 hover:shadow-lg transition-all duration-300">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="text-2xl">{item.icon}</div>
                            <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                              {item.year}
                            </span>
                          </div>
                          <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section Compétences */}
      {activeTab === 'skills' && (
        <section className="py-16 bg-white dark:bg-dark-100">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">Mes Compétences</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                {technicalSkills.map((category, index) => (
                  <div key={index} className="card p-6">
                    <h3 className="text-xl font-semibold mb-6 text-center">{category.category}</h3>
                    <div className="space-y-4">
                      {category.skills.map((skill, skillIndex) => (
                        <div key={skillIndex}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {skill.name}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {skill.level}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-dark-300 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-primary-500 to-accent-gaming h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${skill.level}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Technologies utilisées */}
              <div className="mt-16">
                <h3 className="text-2xl font-bold mb-8 text-center">Technologies & Outils</h3>
                <div className="bg-gray-50 dark:bg-dark-200 rounded-2xl p-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 text-center">
                    {[
                      { name: 'Next.js', icon: '⚡' },
                      { name: 'React', icon: '⚛️' },
                      { name: 'JavaScript', icon: '🟨' },
                      { name: 'TypeScript', icon: '🔷' },
                      { name: 'Tailwind', icon: '🎨' },
                      { name: 'Node.js', icon: '🟢' },
                      { name: 'Git', icon: '📝' },
                      { name: 'Vercel', icon: '▲' },
                      { name: 'Figma', icon: '🎯' },
                      { name: 'MongoDB', icon: '🍃' },
                      { name: 'PostgreSQL', icon: '🐘' },
                      { name: 'Docker', icon: '🐳' }
                    ].map((tech, index) => (
                      <div key={index} className="flex flex-col items-center space-y-2">
                        <div className="w-16 h-16 bg-white dark:bg-dark-300 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-gray-200 dark:border-dark-400">
                          {tech.icon}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {tech.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section Intérêts */}
      {activeTab === 'interests' && (
        <section className="py-16 bg-gray-50 dark:bg-dark-200">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">Mes Passions</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {interests.map((interest, index) => (
                  <div key={index} className="card p-6 text-center hover:shadow-lg transition-all duration-300 group">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {interest.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{interest.category}</h3>
                    <ul className="space-y-2">
                      {interest.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-gray-600 dark:text-gray-400 text-sm">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section Contact */}
      {activeTab === 'contact' && (
        <section id="contact" className="py-16 bg-white dark:bg-dark-100">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">Me Contacter</h2>
              
              <div className="grid md:grid-cols-2 gap-12">
                {/* Informations de contact */}
                <div>
                  <h3 className="text-2xl font-semibold mb-6">Restons en contact</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    N'hésitez pas à me contacter pour discuter de projets, 
                    collaborations ou simplement échanger autour de la tech.
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400">
                        📧
                      </div>
                      <div>
                        <div className="font-semibold">Email</div>
                        <a 
                          href={`mailto:${adminData.email}`}
                          className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          {adminData.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400">
                        💬
                      </div>
                      <div>
                        <div className="font-semibold">WhatsApp</div>
                        <a 
                          href={`https://wa.me/${adminData.whatsapp.replace('+', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          {adminData.whatsapp}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400">
                        🌐
                      </div>
                      <div>
                        <div className="font-semibold">Réseaux sociaux</div>
                        <div className="flex space-x-3 mt-2">
                          <a href="#" className="text-gray-400 hover:text-primary-600 transition-colors">
                            🐦 Twitter
                          </a>
                          <a href="#" className="text-gray-400 hover:text-primary-600 transition-colors">
                            💼 LinkedIn
                          </a>
                          <a href="#" className="text-gray-400 hover:text-primary-600 transition-colors">
                            💻 GitHub
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Formulaire de contact */}
                <div className="card p-6">
                  <h3 className="text-2xl font-semibold mb-6">Envoyez un message</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Votre nom</label>
                      <input type="text" className="input" placeholder="Votre nom complet" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Votre email</label>
                      <input type="email" className="input" placeholder="email@exemple.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Sujet</label>
                      <input type="text" className="input" placeholder="Objet du message" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Message</label>
                      <textarea 
                        rows="5" 
                        className="input resize-none" 
                        placeholder="Votre message..."
                      ></textarea>
                    </div>
                    <button type="submit" className="w-full btn-primary">
                      Envoyer le message
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </MainLayout>
  )
      }
