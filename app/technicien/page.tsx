// app/dashboard/page.tsx
"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, CheckCircle, Bell, PieChart, BarChart, Activity, Zap, Award, ArrowUp, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Area, AreaChart } from "recharts"

export default function Dashboard() {
  const [chartView, setChartView] = useState("pie")
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

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

  return (
    <div className={`p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header avec animation */}
      <div className={`flex justify-between items-center mb-8 transition-all duration-1000 ${isLoaded ? 'translate-y-0' : '-translate-y-10'}`}>
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Bienvenue, Amine <span className="animate-wave inline-block">👋</span>
          </h1>
          <p className="text-gray-600 mt-1">Votre tableau de bord interactif</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm bg-gradient-to-r from-green-400 to-emerald-500 text-white border-none px-3 py-1 animate-pulse">
            <span className="mr-1">●</span> En ligne
          </Badge>
          <div className="relative">
            <Bell className="h-6 w-6 text-blue-600 cursor-pointer hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">3</span>
          </div>
        </div>
      </div>

      {/* Stats avec animations */}
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
            <Card className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-none">
              <div className={`h-1 bg-gradient-to-r ${stat.color}`}></div>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Graphique et Tendances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Graphique */}
        <Card className={`bg-white shadow-lg rounded-xl border-none overflow-hidden lg:col-span-2 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} delay-200`}>
          <CardHeader className="border-b bg-gray-50 p-4">
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="text-gray-800 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-blue-500" />
                <span>Analyse de performance</span>
              </CardTitle>
              <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-sm">
                <Button 
                  variant={chartView === "pie" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setChartView("pie")}
                  className="flex items-center gap-1 transition-all"
                >
                  <PieChart size={16} /> Missions
                </Button>
                <Button 
                  variant={chartView === "bar" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setChartView("bar")}
                  className="flex items-center gap-1 transition-all"
                >
                  <BarChart size={16} /> Temps
                </Button>
                <Button 
                  variant={chartView === "line" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setChartView("line")}
                  className="flex items-center gap-1 transition-all"
                >
                  <Activity size={16} /> Tendances
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-80 p-6">
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

        {/* Notifications */}
        <Card className={`bg-white shadow-lg rounded-xl border-none overflow-hidden transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} delay-400`}>
          <CardHeader className="border-b bg-gray-50 p-4">
            <CardTitle className="text-gray-800 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-blue-500" />
              <span>Notifications récentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {[
                { icon: "🔔", title: "Nouvelle mission disponible", time: "Il y a 10 min", color: "bg-blue-100 text-blue-700" },
                { icon: "🛠", title: "Maintenance prévue demain", time: "Il y a 30 min", color: "bg-amber-100 text-amber-700" },
                { icon: "✅", title: "Mission #5 approuvée", time: "Il y a 2h", color: "bg-green-100 text-green-700" },
                { icon: "📊", title: "Rapport mensuel disponible", time: "Il y a 3h", color: "bg-purple-100 text-purple-700" }
              ].map((notif, idx) => (
                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-3 cursor-pointer group">
                  <div className={`${notif.color} p-2 rounded-lg`}>
                    <span className="text-lg">{notif.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium group-hover:text-blue-600 transition-colors">{notif.title}</h3>
                    <p className="text-xs text-gray-500">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4">
              <Button variant="outline" className="w-full">Voir toutes les notifications</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section: Missions en cours */}
      <div className={`mt-8 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} delay-500`}>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-2 rounded-lg">📋</div>
          <span>Missions en cours</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { id: 1, title: "Maintenance préventive", location: "Site A", progress: 45, priority: "Haute", priorityColor: "bg-red-500" },
            { id: 2, title: "Installation système", location: "Site B", progress: 70, priority: "Moyenne", priorityColor: "bg-amber-500" },
            { id: 3, title: "Audit technique", location: "Site C", progress: 20, priority: "Standard", priorityColor: "bg-blue-500" }
          ].map((mission, idx) => (
            <Card 
              key={idx} 
              className={`bg-white shadow-md rounded-xl border-none overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform transition-transform delay-${idx * 200}`}
            >
              <div className={`h-1 ${mission.priorityColor}`}></div>
              <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg text-gray-800">Mission #{mission.id}</h3>
                  <Badge variant="default" className="bg-blue-100 text-blue-700 hover:bg-blue-200">En cours</Badge>
                </div>
                <p className="text-base font-medium text-blue-600 mb-3">{mission.title}</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <p>📍 Lieu :</p>
                    <p className="font-medium">{mission.location}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>🕒 Temps estimé :</p>
                    <p className="font-medium">4h</p>
                  </div>
                  <div className="flex justify-between">
                    <p>⌛ Temps restant :</p>
                    <p className="font-medium">2h 10min</p>
                  </div>
                  <div className="flex justify-between">
                    <p>🚩 Priorité :</p>
                    <p className={`font-medium text-${mission.priority === "Haute" ? "red" : mission.priority === "Moyenne" ? "amber" : "blue"}-600`}>
                      {mission.priority}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progression</span>
                    <span className="font-medium">{mission.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${mission.priorityColor}`} 
                      style={{ width: `${mission.progress}%`, transition: "width 1.5s ease-in-out" }}
                    ></div>
                  </div>
                </div>
                <Button className="mt-4 w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all duration-300 shadow-md hover:shadow-lg">
                  Accéder à la mission
                </Button>
              </div>
            </Card>
          ))}
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

      {/* Style supplémentaire pour les animations */}
      <style jsx global>{`
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