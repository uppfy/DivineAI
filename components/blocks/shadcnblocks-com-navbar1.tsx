"use client";

import { Book, Menu, Sunset, Trees, Zap, PenLine, LogOut, User, Calendar, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useState } from "react";
import { useRouter, usePathname } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: JSX.Element;
  items?: MenuItem[];
}

interface Navbar1Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  menu?: MenuItem[];
  mobileExtraLinks?: {
    name: string;
    url: string;
  }[];
  auth?: {
    login: {
      text: string;
      url: string;
    };
    signup: {
      text: string;
      url: string;
    };
  };
}

const Navbar1 = ({
  logo = {
    url: "/",
    src: "https://fcuiwgbwavqwunqerchc.supabase.co/storage/v1/object/public/assets//digital-comfort-logo.svg",
    alt: "Divine Comfort",
    title: "Divine Comfort",
  },
  menu = [
    { title: "Home", url: "/" },
    {
      title: "Resources",
      url: "#",
      items: [
        {
          title: "Spiritual Guidance",
          description: "Receive personalized spiritual guidance and comfort",
          icon: <Zap className="size-5 shrink-0" />,
          url: "/spiritual-guidance",
        },
        {
          title: "Bible Study",
          description: "Explore the Word of God with guided studies",
          icon: <Book className="size-5 shrink-0" />,
          url: "/bible-study",
        },
        {
          title: "Journal",
          description: "Write and reflect on your spiritual journey",
          icon: <PenLine className="size-5 shrink-0" />,
          url: "/journal",
        },
        {
          title: "Daily Devotional",
          description: "Daily inspiration and spiritual guidance",
          icon: <Sunset className="size-5 shrink-0" />,
          url: "/devotional",
        },
      ],
    },
    {
      title: "Blog",
      url: "/blog",
    },
    {
      title: "Community",
      url: "/community"
    },
    {
      title: "About",
      url: "/about",
    },
    {
      title: "Contact",
      url: "/contact",
    },
  ],
  mobileExtraLinks = [
    { name: "FAQ", url: "/faq" },
    { name: "Privacy", url: "/privacy" },
    { name: "Terms", url: "/terms" },
    { name: "Support", url: "/support" },
  ],
  auth = {
    login: { text: "Sign In", url: "/signin" },
    signup: { text: "Get Started", url: "/signup" },
  },
}: Navbar1Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Determine if navbar should be sticky based on current path
  const isSticky = pathname !== '/community';
  const headerClassName = isSticky 
    ? "sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm"
    : "w-full border-b bg-white/80 backdrop-blur-sm";

  const handleNavigation = (url: string) => {
    setIsSheetOpen(false);
    router.push(url);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsSheetOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderAuthSection = () => {
    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <div className="size-10 rounded-full overflow-hidden border-2 border-[#6b21a8] bg-white">
              {(profile?.avatarUrl || user?.photoURL) ? (
                <Image
                  src={profile?.avatarUrl || user?.photoURL || ''}
                  alt={profile?.displayName || ''}
                  width={40}
                  height={40}
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-lg text-gray-500">
                    {(profile?.displayName || '')[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                <User className="size-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer text-red-600">
              <LogOut className="size-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <>
        <Link
          href="/sign-in"
          className="text-sm font-semibold leading-6 text-gray-900 border rounded-lg px-4 py-2 hover:bg-gray-50"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="text-sm font-semibold leading-6 text-white bg-[#6b21a8] hover:bg-[#581c87] px-4 py-2 rounded-lg"
        >
          Get started
        </Link>
      </>
    );
  };

  const renderMobileAuthButtons = () => {
    if (user) {
      return (
        <div className="flex flex-col gap-4 mt-6 px-4">
          <div className="flex flex-col items-center pb-4 border-b border-gray-100">
            <div className="relative w-20 h-20 mb-3 rounded-full overflow-hidden border-2 border-purple-200">
              {profile?.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.displayName || user.email || "User"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-800">
                  <User className="h-10 w-10" />
                </div>
              )}
            </div>
            <h3 className="font-medium text-gray-900">
              {profile?.displayName || user.email?.split('@')[0] || "User"}
            </h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          
          <Button
            variant="outline"
            className="w-full justify-center py-6 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-colors"
            onClick={() => handleNavigation('/profile')}
          >
            <User className="mr-2 h-5 w-5" />
            View Profile
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-center py-6 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Sign out
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3 mt-6 px-4">
        <Button
          variant="outline"
          className="w-full bg-white hover:bg-purple-50 hover:text-purple-700 border-2 transition-colors"
          onClick={() => handleNavigation('/sign-in')}
        >
          Sign in
        </Button>
        <Button
          className="w-full bg-purple-700 hover:bg-purple-800 text-white transition-colors"
          onClick={() => handleNavigation('/sign-up')}
        >
          Get started
        </Button>
      </div>
    );
  };

  return (
    <header className={headerClassName}>
      {/* Desktop Navigation */}
      <nav className="container hidden h-16 items-center px-4 md:flex">
        <div className="flex-shrink-0">
          <Link href={logo.url} className="flex items-center">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={150}
              height={40}
              className="h-12 w-auto"
              priority
            />
          </Link>
        </div>
        <div className="flex-1 flex justify-center">
          <NavigationMenu>
            <NavigationMenuList>
              {menu.map((item) => renderMenuItem(item))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex-shrink-0 hidden lg:flex lg:gap-4">
          {renderAuthSection()}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="container flex h-16 items-center justify-between px-4 md:hidden">
        <Link href={logo.url} className="flex items-center">
          <Image
            src={logo.src}
            alt={logo.alt}
            width={120}
            height={32}
            className="h-10 w-auto"
            priority
          />
        </Link>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[300px] sm:w-[350px]">
            <SheetHeader>
              <SheetTitle>
                <Link 
                  href={logo.url} 
                  className="flex items-center justify-center"
                  onClick={() => setIsSheetOpen(false)}
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={120}
                    height={32}
                    className="h-10 w-auto"
                    priority
                  />
                </Link>
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="mt-8">
                <nav className="flex flex-col space-y-4">
                  {menu.map((item, index) => (
                    <div key={index}>
                      {item.items ? (
                        <Collapsible>
                          <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium hover:bg-purple-50 hover:text-purple-700 rounded-md transition-colors">
                            {item.title}
                            <ChevronDown className="h-4 w-4" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="px-4 py-2">
                            {item.items.map((subItem, subIndex) => (
                              <Link
                                key={subIndex}
                                href={subItem.url}
                                className="flex items-center gap-2 py-2 text-sm text-gray-600 hover:text-purple-700 transition-colors"
                                onClick={() => setIsSheetOpen(false)}
                              >
                                {subItem.icon}
                                <div>
                                  <div className="font-medium">{subItem.title}</div>
                                  <div className="text-xs text-gray-500">{subItem.description}</div>
                                </div>
                              </Link>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <Link
                          href={item.url}
                          className="block px-4 py-2 text-sm font-medium hover:bg-purple-50 hover:text-purple-700 rounded-md transition-colors"
                          onClick={() => setIsSheetOpen(false)}
                        >
                          {item.title}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
              {renderMobileAuthButtons()}
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
};

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title} className="text-muted-foreground">
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="w-80 p-3">
            <NavigationMenuLink>
              {item.items.map((subItem) => (
                <li key={subItem.title}>
                  <a
                    className="flex select-none gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-accent-foreground"
                    href={subItem.url}
                  >
                    {subItem.icon}
                    <div>
                      <div className="text-sm font-semibold">
                        {subItem.title}
                      </div>
                      {subItem.description && (
                        <p className="text-sm leading-snug text-muted-foreground">
                          {subItem.description}
                        </p>
                      )}
                    </div>
                  </a>
                </li>
              ))}
            </NavigationMenuLink>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <a
      key={item.title}
      className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-accent-foreground"
      href={item.url}
    >
      {item.title}
    </a>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <a
              key={subItem.title}
              className="flex select-none gap-4 rounded-md p-3 leading-none outline-none transition-colors hover:bg-muted hover:text-accent-foreground"
              href={subItem.url}
            >
              {subItem.icon}
              <div>
                <div className="text-sm font-semibold">{subItem.title}</div>
                {subItem.description && (
                  <p className="text-sm leading-snug text-muted-foreground">
                    {subItem.description}
                  </p>
                )}
              </div>
            </a>
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <a key={item.title} href={item.url} className="font-semibold">
      {item.title}
    </a>
  );
};

export { Navbar1 }; 