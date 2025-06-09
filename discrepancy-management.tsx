"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Flag,
  Download,
  ChevronDown,
  ChevronUp,
  Calendar,
  Search,
  DollarSign,
  FileText,
  ClipboardList,
  Clock,
  Tag,
  Building,
  BarChart2,
  Trash2,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

// Types
interface Discrepancy {
  id: string
  invoiceNumber: string
  supplier: string
  date: string
  issueType: "price_increase" | "unusual_quantity" | "duplicate_invoice" | "new_supplier" | "missing_item"
  description: string
  amountImpact: number
  status: "pending" | "approved" | "flagged" | "resolved"
  severity: "high" | "medium" | "low"
  details?: {
    previousPrice?: number
    currentPrice?: number
    expectedQuantity?: number
    actualQuantity?: number
    duplicateInvoiceId?: string
    affectedItems?: string[]
    notes?: string
  }
}

// Mock data
const mockDiscrepancies: Discrepancy[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-0156",
    supplier: "Flour & Co. Suppliers",
    date: "2024-01-15",
    issueType: "price_increase",
    description: "Organic Whole Wheat Flour price increased by 15% compared to previous orders",
    amountImpact: 72.0,
    status: "pending",
    severity: "high",
    details: {
      previousPrice: 28.0,
      currentPrice: 32.0,
      affectedItems: ["Organic Whole Wheat Flour (25lb bags)"],
      notes: "Supplier did not notify about price increase beforehand",
    },
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-0156",
    supplier: "Flour & Co. Suppliers",
    date: "2024-01-15",
    issueType: "unusual_quantity",
    description: "Cake Flour quantity is 75% lower than typical orders",
    amountImpact: -136.5,
    status: "approved",
    severity: "medium",
    details: {
      expectedQuantity: 8,
      actualQuantity: 2,
      affectedItems: ["Cake Flour Pastry Grade (25lb bags)"],
      notes: "Seasonal adjustment due to lower cake production in January",
    },
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-0156",
    supplier: "Flour & Co. Suppliers",
    date: "2024-01-15",
    issueType: "duplicate_invoice",
    description: "Similar invoice pattern detected from this supplier 3 days ago",
    amountImpact: 1245.5,
    status: "flagged",
    severity: "high",
    details: {
      duplicateInvoiceId: "INV-2024-0143",
      notes: "Possible duplicate billing, needs verification with supplier",
    },
  },
  {
    id: "4",
    invoiceNumber: "INV-2024-0155",
    supplier: "Sweet Ingredients Ltd",
    date: "2024-01-14",
    issueType: "price_increase",
    description: "Sugar price increased by 8% compared to previous orders",
    amountImpact: 45.6,
    status: "pending",
    severity: "medium",
    details: {
      previousPrice: 19.0,
      currentPrice: 20.52,
      affectedItems: ["Granulated Sugar (50lb bags)"],
      notes: "Market price fluctuation",
    },
  },
  {
    id: "5",
    invoiceNumber: "INV-2024-0154",
    supplier: "Bakery Equipment Pro",
    date: "2024-01-13",
    issueType: "missing_item",
    description: "Mixer attachment missing from order but included in invoice",
    amountImpact: 129.99,
    status: "resolved",
    severity: "medium",
    details: {
      affectedItems: ["Stand Mixer Attachment - Dough Hook"],
      notes: "Supplier confirmed error and will send credit note",
    },
  },
  {
    id: "6",
    invoiceNumber: "INV-2024-0153",
    supplier: "Organic Dairy Farms",
    date: "2024-01-12",
    issueType: "price_increase",
    description: "Organic Butter price increased by 12% compared to previous orders",
    amountImpact: 67.8,
    status: "pending",
    severity: "high",
    details: {
      previousPrice: 5.65,
      currentPrice: 6.33,
      affectedItems: ["Organic Unsalted Butter (1lb blocks)"],
      notes: "Seasonal price adjustment due to lower milk production",
    },
  },
  {
    id: "7",
    invoiceNumber: "INV-2024-0152",
    supplier: "Premium Vanilla Co.",
    date: "2024-01-11",
    issueType: "unusual_quantity",
    description: "Vanilla extract quantity is 200% higher than typical orders",
    amountImpact: 234.15,
    status: "approved",
    severity: "low",
    details: {
      expectedQuantity: 5,
      actualQuantity: 15,
      affectedItems: ["Premium Vanilla Extract (16oz bottles)"],
      notes: "Approved due to upcoming holiday special production",
    },
  },
  {
    id: "8",
    invoiceNumber: "INV-2024-0151",
    supplier: "Local Egg Suppliers",
    date: "2024-01-10",
    issueType: "new_supplier",
    description: "First order from this supplier - prices 5% higher than previous supplier",
    amountImpact: 22.28,
    status: "pending",
    severity: "low",
    details: {
      notes: "New supplier selected for better quality and reliability despite slightly higher prices",
    },
  },
  {
    id: "9",
    invoiceNumber: "INV-2024-0150",
    supplier: "Chocolate Importers Inc.",
    date: "2024-01-09",
    issueType: "price_increase",
    description: "Dark chocolate price increased by 18% compared to previous orders",
    amountImpact: 108.0,
    status: "flagged",
    severity: "high",
    details: {
      previousPrice: 12.0,
      currentPrice: 14.16,
      affectedItems: ["Premium Dark Chocolate (10kg blocks)"],
      notes: "Significant increase without prior notification",
    },
  },
  {
    id: "10",
    invoiceNumber: "INV-2024-0149",
    supplier: "Packaging Solutions",
    date: "2024-01-08",
    issueType: "duplicate_invoice",
    description: "Identical invoice to one processed last week",
    amountImpact: 567.82,
    status: "resolved",
    severity: "high",
    details: {
      duplicateInvoiceId: "INV-2024-0142",
      notes: "Supplier confirmed error and has withdrawn duplicate invoice",
    },
  },
]

