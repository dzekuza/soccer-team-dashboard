"use client";

import { useState, useEffect } from "react";
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

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">El. pašto šablonai</h1>
        <p className="text-gray-600">
          Keiskite ir redaguokite siunčiamų laiškų turinį.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
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
                            ? "secondary"
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
          <Card>
            <CardHeader>
              <CardTitle>Redaktorius</CardTitle>
              <CardDescription>
                Redaguokite pasirinkto šablono turinį. Naudokite {"{{kintamasis}}"},
                kad įterptumėte dinaminius duomenis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedTemplate ? (
                <>
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
                      value={selectedTemplate.body_html}
                      onChange={handleInputChange}
                      rows={20}
                      className="font-mono text-sm"
                    />
                  </div>
                  <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving ? "Saugoma..." : "Išsaugoti pakeitimus"}
                  </Button>
                </>
              ) : (
                <p>Pasirinkite šabloną, kurį norite redaguoti.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 