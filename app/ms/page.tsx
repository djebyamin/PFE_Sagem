"use client";

import { useState, useEffect, useMemo } from "react";
import { getMissionsAvecAffectations } from "./getMissions";
import { 
  UserIcon, 
  Calendar, 
  TagIcon, 
  Search, 
  Filter, 
  ArrowUpDown, 
  PieChart, 
  BarChart3, 
  Activity, 
  ClipboardList,
  Clock,
  Users,
  Eye,
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  RefreshCcw,
  Bell,
  Target,
  AlertTriangle,
  Timer,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  PieChart as RechartsChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis, 
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  identifiant: string;
  mot_de_passe: string | null;
  date_creation: Date;
  derniere_connexion: Date | null;
  actif: boolean;
  googleId: string | null;
  image: string | null;
}

interface Affectation {
  id: number;
  utilisateur: Utilisateur;
  role_mission: string;
}

interface Mission {
  id: number;
  titre: string;
  description: string | null;
  date_creation: Date;
  affectations: Affectation[];
  priorite?: 'basse' | 'moyenne' | 'haute' | 'critique';
  date_echeance?: Date;
  progression?: number;
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_creation");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState("cards");
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<{id: number, message: string, type: 'warning' | 'info' | 'success'}[]>([]);

  // Fonction pour calculer le temps moyen de complétion
  const calculateAverageCompletionTime = (missions: Mission[]): number => {
    const completedMissions = missions.filter(m => m.affectations.length >= 3);
    if (completedMissions.length === 0) return 0;
    
    const totalTime = completedMissions.reduce((acc, mission) => {
      const startDate = new Date(mission.date_creation);
      const endDate = new Date();
      return acc + (endDate.getTime() - startDate.getTime());
    }, 0);
    
    return Math.round(totalTime / completedMissions.length / (1000 * 60 * 60 * 24)); // Convertir en jours
  };

  // Fonction pour calculer l'efficacité de l'équipe
  const calculateTeamEfficiency = (missions: Mission[]): number => {
    const totalMissions = missions.length;
    if (totalMissions === 0) return 0;
    
    const completedMissions = missions.filter(m => m.affectations.length >= 3).length;
    return Math.round((completedMissions / totalMissions) * 100);
  };

  // Fonction pour calculer les KPIs
  const calculateKPIs = (missions: Mission[], timeRange: string) => {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
    }
    
    const filteredMissions = missions.filter(m => new Date(m.date_creation) >= startDate);
    const completedMissions = filteredMissions.filter(m => m.affectations.length >= 3);
    
