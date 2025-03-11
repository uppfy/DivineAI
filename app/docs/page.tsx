import { Breadcrumb } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DocsIndex() {
  return (
    <>
      <Breadcrumb
        items={[
          { title: "Home", href: "/" },
          { title: "Documentation", href: "/docs", isCurrentPage: true }
        ]}
        description="Important information about our terms, policies, and guidelines."
      />

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-6">Documentation</h1>
          <p className="text-gray-600 mb-8">
            Welcome to the Divine Comfort documentation. Here you can find important information about our terms, policies, and guidelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
            <h2 className="text-xl font-semibold mb-3">Terms of Service</h2>
            <p className="text-gray-600 mb-4">
              Our Terms of Service outline the rules and guidelines for using Divine Comfort's platform and services.
            </p>
            <Link 
              href="/docs/terms-of-service" 
              className="inline-flex items-center text-[#6b21a8] hover:text-[#581c87] font-medium"
            >
              Read Terms of Service <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
            <h2 className="text-xl font-semibold mb-3">Privacy Policy</h2>
            <p className="text-gray-600 mb-4">
              Our Privacy Policy explains how we collect, use, and protect your personal information.
            </p>
            <Link 
              href="/docs/privacy-policy" 
              className="inline-flex items-center text-[#6b21a8] hover:text-[#581c87] font-medium"
            >
              Read Privacy Policy <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-12 p-6 bg-purple-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Need Help?</h2>
          <p className="text-gray-600 mb-4">
            If you have any questions about our documentation or need further assistance, please don't hesitate to contact us.
          </p>
          <Link 
            href="/contact" 
            className="inline-flex items-center text-[#6b21a8] hover:text-[#581c87] font-medium"
          >
            Contact Support <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
} 