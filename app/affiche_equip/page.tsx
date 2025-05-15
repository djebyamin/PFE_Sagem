"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getEquipements } from "../affiche_equip/action"
import { updateEquipmentStock, getUpdatedEquipments } from "./updateStock"
import { 
  Layers, 
  PackageCheck, 
  Search, 
  ChevronDown, 
  ShoppingCart, 
  X,
  CheckCircle,
  Clock,
  BarChart3,
  Info,
  Calendar,
  RefreshCw,
  Truck,
  TrendingUp,
  Package,
  AlertCircle,
  Grid,
  List,
  Settings,
  User,
  Bell,
  Menu
} from "lucide-react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, RadialLinearScale, Filler } from 'chart.js'
import { Pie, Bar, Line, Radar, Scatter } from 'react-chartjs-2'

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, RadialLinearScale, Filler)

// Type definitions
type Equipement = {
  id: number
  code_imo: string
  nom_testeur: string
  nom_equipement: string
  designation: string
  date_mise_en_marche?: Date
  arborescence?: string | null
  date_garantie?: Date
  categorie: string
  nombre: number
  disponible?: boolean
  image?: string
  isFavorite?: boolean
}

type CartItem = Equipement & {
  quantity: number
}

type NotificationType = 'info' | 'warning' | 'error' | 'success';

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
  timestamp: Date;
  read: boolean;
}

// Types for new features
type MaintenanceHistory = {
  id: number;
  equipementId: number;
  date: Date;
  type: 'preventive' | 'corrective';
  description: string;
  technician: string;
};

type EquipmentRating = {
  id: number;
  equipementId: number;
  rating: number;
  comment: string;
  userId: string;
  date: Date;
};

type PredictionData = {
  equipementId: number;
  predictedStock: number;
  confidence: number;
  nextMaintenance: Date;
};

// Types pour les fonctionnalités intelligentes
type SmartAlert = {
  id: number;
  type: 'stock' | 'maintenance' | 'warranty' | 'usage';
  message: string;
  priority: 'high' | 'medium' | 'low';
  equipmentId: number;
  date: Date;
};

type EquipmentUsage = {
  id: number;
  equipmentId: number;
  userId: string;
  startDate: Date;
  endDate?: Date;
  purpose: string;
  status: 'active' | 'completed' | 'cancelled';
};

type SmartSuggestion = {
  id: number;
  equipmentId: number;
  type: 'replacement' | 'maintenance' | 'upgrade';
  reason: string;
  priority: number;
  date: Date;
};

