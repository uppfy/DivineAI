import { Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#6b21a8]">Divine Comfort</h3>
            <p className="text-sm text-gray-600">
              Finding peace and guidance through faith and spiritual connection.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="hover:text-[#6b21a8]">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-[#6b21a8]">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-[#6b21a8]">
                <Instagram className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/bible-study" className="text-gray-600 hover:text-[#6b21a8]">Bible Study</a>
              </li>
              <li>
                <a href="/prayer-guide" className="text-gray-600 hover:text-[#6b21a8]">Prayer Guide</a>
              </li>
              <li>
                <a href="/meditation" className="text-gray-600 hover:text-[#6b21a8]">Meditation</a>
              </li>
              <li>
                <a href="/devotional" className="text-gray-600 hover:text-[#6b21a8]">Daily Devotional</a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Social</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/community" className="text-gray-600 hover:text-[#6b21a8]">Community</a>
              </li>
              <li>
                <a href="/groups" className="text-gray-600 hover:text-[#6b21a8]">Groups</a>
              </li>
              <li>
                <a href="/events" className="text-gray-600 hover:text-[#6b21a8]">Events</a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/privacy" className="text-gray-600 hover:text-[#6b21a8]">Privacy Policy</a>
              </li>
              <li>
                <a href="/terms" className="text-gray-600 hover:text-[#6b21a8]">Terms of Service</a>
              </li>
              <li>
                <a href="/faq" className="text-gray-600 hover:text-[#6b21a8]">FAQ</a>
              </li>
              <li>
                <a href="/contact" className="text-gray-600 hover:text-[#6b21a8]">Contact</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} Divine Comfort. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export { Footer }; 