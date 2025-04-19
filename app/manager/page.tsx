// app/dashboard/page.tsx
"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { CalendarDays, Clock, CheckCircle, Bell, PieChart, BarChart, Activity, Zap, Award, ArrowUp, Sparkles, Search, Users, FileText, Settings, Calendar, MessageSquare, BarChart3, PieChart as PieChartIcon, TrendingUp, AlertCircle, Briefcase, Target, UserPlus, Filter, Download, Share2, ChevronDown, MapPin } from "lucide-react"
import { useState, useEffect } from "react"
import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Area, AreaChart } from "recharts"

// Définition des interfaces pour le typage
interface QuarterlyKPI {
  revenue: string;
  growth: string;
  clients: number;
  satisfaction: number;
}

interface MissionData {
  name: string;
  value: number;
  color: string;
}

interface TimeData {
  name: string;
  heures: number;
  color: string;
}

interface TrendData {
  name: string;
  performance: number;
  efficacite: number;
  budget: number;
}

interface TeamGoal {
  name: string;
  progress: number;
  target: number;
  unit: string;
}

interface Transaction {
  id: string;
  client: string;
  montant: string;
  date: string;
  status: string;
  statusColor: string;
}

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  department: string;
  status: string;
}

interface Project {
  name: string;
  progress: number;
  deadline: string;
  team: number;
  priority: string;
}

