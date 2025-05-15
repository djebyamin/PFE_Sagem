// app/dashboard/page.tsx
"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, CheckCircle, Bell, PieChart, BarChart, Activity, Zap, Award, ArrowUp, Sparkles, MessageSquare, LogOut } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Area, AreaChart } from "recharts"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getOrCreateConversation, getMessages, sendMessage, getReceivedMessages, markMessageAsRead } from './actions'
import { logoutAction } from '@/app/protected/logout'

interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  identifiant: string;
  roles: string[];
  iat: number;
  exp: number;
  image?: string | null;
}

interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  identifiant: string;
  image?: string | null;
}

interface Mission {
  id: number;
  titre: string;
  description?: string;
  date_creation: Date;
  date_debut?: Date;
  date_fin?: Date;
  statut: string;
  priorite: number;
  client?: string;
  reference_odoo?: string;
  budget?: number;
}

interface Affectation {
  id: number;
  date_affectation: Date;
  role_mission: string;
  commentaire?: string;
  mission: Mission;
}

interface TechnicienComponentProps {
  user: User;
  utilisateurs: Utilisateur[];
  affectations: Affectation[];
}

export default function TechnicienComponent({ user, utilisateurs: initialUtilisateurs, affectations }: TechnicienComponentProps) {
  const [chartView, setChartView] = useState("pie")
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>(initialUtilisateurs)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Utilisateur | null>(null)
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatConversationId, setChatConversationId] = useState<number | null>(null)
  const [chatLoading, setChatLoading] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)
  const [isChatZoneOpen, setIsChatZoneOpen] = useState(false)
  const [receivedMessages, setReceivedMessages] = useState<any[]>([])
  const [lastMessageId, setLastMessageId] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState<Record<number, boolean>>({});
  const [messageStatus, setMessageStatus] = useState<Record<string, 'sent' | 'delivered' | 'read'>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Animation d'entrée
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Animation pour les cartes
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % 3)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  // Effet pour la réception en temps réel des messages
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (chatConversationId) {
      // Polling toutes les 500ms pour les nouveaux messages
      interval = setInterval(async () => {
        try {
          const messages = await getMessages(chatConversationId);
          
          // Vérifier s'il y a de nouveaux messages
          if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            
            // Si c'est un nouveau message
            if (!lastMessageId || lastMessage.id > lastMessageId) {
              setLastMessageId(lastMessage.id);
              
              // Si le message est d'un autre utilisateur
              if (lastMessage.expediteur.id !== Number(user.id)) {
                playNotificationSound();
                simulateTyping(lastMessage.expediteur.id);
                updateMessageStatus(lastMessage.id.toString(), 'delivered');
                
                // Marquer le message comme lu
                try {
                  await markMessageAsRead(lastMessage.id);
                } catch (error) {
                  console.error('Erreur lors du marquage du message comme lu:', error);
                }
              }
            }
          }
          
          setChatMessages(messages);
          
          // Faire défiler vers le bas si nécessaire
          setTimeout(() => {
            chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        } catch (error) {
          console.error('Erreur lors de la récupération des messages:', error);
        }
      }, 500); // Polling toutes les 500ms
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [chatConversationId, user.id, lastMessageId]);

  // Effet pour charger les messages reçus
  useEffect(() => {
    async function loadReceivedMessages() {
      try {
        const messages = await getReceivedMessages(Number(user.id));
        setReceivedMessages(messages);
      } catch (e) {
        console.error('Erreur lors du chargement des messages reçus:', e);
      }
    }
    loadReceivedMessages();
    const interval = setInterval(loadReceivedMessages, 1000); // Polling toutes les secondes
    return () => clearInterval(interval);
  }, [user.id]);

  // Données pour le graphique circulaire
  const missionData = [
    { name: "Terminées", value: 8, color: "#10B981" },
    { name: "En cours", value: 2, color: "#3B82F6" },
    { name: "À approuver", value: 5, color: "#F59E0B" },
  ]

  // Données pour le graphique en barres - temps pointé par jour
  const timeData = [
    { name: "Lun", heures: 6.5, color: "#3B82F6" },
    { name: "Mar", heures: 8, color: "#8B5CF6" },
    { name: "Mer", heures: 7.2, color: "#EC4899" },
    { name: "Jeu", heures: 6.8, color: "#F59E0B" },
    { name: "Ven", heures: 4, color: "#10B981" },
  ]

  // Données pour le graphique de tendance
  const trendData = [
    { name: "Jan", performance: 65, efficacite: 75 },
    { name: "Fév", performance: 59, efficacite: 70 },
    { name: "Mar", performance: 80, efficacite: 85 },
    { name: "Avr", performance: 81, efficacite: 90 },
    { name: "Mai", performance: 76, efficacite: 82 },
    { name: "Juin", performance: 85, efficacite: 88 },
  ]

  const handleMessageSent = () => {
    setIsComposerOpen(false)
    setSelectedUser(null)
    console.log('Message envoyé avec succès')
  }

  const handleOpenMessageComposer = async (utilisateur: Utilisateur) => {
    setSelectedUser(utilisateur)
    setChatDrawerOpen(true)
    setChatLoading(true)
    // Récupérer ou créer la conversation et charger les messages
    const conversation = await getOrCreateConversation(Number(user.id), utilisateur.id)
    setChatConversationId(conversation.id)
    const messages = await getMessages(conversation.id)
    setChatMessages(messages)
    setChatLoading(false)
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Fonction pour envoyer un message avec mise à jour immédiate
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || !chatConversationId) return;
    
    setChatLoading(true);
    try {
      // Envoyer le message
      await sendMessage({
        conversationId: chatConversationId,
        expediteurId: Number(user.id),
        contenu: chatInput.trim(),
      });
      
      // Vider l'input
      setChatInput('');
      
      // Rafraîchir immédiatement les messages
      const messages = await getMessages(chatConversationId);
      setChatMessages(messages);
      
      // Mettre à jour le dernier message ID
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        setLastMessageId(lastMessage.id);
      }
      
      // Faire défiler vers le bas
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    } finally {
      setChatLoading(false);
    }
  };

  // Fonction pour jouer le son de notification
  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  // Fonction pour simuler le statut "en train d'écrire"
  const simulateTyping = (userId: number) => {
    setIsTyping(prev => ({ ...prev, [userId]: true }));
    setTimeout(() => {
      setIsTyping(prev => ({ ...prev, [userId]: false }));
    }, 3000);
  };

  // Fonction pour mettre à jour le statut des messages
  const updateMessageStatus = (messageId: string, status: 'sent' | 'delivered' | 'read') => {
    setMessageStatus(prev => ({ ...prev, [messageId]: status }));
  };

  return (
    <div className={`p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Fond animé avec motifs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
        <div className="absolute w-96 h-96 -top-48 -right-48 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute w-96 h-96 -bottom-48 -left-48 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute w-96 h-96 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* En-tête professionnel */}
      <div className="relative mb-12">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-lg opacity-50"></div>
              <div className="relative bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300">
                <Avatar className="h-20 w-20 ring-4 ring-white/50">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-3xl">
                    {user.prenom[0]}{user.nom[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Bienvenue, {user.prenom} {user.nom} <span className="animate-wave inline-block">👋</span>
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Votre tableau de bord professionnel</p>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className="text-sm bg-gradient-to-r from-green-400 to-emerald-500 text-white border-none px-3 py-1 animate-pulse">
                  <span className="mr-1">●</span> En ligne
                </Badge>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  {new Date().toLocaleTimeString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CalendarDays className="h-4 w-4" />
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold px-6 py-2 rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-105 hover:shadow-xl"
              onClick={() => setIsChatZoneOpen(true)}
            >
              <MessageSquare className="h-5 w-5" />
              Communication
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {receivedMessages.length}
              </span>
            </Button>
            <Button
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold px-6 py-2 rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-105 hover:shadow-xl"
              onClick={() => logoutAction()}
            >
              <LogOut className="h-5 w-5" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Stats avec design professionnel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Missions actives", value: "7", icon: Activity, color: "from-blue-400 to-blue-600", delay: "delay-100" },
          { title: "Productivité", value: "92%", icon: Zap, color: "from-purple-400 to-purple-600", delay: "delay-200" },
          { title: "Réussite", value: "15", icon: Award, color: "from-amber-400 to-amber-600", delay: "delay-300" },
          { title: "Performance", value: "+23%", icon: ArrowUp, color: "from-emerald-400 to-emerald-600", delay: "delay-400" }
        ].map((stat, idx) => (
          <div 
            key={idx} 
            className={`transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} ${stat.delay}`}
          >
            <Card className="group bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-none">
              <div className={`h-2 bg-gradient-to-r ${stat.color} group-hover:h-3 transition-all duration-300`}></div>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm font-medium group-hover:text-gray-700 transition-colors">{stat.title}</p>
                    <p className="text-4xl font-bold mt-1 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">{stat.value}</p>
                  </div>
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Graphique et Tendances avec design professionnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className={`group bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border-none overflow-hidden lg:col-span-2 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} delay-200 hover:shadow-2xl`}>
          <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white p-6">
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="text-gray-800 flex items-center text-xl group-hover:text-blue-600 transition-colors">
                <Sparkles className="h-6 w-6 mr-2 text-blue-500 group-hover:animate-pulse" />
                <span>Analyse de performance</span>
              </CardTitle>
              <div className="flex space-x-2 bg-white rounded-xl p-1 shadow-md">
                <Button 
                  variant={chartView === "pie" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setChartView("pie")}
                  className="flex items-center gap-1 transition-all rounded-lg hover:scale-105"
                >
                  <PieChart size={16} /> Missions
                </Button>
                <Button 
                  variant={chartView === "bar" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setChartView("bar")}
                  className="flex items-center gap-1 transition-all rounded-lg hover:scale-105"
                >
                  <BarChart size={16} /> Temps
                </Button>
                <Button 
                  variant={chartView === "line" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setChartView("line")}
                  className="flex items-center gap-1 transition-all rounded-lg hover:scale-105"
                >
                  <Activity size={16} /> Tendances
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-96 p-6">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === "pie" ? (
                <RechartsChart>
                  <Pie
                    data={missionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    innerRadius={60}
                    paddingAngle={5}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={200}
                    animationDuration={1500}
                  >
                    {missionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={index === activeIndex ? 4 : 1} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </RechartsChart>
              ) : chartView === "bar" ? (
                <RechartsBarChart
                  data={timeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Heures', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} />
                  <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                  <Legend />
                  <Bar 
                    dataKey="heures" 
                    name="Heures pointées"
                    animationBegin={400}
                    animationDuration={1500}
                  >
                    {timeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              ) : (
                <AreaChart
                  data={trendData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="performance" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorPerf)"
                    name="Performance"
                    animationBegin={300}
                    animationDuration={1500}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="efficacite" 
                    stroke="#8B5CF6" 
                    fillOpacity={1} 
                    fill="url(#colorEff)"
                    name="Efficacité"
                    animationBegin={600}
                    animationDuration={1500}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Notifications avec design professionnel */}
        <Card className={`group bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border-none overflow-hidden transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} delay-400 hover:shadow-2xl`}>
          <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white p-6">
            <CardTitle className="text-gray-800 flex items-center text-xl group-hover:text-blue-600 transition-colors">
              <Bell className="h-6 w-6 mr-2 text-blue-500 group-hover:animate-pulse" />
              <span>Notifications récentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {[
                { icon: "🔔", title: "Nouvelle mission disponible", time: "Il y a 10 min", color: "bg-blue-100 text-blue-700" },
                { icon: "🛠", title: "Maintenance prévue demain", time: "Il y a 30 min", color: "bg-amber-100 text-amber-700" },
                { icon: "✅", title: "Mission #5 approuvée", time: "Il y a 2h", color: "bg-green-100 text-green-700" },
                { icon: "📊", title: "Rapport mensuel disponible", time: "Il y a 3h", color: "bg-purple-100 text-purple-700" }
              ].map((notif, idx) => (
                <div key={idx} className="p-4 hover:bg-gray-50/50 transition-colors flex items-start gap-3 cursor-pointer group/notif">
                  <div className={`${notif.color} p-3 rounded-xl shadow-sm group-hover/notif:scale-110 transition-transform duration-300`}>
                    <span className="text-xl">{notif.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium group-hover/notif:text-blue-600 transition-colors">{notif.title}</h3>
                    <p className="text-xs text-gray-500">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4">
              <Button variant="outline" className="w-full rounded-xl hover:bg-gray-50 transition-colors hover:scale-105">
                Voir toutes les notifications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section: Missions en cours avec design professionnel */}
      <div className={`mt-8 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} delay-500`}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-3 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">📋</div>
          <span>Mes missions affectées</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {affectations.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl">
              <p className="text-gray-500">Aucune mission ne vous a été affectée pour le moment.</p>
            </div>
          ) : (
            affectations.map((affectation) => {
              const mission = affectation.mission;
              const getPriorityColor = (priorite: number) => {
                switch (priorite) {
                  case 1: return "bg-red-500";
                  case 2: return "bg-amber-500";
                  default: return "bg-blue-500";
                }
              };
              
              const getPriorityLabel = (priorite: number) => {
                switch (priorite) {
                  case 1: return "Haute";
                  case 2: return "Moyenne";
                  default: return "Standard";
                }
              };

              const getStatusColor = (statut: string) => {
                switch (statut) {
                  case 'EN_COURS': return "bg-green-100 text-green-700";
                  case 'PLANIFIEE': return "bg-blue-100 text-blue-700";
                  case 'EN_PAUSE': return "bg-amber-100 text-amber-700";
                  case 'TERMINEE': return "bg-purple-100 text-purple-700";
                  default: return "bg-gray-100 text-gray-700";
                }
              };

              return (
                <Card 
                  key={mission.id} 
                  className="group bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border-none overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`h-2 ${getPriorityColor(mission.priorite)} group-hover:h-3 transition-all duration-300`}></div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-xl text-gray-800 group-hover:text-blue-600 transition-colors">Mission #{mission.id}</h3>
                      <Badge variant="default" className={`${getStatusColor(mission.statut)} rounded-lg px-3 py-1 group-hover:scale-105 transition-transform duration-300`}>
                        {mission.statut.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-lg font-medium text-blue-600 mb-4 group-hover:text-blue-700 transition-colors">{mission.titre}</p>
                    <div className="space-y-3 text-sm text-gray-600">
                      {mission.client && (
                        <div className="flex justify-between">
                          <p>👥 Client :</p>
                          <p className="font-medium">{mission.client}</p>
                        </div>
                      )}
                      {mission.date_debut && (
                        <div className="flex justify-between">
                          <p>📅 Date début :</p>
                          <p className="font-medium">{new Date(mission.date_debut).toLocaleDateString()}</p>
                        </div>
                      )}
                      {mission.date_fin && (
                        <div className="flex justify-between">
                          <p>⏰ Date fin :</p>
                          <p className="font-medium">{new Date(mission.date_fin).toLocaleDateString()}</p>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <p>🎯 Mon rôle :</p>
                        <p className="font-medium">{affectation.role_mission}</p>
                      </div>
                      <div className="flex justify-between">
                        <p>🚩 Priorité :</p>
                        <p className={`font-medium text-${getPriorityLabel(mission.priorite).toLowerCase()}-600`}>
                          {getPriorityLabel(mission.priorite)}
                        </p>
                      </div>
                    </div>
                    {affectation.commentaire && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Note :</span> {affectation.commentaire}
                        </p>
                      </div>
                    )}
                    <Button className="mt-6 w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105">
                      Accéder à la mission
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Section: Événements à venir */}
      <div className={`mt-10 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} delay-700`}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-lg">📅</div>
          <span>Événements à venir</span>
        </h2>
        <div className="relative">
          <div className="absolute left-8 inset-y-0 w-0.5 bg-gradient-to-b from-blue-400 to-purple-500"></div>
          <div className="space-y-6">
            {[
              { 
                icon: CalendarDays, 
                title: "Réunion d'équipe", 
                time: "Demain à 10h", 
                location: "Salle de conférence A",
                color: "bg-blue-500"
              },
              { 
                icon: CheckCircle, 
                title: "Audit mensuel", 
                time: "20 Avril à 14h", 
                location: "Site principal",
                color: "bg-purple-500"
              },
              { 
                icon: CalendarDays, 
                title: "Formation technique", 
                time: "22 Avril à 9h", 
                location: "Centre de formation",
                color: "bg-pink-500"
              }
            ].map((event, idx) => (
              <div key={idx} className="relative pl-16">
                <div className={`absolute left-7 -translate-x-1/2 ${event.color} rounded-full p-1.5 shadow-md border-4 border-white`}>
                  <event.icon className="h-5 w-5 text-white" />
                </div>
                <Card className="bg-white shadow-md rounded-xl border-none overflow-hidden hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{event.title}</h3>
                        <p className="text-gray-600 text-sm">{event.time} • {event.location}</p>
                      </div>
                      <Button variant="outline" className="mt-3 md:mt-0">
                        Ajouter au calendrier
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section: Liste des utilisateurs */}
      <div className={`mt-8 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} delay-600`}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-lg">👥</div>
          <span>Liste des utilisateurs</span>
        </h2>
        
        {isLoadingUsers ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {utilisateurs.map((utilisateur) => (
              <Card 
                key={utilisateur.id}
                className="bg-white shadow-md rounded-xl border-none overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={utilisateur.image || undefined} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                        {utilisateur.prenom[0]}{utilisateur.nom[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {utilisateur.prenom} {utilisateur.nom}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">{utilisateur.email}</p>
                      <p className="text-xs text-gray-400 mt-1">ID: {utilisateur.identifiant}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                      onClick={() => handleOpenMessageComposer(utilisateur)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Zone de chat (affichée seulement si isChatZoneOpen) */}
      {isChatZoneOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="w-full max-w-3xl m-4 bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl flex pointer-events-auto border overflow-hidden">
            {/* Liste des utilisateurs */}
            <div className="w-1/3 border-r p-4 overflow-y-auto max-h-96 bg-gradient-to-b from-blue-50 to-white">
              <h3 className="font-bold mb-4 text-gray-700 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                Utilisateurs
              </h3>
              <div className="space-y-2">
                {utilisateurs.map((utilisateur) => (
                  <div
                    key={utilisateur.id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all
                      ${selectedUser?.id === utilisateur.id ? 'bg-blue-100 border-l-4 border-blue-500' : 'hover:bg-blue-50'}
                    `}
                    onClick={async () => {
                      setSelectedUser(utilisateur)
                      setChatLoading(true)
                      const conversation = await getOrCreateConversation(Number(user.id), utilisateur.id)
                      setChatConversationId(conversation.id)
                      const messages = await getMessages(conversation.id)
                      setChatMessages(messages)
                      setChatLoading(false)
                      setTimeout(() => {
                        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
                      }, 100)
                    }}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={utilisateur.image || undefined} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                        {utilisateur.prenom[0]}{utilisateur.nom[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{utilisateur.prenom} {utilisateur.nom}</div>
                      <div className="text-xs text-gray-400 truncate">{utilisateur.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Conversation */}
            <div className="flex-1 flex flex-col bg-white/70">
              <div className="flex items-center justify-between p-4 border-b rounded-t-2xl bg-gray-50">
                <div>
                  {selectedUser ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedUser.image || undefined} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                          {selectedUser.prenom[0]}{selectedUser.nom[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold">{selectedUser.prenom} {selectedUser.nom}</span>
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">En ligne</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">Sélectionnez un utilisateur</span>
                  )}
                </div>
                <Button variant="ghost" onClick={() => setIsChatZoneOpen(false)}>
                  ✕
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-80">
                {chatLoading ? (
                  <div className="text-center text-gray-400 py-8">Chargement...</div>
                ) : (
                  !selectedUser ? (
                    <div className="text-center text-gray-400 py-8">Sélectionnez un utilisateur pour discuter</div>
                  ) : (
                    chatMessages.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">Aucun message</div>
                    ) : (
                      <>
                        {chatMessages
                          .sort((a, b) => {
                            // Trier par date (plus anciens en premier)
                            return new Date(a.date_envoi).getTime() - new Date(b.date_envoi).getTime();
                          })
                          .map((msg, idx) => (
                            <div
                              key={msg.id || idx}
                              className={`flex ${msg.expediteur.id === Number(user.id) ? 'justify-end' : 'justify-start'} animate-fade-in`}
                            >
                              <div className={`max-w-xs px-4 py-2 rounded-2xl shadow text-sm relative
                                ${msg.expediteur.id === Number(user.id)
                                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                                  : 'bg-gray-100 text-gray-800'}
                                ${msg.unread ? 'border-2 border-blue-500' : ''}
                              `}>
                                <div className="font-semibold mb-1">{msg.expediteur.prenom} {msg.expediteur.nom}</div>
                                <div>{msg.contenu}</div>
                                <div className="flex items-center justify-end gap-1 mt-1">
                                  <span className="text-xs text-gray-400">{new Date(msg.date_envoi).toLocaleTimeString()}</span>
                                  {msg.expediteur.id === Number(user.id) && (
                                    <span className="text-xs">
                                      {messageStatus[msg.id] === 'read' ? '✓✓' : 
                                       messageStatus[msg.id] === 'delivered' ? '✓✓' : '✓'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        {isTyping[selectedUser.id] && (
                          <div className="flex justify-start animate-fade-in">
                            <div className="bg-gray-100 px-4 py-2 rounded-2xl shadow text-sm">
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">En train d'écrire</span>
                                <div className="flex gap-1">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )
                  )
                )}
                <div ref={chatBottomRef} />
              </div>
              <div className="p-4 border-t flex gap-2 bg-white rounded-b-2xl">
                <input
                  type="text"
                  className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Écrire un message..."
                  value={chatInput}
                  onChange={e => {
                    setChatInput(e.target.value);
                    if (selectedUser) {
                      simulateTyping(selectedUser.id);
                    }
                  }}
                  onKeyDown={e => { if (e.key === 'Enter') handleSendChatMessage() }}
                  disabled={chatLoading || !selectedUser}
                />
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6"
                  onClick={handleSendChatMessage}
                  disabled={chatLoading || !chatInput.trim() || !selectedUser}
                >
                  Envoyer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ajout de l'élément audio pour les notifications */}
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />

      {/* Animation fade-in pour les messages */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s;
        }
        @keyframes wave {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-wave {
          animation: wave 2.5s infinite;
          transform-origin: 70% 70%;
        }
      `}</style>
    </div>
  )
}