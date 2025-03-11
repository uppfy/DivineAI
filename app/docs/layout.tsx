"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, FileText, Shield, BookOpen } from 'lucide-react';

interface SidebarItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
  items?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Documentation",
    href: "/docs",
    icon: <BookOpen className="h-5 w-5" />,
    items: [
      {
        title: "Terms of Service",
        href: "/docs/terms-of-service",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        title: "Privacy Policy",
        href: "/docs/privacy-policy",
        icon: <Shield className="h-4 w-4" />,
      },
    ],
  },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="bg-[#F9FAFB] min-h-screen w-full">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Main content area with sidebar on the right */}
        <div className="flex flex-col md:flex-row gap-12">
          {/* Main Content - Full width on mobile, 70% on desktop */}
          <main className="w-full md:w-[70%] min-h-[70vh]">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 prose prose-purple max-w-none">
              {children}
            </div>
          </main>

          {/* Sidebar - Hidden on mobile, 30% width on desktop, now on the right */}
          <aside className="hidden md:block md:w-[30%]">
            <div className="md:sticky md:top-24 space-y-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="pb-4 border-b border-gray-100">
                <h3 className="font-semibold text-lg text-gray-800">Documentation</h3>
                <p className="text-sm text-gray-500 mt-1">Important information about our services</p>
              </div>
              
              <nav className="space-y-6">
                {sidebarItems.map((section, i) => (
                  <div key={i} className="space-y-4">
                    <div className="flex items-center gap-2 text-[#6b21a8]">
                      {section.icon}
                      <h4 className="font-medium text-sm uppercase tracking-wider">
                        {section.title}
                      </h4>
                    </div>
                    <ul className="space-y-3 pl-2">
                      {section.items?.map((item, j) => (
                        <li key={j}>
                          <Link
                            href={item.href}
                            className={`
                              flex items-center text-sm py-2 px-3 rounded-lg transition-all
                              ${pathname === item.href
                                ? 'bg-purple-50 text-[#6b21a8] font-medium'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-[#6b21a8]'
                              }
                            `}
                            onMouseEnter={() => setHoveredItem(item.href)}
                            onMouseLeave={() => setHoveredItem(null)}
                          >
                            <span className="mr-2 text-[#6b21a8] opacity-80">
                              {item.icon}
                            </span>
                            <span>
                              {item.title}
                            </span>
                            {(pathname === item.href || hoveredItem === item.href) && (
                              <ChevronRight className="ml-auto h-4 w-4 text-[#6b21a8]" />
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-sm text-[#6b21a8] mb-2">Need Help?</h4>
                  <p className="text-xs text-gray-600 mb-3">
                    If you have any questions about our policies or need assistance, our support team is here to help.
                  </p>
                  <Link 
                    href="/contact" 
                    className="text-xs font-medium text-[#6b21a8] hover:text-[#581c87] flex items-center"
                  >
                    Contact Support
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
} 