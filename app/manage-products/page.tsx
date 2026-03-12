"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Trash2, Save, X } from "lucide-react"
import Link from "next/link"
import { bakeryData } from "@/data/bakery-data"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface Product {
  name: string
  quantity: number
}

export default function ManageProductsPage() {
  const [inventoryData, setInventoryData] = useState(bakeryData)
  const [activeTab, setActiveTab] = useState("day-olds")
  const [activeSection, setActiveSection] = useState("")
  const [newProductName, setNewProductName] = useState("")
  const [editMode, setEditMode] = useState<{ id: number; name: string } | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const { toast } = useToast()

  // Load data on mount
  useEffect(() => {
    // First try to get the most recent data
    const productManagementData = localStorage.getItem("productManagementData")
    if (productManagementData) {
      try {
        const parsedData = JSON.parse(productManagementData)
        setInventoryData(parsedData)
        console.log("Loaded existing product management data:", parsedData)
      } catch (error) {
        console.error("Error parsing product management data:", error)
      }
    } else {
      // If no product management data, try to get original inventory
      const originalInventory = localStorage.getItem("originalInventory")
      if (originalInventory) {
        try {
          const parsedData = JSON.parse(originalInventory)
          setInventoryData(parsedData)
          console.log("Loaded from original inventory:", parsedData)
        } catch (error) {
          console.error("Error parsing original inventory:", error)
        }
      } else {
        // If nothing else, use default bakeryData
        console.log("Using default bakery data")
      }
    }

    // Set initial active section
    if (activeTab === "day-olds" && Object.keys(inventoryData.dayOlds).length > 0) {
      setActiveSection(Object.keys(inventoryData.dayOlds)[0])
    } else if (activeTab === "donations" && Object.keys(inventoryData.donations).length > 0) {
      setActiveSection(Object.keys(inventoryData.donations)[0])
    }
  }, [])

  // Update active section when tab changes
  useEffect(() => {
    if (activeTab === "day-olds" && Object.keys(inventoryData.dayOlds).length > 0) {
      setActiveSection(Object.keys(inventoryData.dayOlds)[0])
    } else if (activeTab === "donations" && Object.keys(inventoryData.donations).length > 0) {
      setActiveSection(Object.keys(inventoryData.donations)[0])
    }
  }, [activeTab, inventoryData])

  // Get current products based on active tab and section
  const getCurrentProducts = () => {
    if (activeTab === "day-olds" && activeSection) {
      return inventoryData.dayOlds[activeSection] || []
    } else if (activeTab === "donations" && activeSection) {
      return inventoryData.donations[activeSection] || []
    }
    return []
  }

  // Get current category based on active tab
  const getCurrentCategory = () => {
    return activeTab === "day-olds" ? "dayOlds" : "donations"
  }

  // Add a new product
  const handleAddProduct = () => {
    if (!newProductName.trim() || !activeSection) return

    const category = getCurrentCategory()

    setInventoryData((prev) => {
      const newData = { ...prev }
      newData[category][activeSection] = [
        ...newData[category][activeSection],
        { name: newProductName.trim(), quantity: 0 },
      ]
      return newData
    })

    setNewProductName("")
    setHasChanges(true)

    // Save to localStorage immediately to prevent data loss
    setTimeout(() => {
      localStorage.setItem("productManagementData", JSON.stringify(inventoryData))
    }, 100)
  }

  // Delete a product
  const handleDeleteProduct = (index: number) => {
    const category = getCurrentCategory()

    setInventoryData((prev) => {
      const newData = { ...prev }
      newData[category][activeSection] = newData[category][activeSection].filter((_, i) => i !== index)
      return newData
    })

    setHasChanges(true)

    // Save to localStorage immediately to prevent data loss
    setTimeout(() => {
      localStorage.setItem("productManagementData", JSON.stringify(inventoryData))
    }, 100)
  }

  // Start editing a product
  const startEdit = (index: number, name: string) => {
    setEditMode({ id: index, name })
  }

  // Save edited product
  const saveEdit = () => {
    if (!editMode) return

    const category = getCurrentCategory()

    setInventoryData((prev) => {
      const newData = { ...prev }
      if (newData[category][activeSection][editMode.id]) {
        newData[category][activeSection][editMode.id].name = editMode.name
      }
      return newData
    })

    setEditMode(null)
    setHasChanges(true)

    // Save to localStorage immediately to prevent data loss
    setTimeout(() => {
      localStorage.setItem("productManagementData", JSON.stringify(inventoryData))
    }, 100)
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditMode(null)
  }

  // Add a new section
  const handleAddSection = (sectionName: string) => {
    if (!sectionName.trim()) return

    const category = getCurrentCategory()

    setInventoryData((prev) => {
      const newData = { ...prev }
      newData[category][sectionName] = []
      return newData
    })

    setActiveSection(sectionName)
    setHasChanges(true)

    // Save to localStorage immediately to prevent data loss
    setTimeout(() => {
      localStorage.setItem("productManagementData", JSON.stringify(inventoryData))
    }, 100)
  }

  // Delete a section
  const handleDeleteSection = (section: string) => {
    const category = getCurrentCategory()

    setInventoryData((prev) => {
      const newData = { ...prev }
      delete newData[category][section]

      // Set a new active section if the deleted one was active
      if (activeSection === section) {
        const sections = Object.keys(newData[category])
        if (sections.length > 0) {
          setActiveSection(sections[0])
        } else {
          setActiveSection("")
        }
      }

      return newData
    })

    setHasChanges(true)

    // Save to localStorage immediately to prevent data loss
    setTimeout(() => {
      localStorage.setItem("productManagementData", JSON.stringify(inventoryData))
    }, 100)
  }

  // Save all changes
  const handleSaveChanges = () => {
    // Save to localStorage for persistence
    localStorage.setItem("productManagementData", JSON.stringify(inventoryData))

    // Also save as the original inventory for the main app
    localStorage.setItem("originalInventory", JSON.stringify(inventoryData))

    setHasChanges(false)

    // Show success message
    toast({
      title: "Changes saved",
      description: "Your product changes have been saved successfully.",
      duration: 3000,
    })
  }

  return (
    <main className="min-h-screen bg-white pt-16">
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Crust Bakery</h1>
            </div>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="outline" className="border-gray-300">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Inventory
                </Button>
              </Link>
              <Button
                onClick={handleSaveChanges}
                disabled={!hasChanges}
                className="bg-black hover:bg-gray-800 transition-all duration-200"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="mb-8 border-gray-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-200/50 border-b border-gray-200">
              <CardTitle className="text-gray-800">Manage Products</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="day-olds" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="day-olds" className="data-[state=active]:bg-black data-[state=active]:text-white">
                    Day Olds
                  </TabsTrigger>
                  <TabsTrigger
                    value="donations"
                    className="data-[state=active]:bg-black data-[state=active]:text-white"
                  >
                    Donations
                  </TabsTrigger>
                </TabsList>

                {["day-olds", "donations"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="space-y-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {Object.keys(tab === "day-olds" ? inventoryData.dayOlds : inventoryData.donations).map(
                        (section) => (
                          <div key={section} className="flex items-center">
                            <Button
                              variant={activeSection === section ? "default" : "outline"}
                              className={`mr-1 ${
                                activeSection === section ? "bg-black hover:bg-gray-800" : "border-gray-300"
                              }`}
                              onClick={() => setActiveSection(section)}
                            >
                              {section.charAt(0).toUpperCase() + section.slice(1)}
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-gray-300 text-gray-500"
                              onClick={() => handleDeleteSection(section)}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Delete section</span>
                            </Button>
                          </div>
                        ),
                      )}

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="border-dashed border-gray-300">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Section
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Section</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <Label htmlFor="section-name">Section Name</Label>
                            <Input
                              id="section-name"
                              placeholder="Enter section name..."
                              className="mt-2"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleAddSection((e.target as HTMLInputElement).value)
                                  document.querySelector("[data-dialog-close]")?.click()
                                }
                              }}
                            />
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                              onClick={(e) => {
                                const input = document.getElementById("section-name") as HTMLInputElement
                                handleAddSection(input.value)
                                // Cerrar el modal después de añadir la sección
                                document.querySelector("[data-dialog-close]")?.click()
                              }}
                            >
                              Add Section
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {activeSection && (
                      <>
                        <div className="flex items-center mb-4">
                          <Input
                            placeholder="New product name..."
                            value={newProductName}
                            onChange={(e) => setNewProductName(e.target.value)}
                            className="mr-2"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddProduct()
                            }}
                          />
                          <Button onClick={handleAddProduct}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                          </Button>
                        </div>

                        <Card>
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50">
                                <TableHead className="w-[80%]">Product Name</TableHead>
                                <TableHead className="w-[20%] text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {getCurrentProducts().length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={2} className="h-24 text-center text-gray-500">
                                    No products in this section. Add some products above.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                getCurrentProducts().map((product, index) => (
                                  <TableRow key={index}>
                                    <TableCell>
                                      {editMode && editMode.id === index ? (
                                        <div className="flex items-center">
                                          <Input
                                            value={editMode.name}
                                            onChange={(e) => setEditMode({ ...editMode, name: e.target.value })}
                                            className="mr-2"
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") saveEdit()
                                              if (e.key === "Escape") cancelEdit()
                                            }}
                                          />
                                          <Button size="sm" onClick={saveEdit} className="mr-1">
                                            Save
                                          </Button>
                                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                                            Cancel
                                          </Button>
                                        </div>
                                      ) : (
                                        <div
                                          className="cursor-pointer hover:text-gray-700"
                                          onClick={() => startEdit(index, product.name)}
                                        >
                                          {product.name}
                                        </div>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 border-gray-300 text-red-500 hover:text-red-700 hover:border-red-300"
                                        onClick={() => handleDeleteProduct(index)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Delete</span>
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </Card>
                      </>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}
