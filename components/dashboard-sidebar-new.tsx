"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { 
  Home, 
  Calendar, 
  Ticket, 
  Users, 
  BarChart2, 
  Settings, 
  LogOut, 
  User as UserIcon, 
  QrCode, 
  Download, 
  Megaphone, 
  BadgeCheck, 
  ChevronRight, 
  Tag, 
  ShoppingBag, 
  HelpCircle, 
  FileText,
  ChevronsUpDown,
  Bell,
  CreditCard,
  Sparkles,
  Package,
  ShoppingCart,
  UserCheck,
  Trophy,
  Users2
} from "lucide-react"
import { createClient } from "@/lib/supabase-browser"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

export function DashboardSidebarNew({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useAuth()
  const supabase = createClient()

  const navItems = [
    { 
      title: "Suvestinė", 
      url: "/dashboard/overview", 
      icon: BarChart2,
      isActive: pathname === "/dashboard/overview"
    },
    { 
      title: "Naujienos", 
      url: "/dashboard/naujienos", 
      icon: FileText,
      isActive: pathname === "/dashboard/naujienos"
    },
    { 
      title: "QR kodu skaitytuvas", 
      url: "/dashboard/scanner", 
      icon: QrCode,
      isActive: pathname === "/dashboard/scanner"
    },
    { 
      title: "Renginiai", 
      url: "/dashboard/renginiai", 
      icon: Calendar,
      isActive: pathname === "/dashboard/renginiai",
      subItems: [
        { title: "Renginiai", url: "/dashboard/renginiai" },
        { title: "Bilietai", url: "/dashboard/bilietai" },
        { title: "Prenumeratos", url: "/dashboard/prenumeratos" },
        { title: "Prenumeratos tipai", url: "/dashboard/subscription-types" },
      ]
    },
    { 
      title: "Kuponai", 
      url: "/dashboard/coupons", 
      icon: Tag,
      isActive: pathname === "/dashboard/coupons"
    },
    { 
      title: "Parduotuvė", 
      url: "/dashboard/parduotuve", 
      icon: ShoppingBag,
      isActive: pathname === "/dashboard/parduotuve",
      subItems: [
        { title: "Prekės", url: "/dashboard/shop" },
        { title: "Užsakymai", url: "/dashboard/shop/orders" },
      ]
    },
    { 
      title: "Gerbėjai", 
      url: "/dashboard/fans", 
      icon: UserCheck,
      isActive: pathname === "/dashboard/fans"
    },
    { 
      title: "Rinkodara", 
      url: "/dashboard/marketing", 
      icon: Megaphone,
      isActive: pathname === "/dashboard/marketing"
    },
    { 
      title: "Pagalba", 
      url: "/dashboard/help", 
      icon: HelpCircle,
      isActive: pathname === "/dashboard/help"
    },
    { 
      title: "Mano komanda", 
      url: "/dashboard/zaidejai", 
      icon: Users2,
      isActive: pathname === "/dashboard/zaidejai",
      subItems: [
        { title: "Žaidėjai", url: "/dashboard/zaidejai" },
        { title: "Rungtynės", url: "/dashboard/rungtynes" },
        { title: "Lentelė", url: "/dashboard/lentele" },
      ]
    },
    { 
      title: "Eksportas", 
      url: "/dashboard/export", 
      icon: Download,
      isActive: pathname === "/dashboard/export"
    },
    { 
      title: "Šablonai", 
      url: "/dashboard/templates", 
      icon: Settings,
      isActive: pathname === "/dashboard/templates"
    },
  ]

  const isAnySubItemActive = (item: any) => {
    if (!item.subItems) return false
    return item.subItems.some((subItem: any) => pathname === subItem.url)
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <Link href="/" className="flex items-center">
            <Image 
              src="/Banga-1.png" 
              alt="FK Banga" 
              width={32} 
              height={32} 
              className="object-contain"
            />
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <React.Fragment key={item.title}>
              {item.subItems ? (
                <Collapsible asChild defaultOpen={isAnySubItemActive(item)} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={item.isActive || isAnySubItemActive(item)}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.subItems.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={item.isActive}>
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </React.Fragment>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} supabase={supabase} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function NavUser({
  user,
  supabase,
}: {
  user: any
  supabase: any
}) {
  const { isMobile } = useSidebar()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
                <AvatarFallback className="rounded-lg">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.user_metadata?.full_name || user?.email}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
                  <AvatarFallback className="rounded-lg">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user?.user_metadata?.full_name || user?.email}</span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Bell />
                Pranešimai
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserIcon />
                Profilis
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings />
                Nustatymai
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut />
              Atsijungti
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
