"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Share2, Clipboard, Check, Edit } from "lucide-react"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

interface Product {
  name: string
  quantity: number
  category: string
  section: string
}

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [date, setDate] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const dataProcessed = useRef(false)

  useEffect(() => {
    // Only process data once to prevent infinite loops
    if (dataProcessed.current) return

    // Set the date
    const currentDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    setDate(currentDate)

    // Get the data from URL params
    const inventoryParam = searchParams.get("data")
    if (inventoryParam) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(inventoryParam))
        setProducts(parsedData)

        // Try to get the original inventory structure from localStorage
        const originalInventory = localStorage.getItem("originalInventory")
        if (!originalInventory) {
          // If not available, create a basic structure from the products
          const inventory = {
            dayOlds: {
              tarts: [],
              cookies: [],
              viennoiserie: [],
              savouries: [],
              otherYummies: [],
              breads: [],
            },
            donations: {
              tarts: [],
              pastries: [],
              savouries: [],
              breads: [],
            },
          }
          localStorage.setItem("originalInventory", JSON.stringify(inventory))
        }

        // Mark as processed to prevent re-processing
        dataProcessed.current = true
      } catch (error) {
        console.error("Error parsing inventory data:", error)
        // Mark as processed even on error to prevent infinite loops
        dataProcessed.current = true
      }
    } else {
      // Mark as processed even if no data to prevent infinite loops
      dataProcessed.current = true
    }
  }, [searchParams]) // Add searchParams as dependency

  const handleShare = () => {
    // Create a text representation of the inventory
    let message = `Crust Bakery - Leftover Products (${date})\n\n`

    // Group by main category
    const dayOlds = products.filter((p) => p.category === "dayOlds")
    const donations = products.filter((p) => p.category === "donations")

    if (dayOlds.length > 0) {
      message += "*DAY OLDS:*\n"

      // Group by section
      const sections = dayOlds.reduce(
        (acc, product) => {
          if (!acc[product.section]) {
            acc[product.section] = []
          }
          acc[product.section].push(product)
          return acc
        },
        {} as Record<string, Product[]>,
      )

      // Add each section
      Object.entries(sections).forEach(([section, sectionProducts]) => {
        message += `\n${section.toUpperCase()}:\n`
        sectionProducts.forEach((product) => {
          message += `${product.name}: ${product.quantity}\n`
        })
      })
    }

    if (donations.length > 0) {
      message += "\n*DONATIONS:*\n"

      // Group by section
      const sections = donations.reduce(
        (acc, product) => {
          if (!acc[product.section]) {
            acc[product.section] = []
          }
          acc[product.section].push(product)
          return acc
        },
        {} as Record<string, Product[]>,
      )

      // Add each section
      Object.entries(sections).forEach(([section, sectionProducts]) => {
        message += `\n${section.toUpperCase()}:\n`
        sectionProducts.forEach((product) => {
          message += `${product.name}: ${product.quantity}\n`
        })
      })
    }

    // Create WhatsApp URL
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`

    // Open WhatsApp in a new window
    window.open(whatsappUrl, "_blank")
  }

  const handleCopyToClipboard = async () => {
    // Create a text representation of the inventory
    let message = `Crust Bakery - Leftover Products (${date})\n\n`

    // Group by main category
    const dayOlds = products.filter((p) => p.category === "dayOlds")
    const donations = products.filter((p) => p.category === "donations")

    if (dayOlds.length > 0) {
      message += "*DAY OLDS:*\n"

      // Group by section
      const sections = dayOlds.reduce(
        (acc, product) => {
          if (!acc[product.section]) {
            acc[product.section] = []
          }
          acc[product.section].push(product)
          return acc
        },
        {} as Record<string, Product[]>,
      )

      // Add each section
      Object.entries(sections).forEach(([section, sectionProducts]) => {
        message += `\n${section.toUpperCase()}:\n`
        sectionProducts.forEach((product) => {
          message += `${product.name}: ${product.quantity}\n`
        })
      })
    }

    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const handleBackToEdit = () => {
    // Convert the products back to the original inventory structure
    const inventory = {
      dayOlds: {
        tarts: [],
        cookies: [],
        viennoiserie: [],
        savouries: [],
        otherYummies: [],
        breads: [],
      },
      donations: {
        tarts: [],
        pastries: [],
        savouries: [],
        breads: [],
      },
    }

    // First, populate with all products from the original data structure with quantity 0
    // This ensures we maintain the original product list
    const originalData = JSON.parse(localStorage.getItem("originalInventory") || "{}")
    if (Object.keys(originalData).length > 0) {
      Object.keys(originalData).forEach((category) => {
        Object.keys(originalData[category]).forEach((section) => {
          inventory[category][section] = originalData[category][section].map((product) => ({
            name: product.name,
            quantity: 0,
          }))
        })
      })
    }

    // Then update quantities for products that have values
    products.forEach((product) => {
      const { category, section, name, quantity } = product
      const productIndex = inventory[category][section].findIndex((p) => p.name === name)

      if (productIndex !== -1) {
        inventory[category][section][productIndex].quantity = quantity
      } else {
        // If product doesn't exist in the original structure, add it
        inventory[category][section].push({ name, quantity })
      }
    })

    // Store the inventory data in localStorage
    localStorage.setItem("inventoryData", JSON.stringify(inventory))

    // Navigate back to the inventory page
    window.location.href = "/"
  }

  // Group products by category and section
  const dayOlds = products.filter((p) => p.category === "dayOlds")
  const donations = products.filter((p) => p.category === "donations")

  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex gap-2">
            <Link href="/">
              <Button
                variant="outline"
                className="print:hidden group transition-all duration-300 border-gray-300 hover:border-gray-500"
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                Back to Inventory
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleBackToEdit}
              className="print:hidden border-gray-300 hover:border-gray-500 transition-all duration-300"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Inventory
            </Button>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={handleCopyToClipboard}
              variant="outline"
              className="flex-1 sm:flex-none print:hidden border-gray-300 hover:border-gray-500 transition-all duration-300"
            >
              {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Clipboard className="mr-2 h-4 w-4" />}
              {copied ? "Copied!" : "Copy Text"}
            </Button>
            <Button
              onClick={handleShare}
              className="flex-1 sm:flex-none bg-black hover:bg-gray-800 print:hidden transition-all duration-300"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share via WhatsApp
            </Button>
          </div>
        </div>

        <Card className="mb-8 border-gray-200 shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-200/50 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <CardTitle className="text-gray-800">Crust Bakery - Leftover Products</CardTitle>
              <div className="text-gray-700 text-sm font-medium bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
                {date}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {products.length === 0 ? (
              <div className="text-center py-12 text-amber-600 bg-amber-50/50">
                <div className="mb-2">No products with quantities found.</div>
                <Link href="/">
                  <Button variant="link" className="text-amber-700 hover:text-amber-900">
                    Return to inventory to add products
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Day Olds Section */}
                {dayOlds.length > 0 && (
                  <Accordion
                    type="single"
                    collapsible
                    defaultValue="day-olds"
                    className="border rounded-lg overflow-hidden border-gray-200 shadow-sm"
                  >
                    <AccordionItem value="day-olds" className="border-0">
                      <AccordionTrigger className="bg-gradient-to-r from-gray-100 to-gray-200/50 px-4 py-3 hover:bg-gray-200 hover:no-underline transition-all duration-300">
                        <div className="flex items-center">
                          <h2 className="text-xl font-semibold text-gray-800">Day Olds</h2>
                          <Badge className="ml-2 bg-black">{dayOlds.length} items</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 pt-6 bg-white">
                        <div className="space-y-8">
                          {/* Group by section */}
                          {Object.entries(
                            dayOlds.reduce(
                              (acc, product) => {
                                if (!acc[product.section]) {
                                  acc[product.section] = []
                                }
                                acc[product.section].push(product)
                                return acc
                              },
                              {} as Record<string, Product[]>,
                            ),
                          ).map(([section, sectionProducts], index) => (
                            <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <h3 className="text-lg font-semibold p-3 bg-gray-50 border-b border-gray-200 text-gray-800">
                                {section.charAt(0).toUpperCase() + section.slice(1)}
                              </h3>
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-gray-50/50 hover:bg-gray-50">
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {sectionProducts.map((product, productIndex) => (
                                    <TableRow key={productIndex} className="hover:bg-amber-50/30">
                                      <TableCell className="font-medium">{product.name}</TableCell>
                                      <TableCell className="text-right font-semibold">{product.quantity}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}

                {/* Donations Section */}
                {donations.length > 0 && (
                  <Accordion
                    type="single"
                    collapsible
                    defaultValue="donations"
                    className="border rounded-lg overflow-hidden border-gray-200 shadow-sm"
                  >
                    <AccordionItem value="donations" className="border-0">
                      <AccordionTrigger className="bg-gradient-to-r from-gray-100 to-gray-200/50 px-4 py-3 hover:bg-gray-200 hover:no-underline transition-all duration-300">
                        <div className="flex items-center">
                          <h2 className="text-xl font-semibold text-gray-800">Donations</h2>
                          <Badge className="ml-2 bg-black">{donations.length} items</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 pt-6 bg-white">
                        <div className="space-y-8">
                          {/* Group by section */}
                          {Object.entries(
                            donations.reduce(
                              (acc, product) => {
                                if (!acc[product.section]) {
                                  acc[product.section] = []
                                }
                                acc[product.section].push(product)
                                return acc
                              },
                              {} as Record<string, Product[]>,
                            ),
                          ).map(([section, sectionProducts], index) => (
                            <div key={index} className="bg-white rounded-lg border border-amber-100 overflow-hidden">
                              <h3 className="text-lg font-semibold p-3 bg-amber-50 border-b border-amber-100 text-amber-800">
                                {section.charAt(0).toUpperCase() + section.slice(1)}
                              </h3>
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-amber-50/50 hover:bg-amber-50">
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {sectionProducts.map((product, productIndex) => (
                                    <TableRow key={productIndex} className="hover:bg-amber-50/30">
                                      <TableCell className="font-medium">{product.name}</TableCell>
                                      <TableCell className="text-right font-semibold">{product.quantity}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <footer className="text-center text-gray-600 text-sm mt-8 print:hidden">
          <p>© {new Date().getFullYear()} Crust Bakery. All rights reserved.</p>
        </footer>
      </motion.div>
    </main>
  )
}
