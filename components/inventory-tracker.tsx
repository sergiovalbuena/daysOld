"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"
import ProductTable from "@/components/product-table"
import { bakeryData } from "@/data/bakery-data"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"

export default function InventoryTracker() {
  const [inventoryData, setInventoryData] = useState(bakeryData)
  const [activeTab, setActiveTab] = useState("day-olds")
  const [itemCounts, setItemCounts] = useState({ dayOlds: 0, donations: 0 })
  // Add a search state at the top of the component
  const [searchTerm, setSearchTerm] = useState("")

  // Add at the beginning of the component function
  useEffect(() => {
    // First check if there's a productManagementData in localStorage
    // This has priority as it contains the most recent product structure
    const productManagementData = localStorage.getItem("productManagementData")
    if (productManagementData) {
      try {
        const parsedData = JSON.parse(productManagementData)
        setInventoryData(parsedData)
        console.log("Loaded data from productManagementData:", parsedData)
      } catch (error) {
        console.error("Error parsing product management data:", error)
      }
    }
    // Then check for saved inventory data
    else {
      const savedInventory = localStorage.getItem("inventoryData")
      if (savedInventory) {
        try {
          const parsedInventory = JSON.parse(savedInventory)
          setInventoryData(parsedInventory)
          console.log("Loaded data from inventoryData:", parsedInventory)

          // Clear the localStorage after loading
          localStorage.removeItem("inventoryData")
        } catch (error) {
          console.error("Error parsing saved inventory data:", error)
        }
      } else {
        // If no saved data, check for original inventory structure
        const originalInventory = localStorage.getItem("originalInventory")
        if (originalInventory) {
          try {
            const parsedOriginal = JSON.parse(originalInventory)
            setInventoryData(parsedOriginal)
            console.log("Loaded data from originalInventory:", parsedOriginal)
          } catch (error) {
            console.error("Error parsing original inventory data:", error)
          }
        } else {
          // If nothing else, use the default bakeryData
          console.log("Using default bakeryData")
        }
      }
    }

    // Save the current inventory structure for later use
    localStorage.setItem("originalInventory", JSON.stringify(inventoryData))
  }, [])

  // Calculate counts of items with quantities
  useEffect(() => {
    const dayOldsCount = Object.values(inventoryData.dayOlds).flatMap((products) =>
      products.filter((p) => p.quantity > 0),
    ).length

    const donationsCount = Object.values(inventoryData.donations).flatMap((products) =>
      products.filter((p) => p.quantity > 0),
    ).length

    setItemCounts({
      dayOlds: dayOldsCount,
      donations: donationsCount,
    })
  }, [inventoryData])

  const updateQuantity = (category: string, section: string, productName: string, quantity: number) => {
    setInventoryData((prev) => {
      const newData = { ...prev }
      const productIndex = newData[category][section].findIndex((p) => p.name === productName)
      if (productIndex !== -1) {
        newData[category][section][productIndex].quantity = quantity
      }
      return newData
    })
  }

  const handleSave = () => {
    // Filter products with quantity > 0
    const filteredProducts = Object.entries(inventoryData).flatMap(([category, sections]) => {
      return Object.entries(sections).flatMap(([section, products]) => {
        return products
          .filter((product) => product.quantity > 0)
          .map((product) => ({
            name: product.name,
            quantity: product.quantity,
            category,
            section,
          }))
      })
    })

    // Save the current inventory data to localStorage before navigating
    localStorage.setItem("originalInventory", JSON.stringify(inventoryData))

    // Encode the filtered products as a URL parameter
    const encodedData = encodeURIComponent(JSON.stringify(filteredProducts))

    // Navigate to the results page
    window.location.href = `/results?data=${encodedData}`
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(inventoryData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `crust-bakery-inventory-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  // Agregar este useEffect después de los otros useEffect
  useEffect(() => {
    // Conectar el botón de guardar en la barra de navegación
    const saveButton = document.getElementById("save-button")
    if (saveButton) {
      saveButton.addEventListener("click", handleSave)
    }

    // Limpiar el event listener cuando el componente se desmonte
    return () => {
      if (saveButton) {
        saveButton.removeEventListener("click", handleSave)
      }
    }
  }, [inventoryData]) // Add inventoryData as a dependency

  // Function to render product tables for a specific category
  const renderProductTables = (category) => {
    return Object.entries(inventoryData[category]).map(([section, products]) => (
      <ProductTable
        key={`${category}-${section}`}
        title={section.charAt(0).toUpperCase() + section.slice(1)}
        products={products}
        updateQuantity={(name, quantity) => updateQuantity(category, section, name, quantity)}
        searchTerm={searchTerm}
      />
    ))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Tabs
        defaultValue="day-olds"
        value={activeTab}
        onValueChange={setActiveTab}
        className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
      >
        <div className="sticky top-16 z-20 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 pt-4">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100">
              <TabsTrigger
                value="day-olds"
                className="data-[state=active]:bg-black data-[state=active]:text-white relative"
              >
                Day Olds
                {itemCounts.dayOlds > 0 && <Badge className="ml-2 bg-gray-700">{itemCounts.dayOlds}</Badge>}
              </TabsTrigger>
              <TabsTrigger
                value="donations"
                className="data-[state=active]:bg-black data-[state=active]:text-white relative"
              >
                Donations
                {itemCounts.donations > 0 && <Badge className="ml-2 bg-gray-700">{itemCounts.donations}</Badge>}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Search input - ahora está después de los tabs pero dentro del div sticky */}
          <div className="bg-white p-4 rounded-lg mb-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search all products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-gray-300 focus-visible:ring-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Añadido padding-top para evitar que el contenido quede oculto bajo el header sticky */}
        <TabsContent value="day-olds" className="p-4 pt-6 space-y-6 mt-0">
          {renderProductTables("dayOlds")}
        </TabsContent>

        <TabsContent value="donations" className="p-4 pt-6 space-y-6 mt-0">
          {renderProductTables("donations")}
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
