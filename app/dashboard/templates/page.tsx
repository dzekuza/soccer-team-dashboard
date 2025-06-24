"use client";

import { useState, useEffect, useRef } from "react";
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

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
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
  };

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedTemplate.subject,
          body_html: selectedTemplate.body_html,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save template");
      }

      toast({
        title: "Success!",
        description: "Template has been saved successfully.",
      });
      fetchTemplates(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Could not save template.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = bodyTextareaRef.current;
    if (!textarea || !selectedTemplate) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = text.substring(0, start) + variable + text.substring(end);

    setSelectedTemplate({
      ...selectedTemplate,
      body_html: newText,
    });

    // Focus and set cursor position after inserting
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + variable.length;
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">El. pašto šablonai</h1>
        <p className="text-muted-foreground">
          Keiskite ir redaguokite siunčiamų laiškų turinį.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Mobile View: Dropdown for template selection */}
        <div className="md:hidden">
          <Label>Pasirinkite šabloną</Label>
          <Select onValueChange={handleSelectTemplate} value={selectedTemplate?.name}>
            <SelectTrigger>
              <SelectValue placeholder="Pasirinkite šabloną..." />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.name}>
                  {template.name.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop View: Sidebar for template selection */}
        <div className="hidden md:block md:col-span-1">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Šablonai</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Kraunasi...</p>
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
                        className="w-full justify-start"
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
            <Card className="flex items-center justify-center h-64 bg-card">
                <p>Kraunasi šablonai...</p>
            </Card>
          )}
          {selectedTemplate ? (
            <Tabs defaultValue="editor">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <TabsList>
                  <TabsTrigger value="editor">Redaktorius</TabsTrigger>
                  <TabsTrigger value="preview">Peržiūra</TabsTrigger>
                </TabsList>
                <Button onClick={handleSaveChanges} disabled={isSaving} className="w-full sm:w-auto" variant="default">
                  {isSaving ? "Saugoma..." : "Išsaugoti pakeitimus"}
                </Button>
              </div>
              <TabsContent value="editor">
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle>Šablono redagavimas</CardTitle>
                    <CardDescription>
                      Redaguokite pasirinkto šablono turinį.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Laiško antraštė</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={selectedTemplate.subject}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="body_html">Laiško turinys (HTML)</Label>
                      <Textarea
                        id="body_html"
                        name="body_html"
                        ref={bodyTextareaRef}
                        value={selectedTemplate.body_html}
                        onChange={handleInputChange}
                        rows={15}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div>
                      <Label>Galimi kintamieji</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(templateVariables[selectedTemplate.name] || []).map(
                          (variable) => (
                            <Button
                              key={variable}
                              variant="outline"
                              size="sm"
                              onClick={() => insertVariable(variable)}
                              className="font-mono"
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
                <Card>
                  <CardHeader>
                    <CardTitle>Šablono peržiūra</CardTitle>
                    <CardDescription>
                      Taip atrodys jūsų el. laiškas.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Antraštė</Label>
                        <p className="text-lg font-semibold p-2 bg-gray-100 rounded">
                          {selectedTemplate.subject}
                        </p>
                      </div>
                      <div>
                        <Label>Turinys</Label>
                        <div
                          className="border rounded-md p-4 min-h-[400px]"
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
            <Card>
              <CardContent className="pt-6">
                <p>Pasirinkite šabloną, kurį norite redaguoti.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 