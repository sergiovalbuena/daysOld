"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Minus } from "lucide-react"
import { CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { motion, AnimatePresence } from "framer-motion"

interface Product {
  name: string
  quantity: number
}

// Update the interface to include searchTerm
interface ProductTableProps {
  title: string
  products: Product[]
  updateQuantity: (name: string, quantity: number) => void
  searchTerm: string
}

export default function ProductTable({ title, products, updateQuantity, searchTerm }: ProductTableProps) {
  const [isOpen, setIsOpen] = useState(true)

  const handleQuantityChange = (name: string, value: string) => {
    const quantity = Number.parseInt(value) || 0
    updateQuantity(name, quantity)
  }

  const incrementQuantity = (name: string, currentQuantity: number) => {
    updateQuantity(name, currentQuantity + 1)
  }

  const decrementQuantity = (name: string, currentQuantity: number) => {
    if (currentQuantity > 0) {
      updateQuantity(name, currentQuantity - 1)
    }
  }

  // Update the filteredProducts logic to use the searchTerm from props
  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Count products with quantity > 0
  const productsWithQuantity = products.filter((p) => p.quantity > 0).length

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="item-1"
      className="w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm"
      onValueChange={(value) => setIsOpen(!!value)}
    >
      <AccordionItem value="item-1" className="border-0">
        <AccordionTrigger className="bg-gradient-to-r from-gray-100 to-gray-200/50 px-4 py-3 hover:bg-gray-200 hover:no-underline transition-all duration-300">
          <div className="flex items-center justify-between w-full">
            <CardTitle className="text-gray-800 flex items-center">
              {title}
              {productsWithQuantity > 0 && (
                <span className="ml-2 bg-black text-white text-xs px-2 py-1 rounded-full">{productsWithQuantity}</span>
              )}
            </CardTitle>
          </div>
        </AccordionTrigger>
        <AnimatePresence>
          {isOpen && (
            <AccordionContent forceMount className="p-0 overflow-hidden">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-100">
                      <TableHead className="w-[60%]">Product</TableHead>
                      <TableHead className="w-[40%]">Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center text-gray-500">
                          No products found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product, index) => (
                        <TableRow key={index} className={product.quantity > 0 ? "bg-gray-50/50" : ""}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 rounded-r-none border-r-0 border-gray-300 text-gray-700"
                                onClick={() => decrementQuantity(product.name, product.quantity)}
                                disabled={product.quantity <= 0}
                              >
                                <Minus className="h-4 w-4" />
                                <span className="sr-only">Decrease</span>
                              </Button>
                              <Input
                                type="number"
                                min="0"
                                value={product.quantity || ""}
                                onChange={(e) => handleQuantityChange(product.name, e.target.value)}
                                className="w-14 text-center rounded-none h-9 border-gray-300 focus-visible:ring-gray-500"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 rounded-l-none border-l-0 border-gray-300 text-gray-700"
                                onClick={() => incrementQuantity(product.name, product.quantity)}
                              >
                                <Plus className="h-4 w-4" />
                                <span className="sr-only">Increase</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </motion.div>
            </AccordionContent>
          )}
        </AnimatePresence>
      </AccordionItem>
    </Accordion>
  )
}
