"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-[#0A165B] p-1 text-white",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[#070F40] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:font-semibold hover:bg-[#070F40]/80",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

// Custom Public Tabs Component for pages like standings, players, etc.
interface PublicTabsProps {
  tabs: Array<{
    key: string
    label: string
  }>
  activeTab: string
  onTabChange: (tab: string) => void
  className?: string
}

export function PublicTabs({ tabs, activeTab, onTabChange, className }: PublicTabsProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex w-full">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex-1 px-4 py-[33px] rounded-none border-b-2 transition-colors ${
              activeTab === tab.key
                ? "bg-[#0A165B] text-white border-[#F15601]"
                : "bg-[#232C62] text-white hover:bg-[#0A165B] border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