export default function DiscrepancyManagement() {
  // State
  const [selectedTab, setSelectedTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({})
  const [selectAll, setSelectAll] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Toggle row expansion
  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Toggle row selection
  const toggleRowSelection = (id: string) => {
    const newSelectedRows = { ...selectedRows, [id]: !selectedRows[id] }
    setSelectedRows(newSelectedRows)

    // Check if all visible rows are selected
    const allSelected = filteredDiscrepancies.every((d) => newSelectedRows[d.id])
    setSelectAll(allSelected && filteredDiscrepancies.length > 0)
  }

  // Toggle select all
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll
    setSelectAll(newSelectAll)

    const newSelectedRows = { ...selectedRows }
    filteredDiscrepancies.forEach((d) => {
      newSelectedRows[d.id] = newSelectAll
    })

    setSelectedRows(newSelectedRows)
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setDateRange({ from: undefined, to: undefined })
    setStatusFilter("all")
    setSelectedTab("all")
  }

  // Filter discrepancies based on tab, search, date range, and status
  const filteredDiscrepancies = useMemo(() => {
    return mockDiscrepancies.filter((discrepancy) => {
      // Filter by tab
      if (selectedTab !== "all") {
        switch (selectedTab) {
          case "price":
            if (discrepancy.issueType !== "price_increase") return false
            break
          case "quantity":
            if (discrepancy.issueType !== "unusual_quantity") return false
            break
          case "duplicates":
            if (discrepancy.issueType !== "duplicate_invoice") return false
            break
          case "new_suppliers":
            if (discrepancy.issueType !== "new_supplier") return false
            break
          case "missing":
            if (discrepancy.issueType !== "missing_item") return false
            break
        }
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (
          !discrepancy.invoiceNumber.toLowerCase().includes(query) &&
          !discrepancy.supplier.toLowerCase().includes(query) &&
          !discrepancy.description.toLowerCase().includes(query)
        ) {
          return false
        }
      }

      // Filter by date range
      if (dateRange.from && dateRange.to) {
        const discrepancyDate = new Date(discrepancy.date)
        if (discrepancyDate < dateRange.from || discrepancyDate > dateRange.to) {
          return false
        }
      }

      // Filter by status
      if (statusFilter !== "all" && discrepancy.status !== statusFilter) {
        return false
      }

      return true
    })
  }, [selectedTab, searchQuery, dateRange, statusFilter])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const total = filteredDiscrepancies.length
    const potentialSavings = filteredDiscrepancies
      .filter((d) => d.amountImpact > 0)
      .reduce((sum, d) => sum + d.amountImpact, 0)
    const pendingReviews = filteredDiscrepancies.filter((d) => d.status === "pending").length

    return { total, potentialSavings, pendingReviews }
  }, [filteredDiscrepancies])

  // Get issue type display text and icon
  const getIssueTypeInfo = (type: string) => {
    switch (type) {
      case "price_increase":
        return { text: "Price Increase", icon: <DollarSign className="h-4 w-4" /> }
      case "unusual_quantity":
        return { text: "Quantity Issue", icon: <Tag className="h-4 w-4" /> }
      case "duplicate_invoice":
        return { text: "Duplicate Invoice", icon: <FileText className="h-4 w-4" /> }
      case "new_supplier":
        return { text: "New Supplier", icon: <Building className="h-4 w-4" /> }
      case "missing_item":
        return { text: "Missing Item", icon: <AlertTriangle className="h-4 w-4" /> }
      default:
        return { text: type, icon: <AlertTriangle className="h-4 w-4" /> }
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" /> Approved
          </Badge>
        )
      case "flagged":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            <Flag className="h-3 w-3 mr-1" /> Flagged
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            <CheckCircle className="h-3 w-3 mr-1" /> Resolved
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            High
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
            Medium
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            Low
          </Badge>
        )
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    const selectedIds = Object.entries(selectedRows)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id)

    console.log(`Performing ${action} on:`, selectedIds)

    // In a real app, you would make API calls here
    // For now, just show an alert
    alert(`${action} action performed on ${selectedIds.length} items`)
  }

  // Handle export
  const handleExport = (format: string) => {
    console.log(`Exporting in ${format} format`)
    alert(`Exporting discrepancies in ${format} format`)
  }

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
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-amber-900">Discrepancy Management</h1>
                  <p className="text-sm text-amber-600">Review and resolve invoice discrepancies</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="border-amber-300 text-amber-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56" align="end">
                  <div className="space-y-1">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => handleExport("csv")}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export as CSV
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => handleExport("excel")}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export as Excel
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => handleExport("pdf")}>
                      <FileText className="h-4 w-4 mr-2" />
                      Export as PDF
                    </Button>
                    <Separator />
                    <Button variant="ghost" className="w-full justify-start" onClick={() => handleExport("quickbooks")}>
                      <FileText className="h-4 w-4 mr-2" />
                      Export to QuickBooks
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => handleExport("xero")}>
                      <FileText className="h-4 w-4 mr-2" />
                      Export to Xero
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-amber-600 uppercase tracking-wide">Total Discrepancies</p>
                    <p className="text-3xl font-bold text-amber-900">{summaryStats.total}</p>
                  </div>
                </div>
                <BarChart2 className="h-8 w-8 text-amber-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-amber-600 uppercase tracking-wide">Potential Savings</p>
                    <p className="text-3xl font-bold text-amber-900">${summaryStats.potentialSavings.toFixed(2)}</p>
                  </div>
                </div>
                <BarChart2 className="h-8 w-8 text-green-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ClipboardList className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-amber-600 uppercase tracking-wide">Pending Reviews</p>
                    <p className="text-3xl font-bold text-amber-900">{summaryStats.pendingReviews}</p>
                  </div>
                </div>
                <Progress value={(summaryStats.pendingReviews / summaryStats.total) * 100} className="w-16 h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white/70 backdrop-blur-sm border-amber-200 mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-500" />
                <Input
                  placeholder="Search by invoice #, supplier, or description..."
                  className="pl-10 border-amber-200 focus:border-amber-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="border-amber-200 text-amber-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    {dateRange.from && dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                      </>
                    ) : (
                      "Date Range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="range"
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to,
                    }}
                    onSelect={(range) => {
                      setDateRange({
                        from: range?.from,
                        to: range?.to,
                      })
                      if (range?.to) {
                        setIsCalendarOpen(false)
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] border-amber-200">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="border-amber-200 text-amber-700" onClick={clearFilters}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs and Table */}
        <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
          <CardHeader className="pb-0">
            <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="bg-amber-100">
                <TabsTrigger value="all" className="data-[state=active]:bg-white">
                  All Discrepancies
                </TabsTrigger>
                <TabsTrigger value="price" className="data-[state=active]:bg-white">
                  Price Alerts
                </TabsTrigger>
                <TabsTrigger value="quantity" className="data-[state=active]:bg-white">
                  Quantity Issues
                </TabsTrigger>
                <TabsTrigger value="duplicates" className="data-[state=active]:bg-white">
                  Duplicates
                </TabsTrigger>
                <TabsTrigger value="new_suppliers" className="data-[state=active]:bg-white">
                  New Suppliers
                </TabsTrigger>
                <TabsTrigger value="missing" className="data-[state=active]:bg-white">
                  Missing Items
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Bulk Actions */}
            {Object.values(selectedRows).some(Boolean) && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-amber-600" />
                  <span className="text-amber-800">
                    {Object.values(selectedRows).filter(Boolean).length} items selected
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleBulkAction("approve")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Selected
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-300 text-amber-700"
                    onClick={() => handleBulkAction("flag")}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Flag All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-300 text-amber-700"
                    onClick={() => handleBulkAction("export")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="rounded-md border border-amber-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-amber-50">
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox checked={selectAll} onCheckedChange={toggleSelectAll} aria-label="Select all" />
                    </TableHead>
                    <TableHead className="w-[120px]">Invoice #</TableHead>
                    <TableHead className="w-[200px]">Supplier</TableHead>
                    <TableHead className="w-[120px]">Date</TableHead>
                    <TableHead>Issue Type</TableHead>
                    <TableHead className="text-right">Amount Impact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Severity</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDiscrepancies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center text-amber-600">
                          <Search className="h-8 w-8 mb-2" />
                          <p>No discrepancies found</p>
                          <p className="text-sm text-amber-500">Try adjusting your filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDiscrepancies.map((discrepancy) => (
                      <>
                        <TableRow key={discrepancy.id} className="hover:bg-amber-50">
                          <TableCell>
                            <Checkbox
                              checked={selectedRows[discrepancy.id] || false}
                              onCheckedChange={() => toggleRowSelection(discrepancy.id)}
                              aria-label={`Select row ${discrepancy.id}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{discrepancy.invoiceNumber}</TableCell>
                          <TableCell>{discrepancy.supplier}</TableCell>
                          <TableCell>{discrepancy.date}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              {getIssueTypeInfo(discrepancy.issueType).icon}
                              <span>{getIssueTypeInfo(discrepancy.issueType).text}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={discrepancy.amountImpact > 0 ? "text-red-600" : "text-green-600"}>
                              {discrepancy.amountImpact > 0 ? "+" : ""}${Math.abs(discrepancy.amountImpact).toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>{getStatusBadge(discrepancy.status)}</TableCell>
                          <TableCell>{getSeverityBadge(discrepancy.severity)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRowExpansion(discrepancy.id)}
                              className="p-0 h-8 w-8"
                            >
                              {expandedRows[discrepancy.id] ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                        {expandedRows[discrepancy.id] && (
                          <TableRow className="bg-amber-50/50">
                            <TableCell colSpan={9} className="p-4">
                              <div className="rounded-md border border-amber-200 bg-white p-4">
                                <h4 className="font-medium text-amber-900 mb-2">Discrepancy Details</h4>
                                <p className="text-amber-800 mb-4">{discrepancy.description}</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  {discrepancy.details?.previousPrice !== undefined && (
                                    <div>
                                      <p className="text-xs text-amber-600 uppercase tracking-wide">Previous Price</p>
                                      <p className="font-medium">${discrepancy.details.previousPrice.toFixed(2)}</p>
                                    </div>
                                  )}

                                  {discrepancy.details?.currentPrice !== undefined && (
                                    <div>
                                      <p className="text-xs text-amber-600 uppercase tracking-wide">Current Price</p>
                                      <p className="font-medium">${discrepancy.details.currentPrice.toFixed(2)}</p>
                                    </div>
                                  )}

                                  {discrepancy.details?.expectedQuantity !== undefined && (
                                    <div>
                                      <p className="text-xs text-amber-600 uppercase tracking-wide">
                                        Expected Quantity
                                      </p>
                                      <p className="font-medium">{discrepancy.details.expectedQuantity}</p>
                                    </div>
                                  )}

                                  {discrepancy.details?.actualQuantity !== undefined && (
                                    <div>
                                      <p className="text-xs text-amber-600 uppercase tracking-wide">Actual Quantity</p>
                                      <p className="font-medium">{discrepancy.details.actualQuantity}</p>
                                    </div>
                                  )}

                                  {discrepancy.details?.duplicateInvoiceId && (
                                    <div>
                                      <p className="text-xs text-amber-600 uppercase tracking-wide">
                                        Duplicate Invoice ID
                                      </p>
                                      <p className="font-medium">{discrepancy.details.duplicateInvoiceId}</p>
                                    </div>
                                  )}
                                </div>

                                {discrepancy.details?.affectedItems && discrepancy.details.affectedItems.length > 0 && (
                                  <div className="mb-4">
                                    <p className="text-xs text-amber-600 uppercase tracking-wide mb-1">
                                      Affected Items
                                    </p>
                                    <ul className="list-disc pl-5 space-y-1">
                                      {discrepancy.details.affectedItems.map((item, index) => (
                                        <li key={index} className="text-amber-800">
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {discrepancy.details?.notes && (
                                  <div className="mb-4">
                                    <p className="text-xs text-amber-600 uppercase tracking-wide mb-1">Notes</p>
                                    <p className="text-amber-800 bg-amber-50 p-2 rounded-md border border-amber-100">
                                      {discrepancy.details.notes}
                                    </p>
                                  </div>
                                )}

                                <div className="flex space-x-2 mt-4">
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button size="sm" variant="outline" className="border-amber-300 text-amber-700">
                                    <Flag className="h-4 w-4 mr-2" />
                                    Flag for Review
                                  </Button>
                                  <Button size="sm" variant="outline" className="border-amber-300 text-amber-700">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Dismiss
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