    return {
      completionRate: Math.round((completedMissions.length / filteredMissions.length) * 100) || 0,
      averageCompletionTime: calculateAverageCompletionTime(filteredMissions),
      criticalMissions: filteredMissions.filter(m => m.priorite === 'critique').length,
      overdueMissions: filteredMissions.filter(m => 
        m.date_echeance && new Date(m.date_echeance) < now
      ).length,
      teamEfficiency: calculateTeamEfficiency(filteredMissions)
    };
  };

  const getPriorityColor = (priority: Mission['priorite']) => {
    switch (priority) {
      case 'critique':
        return 'bg-red-100 text-red-800';
      case 'haute':
        return 'bg-orange-100 text-orange-800';
      case 'moyenne':
        return 'bg-yellow-100 text-yellow-800';
      case 'basse':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: Mission['priorite']) => {
    switch (priority) {
      case 'critique':
        return AlertTriangle;
      case 'haute':
        return AlertCircle;
      case 'moyenne':
        return Clock;
      case 'basse':
        return CheckCircle2;
      default:
        return TagIcon;
    }
  };

  const getMissionStatus = (mission: Mission) => {
    if (mission.affectations.length === 0) {
      return { 
        color: "bg-yellow-100 text-yellow-800", 
        badgeColor: "bg-yellow-200 hover:bg-yellow-300",
        label: "Non affectée",
        icon: AlertCircle 
      };
    } else if (mission.affectations.length >= 3) {
      return { 
        color: "bg-green-100 text-green-800", 
        badgeColor: "bg-green-200 hover:bg-green-300", 
        label: "Équipe complète",
        icon: CheckCircle2 
      };
    } else {
      return { 
        color: "bg-blue-100 text-blue-700", 
        badgeColor: "bg-blue-200 hover:bg-blue-300", 
        label: "En cours d'affectation",
        icon: Users 
      };
    }
  };

  useEffect(() => {
    const fetchMissions = async () => {
      setIsLoading(true);
      try {
        const data = await getMissionsAvecAffectations();
        // Transformer les données pour inclure les propriétés optionnelles
        const transformedData: Mission[] = data.map((mission: any) => ({
          ...mission,
          priorite: mission.priorite || undefined,
          date_echeance: mission.date_echeance ? new Date(mission.date_echeance) : undefined,
          progression: mission.progression || 0
        }));
        setMissions(transformedData);
      } catch (error) {
        console.error("Erreur lors du chargement des missions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMissions();
  }, []);

  // Mise à jour des notifications
  useEffect(() => {
    const checkMissions = () => {
      const newNotifications = [];
      
      // Vérifier les missions critiques
      const criticalMissions = missions.filter(m => m.priorite === 'critique');
      if (criticalMissions.length > 0) {
        newNotifications.push({
          id: 1,
          message: `${criticalMissions.length} mission(s) critique(s) nécessite(nt) votre attention`,
          type: 'warning' as const
        });
      }
      
      // Vérifier les missions en retard
      const overdueMissions = missions.filter(m => 
        m.date_echeance && new Date(m.date_echeance) < new Date()
      );
      if (overdueMissions.length > 0) {
        newNotifications.push({
          id: 2,
          message: `${overdueMissions.length} mission(s) en retard`,
          type: 'warning' as const
        });
      }
      
      // Vérifier les missions complétées
      const completedMissions = missions.filter(m => m.affectations.length >= 3);
      if (completedMissions.length > 0) {
        newNotifications.push({
          id: 3,
          message: `${completedMissions.length} mission(s) complétée(s)`,
          type: 'success' as const
        });
      }
      
      setNotifications(newNotifications);
    };

    checkMissions();
  }, [missions]);

  // Fonction pour obtenir les équipes uniques
  const getUniqueTeams = useMemo(() => {
    const teams = new Set<string>();
    missions.forEach(mission => {
      mission.affectations.forEach(aff => {
        if (aff.role_mission) {
          teams.add(aff.role_mission);
        }
      });
    });
    return Array.from(teams);
  }, [missions]);

  // Mise à jour du filtrage des missions
  const filteredMissions = useMemo(() => {
    return missions
      .filter((mission: Mission) => {
        // Filtrage par recherche
        const matchesSearch = 
          mission.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
          (mission.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
        
        // Filtrage par statut
        const matchesStatus = 
          filterStatus === "all" || 
          (filterStatus === "assigned" && mission.affectations.length > 0) ||
          (filterStatus === "unassigned" && mission.affectations.length === 0) ||
          (filterStatus === "complete" && mission.affectations.length >= 3);
        
        // Filtrage par équipe
        const matchesTeam = 
          selectedTeam === "all" ||
          mission.affectations.some(aff => aff.role_mission === selectedTeam);
        
        return matchesSearch && matchesStatus && matchesTeam;
      })
      .sort((a: Mission, b: Mission) => {
        // Tri dynamique
        if (sortBy === "titre") {
          return sortOrder === "asc" 
            ? a.titre.localeCompare(b.titre)
            : b.titre.localeCompare(a.titre);
        } else if (sortBy === "date_creation") {
          return sortOrder === "asc"
            ? new Date(a.date_creation).getTime() - new Date(b.date_creation).getTime()
            : new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime();
        } else if (sortBy === "affectations") {
          return sortOrder === "asc"
            ? a.affectations.length - b.affectations.length
            : b.affectations.length - a.affectations.length;
        } else if (sortBy === "priorite") {
          const priorityOrder = { 'critique': 4, 'haute': 3, 'moyenne': 2, 'basse': 1 };
          const aPriority = a.priorite ? priorityOrder[a.priorite] : 0;
          const bPriority = b.priorite ? priorityOrder[b.priorite] : 0;
          return sortOrder === "asc"
            ? aPriority - bPriority
            : bPriority - aPriority;
        }
        return 0;
      });
  }, [missions, searchTerm, filterStatus, sortBy, sortOrder, selectedTeam]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Données pour les graphiques et statistiques
  const statsData = useMemo(() => {
    const nonAffectees = missions.filter(m => m.affectations.length === 0).length;
    const enCours = missions.filter(m => m.affectations.length > 0 && m.affectations.length < 3).length;
    const completes = missions.filter(m => m.affectations.length >= 3).length;
    
    // Données pour le graphique en secteurs
    const pieData = [
      { name: 'Non affectées', value: nonAffectees, color: '#fcd34d' },
      { name: 'En cours', value: enCours, color: '#60a5fa' },
      { name: 'Complètes', value: completes, color: '#34d399' }
    ];
    
    // Données pour le graphique à barres - nombre d'utilisateurs par rôle
    const roles: Record<string, number> = {};
    missions.forEach(mission => {
      mission.affectations.forEach(aff => {
        roles[aff.role_mission] = (roles[aff.role_mission] || 0) + 1;
      });
    });
    
    const roleData = Object.entries(roles).map(([name, value]) => ({ name, value }));
    
    // Données pour le graphique linéaire - évolution des missions
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const evolutionData = last7Days.map(date => {
      const missionsForDate = missions.filter(m => 
        new Date(m.date_creation).toISOString().split('T')[0] <= date
      );
      return {
        date: new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        total: missionsForDate.length,
        completes: missionsForDate.filter(m => m.affectations.length >= 3).length,
        enCours: missionsForDate.filter(m => m.affectations.length > 0 && m.affectations.length < 3).length
      };
    });
    
    // Statistiques générales
    const totalUsers = missions.reduce((acc, mission) => acc + mission.affectations.length, 0);
    const avgUsersPerMission = totalUsers / (missions.length || 1);
    const completionRate = (completes / missions.length) * 100 || 0;
    
    return {
      pieData,
      roleData,
      evolutionData,
      totalMissions: missions.length,
      totalUsers,
      avgUsersPerMission,
      nonAffectees,
      enCours,
      completes,
      completionRate
    };
  }, [missions]);

  // Composant pour afficher le graphique en secteurs
  const PieChartComponent = () => (
    <ResponsiveContainer width="100%" height={200}>
      <RechartsChart>
        <Pie
          data={statsData.pieData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {statsData.pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <RechartsTooltip formatter={(value) => [`${value} missions`, '']} />
      </RechartsChart>
    </ResponsiveContainer>
  );
  
  // Composant pour afficher le graphique à barres
  const BarChartComponent = () => (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={statsData.roleData}>
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <RechartsTooltip formatter={(value) => [`${value} utilisateurs`, '']} />
        <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );

  // Composant pour afficher le graphique d'évolution
  const LineChartComponent = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={statsData.evolutionData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <RechartsTooltip />
        <Legend />
        <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total missions" />
        <Line type="monotone" dataKey="completes" stroke="#34d399" name="Missions complètes" />
        <Line type="monotone" dataKey="enCours" stroke="#60a5fa" name="En cours" />
      </LineChart>
    </ResponsiveContainer>
  );

  // Composant pour afficher les notifications
  const NotificationsPanel = () => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50"
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold">Notifications</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                notification.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                notification.type === 'success' ? 'bg-green-50 dark:bg-green-900/20' :
                'bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <p className="text-sm">{notification.message}</p>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            Aucune notification
          </div>
        )}
      </div>
    </motion.div>
  );

  // Composant pour afficher le graphique de progression
  const ProgressChart = () => {
    const progressData = useMemo(() => {
      const now = new Date();
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const data = Array.from({ length: days }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (days - i - 1));
        return {
          date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          completed: missions.filter(m => 
            new Date(m.date_creation) <= date && 
            m.affectations.length >= 3
          ).length,
          inProgress: missions.filter(m => 
            new Date(m.date_creation) <= date && 
            m.affectations.length > 0 && 
            m.affectations.length < 3
          ).length,
          notStarted: missions.filter(m => 
            new Date(m.date_creation) <= date && 
            m.affectations.length === 0
          ).length
        };
      });
      return data;
    }, [missions, timeRange]);

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={progressData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="completed" 
            stroke="#34d399" 
            name="Complétées" 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="inProgress" 
            stroke="#60a5fa" 
            name="En cours" 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="notStarted" 
            stroke="#fcd34d" 
            name="Non démarrées" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Composant pour afficher une carte de mission
  const MissionCard = ({ mission }: { mission: Mission }) => {
    const status = getMissionStatus(mission);
    const StatusIcon = status.icon;
    const PriorityIcon = getPriorityIcon(mission.priorite);
    const priorityColor = getPriorityColor(mission.priorite);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ 
          scale: 1.03, 
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
        }}
        className="bg-white/90 backdrop-blur-sm dark:bg-gray-900/90 border border-blue-100 dark:border-gray-700 rounded-2xl shadow-md p-6 overflow-hidden relative"
      >
        <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-700/20 blur-xl"></div>
        
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-2xl font-semibold text-blue-600 mb-1 line-clamp-2">{mission.titre}</h2>
          <div className="flex gap-2">
            {mission.priorite && (
              <Badge variant="outline" className={`flex items-center gap-1 ${priorityColor}`}>
                <PriorityIcon size={12} />
                <span>{mission.priorite}</span>
              </Badge>
            )}
            <Badge variant="outline" className={`flex items-center gap-1 ${status.badgeColor}`}>
              <StatusIcon size={12} />
              <span>{status.label}</span>
            </Badge>
          </div>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 min-h-[4.5rem]">
          {mission.description || "Aucune description disponible."}
        </p>
        
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar size={16} className="mr-1" />
            <time>Créée le : {new Date(mission.date_creation).toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            })}</time>
          </div>
          {mission.date_echeance && (
            <div className="flex items-center">
              <Timer size={16} className="mr-1" />
              <time>Échéance : {new Date(mission.date_echeance).toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })}</time>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-lg flex items-center gap-2">
              <UserIcon size={16} className="text-blue-500" />
              <span>Équipe</span>
            </h3>
            <Badge variant="secondary" className="text-xs">
              {mission.affectations.length} / 3
            </Badge>
          </div>
          
          <div className="mb-3">
            <Progress value={mission.affectations.length / 3 * 100} className="h-1" />
          </div>
          
          <ul className="space-y-2 max-h-40 overflow-y-auto px-1">
            {mission.affectations.length > 0 ? (
              mission.affectations.map((affectation) => (
                <motion.li 
                  key={affectation.id} 
                  className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                  whileHover={{ x: 5 }}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                    {affectation.utilisateur.prenom[0]}{affectation.utilisateur.nom[0]}
                  </div>
                  <div className="flex-grow">
                    <div>{affectation.utilisateur.prenom} {affectation.utilisateur.nom}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <TagIcon size={12} />
                      {affectation.role_mission}
                    </div>
                  </div>
                </motion.li>
              ))
            ) : (
              <li className="italic text-gray-400 flex items-center justify-center py-4">Aucun utilisateur affecté</li>
            )}
          </ul>
          
          <div className="flex gap-2 mt-4">
            <Button
              variant="default"
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
              onClick={() => setSelectedMission(mission)}
            >
              <Eye size={16} className="mr-2" />
              Détails
            </Button>
            
            <Button
              variant="outline"
              className="px-2"
            >
              <PlusCircle size={16} />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="p-4 md:p-10 min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900/30">
        <div className="absolute inset-0">
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
          </div>
          
          {/* Animated Circles */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          
          {/* Animated Lines */}
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent animate-shimmer"></div>
            <div className="absolute top-1/3 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-shimmer animation-delay-1000"></div>
            <div className="absolute top-2/3 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-600/20 to-transparent animate-shimmer animation-delay-2000"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                📊 Tableau de Bord des Missions
              </span>
            </h1>
            
            <div className="flex gap-4">
              <select
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="7d">7 derniers jours</option>
                <option value="30d">30 derniers jours</option>
                <option value="90d">90 derniers jours</option>
              </select>
              
              <Button
                variant="outline"
                className="relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Nouveaux KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full p-2 bg-blue-100 text-blue-700">
                    <Target size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Taux de complétion</p>
                    <h3 className="text-2xl font-bold">{calculateKPIs(missions, timeRange).completionRate.toFixed(1)}%</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full p-2 bg-blue-100 text-blue-700">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Temps moyen</p>
                    <h3 className="text-2xl font-bold">{calculateKPIs(missions, timeRange).averageCompletionTime.toFixed(1)}j</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full p-2 bg-blue-100 text-blue-700">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Missions critiques</p>
                    <h3 className="text-2xl font-bold">{calculateKPIs(missions, timeRange).criticalMissions}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full p-2 bg-blue-100 text-blue-700">
                    <Timer size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">En retard</p>
                    <h3 className="text-2xl font-bold">{calculateKPIs(missions, timeRange).overdueMissions}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full p-2 bg-blue-100 text-blue-700">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Efficacité équipe</p>
                    <h3 className="text-2xl font-bold">{calculateKPIs(missions, timeRange).teamEfficiency.toFixed(1)}%</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tableau de bord - statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-full p-2 bg-purple-100 text-purple-700">
                  <ClipboardList size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total missions</p>
                  <h3 className="text-2xl font-bold">{statsData.totalMissions}</h3>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-full p-2 bg-green-100 text-green-700">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Taux de complétion</p>
                  <h3 className="text-2xl font-bold">{statsData.completionRate.toFixed(1)}%</h3>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-full p-2 bg-blue-100 text-blue-700">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Utilisateurs total</p>
                  <h3 className="text-2xl font-bold">{statsData.totalUsers}</h3>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-full p-2 bg-yellow-100 text-yellow-700">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Moyenne par mission</p>
                  <h3 className="text-2xl font-bold">{statsData.avgUsersPerMission.toFixed(1)}</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des missions</CardTitle>
                <CardDescription>Par état d'affectation</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChartComponent />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribution des rôles</CardTitle>
                <CardDescription>Nombre d'utilisateurs par rôle</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartComponent />
              </CardContent>
            </Card>
          </div>

          {/* Évolution des missions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Évolution des missions</CardTitle>
              <CardDescription>Sur les 7 derniers jours</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChartComponent />
            </CardContent>
          </Card>

          {/* Barre de recherche et filtres */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher une mission..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <select
                className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="assigned">Missions affectées</option>
                <option value="unassigned">Missions non affectées</option>
                <option value="complete">Équipes complètes</option>
              </select>
              
              <select
                className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
              >
                <option value="all">Toutes les équipes</option>
                {getUniqueTeams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
              
              <div className="relative">
                <select
                  className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white pr-10"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date_creation">Date de création</option>
                  <option value="titre">Titre</option>
                  <option value="affectations">Nombre d'affectations</option>
                  <option value="priorite">Priorité</option>
                </select>
                <button 
                  onClick={toggleSortOrder}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <ArrowUpDown size={16} className={`transition-all duration-200 ${sortOrder === "asc" ? "text-blue-500" : "text-gray-500"}`} />
                </button>
              </div>
              
              <Button
                onClick={() => setShowStatsDialog(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <PieChart size={16} />
                <span className="hidden md:inline">Statistiques</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter size={16} /> Vue
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Type d'affichage</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActiveView("cards")}>
                    <div className={`flex items-center gap-2 ${activeView === "cards" ? "text-blue-500" : ""}`}>
                      <div className="grid grid-cols-2 gap-1 w-4 h-4">
                        <div className="bg-current rounded-sm"></div>
                        <div className="bg-current rounded-sm"></div>
                        <div className="bg-current rounded-sm"></div>
                        <div className="bg-current rounded-sm"></div>
                      </div>
                      <span>Cartes</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveView("list")}>
                    <div className={`flex items-center gap-2 ${activeView === "list" ? "text-blue-500" : ""}`}>
                      <FileText size={16} />
                      <span>Liste</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveView("table")}>
                    <div className={`flex items-center gap-2 ${activeView === "table" ? "text-blue-500" : ""}`}>
                      <BarChart3 size={16} />
                      <span>Tableau</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.div>

        {/* Dialog de statistiques détaillées */}
        <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-2">Statistiques des missions</DialogTitle>
              <DialogDescription>
                Aperçu détaillé de la répartition et de l'état des missions
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <Tabs defaultValue="overview">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                  <TabsTrigger value="roles">Rôles</TabsTrigger>
                  <TabsTrigger value="trends">Tendances</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Répartition des missions</CardTitle>
                        <CardDescription>Par état d'affectation</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <PieChartComponent />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Statistiques générales</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Progression globale des affectations</span>
                            <span className="text-sm font-medium">
                              {((statsData.enCours + statsData.completes) / statsData.totalMissions * 100).toFixed(0)}%
                            </span>
                          </div>
                          <Progress 
                            value={(statsData.enCours + statsData.completes) / statsData.totalMissions * 100} 
                            className="h-2"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">Utilisateurs total</div>
                            <div className="text-2xl font-bold">{statsData.totalUsers}</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">Moy. utilisateurs/mission</div>
                            <div className="text-2xl font-bold">{statsData.avgUsersPerMission.toFixed(1)}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="roles">
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribution des rôles</CardTitle>
                      <CardDescription>Nombre d'utilisateurs par rôle de mission</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BarChartComponent />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="trends">
                  <Card>
                    <CardHeader>
                      <CardTitle>Évolution des affectations</CardTitle>
                      <CardDescription>Cette fonctionnalité sera disponible prochainement</CardDescription>
                    </CardHeader>
                    <CardContent className="h-64 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Activity size={48} className="mx-auto mb-4 opacity-30" />
                        <p>Données de tendance en cours de développement</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>

        {/* Ajout du panneau de notifications */}
        {showNotifications && (
          <AnimatePresence>
            <NotificationsPanel />
          </AnimatePresence>
        )}

        {/* Nouveau graphique de progression */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Progression des missions</CardTitle>
            <CardDescription>Évolution sur la période sélectionnée</CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressChart />
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="loader">
              <div className="w-16 h-16 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Compteur de résultats */}
            <motion.div 
              className="flex justify-between items-center mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-gray-600 dark:text-gray-400">
                {filteredMissions.length} mission{filteredMissions.length !== 1 ? 's' : ''} trouvée{filteredMissions.length !== 1 ? 's' : ''}
              </p>
              
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon">
                        <PlusCircle size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ajouter une mission</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon">
                        <RefreshCcw size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Rafraîchir les données</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </motion.div>

            {/* Vue en cartes */}
            {activeView === "cards" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredMissions.map((mission) => (
                    <MissionCard key={mission.id} mission={mission} />
                  ))}
                </AnimatePresence>
              </div>
            )}
            
            {/* Vue en liste */}
            {activeView === "list" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {filteredMissions.map((mission) => {
                  const status = getMissionStatus(mission);
                  const StatusIcon = status.icon;
                  
                  return (
                    <motion.div
                      key={mission.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ scale: 1.01 }}
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4"
                    >
                      <div className="flex items-start md:items-center gap-4 flex-col md:flex-row">
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-pink-600">{mission.titre}</h3>
                            <Badge variant="outline" className={`flex items-center gap-1 ${status.badgeColor}`}>
                              <StatusIcon size={12} />
                              <span>{status.label}</span>
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                            {mission.description || "Aucune description disponible."}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-sm text-gray-500">Équipe</div>
                            <div className="text-lg font-bold">{mission.affectations.length}/3</div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="icon">
                              <Eye size={16} />
                            </Button>
                            <Button variant="outline" size="icon">
                              <PlusCircle size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
            
            {/* Vue en tableau */}
            {activeView === "table" && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Titre</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Statut</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Équipe</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMissions.map((mission) => {
                      const status = getMissionStatus(mission);
                      const StatusIcon = status.icon;
                      
                      return (
                        <tr key={mission.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900 dark:text-gray-100">{mission.titre}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{mission.description || "Aucune description"}</div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={`flex items-center gap-1 w-fit ${status.badgeColor}`}>
                              <StatusIcon size={12} />
                              <span>{status.label}</span>
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Progress value={mission.affectations.length / 3 * 100} className="w-20 h-1" />
                              <span className="text-sm text-gray-500">{mission.affectations.length}/3</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(mission.date_creation).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="icon">
                                <Eye size={16} />
                              </Button>
                              <Button variant="outline" size="icon">
                                <PlusCircle size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            {filteredMissions.length === 0 && (
              <motion.div
                className="text-center py-16 text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="mx-auto w-24 h-24 mb-6 text-gray-300 dark:text-gray-600">
                  <Search size={96} strokeWidth={1} />
                </div>
                <h3 className="text-xl font-medium mb-2">Aucune mission trouvée</h3>
                <p>Essayez de modifier vos critères de recherche</p>
              </motion.div>
            )}
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
                    