export default function Dashboard() {
  const [chartView, setChartView] = useState("pie")
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [activeSection, setActiveSection] = useState("dashboard")
  const [currentQuarter, setCurrentQuarter] = useState("Q2")
  const [kpiExpanded, setKpiExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentGoalView, setCurrentGoalView] = useState("team")

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
  const missionData: MissionData[] = [
    { name: "Terminées", value: 8, color: "#10B981" },
    { name: "En cours", value: 2, color: "#3B82F6" },
    { name: "À approuver", value: 5, color: "#F59E0B" },
  ]

  // Données pour le graphique en barres - temps pointé par jour
  const timeData: TimeData[] = [
    { name: "Lun", heures: 6.5, color: "#3B82F6" },
    { name: "Mar", heures: 8, color: "#8B5CF6" },
    { name: "Mer", heures: 7.2, color: "#EC4899" },
    { name: "Jeu", heures: 6.8, color: "#F59E0B" },
    { name: "Ven", heures: 4, color: "#10B981" },
  ]

  // Données pour le graphique de tendance
  const trendData: TrendData[] = [
    { name: "Jan", performance: 65, efficacite: 75, budget: 82 },
    { name: "Fév", performance: 59, efficacite: 70, budget: 78 },
    { name: "Mar", performance: 80, efficacite: 85, budget: 89 },
    { name: "Avr", performance: 81, efficacite: 90, budget: 86 },
    { name: "Mai", performance: 76, efficacite: 82, budget: 78 },
    { name: "Juin", performance: 85, efficacite: 88, budget: 91 },
  ]

  // Données pour les objectifs de l'équipe
  const teamGoalsData: TeamGoal[] = [
    { name: "Acquisition clients", progress: 65, target: 100, unit: "nouveaux clients" },
    { name: "Satisfaction client", progress: 88, target: 95, unit: "score NPS" },
    { name: "Développement produit", progress: 42, target: 100, unit: "fonctionnalités" },
    { name: "Optimisation des coûts", progress: 71, target: 80, unit: "% économisé" },
  ]

  // Données pour les dernières transactions
  const transactionsData: Transaction[] = [
    { id: "TX-4823", client: "Acme Corp", montant: "12,500 €", date: "15 Avr", status: "Payé", statusColor: "bg-green-100 text-green-800" },
    { id: "TX-4822", client: "TechVision", montant: "8,750 €", date: "14 Avr", status: "En attente", statusColor: "bg-amber-100 text-amber-800" },
    { id: "TX-4821", client: "GlobalServ", montant: "15,200 €", date: "12 Avr", status: "Payé", statusColor: "bg-green-100 text-green-800" },
    { id: "TX-4820", client: "InnoSystems", montant: "6,300 €", date: "10 Avr", status: "En attente", statusColor: "bg-amber-100 text-amber-800" },
  ]

  // Données pour les ressources humaines
  const teamMembers: TeamMember[] = [
    { name: "Sophie Martin", role: "Chef de projet", avatar: "SM", department: "Operations", status: "Disponible" },
    { name: "Thomas Dubois", role: "Développeur", avatar: "TD", department: "Tech", status: "En mission" },
    { name: "Léa Bernard", role: "Designer UX", avatar: "LB", department: "Design", status: "Congé" },
    { name: "Marc Petit", role: "Commercial", avatar: "MP", department: "Ventes", status: "Disponible" },
  ]

  // Données pour les projets
  const projectsData: Project[] = [
    { name: "Refonte application mobile", progress: 75, deadline: "28 Avr", team: 4, priority: "Haute" },
    { name: "Migration serveurs", progress: 30, deadline: "15 Mai", team: 2, priority: "Critique" },
    { name: "Audit sécurité", progress: 90, deadline: "20 Avr", team: 3, priority: "Moyenne" },
    { name: "Formation clients", progress: 50, deadline: "30 Avr", team: 2, priority: "Standard" },
  ]

  // Options pour le filtre de départements
  const departmentOptions = ["Tous", "Operations", "Tech", "Design", "Ventes", "Finance", "RH"]
  
  // KPIs trimestriels
  const quarterlyKPIs: Record<string, QuarterlyKPI> = {
    "Q1": { revenue: "380,500 €", growth: "+12%", clients: 28, satisfaction: 92 },
    "Q2": { revenue: "412,750 €", growth: "+8.5%", clients: 35, satisfaction: 95 },
    "Q3": { revenue: "0 €", growth: "--", clients: 0, satisfaction: 0 },
    "Q4": { revenue: "0 €", growth: "--", clients: 0, satisfaction: 0 }
  }

  return (
    <div className={`min-h-screen transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Navigation latérale */}
      <div className="flex">
        <div className="w-64 bg-gradient-to-b from-blue-900 to-indigo-900 text-white h-screen fixed left-0 top-0 overflow-y-auto">
          <div className="p-4 border-b border-blue-800">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span>TechFlow</span>
            </h2>
          </div>
          
          <div className="p-4">
            <div className="flex items-center gap-3 mb-6">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/api/placeholder/100/100" />
                <AvatarFallback className="bg-blue-600">AM</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Amine Maarouf</p>
                <p className="text-xs text-blue-300">Chef de projet</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              {[
                { name: "Tableau de bord", icon: Activity, id: "dashboard" },
                { name: "Projets", icon: Briefcase, id: "projects" },
                { name: "Équipe", icon: Users, id: "team" },
                { name: "Finances", icon: BarChart3, id: "finance" },
                { name: "Objectifs", icon: Target, id: "goals" },
                { name: "Rapports", icon: FileText, id: "reports" },
                { name: "Calendrier", icon: Calendar, id: "calendar" },
                { name: "Messages", icon: MessageSquare, id: "messages", badge: "3" },
                { name: "Paramètres", icon: Settings, id: "settings" },
              ].map((item) => (
                <button
                  key={item.id}
                  className={`flex items-center gap-3 w-full p-2.5 rounded-lg transition-colors ${
                    activeSection === item.id 
                      ? "bg-blue-700 text-white" 
                      : "text-blue-100 hover:bg-blue-800"
                  }`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Contenu principal avec marge pour navigation */}
        <div className="ml-64 flex-1 bg-gradient-to-br from-blue-50 to-indigo-50">
          {/* Header principal */}
          <header className="bg-white border-b shadow-sm p-4 sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <div className="relative w-64">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input 
                  placeholder="Rechercher..." 
                  className="pl-9 bg-gray-50" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Bell className="h-6 w-6 text-gray-600 cursor-pointer hover:text-blue-600" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">3</span>
                </div>
                <div className="relative">
                  <MessageSquare className="h-6 w-6 text-gray-600 cursor-pointer hover:text-blue-600" />
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">2</span>
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <div className="flex items-center gap-2 cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/api/placeholder/100/100" />
                    <AvatarFallback className="bg-blue-600">AM</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>
          </header>
          
          {/* Contenu principal */}
          <main className="p-6">
            {/* Header de la page */}
            <div className={`flex justify-between items-center mb-6 transition-all duration-1000 ${isLoaded ? 'translate-y-0' : '-translate-y-10'}`}>
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  Bienvenue, Amine <span className="animate-wave inline-block">👋</span>
                </h1>
                <p className="text-gray-600 mt-1">Votre tableau de bord • {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exporter
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Partager
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  + Nouvelle mission
                </Button>
              </div>
            </div>
            
            {/* Section KPI et Graphiques de performance */}
            <div className="mb-8">
              <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-white border-b p-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800">Performance d'entreprise</CardTitle>
                    <p className="text-gray-500 text-sm">Vue d'ensemble des indicateurs clés</p>
                  </div>
                  <div className="flex gap-2">
                    {["Q1", "Q2", "Q3", "Q4"].map((quarter) => (
                      <Button 
                        key={quarter} 
                        variant={currentQuarter === quarter ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentQuarter(quarter)}
                        className={quarter === "Q3" || quarter === "Q4" ? "opacity-50 cursor-not-allowed" : ""}
                        disabled={quarter === "Q3" || quarter === "Q4"}
                      >
                        {quarter} 2025
                      </Button>
                    ))}
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setKpiExpanded(!kpiExpanded)}
                    >
                      <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${kpiExpanded ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className={`bg-white p-0 transition-all duration-500 ${kpiExpanded ? 'max-h-screen' : 'max-h-32'} overflow-hidden`}>
                  <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
                    <div className="p-6 text-center">
                      <p className="text-sm text-gray-500 mb-1">Chiffre d'affaires</p>
                      <p className="text-2xl font-bold text-blue-700">{quarterlyKPIs[currentQuarter].revenue}</p>
                      <p className="text-xs font-medium mt-1 text-green-600">{quarterlyKPIs[currentQuarter].growth}</p>
                    </div>
                    <div className="p-6 text-center">
                      <p className="text-sm text-gray-500 mb-1">Nouveaux clients</p>
                      <p className="text-2xl font-bold text-blue-700">{quarterlyKPIs[currentQuarter].clients}</p>
                      <div className="flex items-center justify-center mt-1">
                        <span className="text-xs font-medium text-green-600 flex items-center">
                          <ArrowUp className="h-3 w-3 mr-0.5" /> +25%
                        </span>
                      </div>
                    </div>
                    <div className="p-6 text-center">
                      <p className="text-sm text-gray-500 mb-1">Satisfaction client</p>
                      <p className="text-2xl font-bold text-blue-700">{quarterlyKPIs[currentQuarter].satisfaction}%</p>
                      <div className="flex items-center justify-center mt-1">
                        <span className="text-xs font-medium text-green-600 flex items-center">
                          <ArrowUp className="h-3 w-3 mr-0.5" /> +3%
                        </span>
                      </div>
                    </div>
                    <div className="p-6 text-center">
                      <p className="text-sm text-gray-500 mb-1">Taux de conversion</p>
                      <p className="text-2xl font-bold text-blue-700">68%</p>
                      <div className="flex items-center justify-center mt-1">
                        <span className="text-xs font-medium text-amber-600 flex items-center">
                          <ArrowUp className="h-3 w-3 mr-0.5" /> +1%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Graphique de tendance étendu */}
                  <div className={`transition-all duration-500 ${kpiExpanded ? 'h-96 opacity-100' : 'h-0 opacity-0'}`}>
                    <div className="p-6 h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={trendData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
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
                            <linearGradient id="colorBudg" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
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
                            activeDot={{ r: 8 }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="efficacite" 
                            stroke="#8B5CF6" 
                            fillOpacity={1} 
                            fill="url(#colorEff)"
                            name="Efficacité"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="budget" 
                            stroke="#10B981" 
                            fillOpacity={1} 
                            fill="url(#colorBudg)"
                            name="Budget"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Tableaux de bord spécifiques */}
            <Tabs defaultValue="performance" className="mb-8">
              <TabsList className="mb-4 bg-white p-1 shadow-sm rounded-lg">
                <TabsTrigger value="performance" className="data-[state=active]:bg-blue-50">
                  <Activity className="h-4 w-4 mr-2" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="projects" className="data-[state=active]:bg-blue-50">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Projets
                </TabsTrigger>
                <TabsTrigger value="finance" className="data-[state=active]:bg-blue-50">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Finances
                </TabsTrigger>
                <TabsTrigger value="hr" className="data-[state=active]:bg-blue-50">
                  <Users className="h-4 w-4 mr-2" />
                  Ressources Humaines
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="performance" className="m-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Graphique */}
                  <Card className="bg-white shadow-md rounded-xl border-none overflow-hidden lg:col-span-2">
                    <CardHeader className="border-b bg-gray-50 p-4">
                      <div className="flex flex-row items-center justify-between">
                        <CardTitle className="text-gray-800 flex items-center">
                          <PieChartIcon className="h-5 w-5 mr-2 text-blue-500" />
                          <span>Analyse des missions</span>
                        </CardTitle>
                        <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-sm">
                          <Button 
                            variant={chartView === "pie" ? "default" : "outline"} 
                            size="sm"
                            onClick={() => setChartView("pie")}
                            className="flex items-center gap-1 transition-all"
                          >
                            <PieChartIcon size={16} /> Répartition
                          </Button>
                          <Button 
                            variant={chartView === "bar" ? "default" : "outline"} 
                            size="sm"
                            onClick={() => setChartView("bar")}
                            className="flex items-center gap-1 transition-all"
                          >
                            <BarChart size={16} /> Heures
                          </Button>
                          <Button 
                            variant={chartView === "line" ? "default" : "outline"} 
                            size="sm"
                            onClick={() => setChartView("line")}
                            className="flex items-center gap-1 transition-all"
                          >
                            <TrendingUp size={16} /> Tendances
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
                          <LineChart
                            data={trendData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="performance" stroke="#3B82F6" activeDot={{ r: 8 }} name="Performance" />
                            <Line type="monotone" dataKey="efficacite" stroke="#8B5CF6" name="Efficacité" />
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Objectifs */}
                  <Card className="bg-white shadow-md rounded-xl border-none overflow-hidden">
                    <CardHeader className="border-b bg-gray-50 p-4">
                      <div className="flex flex-row items-center justify-between">
                        <CardTitle className="text-gray-800 flex items-center">
                          <Target className="h-5 w-5 mr-2 text-blue-500" />
                          <span>Objectifs & KPIs</span>
                        </CardTitle>
                        <div className="flex gap-1 bg-white rounded-lg p-0.5 shadow-sm">
                          <Button 
                            variant={currentGoalView === "team" ? "default" : "outline"} 
                            size="sm"
                            onClick={() => setCurrentGoalView("team")}
                            className="text-xs px-2"
                          >
                            Équipe
                          </Button>
                          <Button 
                            variant={currentGoalView === "personal" ? "default" : "outline"} 
                            size="sm"
                            onClick={() => setCurrentGoalView("personal")}
                            className="text-xs px-2"
                          >
                            Personnel
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
  <div className="space-y-4">
    {teamGoalsData.map((goal, idx) => {
      const ratio = goal.progress / goal.target;
      const colorClass =
        ratio > 0.7 ? "bg-green-500" : ratio > 0.4 ? "bg-yellow-500" : "bg-red-500";

      return (
        <div key={idx} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{goal.name}</span>
            <span className="text-gray-500">
              {goal.progress}/{goal.target} {goal.unit}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${colorClass}`}
              style={{ width: `${(goal.progress / goal.target) * 100}%` }}
            />
          </div>
        </div>
      );
    })}
  </div>
