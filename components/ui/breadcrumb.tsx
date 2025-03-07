"use client"

import Link from "next/link"
import { ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface BreadcrumbItem {
  title: string;
  href: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  description?: string;
}

export function Breadcrumb({ items, description }: BreadcrumbProps) {
  // Get the current page title
  const currentPage = items[items.length - 1].title;
  
  return (
    <div className="mb-8">
      {/* Mobile View */}
      <div className="md:hidden space-y-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="truncate">{currentPage}</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[calc(100vw-32px)] max-w-sm">
            {items.map((item, index) => (
              <DropdownMenuItem key={index} className="py-2">
                <Link 
                  href={item.href}
                  className={`flex-1 ${item.isCurrentPage ? 'text-[#6b21a8] font-medium' : 'text-gray-600'}`}
                >
                  {item.title}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <nav className="flex items-center space-x-1 text-sm text-gray-600">
          {items.map((item, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />}
              {item.isCurrentPage ? (
                <span className="font-medium text-[#6b21a8]">{item.title}</span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-[#6b21a8] transition-colors"
                >
                  {item.title}
                </Link>
              )}
            </div>
          ))}
        </nav>
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
      </div>
    </div>
  )
} 