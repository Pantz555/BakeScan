"use client"
import { useState } from "react"
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Flag,
  Database,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  Building,
  Calendar,
  DollarSign,
  Hash,
  Phone,
  Mail,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  hasDiscrepancy?: boolean
  discrepancyType?: string
}

interface InvoiceData {
  supplier: {
    name: string
    address: string
    phone: string
    email: string
  }
  invoice: {
    number: string
    date: string
    dueDate: string
    totalAmount: number
  }
  lineItems: LineItem[]
  discrepancies: {
    id: string
    type: "price_increase" | "unusual_quantity" | "duplicate_invoice" | "missing_item"
    severity: "high" | "medium" | "low"
    description: string
    affectedItems?: string[]
  }[]
}

const mockInvoiceData: InvoiceData = {
  supplier: {
    name: "Flour & Co. Suppliers",
    address: "1234 Baker Street, Wheat Valley, CA 90210",
    phone: "+1 (555) 123-4567",
    email: "orders@flourandco.com",
  },
  invoice: {
    number: "INV-2024-0156",
    date: "2024-01-15",
    dueDate: "2024-02-14",
    totalAmount: 1245.5,
  },
  lineItems: [
    {
      id: "1",
      description: "Premium All-Purpose Flour (50lb bags)",
      quantity: 20,
      unitPrice: 24.5,
      total: 490.0,
    },
    {
      id: "2",
      description: "Organic Whole Wheat Flour (25lb bags)",
      quantity: 15,
      unitPrice: 32.0,
      total: 480.0,
      hasDiscrepancy: true,
      discrepancyType: "Price increased 15% from last order",
    },
    {
      id: "3",
      description: "Bread Flour High Gluten (50lb bags)",
      quantity: 8,
      unitPrice: 28.75,
      total: 230.0,
    },
    {
      id: "4",
      description: "Cake Flour Pastry Grade (25lb bags)",
      quantity: 2,
      unitPrice: 22.75,
      total: 45.5,
      hasDiscrepancy: true,
      discrepancyType: "Unusually low quantity ordered",
    },
  ],
  discrepancies: [
    {
      id: "1",
      type: "price_increase",
      severity: "high",
      description: "Organic Whole Wheat Flour price increased by 15% compared to previous orders",
      affectedItems: ["2"],
    },
    {
      id: "2",
      type: "unusual_quantity",
      severity: "medium",
      description: "Cake Flour quantity is 75% lower than typical orders",
      affectedItems: ["4"],
    },
    {
      id: "3",
      type: "duplicate_invoice",
      severity: "low",
      description: "Similar invoice pattern detected from this supplier 3 days ago",
    },
  ],
}

