"use client"

import { useState, useMemo } from "react"
import {
  Building,
  Search,
  Plus,
  Star,
  TrendingUp,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Edit,
  Bell,
  FileText,
  BarChart3,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Supplier {
  id: string
  name: string
  logo?: string
  contactPerson: string
  email: string
  phone: string
  address: string
  paymentTerms: string
  rating: number
  reliabilityScore: number
  totalInvoices: number
  totalSpent: number
  lastOrderDate: string
  status: "active" | "inactive" | "pending"
  categories: string[]
  priceAlerts: number
  notes?: string
  keyMetrics: {
    avgOrderValue: number
    onTimeDelivery: number
    priceStability: number
    invoiceAccuracy: number
  }
}

const mockSuppliers: Supplier[] = [
  {
    id: "1",
    name: "Flour & Co. Suppliers",
    logo: "/placeholder.svg?height=60&width=60&text=F&C",
    contactPerson: "Sarah Johnson",
    email: "orders@flourandco.com",
    phone: "+1 (555) 123-4567",
    address: "1234 Baker Street, Wheat Valley, CA 90210",
    paymentTerms: "Net 30",
    rating: 4.5,
    reliabilityScore: 92,
    totalInvoices: 48,
    totalSpent: 24580.5,
    lastOrderDate: "2024-01-15",
    status: "active",
    categories: ["Flour", "Grains"],
    priceAlerts: 2,
    keyMetrics: {
      avgOrderValue: 512.09,
      onTimeDelivery: 94,
      priceStability: 88,
      invoiceAccuracy: 96,
    },
    notes: "Reliable supplier with consistent quality. Occasional price fluctuations on organic products.",
  },
  {
    id: "2",
    name: "Sweet Ingredients Ltd",
    logo: "/placeholder.svg?height=60&width=60&text=SI",
    contactPerson: "Michael Chen",
    email: "sales@sweetingredients.com",
    phone: "+1 (555) 234-5678",
    address: "567 Sugar Lane, Sweet City, NY 10001",
    paymentTerms: "Net 15",
    rating: 4.8,
    reliabilityScore: 96,
    totalInvoices: 36,
    totalSpent: 18920.75,
    lastOrderDate: "2024-01-14",
    status: "active",
    categories: ["Sugar", "Sweeteners", "Chocolate"],
    priceAlerts: 1,
    keyMetrics: {
      avgOrderValue: 525.58,
      onTimeDelivery: 98,
      priceStability: 92,
      invoiceAccuracy: 99,
    },
    notes: "Excellent service and quality. Premium pricing but worth it for specialty items.",
  },
  {
    id: "3",
    name: "Bakery Equipment Pro",
    logo: "/placeholder.svg?height=60&width=60&text=BEP",
    contactPerson: "David Rodriguez",
    email: "support@bakeryequipmentpro.com",
    phone: "+1 (555) 345-6789",
    address: "890 Industrial Blvd, Equipment City, TX 75001",
    paymentTerms: "Net 45",
    rating: 4.2,
    reliabilityScore: 85,
    totalInvoices: 12,
    totalSpent: 15680.9,
    lastOrderDate: "2024-01-13",
    status: "active",
    categories: ["Equipment", "Tools"],
    priceAlerts: 0,
    keyMetrics: {
      avgOrderValue: 1306.74,
      onTimeDelivery: 83,
      priceStability: 95,
      invoiceAccuracy: 92,
    },
    notes: "Good for equipment purchases. Delivery can be slow during peak seasons.",
  },
  {
    id: "4",
    name: "Organic Dairy Farms",
    logo: "/placeholder.svg?height=60&width=60&text=ODF",
    contactPerson: "Emma Wilson",
    email: "orders@organicdairyfarms.com",
    phone: "+1 (555) 456-7890",
    address: "123 Farm Road, Dairy Valley, WI 53001",
    paymentTerms: "Net 30",
    rating: 4.6,
    reliabilityScore: 89,
    totalInvoices: 28,
    totalSpent: 12450.3,
    lastOrderDate: "2024-01-12",
    status: "active",
    categories: ["Dairy", "Organic"],
    priceAlerts: 3,
    keyMetrics: {
      avgOrderValue: 444.65,
      onTimeDelivery: 91,
      priceStability: 78,
      invoiceAccuracy: 94,
    },
    notes: "High-quality organic products. Prices fluctuate with seasonal availability.",
  },
  {
    id: "5",
    name: "Premium Vanilla Co.",
    logo: "/placeholder.svg?height=60&width=60&text=PV",
    contactPerson: "James Thompson",
    email: "sales@premiumvanilla.com",
    phone: "+1 (555) 567-8901",
    address: "456 Spice Street, Flavor Town, FL 33101",
    paymentTerms: "Net 15",
    rating: 4.9,
    reliabilityScore: 98,
    totalInvoices: 24,
    totalSpent: 8920.45,
    lastOrderDate: "2024-01-11",
    status: "active",
    categories: ["Spices", "Extracts"],
    priceAlerts: 0,
    keyMetrics: {
      avgOrderValue: 371.69,
      onTimeDelivery: 99,
      priceStability: 96,
      invoiceAccuracy: 100,
    },
    notes: "Exceptional quality and service. Premium supplier for specialty extracts.",
  },
  {
    id: "6",
    name: "Local Egg Suppliers",
    logo: "/placeholder.svg?height=60&width=60&text=LES",
    contactPerson: "Lisa Martinez",
    email: "info@localeggs.com",
    phone: "+1 (555) 678-9012",
    address: "789 Poultry Lane, Egg City, IA 50001",
    paymentTerms: "Net 30",
    rating: 4.3,
    reliabilityScore: 87,
    totalInvoices: 32,
    totalSpent: 7650.8,
    lastOrderDate: "2024-01-10",
    status: "active",
    categories: ["Eggs", "Poultry"],
    priceAlerts: 1,
    keyMetrics: {
      avgOrderValue: 239.09,
      onTimeDelivery: 88,
      priceStability: 85,
      invoiceAccuracy: 91,
    },
    notes: "Local supplier with fresh products. Occasional delivery delays during bad weather.",
  },
  {
    id: "7",
    name: "Global Spice Traders",
    logo: "/placeholder.svg?height=60&width=60&text=GST",
    contactPerson: "Ahmed Hassan",
    email: "orders@globalspicetraders.com",
    phone: "+1 (555) 789-0123",
    address: "321 Spice Market, International District, CA 90028",
    paymentTerms: "Net 60",
    rating: 3.8,
    reliabilityScore: 76,
    totalInvoices: 18,
    totalSpent: 5420.25,
    lastOrderDate: "2024-01-05",
    status: "pending",
    categories: ["Spices", "International"],
    priceAlerts: 4,
    keyMetrics: {
      avgOrderValue: 301.12,
      onTimeDelivery: 75,
      priceStability: 68,
      invoiceAccuracy: 85,
    },
    notes: "Good variety of international spices. Quality can be inconsistent.",
  },
]

export default function SupplierManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null)

  // Filter and sort suppliers
  const filteredSuppliers = useMemo(() => {
    const filtered = mockSuppliers.filter((supplier) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (
          !supplier.name.toLowerCase().includes(query) &&
          !supplier.contactPerson.toLowerCase().includes(query) &&
          !supplier.categories.some((cat) => cat.toLowerCase().includes(query))
        ) {
          return false
        }
      }

      // Status filter
      if (statusFilter !== "all" && supplier.status !== statusFilter) {
        return false
      }

      // Category filter
      if (categoryFilter !== "all" && !supplier.categories.includes(categoryFilter)) {
        return false
      }

      return true
    })

    // Sort suppliers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "rating":
          return b.rating - a.rating
        case "totalSpent":
          return b.totalSpent - a.totalSpent
        case "lastOrder":
          return new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
        case "reliability":
          return b.reliabilityScore - a.reliabilityScore
        default:
          return 0
      }
    })

    return filtered
  }, [searchQuery, statusFilter, categoryFilter, sortBy])

  // Get unique categories
  const categories = useMemo(() => {
    const allCategories = mockSuppliers.flatMap((supplier) => supplier.categories)
    return Array.from(new Set(allCategories)).sort()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
            <Clock className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? "text-amber-400 fill-current" : "text-gray-300"
        }`}
      />
    ))
  }

  const getReliabilityColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-amber-600"
    return "text-red-600"
  }

  if (selectedSupplier) {
    const supplier = mockSuppliers.find((s) => s.id === selectedSupplier)
    if (supplier) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
          {/* Header */}
          <header className="bg-white border-b border-amber-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-amber-700 hover:text-amber-900"
                    onClick={() => setSelectedSupplier(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={supplier.logo || "/placeholder.svg"} alt={supplier.name} />
                      <AvatarFallback className="bg-amber-100 text-amber-700">
                        {supplier.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-xl font-bold text-amber-900">{supplier.name}</h1>
                      <p className="text-sm text-amber-600">{supplier.contactPerson}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="border-amber-300 text-amber-700">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="border-amber-300 text-amber-700">
                    <Bell className="h-4 w-4 mr-2" />
                    Alerts
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Supplier Detail Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-600 uppercase tracking-wide">Total Spent</p>
                      <p className="text-2xl font-bold text-amber-900">${supplier.totalSpent.toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-amber-300" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-600 uppercase tracking-wide">Reliability Score</p>
                      <p className={`text-2xl font-bold ${getReliabilityColor(supplier.reliabilityScore)}`}>
                        {supplier.reliabilityScore}%
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-amber-300" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-600 uppercase tracking-wide">Total Orders</p>
                      <p className="text-2xl font-bold text-amber-900">{supplier.totalInvoices}</p>
                    </div>
                    <FileText className="h-8 w-8 text-amber-300" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-600 uppercase tracking-wide">Price Alerts</p>
                      <p className={`text-2xl font-bold ${supplier.priceAlerts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {supplier.priceAlerts}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-amber-300" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Information Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-amber-100">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white">Overview</TabsTrigger>
                <TabsTrigger value="pricing" className="data-[state=active]:bg-white">Price History</TabsTrigger>
                <TabsTrigger value="performance" className="data-[state=active]:bg-white">Performance</TabsTrigger>
                <TabsTrigger value="transactions" className="data-[state=active]:bg-white">Transactions</TabsTrigger>
                <TabsTrigger value="notes" className="data-[state=active]:bg-white">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Building className="h-5 w-5 mr-2" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-amber-600" />
                        <div>
                          <p className="text-sm text-amber-600">Email</p>
                          <p className="font-medium">{supplier.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-amber-600" />
                        <div>
                          <p className="text-sm text-amber-600">Phone</p>
                          <p className="font-medium">{supplier.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-4 w-4 text-amber-600 mt-1" />
                        <div>
                          <p className="text-sm text-amber-600">Address</p>
                          <p className="font-medium">{supplier.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-amber-600" />
                        <div>
                          <p className="text-sm text-amber-600">Payment Terms</p>
                          <p className="font-medium">{supplier.paymentTerms}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Key Metrics */}
                  <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2" />
                        Key Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-amber-600">On-Time Delivery</span>
                          <span className="font-medium">{supplier.keyMetrics.onTimeDelivery}%</span>
                        </div>
                        <div className="w-full bg-amber-100 rounded-full h-2">
                          <div 
                            className="bg-amber-600 h-2 rounded-full" 
                            style={{ width: `${supplier.keyMetrics.onTimeDelivery}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-amber-600">Price Stability</span>
                          <span className="font-medium">{supplier.keyMetrics.priceStability}%</span>
                        </div>
                        <div className="w-full bg-amber-100 rounded-full h-2">
                          <div 
                            className="bg-amber-600 h-2 rounded-full" 
                            style={{ width: `${supplier.keyMetrics.priceStability}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-amber-600">Invoice Accuracy</span>
                          <span className="font-medium">{supplier.keyMetrics.invoiceAccuracy}%</span>
                        </div>
                        <div className="w-full bg-amber-100 rounded-full h-2">
                          <div 
                            className="bg-amber-600 h-2 rounded-full" 
                            style={{ width: `${supplier.keyMetrics.invoiceAccuracy}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-amber-200">
                        <div className="flex justify-between">
                          <span className="text-sm text-amber-600">Average Order Value</span>
                          <span className="font-medium">${supplier.keyMetrics.avgOrderValue.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Categories and Status */}
                <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
                  <CardHeader>
                    <CardTitle>Supplier Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-amber-600 mb-2">Status</p>
                        {getStatusBadge(supplier.status)}
                      </div>
                      <div>
                        <p className="text-sm text-amber-600 mb-2">Rating</p>
                        <div className="flex items-center space-x-1">
                          {getRatingStars(supplier.rating)}
                          <span className="ml-2 text-sm font-medium">{supplier.rating}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-amber-600 mb-2">Last Order</p>
                        <p className="font-medium">{supplier.lastOrderDate}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-amber-600 mb-2">Categories</p>
                      <div className="flex flex-wrap gap-2">
                        {supplier.categories.map((category) => (
                          <Badge key={category} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pricing">
                <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
                  <CardHeader>
                    <CardTitle>Price History Charts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-amber-600">
                      <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Price History Charts</p>
                      <p className="text-sm">Interactive charts showing price trends for common items would be displayed here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance">
                <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
                  <CardHeader>
                    <CardTitle>Performance Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-amber-600">
                      <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Performance Analytics</p>
                      <p className="text-sm">Detailed performance metrics and trends would be displayed here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transactions">
                <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-amber-600">
                      <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Transaction History</p>
                      <p className="text-sm">Recent invoices and transaction details would be displayed here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes">
                <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
                  <CardHeader>
                    <CardTitle>Notes & Comments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-amber-800">{supplier.notes}</p>
                        <p className="text-xs text-amber-600 mt-2">Last updated: January 15, 2024</p>
                      </div>
                      <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                        <Edit className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-amber-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-amber-900">Supplier Management</h1>
                  <p className="text-sm text-amber-600">Manage your bakery suppliers</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 uppercase tracking-wide">Total Suppliers</p>
                  <p className="text-3xl font-bold text-amber-900">{mockSuppliers.length}</p>
                </div>
                <Building className="h-8 w-8 text-amber-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 uppercase tracking-wide">Active Suppliers</p>
                  <p className="text-3xl font-bold text-green-600">
                    {mockSuppliers.filter(s => s.status === 'active').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 uppercase tracking-wide">Price Alerts</p>
                  <p className="text-3xl font-bold text-red-600">
                    {mockSuppliers.reduce((sum, s) => sum + s.priceAlerts, 0)}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 uppercase tracking-wide">Total Spent</p>
                  <p className="text-3xl font-bold text-amber-900">
                    ${mockSuppliers.reduce((sum, s) => sum + s.totalSpent, 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-amber-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/70 backdrop-blur-sm border-amber-200 mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-500\" />
