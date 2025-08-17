"use client"

import React from "react"
import { 
  HelpCircle, 
  Calendar, 
  Ticket, 
  Users, 
  BarChart2, 
  QrCode, 
  Download, 
  Megaphone, 
  BadgeCheck, 
  Tag, 
  ShoppingBag, 
  BookOpen, 
  Settings 
} from "lucide-react"

interface IconProps {
  name: string
  className?: string
}

export function Icon({ name, className = "h-5 w-5" }: IconProps) {
  const iconMap: { [key: string]: any } = {
    Calendar,
    Ticket,
    Users,
    BarChart2,
    QrCode,
    Download,
    Megaphone,
    BadgeCheck,
    Tag,
    ShoppingBag,
    BookOpen,
    Settings,
    HelpCircle
  }

  const IconComponent = iconMap[name] || HelpCircle
  return <IconComponent className={className} />
}
