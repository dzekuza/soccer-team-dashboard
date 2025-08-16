"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import type { EmailTemplate } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const templateVariables: Record<string, string[]> = {
  ticket_confirmation: [
    "{{event_title}}",
    "{{event_date}}",
    "{{event_time}}",
    "{{event_location}}",
    "{{purchaser_name}}",
    "{{ticket_id}}",
    "{{tier_name}}",
    "{{tier_price}}",
    "{{team1_name}}",
    "{{team2_name}}",
  ],
  subscription_confirmation: [
    "{{purchaser_name}}",
    "{{start_date}}",
    "{{end_date}}",
    "{{validity_period}}",
  ],
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/templates");
      if (!response.ok) throw new Error("Failed to fetch templates");
      const data = await response.json();
      setTemplates(data);
      if (data.length > 0) {
        setSelectedTemplate(data[0]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Could not fetch templates.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleSelectTemplate = (templateName: string) => {
    const template = templates.find((t) => t.name === templateName);
    setSelectedTemplate(template || null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!selectedTemplate) return;
    setSelectedTemplate({
      ...selectedTemplate,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveChanges = async () => {
    if (!selectedTemplate) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/templates/${selectedTemplate.name}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedTemplate),
      });

      if (!response.ok) {
        throw new Error("Failed to save template");
      }

      toast({
        title: "Success",
        description: "Template saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Could not save template.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const insertVariable = (variable: string) => {
    if (!bodyTextareaRef.current) return;

    const textarea = bodyTextareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    textarea.value = before + variable + after;
    textarea.selectionStart = textarea.selectionEnd = start + variable.length;
    textarea.focus();

    // Trigger onChange event
    const event = new Event("input", { bubbles: true });
    textarea.dispatchEvent(event);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">El. pašto šablonai</h1>
        <p className="text-gray-300">
          Keiskite ir redaguokite siunčiamų laiškų turinį.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Mobile View: Dropdown for template selection */}
        <div className="md:hidden">
          <Label className="text-white">Pasirinkite šabloną</Label>
          <Select onValueChange={handleSelectTemplate} value={selectedTemplate?.name}>
            <SelectTrigger className="bg-white/10 border-gray-600 text-white focus:border-[#F15601] focus:ring-[#F15601] focus:ring-1">
              <SelectValue placeholder="Pasirinkite šabloną..." />
            </SelectTrigger>
            <SelectContent className="bg-[#0A165B] border-gray-600">
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.name} className="text-white hover:bg-[#0A2065] focus:bg-[#0A2065]">
                  {template.name.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop View: Sidebar for template selection */}
        <div className="hidden md:block md:col-span-1">
          <Card className="bg-[#0A165B]/50 border border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Šablonai</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-gray-300">Kraunasi...</p>
              ) : (
                <ul className="space-y-2">
                  {templates.map((template) => (
                    <li key={template.id}>
                      <Button
                        variant={
                          selectedTemplate?.name === template.name
                            ? "default"
                            : "ghost"
                        }
                        className={`w-full justify-start ${
                          selectedTemplate?.name === template.name
                            ? "bg-[#F15601] text-white hover:bg-[#E04501]"
                            : "text-gray-300 hover:text-white hover:bg-[#0A2065]/50"
                        }`}
                        onClick={() => handleSelectTemplate(template.name)}
                      >
                        {template.name.replace(/_/g, " ")}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          {isLoading && !selectedTemplate && (
            <Card className="flex items-center justify-center h-64 bg-[#0A165B]/50 border border-gray-700">
                <p className="text-gray-300">Kraunasi šablonai...</p>
            </Card>
          )}
          {selectedTemplate ? (
            <Tabs defaultValue="editor">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <TabsList className="bg-gray-100">
                  <TabsTrigger value="editor" className="data-[state=active]:bg-white data-[state=active]:text-[#0A165B] data-[state=active]:font-semibold">Redaktorius</TabsTrigger>
                  <TabsTrigger value="preview" className="data-[state=active]:bg-white data-[state=active]:text-[#0A165B] data-[state=active]:font-semibold">Peržiūra</TabsTrigger>
                </TabsList>
                <Button onClick={handleSaveChanges} disabled={isSaving} className="w-full sm:w-auto bg-[#F15601] hover:bg-[#E04501] text-white" variant="default">
                  {isSaving ? "Saugoma..." : "Išsaugoti pakeitimus"}
                </Button>
              </div>
              <TabsContent value="editor">
                <Card className="bg-[#0A165B]/50 border border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Šablono redagavimas</CardTitle>
                    <CardDescription className="text-gray-300">
                      Redaguokite pasirinkto šablono turinį.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-white">Laiško antraštė</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={selectedTemplate.subject}
                        onChange={handleInputChange}
                        className="bg-white/10 border-gray-600 text-white placeholder:text-gray-400 focus:border-[#F15601] focus:ring-[#F15601] focus:ring-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="body_html" className="text-white">Laiško turinys (HTML)</Label>
                      <Textarea
                        id="body_html"
                        name="body_html"
                        ref={bodyTextareaRef}
                        value={selectedTemplate.body_html}
                        onChange={handleInputChange}
                        rows={15}
                        className="font-mono text-sm bg-white/10 border-gray-600 text-white placeholder:text-gray-400 focus:border-[#F15601] focus:ring-[#F15601] focus:ring-1"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Galimi kintamieji</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(templateVariables[selectedTemplate.name] || []).map(
                          (variable) => (
                            <Button
                              key={variable}
                              variant="outline"
                              size="sm"
                              onClick={() => insertVariable(variable)}
                              className="font-mono border-gray-600 text-gray-300 hover:text-white hover:bg-[#0A2065]"
                            >
                              {variable}
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="preview">
                <Card className="bg-[#0A165B]/50 border border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Šablono peržiūra</CardTitle>
                    <CardDescription className="text-gray-300">
                      Taip atrodys jūsų el. laiškas.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white">Antraštė</Label>
                        <p className="text-lg font-semibold p-3 bg-[#0A2065] rounded border border-gray-600 text-white">
                          {selectedTemplate.subject}
                        </p>
                      </div>
                      <div>
                        <Label className="text-white">Turinys</Label>
                        <div
                          className="border border-gray-600 rounded-md p-4 min-h-[400px] bg-[#0A2065] text-white"
                          dangerouslySetInnerHTML={{
                            __html: selectedTemplate.body_html,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="bg-[#0A165B]/50 border border-gray-700">
              <CardContent className="pt-6">
                <p className="text-gray-300">Pasirinkite šabloną, kurį norite redaguoti.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 