"use client"

import InventoryTracker from "@/components/inventory-tracker"
import Link from "next/link"
import { Settings } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function Home() {
  const { toast } = useToast()

  const handleSaveClick = () => {
    toast({
      title: "Guardando inventario...",
      description: "Procesando los datos del inventario",
      duration: 3000,
    })
    // El evento click original será manejado por el event listener en InventoryTracker
  }

  return (
    <main className="min-h-screen bg-white pt-16">
      {" "}
      {/* Added pt-16 to account for the fixed header height */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Crust Bakery</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/manage-products"
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Manage Products</span>
              </Link>
              <button
                id="save-button"
                onClick={handleSaveClick}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                <span className="mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                </span>
                Save
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InventoryTracker />
      </div>
    </main>
  )
}