export default function InvoiceAnalysis() {
  const [zoomLevel, setZoomLevel] = useState(100)
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState<string | null>(null)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="h-4 w-4" />
      case "medium":
        return <Flag className="h-4 w-4" />
      case "low":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-amber-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-amber-700 hover:text-amber-900">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-amber-900">Invoice Analysis</h1>
                  <p className="text-sm text-amber-600">{mockInvoiceData.invoice.number}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="border-amber-300 text-amber-700">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="border-amber-300 text-amber-700">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
          {/* Left Side - Invoice Preview */}
          <div className="space-y-4">
            <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-amber-900">Invoice Preview</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
                      className="border-amber-300 text-amber-700"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-amber-700 min-w-[60px] text-center">{zoomLevel}%</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                      className="border-amber-300 text-amber-700"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-amber-300 text-amber-700">
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white border-2 border-amber-200 rounded-lg p-4 min-h-[600px] flex items-center justify-center">
                  <div
                    className="bg-gray-100 rounded-lg shadow-inner flex items-center justify-center"
                    style={{
                      width: `${Math.min(100, zoomLevel)}%`,
                      height: `${Math.min(100, zoomLevel * 0.8)}%`,
                      minHeight: "400px",
                    }}
                  >
                    <div className="text-center text-gray-500">
                      <FileText className="h-16 w-16 mx-auto mb-4" />
                      <p className="text-lg font-medium">Invoice Document</p>
                      <p className="text-sm">{mockInvoiceData.invoice.number}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Extracted Data */}
          <div className="space-y-4 overflow-y-auto">
            {/* Discrepancy Alerts */}
            {mockInvoiceData.discrepancies.length > 0 && (
              <Card className="bg-white/70 backdrop-blur-sm border-red-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-red-900 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Discrepancies Found ({mockInvoiceData.discrepancies.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockInvoiceData.discrepancies.map((discrepancy) => (
                    <Alert
                      key={discrepancy.id}
                      className={`cursor-pointer transition-colors ${
                        selectedDiscrepancy === discrepancy.id ? "bg-red-50 border-red-300" : ""
                      }`}
                      onClick={() =>
                        setSelectedDiscrepancy(selectedDiscrepancy === discrepancy.id ? null : discrepancy.id)
                      }
                    >
                      <div className="flex items-start space-x-3">
                        <Badge
                          variant="outline"
                          className={`${getSeverityColor(discrepancy.severity)} flex items-center space-x-1 mt-0.5`}
                        >
                          {getSeverityIcon(discrepancy.severity)}
                          <span className="text-xs font-medium capitalize">{discrepancy.severity}</span>
                        </Badge>
                        <AlertDescription className="flex-1">{discrepancy.description}</AlertDescription>
                      </div>
                    </Alert>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Supplier Information */}
            <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-amber-900 flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Supplier Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-start space-x-3">
                    <Building className="h-4 w-4 text-amber-600 mt-1" />
                    <div>
                      <p className="font-medium text-amber-900">{mockInvoiceData.supplier.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-amber-600 mt-1" />
                    <div>
                      <p className="text-sm text-amber-700">{mockInvoiceData.supplier.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-amber-600" />
                    <p className="text-sm text-amber-700">{mockInvoiceData.supplier.phone}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-amber-600" />
                    <p className="text-sm text-amber-700">{mockInvoiceData.supplier.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Details */}
            <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-amber-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Invoice Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Hash className="h-4 w-4 text-amber-600" />
                    <div>
                      <p className="text-xs text-amber-600 uppercase tracking-wide">Invoice Number</p>
                      <p className="font-medium text-amber-900">{mockInvoiceData.invoice.number}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-amber-600" />
                    <div>
                      <p className="text-xs text-amber-600 uppercase tracking-wide">Invoice Date</p>
                      <p className="font-medium text-amber-900">{mockInvoiceData.invoice.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-amber-600" />
                    <div>
                      <p className="text-xs text-amber-600 uppercase tracking-wide">Due Date</p>
                      <p className="font-medium text-amber-900">{mockInvoiceData.invoice.dueDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-4 w-4 text-amber-600" />
                    <div>
                      <p className="text-xs text-amber-600 uppercase tracking-wide">Total Amount</p>
                      <p className="font-bold text-lg text-amber-900">
                        ${mockInvoiceData.invoice.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-amber-900">Line Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-amber-900">Description</TableHead>
                      <TableHead className="text-amber-900 text-center">Qty</TableHead>
                      <TableHead className="text-amber-900 text-right">Unit Price</TableHead>
                      <TableHead className="text-amber-900 text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockInvoiceData.lineItems.map((item) => (
                      <TableRow key={item.id} className={item.hasDiscrepancy ? "bg-red-50 border-red-200" : ""}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-amber-900">{item.description}</p>
                            {item.hasDiscrepancy && (
                              <Badge variant="outline" className="mt-1 bg-red-100 text-red-800 border-red-200 text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {item.discrepancyType}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">${item.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Separator className="my-4" />
                <div className="flex justify-end">
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-900">
                      Total: ${mockInvoiceData.invoice.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Invoice
                  </Button>
                  <Button variant="outline" className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50">
                    <Flag className="h-4 w-4 mr-2" />
                    Flag for Review
                  </Button>
                  <Button variant="outline" className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50">
                    <Database className="h-4 w-4 mr-2" />
                    Add to Database
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
