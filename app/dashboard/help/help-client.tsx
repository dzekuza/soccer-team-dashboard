"use client"

import React, { useState, useMemo } from "react"
import { HelpCircle, Search, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Icon } from "./icon-map"

interface HelpItem {
  question: string
  answer: string
}

interface HelpSection {
  title: string
  icon: string
  description: string
  items: HelpItem[]
}

interface HelpClientProps {
  helpSections: HelpSection[]
}

export default function HelpClient({ helpSections }: HelpClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedSections, setExpandedSections] = useState<string[]>([])



  // Filter sections and items based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return helpSections

    return helpSections
      .map(section => ({
        ...section,
        items: section.items.filter(item =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }))
      .filter(section => section.items.length > 0)
  }, [helpSections, searchQuery])

  // Expand sections that have search results
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const sectionsWithResults = filteredSections.map((_, index) => `section-${index}`)
      setExpandedSections(sectionsWithResults)
    } else {
      setExpandedSections([])
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setExpandedSections([])
  }

  const totalInstructions = helpSections.reduce((acc, section) => acc + section.items.length, 0)
  const searchResultsCount = filteredSections.reduce((acc, section) => acc + section.items.length, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-blue-100 rounded-lg">
          <HelpCircle className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pagalba</h1>
          <p className="text-gray-600">Išsamūs nurodymai, kaip naudotis sistemos funkcijomis</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Ieškoti pagalbos..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {searchQuery && (
          <div className="mt-2 text-sm text-gray-600">
            Rasta {searchResultsCount} rezultatų iš {totalInstructions} instrukcijų
          </div>
        )}
      </div>

      {/* Quick Navigation */}
      {!searchQuery && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Greita navigacija</CardTitle>
            <CardDescription>Spustelėkite ant kategorijos, kad pereitumėte prie jos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {helpSections.map((section, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start h-auto p-3"
                  onClick={() => {
                    document.getElementById(`section-${index}`)?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    })
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <Icon name={section.icon} className="h-4 w-4 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium">{section.title}</div>
                      <div className="text-xs text-gray-500">{section.items.length} klausimai</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {searchQuery ? "Rasta rezultatų" : "Iš viso instrukcijų"}
            </CardTitle>
            <Icon name="BookOpen" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {searchQuery ? searchResultsCount : totalInstructions}
            </div>
            <p className="text-xs text-muted-foreground">
              {searchQuery ? "Atitinka paiešką" : "Daugiau nei 30 nurodymų"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kategorijos</CardTitle>
            <Icon name="Settings" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {searchQuery ? filteredSections.length : helpSections.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {searchQuery ? "Su rezultatais" : "Pagrindinės funkcijos"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atnaujinta</CardTitle>
            <Badge variant="secondary">Šiandien</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2024</div>
            <p className="text-xs text-muted-foreground">Naujausia versija</p>
          </CardContent>
        </Card>
      </div>

      {/* Help Sections */}
      {filteredSections.length > 0 ? (
        <div className="space-y-6">
          {filteredSections.map((section, index) => (
            <Card key={index} id={`section-${index}`}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon name={section.icon} className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion 
                  type="multiple" 
                  value={expandedSections}
                  onValueChange={setExpandedSections}
                  className="w-full"
                >
                  {section.items.map((item, itemIndex) => (
                    <AccordionItem key={itemIndex} value={`section-${index}-item-${itemIndex}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 leading-relaxed">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nerasta rezultatų
            </h3>
            <p className="text-gray-600 mb-4">
              Pabandykite pakeisti paieškos užklausą arba peržiūrėkite visas kategorijas
            </p>
            <Button onClick={clearSearch} variant="outline">
              Išvalyti paiešką
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Contact Support */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            <span>Reikia papildomos pagalbos?</span>
          </CardTitle>
          <CardDescription>
            Jei neradote atsakymo į savo klausimą, kreipkitės į palaikymo komandą
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">El. paštas</h4>
              <p className="text-sm text-gray-600">palaikymas@fkbanga.lt</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Telefonas</h4>
              <p className="text-sm text-gray-600">+370 123 45678</p>
            </div>
          </div>
          <div className="pt-4 border-t border-blue-200">
            <p className="text-sm text-gray-600">
              <strong>Darbo laikas:</strong> Pirmadienis - Penktadienis, 9:00 - 18:00
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