// Main component
export default function MagasinEquipements() {
  // State variables
  const [equipements, setEquipements] = useState<Equipement[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFilters, setSearchFilters] = useState({
    categorie: '',
    disponibilite: '',
    stockBas: false
  })
  const [showFavorites, setShowFavorites] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [cachedData, setCachedData] = useState<Equipement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [showDetailedView, setShowDetailedView] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState('catalogue')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'nom' | 'categorie' | 'disponibilite' | 'quantite'>('nom')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState({
    totalEquipements: 0,
    categories: {} as Record<string, number>,
    stockBas: 0,
    maintenance: 0
  })
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceHistory[]>([]);
  const [equipmentRatings, setEquipmentRatings] = useState<EquipmentRating[]>([]);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [showAR, setShowAR] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipement | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [smartAlerts, setSmartAlerts] = useState<SmartAlert[]>([]);
  const [equipmentUsage, setEquipmentUsage] = useState<EquipmentUsage[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [showSmartPanel, setShowSmartPanel] = useState(false);

  // Fetch equipment data
  useEffect(() => {
    async function fetchEquipements() {
      setIsLoading(true)
      try {
        const data = await getEquipements()
        // Enhance data with additional properties
        const enhancedData = data.map(item => ({
          ...item,
          disponible: item.nombre > 0,
          date_mise_en_marche: item.date_mise_en_marche ? new Date(item.date_mise_en_marche) : undefined,
          date_garantie: item.date_garantie ? new Date(item.date_garantie) : undefined
        }))
        setEquipements(enhancedData)
      } catch (error) {
        console.error("Error fetching equipment:", error)
      } finally {
        // Simulate loading for demo purposes
        setTimeout(() => setIsLoading(false), 800)
      }
    }

    fetchEquipements()
  }, [])

  // Fonction de recherche unifiée avec useMemo pour optimiser les performances
  const filteredEquipements = useMemo(() => {
    return equipements.filter(equip => {
      const matchesSearch = equip.nom_equipement.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          equip.designation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategorie = !searchFilters.categorie || equip.categorie === searchFilters.categorie;
      const matchesDisponibilite = !searchFilters.disponibilite || 
                                  (searchFilters.disponibilite === 'disponible' && equip.disponible) ||
                                  (searchFilters.disponibilite === 'indisponible' && !equip.disponible);
      const matchesStockBas = !searchFilters.stockBas || equip.nombre < 5;

      return matchesSearch && matchesCategorie && matchesDisponibilite && matchesStockBas;
    });
  }, [equipements, searchQuery, searchFilters]);

  // Extract unique categories
  const categories = ["Tous", ...Array.from(new Set(equipements.map(e => e.categorie)))]

  // Cart functions
  const addToCart = (equipement: Equipement) => {
    if (equipement.nombre <= 0) {
      showNotification("Cet équipement n'est plus disponible en stock", "error")
      return
    }
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === equipement.id)
      if (existingItem) {
        if (existingItem.quantity + 1 > equipement.nombre) {
          showNotification(`Stock insuffisant. Disponible: ${equipement.nombre}`, "warning")
          return prevCart
        }
        
        showNotification(`Quantité de ${equipement.nom_equipement} mise à jour`, "success")
        return prevCart.map(item => 
          item.id === equipement.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      } else {
        showNotification(`${equipement.nom_equipement} ajouté au panier`, "success")
        return [...prevCart, { ...equipement, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (id: number) => {
    const itemToRemove = cart.find(item => item.id === id)
    if (itemToRemove) {
      showNotification(`${itemToRemove.nom_equipement} retiré du panier`, "info")
    }
    setCart(prevCart => prevCart.filter(item => item.id !== id))
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    
    const equipement = equipements.find(e => e.id === id)
    if (equipement && quantity > equipement.nombre) {
      showNotification(`Stock insuffisant. Disponible: ${equipement.nombre}`, "warning")
      return
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

  // Calculate total items in cart
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  
  // Format date for display
  const formatDate = (date: Date | undefined | null): string => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString('fr-FR')
  }

  // Place an order
  const placeOrder = async () => {
    if (cart.length === 0) return
    
    try {
      setIsProcessing(true)
      
      // Prepare data for stock update
      const itemsToUpdate = cart.map(item => ({
        id: item.id,
        quantity: item.quantity
      }))
      
      // Call server action to update stock
      const result = await updateEquipmentStock(itemsToUpdate)
      
      if (result.success) {
        // Get updated equipment data
        const updatedItems = await getUpdatedEquipments(cart.map(item => item.id))
        
        // Update local equipment state
        setEquipements(prev => {
          const newEquipements = [...prev]
          updatedItems.forEach(updated => {
            const index = newEquipements.findIndex(e => e.id === updated.id)
            if (index !== -1) {
              newEquipements[index] = {
                ...newEquipements[index],
                nombre: updated.nombre,
                disponible: updated.nombre > 0
              }
            }
          })
          return newEquipements
        })
        
        // Confirm order
        setOrderPlaced(true)
        showNotification("Commande envoyée avec succès!", "success")
        setTimeout(() => {
          setCart([])
          setOrderPlaced(false)
          setShowCart(false)
        }, 3000)
      } else {
        showNotification("Erreur lors de la mise à jour du stock. Veuillez réessayer.", "error")
      }
    } catch (error) {
      console.error("Erreur lors du traitement de la commande:", error)
      showNotification("Une erreur est survenue lors du traitement de votre commande.", "error")
    } finally {
      setIsProcessing(false)
    }
  }

  // Sample recent orders data
  const recentOrders = [
    { id: 1, date: "04/05/2025", status: "Livré", items: 5 },
    { id: 2, date: "28/04/2025", status: "En cours", items: 3 },
    { id: 3, date: "15/04/2025", status: "Livré", items: 8 }
  ]

  // Toggle between detailed and simple view
  const toggleView = () => {
    setShowDetailedView(!showDetailedView)
  }

  // Toggle between grid and list view
  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid")
  }

  // Notification system (simplified implementation)
  const showNotification = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type, timestamp: new Date(), read: false }])
    
    // Auto-remove notification after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== id))
    }, 3000)
  }

  // Sort function
  const handleSort = (criteria: "nom" | "categorie" | "disponibilite" | "quantite") => {
    if (sortBy === criteria) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(criteria)
      setSortDirection("asc")
    }
  }

  // Dashboard statistics
  const dashboardStats = {
    availableEquipment: equipements.filter(e => e.disponible).length,
    totalEquipment: equipements.length,
    monthlyOrders: 12,
    categoriesCount: categories.length - 1,
    lowStockItems: equipements.filter(e => e.nombre > 0 && e.nombre <= 3).length
  }

  // Fonction pour gérer les favoris
  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(favId => favId !== id)
        : [...prev, id]
    )
  }

  // Calcul des statistiques
  useEffect(() => {
    const newStats = {
      totalEquipements: equipements.length,
      categories: equipements.reduce((acc, equip) => {
        acc[equip.categorie] = (acc[equip.categorie] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      stockBas: equipements.filter(e => e.nombre < 5).length,
      maintenance: equipements.filter(e => !e.disponible).length
    };
    setStats(newStats);
  }, [equipements]);

  // Fonction pour ajouter une notification
  const addNotification = (message: string, type: NotificationType) => {
    const newNotification: Notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Vérification du stock bas
  useEffect(() => {
    equipements.forEach(equip => {
      if (equip.nombre < 5) {
        addNotification(
          `Stock bas pour ${equip.nom_equipement} (${equip.nombre} restants)`,
          'warning'
        );
      }
    });
  }, [equipements]);

  // Gestion du mode hors-ligne
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Mise en cache des données
    if (isOnline) {
      setCachedData(equipements);
      localStorage.setItem('cachedEquipements', JSON.stringify(equipements));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline, equipements]);

  // Chargement des données en cache au démarrage
  useEffect(() => {
    const cached = localStorage.getItem('cachedEquipements');
    if (cached) {
      setCachedData(JSON.parse(cached));
    }
  }, []);

  // Fonction pour planifier la maintenance
  const scheduleMaintenance = (equipId: number, date: Date) => {
    const equip = equipements.find(e => e.id === equipId);
    if (equip) {
      addNotification(
        `Maintenance planifiée pour ${equip.nom_equipement} le ${date.toLocaleDateString()}`,
        'info'
      );
    }
  };

  // Function to generate predictions
  const generatePredictions = useCallback(() => {
    const newPredictions = equipements.map(equip => ({
      equipementId: equip.id,
      predictedStock: Math.max(0, equip.nombre - Math.floor(Math.random() * 5)),
      confidence: 0.8 + Math.random() * 0.2,
      nextMaintenance: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000)
    }));
    setPredictions(newPredictions);
  }, [equipements]);

  // Update predictions
  useEffect(() => {
    generatePredictions();
    const interval = setInterval(generatePredictions, 24 * 60 * 60 * 1000); // Daily update
    return () => clearInterval(interval);
  }, [generatePredictions]);

  // Function to add maintenance
  const addMaintenance = (equipId: number, type: 'preventive' | 'corrective', description: string) => {
    const newMaintenance: MaintenanceHistory = {
      id: Date.now(),
      equipementId: equipId,
      date: new Date(),
      type,
      description,
      technician: 'Sagemcom Technician' // To be replaced with the logged-in user
    };
    setMaintenanceHistory(prev => [...prev, newMaintenance]);
    addNotification(`Maintenance ${type} added for equipment #${equipId}`, 'info');
  };

  // Function to add rating
  const addRating = (equipId: number, rating: number, comment: string) => {
    const newRating: EquipmentRating = {
      id: Date.now(),
      equipementId: equipId,
      rating,
      comment,
      userId: 'User', // To be replaced with the logged-in user
      date: new Date()
    };
    setEquipmentRatings(prev => [...prev, newRating]);
    addNotification('Rating added successfully', 'success');
  };

  // Fonction utilitaire pour générer des IDs uniques
  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Fonction pour analyser les données et générer des alertes intelligentes
  const generateSmartAlerts = useCallback(() => {
    const newAlerts: SmartAlert[] = [];

    equipements.forEach(equip => {
      // Alerte de stock bas
      if (equip.nombre < 5) {
        newAlerts.push({
          id: Number(generateUniqueId()),
          type: 'stock',
          message: `Stock bas pour ${equip.nom_equipement} (${equip.nombre} restants)`,
          priority: equip.nombre === 0 ? 'high' : 'medium',
          equipmentId: equip.id,
          date: new Date()
        });
      }

      // Alerte de maintenance
      if (equip.date_mise_en_marche) {
        const monthsInUse = (new Date().getTime() - new Date(equip.date_mise_en_marche).getTime()) / (1000 * 60 * 60 * 24 * 30);
        if (monthsInUse > 6) {
          newAlerts.push({
            id: Number(generateUniqueId()),
            type: 'maintenance',
            message: `${equip.nom_equipement} nécessite une maintenance préventive`,
            priority: 'medium',
            equipmentId: equip.id,
            date: new Date()
          });
        }
      }

      // Alerte de garantie
      if (equip.date_garantie) {
        const daysUntilWarranty = (new Date(equip.date_garantie).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
        if (daysUntilWarranty < 30) {
          newAlerts.push({
            id: Number(generateUniqueId()),
            type: 'warranty',
            message: `La garantie de ${equip.nom_equipement} expire dans ${Math.ceil(daysUntilWarranty)} jours`,
            priority: 'high',
            equipmentId: equip.id,
            date: new Date()
          });
        }
      }
    });

    setSmartAlerts(newAlerts);
  }, [equipements]);

  // Mise à jour des alertes intelligentes
  useEffect(() => {
    generateSmartAlerts();
    const interval = setInterval(generateSmartAlerts, 1000 * 60 * 60); // Mise à jour toutes les heures
    return () => clearInterval(interval);
  }, [generateSmartAlerts]);

  // Fonction pour générer des suggestions intelligentes
  const generateSmartSuggestions = useCallback(() => {
    const newSuggestions: SmartSuggestion[] = [];

    equipements.forEach(equip => {
      // Suggestion de remplacement basée sur l'âge
      if (equip.date_mise_en_marche) {
        const yearsInUse = (new Date().getTime() - new Date(equip.date_mise_en_marche).getTime()) / (1000 * 60 * 60 * 24 * 365);
        if (yearsInUse > 3) {
          newSuggestions.push({
            id: Number(generateUniqueId()),
            equipmentId: equip.id,
            type: 'replacement',
            reason: `Équipement en service depuis ${Math.floor(yearsInUse)} ans`,
            priority: yearsInUse > 5 ? 1 : 2,
            date: new Date()
          });
        }
      }

      // Suggestion de maintenance basée sur l'utilisation
      const usageCount = equipmentUsage.filter(u => u.equipmentId === equip.id).length;
      if (usageCount > 100) {
        newSuggestions.push({
          id: Number(generateUniqueId()),
          equipmentId: equip.id,
          type: 'maintenance',
          reason: `Forte utilisation détectée (${usageCount} utilisations)`,
          priority: 2,
          date: new Date()
        });
      }
    });

    setSmartSuggestions(newSuggestions);
  }, [equipements, equipmentUsage]);

  // Mise à jour des suggestions
  useEffect(() => {
    generateSmartSuggestions();
    const interval = setInterval(generateSmartSuggestions, 1000 * 60 * 60 * 24); // Mise à jour quotidienne
    return () => clearInterval(interval);
  }, [generateSmartSuggestions]);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans">
      {/* Header with professional design */}
      <header className="bg-white shadow-sm sticky top-0 z-30 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-slate-700 bg-slate-100 p-2 rounded-md">
                <Layers size={24} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <span className="text-slate-900">
                    Sagemcom
                  </span>
                  <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    BETA
                  </span>
                </h1>
                <p className="text-sm text-slate-500">Magasin Interne</p>
              </div>
            </div>
            
            {/* Navigation with professional styling */}
            <div className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => setActiveTab("dashboard")}
                className={`text-sm font-medium border-b-2 py-3 transition-colors ${
                  activeTab === "dashboard" 
                    ? "text-slate-900 border-slate-900" 
                    : "text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 size={16} />
                  <span>Tableau de bord</span>
                </div>
              </button>
              
              <button 
                onClick={() => setActiveTab("catalogue")}
                className={`text-sm font-medium border-b-2 py-3 transition-colors ${
                  activeTab === "catalogue" 
                    ? "text-slate-900 border-slate-900" 
                    : "text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package size={16} />
                  <span>Catalogue</span>
                </div>
              </button>
              
              <button 
                onClick={() => setShowCart(true)}
                className="relative flex items-center text-slate-700 hover:text-slate-900 transition-colors"
              >
                <div className="p-2 bg-slate-100 rounded-md">
                  <ShoppingCart size={20} />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </div>
              </button>
              
              <div className="flex items-center gap-3 text-slate-600">
                <button className="p-2 hover:bg-slate-100 rounded-md transition-colors">
                  <Bell size={16} />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-md transition-colors">
                  <User size={16} />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-md transition-colors">
                  <Settings size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with professional styling */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-600">
              <RefreshCw size={32} className="animate-spin" />
            </div>
            <p className="ml-4 text-slate-600">Chargement des équipements...</p>
          </div>
        ) : activeTab === "catalogue" ? (
          <div>
            {/* Professional search bar */}
            <div className="mb-6 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Rechercher un équipement..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 rounded-md border border-slate-200 bg-white focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  </div>
                </div>
                <select
                  value={searchFilters.categorie}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, categorie: e.target.value }))}
                  className="px-4 py-2 rounded-md border border-slate-200 bg-white focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors"
                >
                  <option value="">Toutes les catégories</option>
                  <option value="Bricolage">Bricolage</option>
                  <option value="Sécurité">Sécurité</option>
                  <option value="Electronique">Electronique</option>
                  <option value="Mécanique">Mécanique</option>
                  <option value="Informatique">Informatique</option>
                  <option value="Autre">Autre</option>
                </select>
                
                <select
                  value={searchFilters.disponibilite}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, disponibilite: e.target.value }))}
                  className="px-4 py-2 rounded-md border border-slate-200 bg-white focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors"
                >
                  <option value="">Tous les statuts</option>
                  <option value="disponible">Disponible</option>
                  <option value="indisponible">Indisponible</option>
                </select>
                <label className="flex items-center gap-2 px-4 py-2 bg-white rounded-md border border-slate-200">
                  <input
                    type="checkbox"
                    checked={searchFilters.stockBas}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, stockBas: e.target.checked }))}
                    className="w-4 h-4 text-slate-600 focus:ring-slate-400 border-slate-300 rounded"
                  />
                  Stock bas
                </label>
              </div>
            </div>

            {/* Equipment cards with professional design */}
            {filteredEquipements.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEquipements.map((e, index) => (
                  <div
                    key={e.id}
                    className="bg-white rounded-md overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-base font-medium text-slate-900">{e.nom_equipement}</h3>
                          <p className="text-sm text-slate-500">{e.code_imo}</p>
                        </div>
                        <span 
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            e.disponible 
                              ? 'bg-slate-100 text-slate-700' 
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {e.disponible ? 'Disponible' : 'Indisponible'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{e.designation}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded">
                          {e.categorie}
                        </span>
                        <span className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded">
                          {e.nom_testeur}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <span className="text-slate-500">Stock: </span>
                          <span className={`font-medium ${
                            e.nombre === 0 ? 'text-slate-500' :
                            e.nombre <= 3 ? 'text-slate-700' : 'text-slate-900'
                          }`}>
                            {e.nombre}
                          </span>
                        </div>
                        
                        <button
                          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white ${
                            e.disponible 
                              ? 'bg-slate-900 hover:bg-slate-800' 
                              : 'bg-slate-400 cursor-not-allowed'
                          } transition-colors`}
                          onClick={() => e.disponible && addToCart(e)}
                          disabled={!e.disponible}
                        >
                          <ShoppingCart size={14} className="mr-1.5" />
                          Ajouter
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Professional empty state
              <div className="text-center py-12 bg-white rounded-md shadow-sm border border-slate-200">
                <div className="mx-auto flex flex-col items-center">
                  <PackageCheck size={48} className="text-slate-300 mb-3" />
                  <h3 className="text-lg font-medium text-slate-900">Aucun équipement trouvé</h3>
                  <p className="mt-1 text-slate-500">Essayez de modifier vos critères de recherche</p>
                  <button 
                    onClick={() => {
                      setSearchQuery("")
                      setSearchFilters({
                        categorie: '',
                        disponibilite: '',
                        stockBas: false
                      })
                    }}
                    className="mt-4 text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5"
                  >
                    <RefreshCw size={14} />
                    Réinitialiser les filtres
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Dashboard view with professional styling
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Tableau de Bord</h2>
            
            {/* Stats Cards with professional design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-md shadow-sm p-4 border border-slate-200">
                <h3 className="text-sm font-medium text-slate-600 mb-1">Total Équipements</h3>
                <p className="text-2xl font-semibold text-slate-900">{stats.totalEquipements}</p>
              </div>
              
              <div className="bg-white rounded-md shadow-sm p-4 border border-slate-200">
                <h3 className="text-sm font-medium text-slate-600 mb-1">Stock Bas</h3>
                <p className="text-2xl font-semibold text-slate-900">{stats.stockBas}</p>
              </div>
              
              <div className="bg-white rounded-md shadow-sm p-4 border border-slate-200">
                <h3 className="text-sm font-medium text-slate-600 mb-1">En Maintenance</h3>
                <p className="text-2xl font-semibold text-slate-900">{stats.maintenance}</p>
              </div>
              
              <div className="bg-white rounded-md shadow-sm p-4 border border-slate-200">
                <h3 className="text-sm font-medium text-slate-600 mb-1">Favoris</h3>
                <p className="text-2xl font-semibold text-slate-900">{favorites.length}</p>
              </div>
            </div>

            {/* Nouveaux tableaux de bord avec diagrammes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Diagramme circulaire des catégories amélioré */}
              <div className="bg-white rounded-md shadow-sm p-4 border border-slate-200">
                <h3 className="text-base font-medium text-slate-900 mb-4">Répartition par Catégorie</h3>
                <div className="h-64">
                  <Pie
                    data={{
                      labels: Object.keys(stats.categories),
                      datasets: [{
                        data: Object.values(stats.categories),
                        backgroundColor: [
                          'rgba(100, 116, 139, 0.8)',
                          'rgba(71, 85, 105, 0.8)',
                          'rgba(51, 65, 85, 0.8)',
                          'rgba(30, 41, 59, 0.8)',
                          'rgba(15, 23, 42, 0.8)',
                        ],
                        borderColor: [
                          'rgba(100, 116, 139, 1)',
                          'rgba(71, 85, 105, 1)',
                          'rgba(51, 65, 85, 1)',
                          'rgba(30, 41, 59, 1)',
                          'rgba(15, 23, 42, 1)',
                        ],
                        borderWidth: 1,
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            font: {
                              size: 12
                            },
                            padding: 20
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const label = context.label || '';
                              const value = Number(context.raw) || 0;
                              const total = context.dataset.data.reduce((a: number, b: number) => a + Number(b), 0);
                              const percentage = Math.round((value / total) * 100);
                              return `${label}: ${value} (${percentage}%)`;
                            }
                          }
                        }
                      },
                      animation: {
                        animateScale: true,
                        animateRotate: true
                      }
                    }}
                  />
                </div>
              </div>

              {/* Nouveau graphique de tendance temporelle */}
              <div className="bg-white rounded-md shadow-sm p-4 border border-slate-200">
                <h3 className="text-base font-medium text-slate-900 mb-4">Tendance du Stock</h3>
                <div className="h-64">
                  <Line
                    data={{
                      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
                      datasets: [{
                        label: 'Stock moyen',
                        data: [65, 59, 80, 81, 56, 55],
                        fill: true,
                        backgroundColor: 'rgba(100, 116, 139, 0.2)',
                        borderColor: 'rgba(100, 116, 139, 1)',
                        tension: 0.4
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        tooltip: {
                          mode: 'index',
                          intersect: false,
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Nouvelle section pour les diagrammes avancés */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Diagramme radar pour les performances */}
              <div className="bg-white rounded-md shadow-sm p-4 border border-slate-200">
                <h3 className="text-base font-medium text-slate-900 mb-4">Performance des Équipements</h3>
                <div className="h-64">
                  <Radar
                    data={{
                      labels: ['Disponibilité', 'Maintenance', 'Utilisation', 'Fiabilité', 'Efficacité'],
                      datasets: [{
                        label: 'Performance moyenne',
                        data: [85, 75, 90, 80, 85],
                        backgroundColor: 'rgba(100, 116, 139, 0.2)',
                        borderColor: 'rgba(100, 116, 139, 1)',
                        pointBackgroundColor: 'rgba(100, 116, 139, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(100, 116, 139, 1)'
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        r: {
                          angleLines: {
                            display: true
                          },
                          suggestedMin: 0,
                          suggestedMax: 100
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Graphique de dispersion pour les corrélations */}
              <div className="bg-white rounded-md shadow-sm p-4 border border-slate-200">
                <h3 className="text-base font-medium text-slate-900 mb-4">Corrélation Utilisation/Maintenance</h3>
                <div className="h-64">
                  <Scatter
                    data={{
                      datasets: [{
                        label: 'Équipements',
                        data: [
                          { x: 20, y: 30 },
                          { x: 40, y: 50 },
                          { x: 60, y: 70 },
                          { x: 80, y: 90 },
                          { x: 100, y: 110 }
                        ],
                        backgroundColor: 'rgba(100, 116, 139, 0.8)'
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: 'Utilisation (%)'
                          }
                        },
                        y: {
                          title: {
                            display: true,
                            text: 'Maintenance (%)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Timeline des maintenances */}
              <div className="bg-white rounded-md shadow-sm p-4 border border-slate-200">
                <h3 className="text-base font-medium text-slate-900 mb-4">Timeline des Maintenances</h3>
                <div className="h-64 overflow-y-auto">
                  {maintenanceHistory
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .map((maintenance, index) => (
                      <div key={maintenance.id} className="flex items-start mb-4">
                        <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-slate-400"></div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-slate-900">
                            {equipements.find(e => e.id === maintenance.equipementId)?.nom_equipement}
                          </p>
                          <p className="text-xs text-slate-500">{maintenance.type}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(maintenance.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Tableaux de bord supplémentaires avec diagrammes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* État du stock avec diagramme */}
              <div className="bg-white rounded-md shadow-sm p-4 border border-slate-200">
                <h3 className="text-base font-medium text-slate-900 mb-4">État du Stock</h3>
                <div className="h-48 mb-4">
                  <Pie
                    data={{
                      labels: ['Stock optimal', 'Stock moyen', 'Stock bas', 'Rupture'],
                      datasets: [{
                        data: [
                          equipements.filter(e => e.nombre > 10).length,
                          equipements.filter(e => e.nombre > 5 && e.nombre <= 10).length,
                          equipements.filter(e => e.nombre <= 5 && e.nombre > 0).length,
                          equipements.filter(e => e.nombre === 0).length
                        ],
                        backgroundColor: [
                          'rgba(34, 197, 94, 0.8)',
                          'rgba(234, 179, 8, 0.8)',
                          'rgba(249, 115, 22, 0.8)',
                          'rgba(239, 68, 68, 0.8)'
                        ],
                        borderColor: [
                          'rgba(34, 197, 94, 1)',
                          'rgba(234, 179, 8, 1)',
                          'rgba(249, 115, 22, 1)',
                          'rgba(239, 68, 68, 1)'
                        ],
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            font: {
                              size: 11
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">En stock optimal</span>
                    <span className="text-sm font-medium text-slate-900">
                      {equipements.filter(e => e.nombre > 10).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Stock moyen</span>
                    <span className="text-sm font-medium text-slate-900">
                      {equipements.filter(e => e.nombre > 5 && e.nombre <= 10).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Stock bas</span>
                    <span className="text-sm font-medium text-slate-900">
                      {equipements.filter(e => e.nombre <= 5 && e.nombre > 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Rupture de stock</span>
                    <span className="text-sm font-medium text-slate-900">
                      {equipements.filter(e => e.nombre === 0).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Maintenance avec diagramme */}
              <div className="bg-white rounded-md shadow-sm p-4 border border-slate-200">
                <h3 className="text-base font-medium text-slate-900 mb-4">Maintenance</h3>
                <div className="h-48 mb-4">
                  <Bar
                    data={{
                      labels: ['Préventive', 'Corrective', 'Planifiée'],
                      datasets: [{
                        label: 'Nombre d\'équipements',
                        data: [
                          maintenanceHistory.filter(m => m.type === 'preventive').length,
                          maintenanceHistory.filter(m => m.type === 'corrective').length,
                          maintenanceHistory.filter(m => new Date(m.date) > new Date()).length
                        ],
                        backgroundColor: 'rgba(100, 116, 139, 0.8)',
                        borderColor: 'rgba(100, 116, 139, 1)',
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1
                          }
                        }
                      }
                    }}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">En maintenance préventive</span>
                    <span className="text-sm font-medium text-slate-900">
                      {maintenanceHistory.filter(m => m.type === 'preventive').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">En maintenance corrective</span>
                    <span className="text-sm font-medium text-slate-900">
                      {maintenanceHistory.filter(m => m.type === 'corrective').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Maintenances planifiées</span>
                    <span className="text-sm font-medium text-slate-900">
                      {maintenanceHistory.filter(m => new Date(m.date) > new Date()).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Garanties avec diagramme */}
              <div className="bg-white rounded-md shadow-sm p-4 border border-slate-200">
                <h3 className="text-base font-medium text-slate-900 mb-4">Garanties</h3>
                <div className="h-48 mb-4">
                  <Pie
                    data={{
                      labels: ['Sous garantie', 'Expiration < 30 jours', 'Expirées'],
                      datasets: [{
                        data: [
                          equipements.filter(e => e.date_garantie && new Date(e.date_garantie) > new Date()).length,
                          equipements.filter(e => {
                            if (!e.date_garantie) return false;
                            const daysUntilExpiry = Math.ceil((new Date(e.date_garantie).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
                          }).length,
                          equipements.filter(e => e.date_garantie && new Date(e.date_garantie) <= new Date()).length
                        ],
                        backgroundColor: [
                          'rgba(34, 197, 94, 0.8)',
                          'rgba(234, 179, 8, 0.8)',
                          'rgba(239, 68, 68, 0.8)'
                        ],
                        borderColor: [
                          'rgba(34, 197, 94, 1)',
                          'rgba(234, 179, 8, 1)',
                          'rgba(239, 68, 68, 1)'
                        ],
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            font: {
                              size: 11
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Sous garantie</span>
                    <span className="text-sm font-medium text-slate-900">
                      {equipements.filter(e => e.date_garantie && new Date(e.date_garantie) > new Date()).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Expiration moins de 30 jours</span>
                    <span className="text-sm font-medium text-slate-900">
                      {equipements.filter(e => {
                        if (!e.date_garantie) return false;
                        const daysUntilExpiry = Math.ceil((new Date(e.date_garantie).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
                      }).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Garanties expirées</span>
                    <span className="text-sm font-medium text-slate-900">
                      {equipements.filter(e => e.date_garantie && new Date(e.date_garantie) <= new Date()).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tableau des alertes */}
            <div className="bg-white rounded-md shadow-sm p-4 border border-slate-200 mb-6">
              <h3 className="text-base font-medium text-slate-900 mb-4">Alertes Actives</h3>
              <div className="space-y-3">
                {smartAlerts
                  .sort((a, b) => {
                    const priorityOrder = { high: 0, medium: 1, low: 2 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                  })
                  .slice(0, 5)
                  .map(alert => (
                    <div 
                      key={alert.id}
                      className={`p-3 rounded-md ${
                        alert.priority === 'high' ? 'bg-slate-50 border border-slate-200' :
                        alert.priority === 'medium' ? 'bg-slate-50 border border-slate-200' :
                        'bg-slate-50 border border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{alert.message}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(alert.date).toLocaleString()}
                          </p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          alert.priority === 'high' ? 'bg-slate-200 text-slate-700' :
                          alert.priority === 'medium' ? 'bg-slate-200 text-slate-700' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {alert.priority}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Favoris button with professional styling */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-700 rounded-md shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                {showFavorites ? "Tous les équipements" : "Favoris"}
              </button>
            </div>

            {/* Equipment grid with professional styling */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(showFavorites ? filteredEquipements.filter(equip => favorites.includes(equip.id)) : filteredEquipements).map((equip) => {
                const prediction = predictions.find(p => p.equipementId === equip.id);
                const ratings = equipmentRatings.filter(r => r.equipementId === equip.id);
                const avgRating = ratings.length > 0
                  ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
                  : 0;

                return (
                  <div
                    key={equip.id}
                    className="bg-white rounded-md shadow-sm p-4 border border-slate-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-base font-medium text-slate-900">{equip.nom_equipement}</h3>
                        <p className="text-sm text-slate-500">{equip.code_imo}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setSelectedEquipment(equip);
                            setShowAR(true);
                          }}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => toggleFavorite(equip.id)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Predictions with professional styling */}
                    {prediction && (
                      <div className="mb-3 p-2 bg-slate-50 rounded-md">
                        <h4 className="text-xs font-medium text-slate-600 mb-1">Prévisions IA</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-500">Stock prévu:</span>
                            <span className="ml-1 font-medium text-slate-700">{prediction.predictedStock}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Prochaine maintenance:</span>
                            <span className="ml-1 font-medium text-slate-700">
                              {prediction.nextMaintenance.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ratings with professional styling */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`h-3.5 w-3.5 ${
                                star <= avgRating ? 'text-slate-700' : 'text-slate-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-slate-500">
                          {ratings.length} évaluation{ratings.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Actions with professional styling */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart(equip)}
                        className="flex-1 px-3 py-1.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
                      >
                        Ajouter au panier
                      </button>
                      <button
                        onClick={() => addMaintenance(equip.id, 'preventive', 'Maintenance préventive programmée')}
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-200 transition-colors"
                      >
                        Maintenance
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Shopping Cart with professional styling */}
      <AnimatePresence>
        {showCart && (
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-end z-50"
            onClick={() => !isProcessing && !orderPlaced && setShowCart(false)}
          >
            <div
              className="bg-white w-full max-w-md overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-slate-900 flex items-center">
                    <ShoppingCart size={18} className="mr-2" />
                    Panier
                  </h2>
                  {!isProcessing && !orderPlaced && (
                    <button 
                      onClick={() => setShowCart(false)} 
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {orderPlaced ? (
                  <div className="text-center py-8">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 mb-3">
                      <CheckCircle size={32} className="text-slate-700" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">Commande envoyée!</h3>
                    <p className="text-slate-500 mt-1">Votre commande a été traitée avec succès.</p>
                  </div>
                ) : cart.length > 0 ? (
                  <>
                    <div className="divide-y divide-slate-200">
                      {cart.map((item) => (
                        <div 
                          key={item.id} 
                          className="py-3"
                        >
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-sm font-medium text-slate-900">{item.nom_equipement}</h3>
                              <p className="text-xs text-slate-500">{item.code_imo}</p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <div className="mt-2 flex justify-between items-center">
                            <div className="flex items-center border rounded-md">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="px-2 py-1 text-slate-600 hover:bg-slate-50"
                              >
                                -
                              </button>
                              <span className="px-2 py-1 text-slate-800">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-2 py-1 text-slate-600 hover:bg-slate-50"
                                disabled={item.quantity >= item.nombre}
                              >
                                +
                              </button>
                            </div>
                            <p className="text-xs text-slate-500">
                              {item.nombre} disponible{item.nombre > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 border-t border-slate-200 pt-4">
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-medium text-slate-900">Total des articles</span>
                        <span className="text-sm font-medium text-slate-900">{totalItems}</span>
                      </div>

                      <button
                        disabled={isProcessing}
                        onClick={placeOrder}
                        className={`w-full py-2 px-3 rounded-md text-white text-sm font-medium flex justify-center items-center ${
                          isProcessing ? 'bg-slate-400' : 'bg-slate-900 hover:bg-slate-800'
                        } transition-colors`}
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw size={14} className="mr-2 animate-spin" />
                            Traitement...
                          </>
                        ) : (
                          <>
                            <Truck size={14} className="mr-2" />
                            Valider la commande
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <PackageCheck size={40} className="mx-auto text-slate-300 mb-3" />
                    <h3 className="text-base font-medium text-slate-900">Votre panier est vide</h3>
                    <p className="text-slate-500 mt-1">Parcourez le catalogue pour ajouter des équipements</p>
                    <button
                      onClick={() => {
                        setShowCart(false)
                        setActiveTab("catalogue")
                      }}
                      className="mt-4 text-slate-600 hover:text-slate-900 text-sm font-medium"
                    >
                      Retour au catalogue
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Notifications with professional styling */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-3 rounded-md shadow-sm ${
              notification.type === 'warning' ? 'bg-slate-100 border border-slate-300' :
              notification.type === 'error' ? 'bg-slate-100 border border-slate-300' :
              notification.type === 'success' ? 'bg-slate-100 border border-slate-300' :
              'bg-slate-100 border border-slate-300'
            }`}
          >
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{notification.message}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => setNotifications(prev => 
                  prev.filter(n => n.id !== notification.id)
                )}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Connection indicator with professional styling */}
      <div className="fixed top-4 right-4 z-50">
        <div
          className={`px-3 py-1.5 rounded-md shadow-sm ${
            isOnline ? 'bg-slate-100 text-slate-700' : 'bg-slate-100 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${
              isOnline ? 'bg-slate-700' : 'bg-slate-500'
            }`} />
            <span className="text-xs font-medium">
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
        </div>
      </div>

      {/* Maintenance mode with professional styling */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setMaintenanceMode(!maintenanceMode)}
          className={`px-3 py-1.5 rounded-md shadow-sm ${
            maintenanceMode 
              ? 'bg-slate-100 text-slate-700' 
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-medium">
              {maintenanceMode ? 'Mode Maintenance' : 'Mode Normal'}
            </span>
          </div>
        </button>
      </div>

      {/* Mode AR */}
      {showAR && selectedEquipment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
        >
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">AR View - {selectedEquipment.nom_equipement}</h3>
            <div className="aspect-video bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
              <p className="text-slate-500">AR View to be implemented</p>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowAR(false)}
                className="px-4 py-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Interactive Tutorial */}
      {showTutorial && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        >
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">Interactive Tutorial</h3>
            <div className="space-y-4">
              <p>Welcome to the intelligent Sagemcom store!</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Use the advanced search to quickly find your equipment</li>
                <li>Consult stock predictions to anticipate your needs</li>
                <li>Follow maintenance history for each equipment</li>
                <li>Share your equipment lists with your colleagues</li>
              </ul>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowTutorial(false)}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
              >
                Start
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Panneau intelligent */}
      <motion.div
        initial={{ x: -400 }}
        animate={{ x: showSmartPanel ? 0 : -400 }}
        className="fixed left-0 top-0 h-full w-96 bg-white shadow-lg z-40 overflow-y-auto"
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Intelligence Artificielle</h2>
            <button
              onClick={() => setShowSmartPanel(false)}
              className="text-slate-500 hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Alertes intelligentes */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Alertes</h3>
            <div className="space-y-3">
              {smartAlerts.map(alert => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg ${
                    alert.priority === 'high' ? 'bg-rose-50 border border-rose-200' :
                    alert.priority === 'medium' ? 'bg-amber-50 border border-amber-200' :
                    'bg-sky-50 border border-sky-200'
                  } border`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{alert.message}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(alert.date).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setSmartAlerts(prev => prev.filter(a => a.id !== alert.id))}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Suggestions intelligentes */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Suggestions</h3>
            <div className="space-y-3">
              {smartSuggestions.map(suggestion => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          suggestion.type === 'replacement' ? 'bg-rose-100 text-rose-800' :
                          suggestion.type === 'maintenance' ? 'bg-amber-100 text-amber-800' :
                          'bg-sky-100 text-sky-800'
                        }`}>
                          {suggestion.type}
                        </span>
                        <span className="text-xs text-slate-500">
                          Priorité: {suggestion.priority}
                        </span>
                      </div>
                      <p className="text-sm text-slate-800">{suggestion.reason}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(suggestion.date).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setSmartSuggestions(prev => prev.filter(s => s.id !== suggestion.id))}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bouton pour ouvrir le panneau intelligent */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowSmartPanel(true)}
        className="fixed left-4 top-20 z-30 bg-white p-3 rounded-lg shadow-lg border border-slate-200"
      >
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-slate-800">IA</span>
        </div>
      </motion.button>
    </div>
  )
}