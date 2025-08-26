"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StandingsTable } from "./standings-table"

export function StandingsTabs() {
  return (
    <div className="w-full">
      {/* Heading */}
      <div className="text-center py-8 border-t border-b border-[#232C62]">
        <h2 className="text-white text-[48px] font-bold leading-[60px]">
          Turnyrinė lentelė
        </h2>
      </div>
      
      <Tabs defaultValue="Banga A" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-transparent border-b border-[rgba(95,95,113,0.3)] h-auto p-0">
        <TabsTrigger 
          value="Banga A" 
          className="px-8 py-[33px] text-white text-base font-medium bg-transparent data-[state=active]:bg-[#070F40] data-[state=active]:text-white hover:bg-[rgba(255,255,255,0.1)] rounded-none border-r border-[rgba(95,95,113,0.3)] focus-visible:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50"
        >
          Banga
        </TabsTrigger>
        <TabsTrigger 
          value="Banga B" 
          className="px-8 py-[33px] text-white text-base font-medium bg-transparent data-[state=active]:bg-[#070F40] data-[state=active]:text-white hover:bg-[rgba(255,255,255,0.1)] rounded-none border-r border-[rgba(95,95,113,0.3)] focus-visible:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50"
        >
          Banga B
        </TabsTrigger>
        <TabsTrigger 
          value="Banga M" 
          className="px-8 py-[33px] text-white text-base font-medium bg-transparent data-[state=active]:bg-[#070F40] data-[state=active]:text-white hover:bg-[rgba(255,255,255,0.1)] rounded-none focus-visible:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50"
        >
          Merginos
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="Banga A" className="mt-0">
        <StandingsTable selectedTeam="Banga A" />
      </TabsContent>
      
      <TabsContent value="Banga B" className="mt-0">
        <StandingsTable selectedTeam="Banga B" />
      </TabsContent>
      
      <TabsContent value="Banga M" className="mt-0">
        <StandingsTable selectedTeam="Banga M" />
      </TabsContent>
    </Tabs>
    </div>
  )
}