</CardContent>

                    // Suite du code pour CardFooter et le reste des composants
                    <CardFooter className="bg-gray-50 p-4 border-t">
                      <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2">
                        <Award className="h-4 w-4" />
                        Voir tous les objectifs
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                {/* Activité récente */}
                <Card className="bg-white shadow-md rounded-xl border-none overflow-hidden mt-6">
                  <CardHeader className="border-b bg-gray-50 p-4">
                    <div className="flex flex-row items-center justify-between">
                      <CardTitle className="text-gray-800 flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-blue-500" />
                        <span>Dernières transactions</span>
                      </CardTitle>
                      <Button variant="ghost" size="sm" className="text-blue-600">
                        Voir tout
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {transactionsData.map((transaction) => (
                        <div key={transaction.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{transaction.client}</p>
                              <p className="text-sm text-gray-500">{transaction.id}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{transaction.montant}</p>
                            <p className="text-sm text-gray-500">{transaction.date}</p>
                          </div>
                          <Badge className={transaction.statusColor + " whitespace-nowrap"}>
                            {transaction.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects" className="m-0">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Statuts des projets */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:col-span-4">
                    {[
                      { title: "Projets actifs", value: "12", icon: Briefcase, color: "bg-blue-500" },
                      { title: "En attente", value: "3", icon: Clock, color: "bg-amber-500" },
                      { title: "Terminés", value: "27", icon: CheckCircle, color: "bg-green-500" },
                      { title: "À risque", value: "4", icon: AlertCircle, color: "bg-red-500" }
                    ].map((stat, index) => (
                      <Card key={index} className="bg-white border-none shadow-md">
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                          <div className={`${stat.color} p-3 rounded-full mb-4`}>
                            <stat.icon className="h-6 w-6 text-white" />
                          </div>
                          <p className="text-3xl font-bold">{stat.value}</p>
                          <p className="text-gray-500 text-sm">{stat.title}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Liste des projets */}
                  <Card className="bg-white shadow-md rounded-xl border-none overflow-hidden lg:col-span-4">
                    <CardHeader className="border-b bg-gray-50 p-4">
                      <div className="flex flex-row items-center justify-between">
                        <CardTitle className="text-gray-800 flex items-center">
                          <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                          <span>Projets en cours</span>
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Filter className="h-4 w-4" />
                            Filtrer
                          </Button>
                          <Button variant="default" size="sm">+ Nouveau projet</Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
  <table className="w-full">
    <thead className="bg-gray-50 text-gray-500 text-xs">
      <tr>
        <th className="text-left p-4">Nom du projet</th>
        <th className="text-left p-4">Progression</th>
        <th className="text-left p-4">Échéance</th>
        <th className="text-left p-4">Équipe</th>
        <th className="text-left p-4">Priorité</th>
        <th className="text-center p-4">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y">
      {projectsData.map((project, idx) => (
        <tr key={idx} className="hover:bg-blue-50 transition-colors">
          <td className="p-4">
            <p className="font-medium">{project.name}</p>
          </td>
          <td className="p-4">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-24 rounded-full overflow-hidden`}
                style={{ backgroundColor: "#E5E7EB" }}
              >
                <div
                  className="h-full"
                  style={{
                    width: `${project.progress}%`,
                    backgroundColor:
                      project.progress > 70
                        ? "#10B981"
                        : project.progress > 30
                        ? "#F59E0B"
                        : "#EF4444",
                  }}
                />
              </div>
              <span className="text-sm">{project.progress}%</span>
            </div>
          </td>
          <td className="p-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{project.deadline}</span>
            </div>
          </td>
          <td className="p-4">
            <div className="flex -space-x-2">
              {[...Array(project.teamSize || 0)].map((_, i) => (
                <Avatar key={i} className="h-8 w-8 border-2 border-white">
                  <AvatarFallback className="bg-blue-600 text-xs">
                    {String.fromCharCode(65 + i)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </td>
          <td className="p-4">
            <Badge
              className={
                project.priority === "Haute"
                  ? "bg-amber-100 text-amber-800"
                  : project.priority === "Critique"
                  ? "bg-red-100 text-red-800"
                  : project.priority === "Moyenne"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }
            >
              {project.priority}
            </Badge>
          </td>
          <td className="p-4">
            <div className="flex justify-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <FileText className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Users className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</CardContent>

<CardFooter className="bg-gray-50 p-4 border-t flex justify-between items-center">
  <p className="text-sm text-gray-500">Affichage de 4 sur 12 projets</p>
  <div className="flex gap-1">
    <Button variant="outline" size="sm" disabled>
      Précédent
    </Button>
    <Button variant="outline" size="sm">
      Suivant
    </Button>
  </div>
</CardFooter>

                    <CardContent className="h-80 p-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={trendData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="performance" stroke="#3B82F6" activeDot={{ r: 8 }} name="Revenu" />
                          <Line type="monotone" dataKey="budget" stroke="#10B981" name="Prévisionnel" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-md rounded-xl border-none overflow-hidden">
                    <CardHeader className="border-b bg-gray-50 p-4">
                      <CardTitle className="text-gray-800 flex items-center">
                        <PieChartIcon className="h-5 w-5 mr-2 text-blue-500" />
                        <span>Répartition des revenus</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-80 p-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsChart>
                          <Pie
                            data={[
                              { name: "Services", value: 55, color: "#3B82F6" },
                              { name: "Produits", value: 30, color: "#8B5CF6" },
                              { name: "Formation", value: 15, color: "#10B981" },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={120}
                            innerRadius={60}
                            paddingAngle={5}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {[
                              { name: "Services", value: 55, color: "#3B82F6" },
                              { name: "Produits", value: 30, color: "#8B5CF6" },
                              { name: "Formation", value: 15, color: "#10B981" },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36} />
                        </RechartsChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="hr" className="m-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="bg-white shadow-md rounded-xl border-none overflow-hidden">
                    <CardHeader className="border-b bg-gray-50 p-4">
                      <div className="flex flex-row items-center justify-between">
                        <CardTitle className="text-gray-800 flex items-center">
                          <Users className="h-5 w-5 mr-2 text-blue-500" />
                          <span>Membres de l'équipe</span>
                        </CardTitle>
                        <Button variant="default" size="sm" className="flex items-center gap-1">
                          <UserPlus className="h-4 w-4" />
                          Ajouter
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between p-4 border-b">
                        <Input 
                          placeholder="Rechercher un membre..." 
                          className="max-w-xs"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Filter className="h-4 w-4" />
                            <span>Département</span>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="divide-y">
                        {teamMembers.map((member, index) => (
                          <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-blue-600">{member.avatar}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-gray-500">{member.role}</p>
                              </div>
                            </div>
                            <Badge className={
                              member.status === "Disponible" ? "bg-green-100 text-green-800" :
                              member.status === "En mission" ? "bg-blue-100 text-blue-800" :
                              "bg-amber-100 text-amber-800"
                            }>
                              {member.status}
                            </Badge>
                            <Badge variant="outline">{member.department}</Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="bg-gray-50 p-4 border-t">
                      <Button variant="outline" size="sm" className="w-full">
                        Voir toute l'équipe
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="bg-white shadow-md rounded-xl border-none overflow-hidden lg:col-span-2">
                    <CardHeader className="border-b bg-gray-50 p-4">
                      <div className="flex flex-row items-center justify-between">
                        <CardTitle className="text-gray-800 flex items-center">
                          <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                          <span>Répartition géographique</span>
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <div className="w-1/2">
                          <h3 className="text-lg font-semibold mb-4">Bureaux</h3>
                          <div className="space-y-4">
                            {[
                              { city: "Paris", members: 12, address: "24 Rue du Commerce" },
                              { city: "Lyon", members: 8, address: "15 Rue de la République" },
                              { city: "Bordeaux", members: 5, address: "8 Cours de l'Intendance" },
                              { city: "Lille", members: 3, address: "45 Rue Nationale" },
                            ].map((office, idx) => (
                              <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-semibold">{office.city}</p>
                                    <p className="text-sm text-gray-500">{office.address}</p>
                                  </div>
                                  <Badge variant="outline">{office.members}</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="w-1/2">
                          <h3 className="text-lg font-semibold mb-4">Répartition par département</h3>
                          <ResponsiveContainer width="100%" height={250}>
                            <RechartsBarChart
                              data={[
                                { department: "Tech", count: 12, color: "#3B82F6" },
                                { department: "Design", count: 5, color: "#8B5CF6" },
                                { department: "Ventes", count: 7, color: "#10B981" },
                                { department: "Marketing", count: 4, color: "#F59E0B" },
                                { department: "Direction", count: 3, color: "#EC4899" },
                              ]}
                              layout="vertical"
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis dataKey="department" type="category" />
                              <Tooltip />
                              <Bar dataKey="count" name="Employés">
                                {[
                                  { department: "Tech", count: 12, color: "#3B82F6" },
                                  { department: "Design", count: 5, color: "#8B5CF6" },
                                  { department: "Ventes", count: 7, color: "#10B981" },
                                  { department: "Marketing", count: 4, color: "#F59E0B" },
                                  { department: "Direction", count: 3, color: "#EC4899" },
                                ].map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Bar>
                            </RechartsBarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Ajouter des styles CSS globaux pour les animations */}
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
          animation: wave 2.5s ease-in-out infinite;
          transform-origin: 70% 70%;
          display: inline-block;
        }
      `}</style>
    </div>
  )
}