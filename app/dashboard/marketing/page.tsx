"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Stepper } from "@/components/ui/stepper";
import type { Fan, MarketingCampaign } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MarketingPage() {
  const [step, setStep] = useState(0);
  const [fans, setFans] = useState<Fan[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [selectedFans, setSelectedFans] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailFormat, setEmailFormat] = useState<"html" | "text">("html");
  const { toast } = useToast();

  const steps = [
    "Pasirinkite gavėjus",
    "Sukurkite el. laišką", 
    "Peržiūra ir siuntimas",
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const [fansRes, campaignsRes] = await Promise.all([
          fetch("/api/fans"),
          fetch("/api/marketing/campaigns"),
        ]);
        const fansData = await fansRes.json();
        const campaignsData = await campaignsRes.json();
        
        // Filter out duplicate fans by email
        const uniqueFans = Array.from(new Map(fansData.map((fan: Fan) => [fan.email, fan])).values()) as Fan[];
        
        setFans(uniqueFans);
        setCampaigns(campaignsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({ title: "Klaida", description: "Nepavyko gauti duomenų.", variant: "destructive" });
      }
    }
    fetchData();
  }, [toast]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFans(fans.map((fan) => fan.email));
    } else {
      setSelectedFans([]);
    }
  };

  const handleSelectFan = (email: string, checked: boolean) => {
    if (checked) {
      setSelectedFans((prev) => [...prev, email]);
    } else {
      setSelectedFans((prev) => prev.filter((e) => e !== email));
    }
  };

  const handleNextStep = () => {
    if (step === 0 && selectedFans.length === 0) {
      toast({ title: "Klaida", description: "Pasirinkite bent vieną gavėją.", variant: "destructive" });
      return;
    }
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  const handleSendEmail = async () => {
    setIsLoading(true);
    try {
      const payload: any = { 
        recipients: selectedFans, 
        subject,
      };

      if (emailFormat === 'html') {
        payload.htmlBody = body;
      } else {
        payload.textBody = body;
      }

      const response = await fetch("/api/marketing/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send email");
      }

      toast({
        title: "Success",
        description: `Email sent successfully to ${selectedFans.length} recipients.`,
      });

      // Reset form
      setSelectedFans([]);
      setSubject("");
      setBody("");
      setStep(0);
    } catch (error) {
      console.error("Failed to send email:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (campaignId: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (campaign) {
      setSubject(campaign.subject);
      setBody(campaign.body_html || campaign.body_text || "");
      setEmailFormat(campaign.body_html ? "html" : "text");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Marketingas</h1>
        <p className="text-gray-300">
          Siųskite el. laiškus savo gerbėjams ir stebėkite kampanijų rezultatus.
        </p>
      </div>

      <Card className="bg-[#0A165B]/50 border border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">El. laiško kampanija</CardTitle>
          <CardDescription className="text-gray-300">
            Sukurkite ir išsiųskite el. laiškus savo gerbėjams.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Stepper steps={steps} currentStep={step} onStepChange={setStep} />

          {step === 0 && (
            <div>
              <CardTitle className="text-white mt-6">1. Pasirinkite gavėjus</CardTitle>
              <CardDescription className="text-gray-300 mb-4">
                Pasirinkite gerbėjus, kuriuos norite įtraukti į kampaniją.
              </CardDescription>
              
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="select-all"
                  checked={selectedFans.length === fans.length && fans.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="text-white">
                  Pasirinkti visus ({fans.length} gerbėjų)
                </Label>
              </div>

              <div className="hidden md:block bg-[#0A165B]/50 border border-gray-700 rounded-lg shadow-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-[#0A2065]/50">
                      <TableHead className="text-gray-300 font-medium">Pasirinkti</TableHead>
                      <TableHead className="text-gray-300 font-medium">Vardas</TableHead>
                      <TableHead className="text-gray-300 font-medium">El. paštas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fans.map((fan, index) => (
                      <TableRow key={`${fan.email}-${index}`} className="border-gray-700 hover:bg-[#0A2065]/30 transition-colors"> 
                        <TableCell>
                          <Checkbox
                            checked={selectedFans.includes(fan.email)}
                            onCheckedChange={(checked) => handleSelectFan(fan.email, !!checked)}
                          />
                        </TableCell>
                        <TableCell className="text-white font-medium">{fan.name}</TableCell>
                        <TableCell className="text-gray-300">{fan.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <CardTitle className="text-white mt-6">2. Sukurkite el. laišką</CardTitle>
              <CardDescription className="text-gray-300 mb-4">Sukurkite naują laišką arba pasirinkite iš seniau naudotų.</CardDescription>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Naudoti šabloną</Label>
                  <Select onValueChange={handleTemplateSelect}>
                    <SelectTrigger className="bg-white/10 border-gray-600 text-white focus:border-[#F15601] focus:ring-[#F15601] focus:ring-1">
                      <SelectValue placeholder="Pasirinkite seną kampaniją..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0A165B] border-gray-600">
                      {campaigns.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="text-white hover:bg-[#0A2065] focus:bg-[#0A2065]">
                          {c.subject} (Išsiųsta: {new Date(c.created_at).toLocaleDateString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#0A165B] px-2 text-gray-300">Arba</span>
                    </div>
                </div>

                <RadioGroup value={emailFormat} onValueChange={(value: "html" | "text") => setEmailFormat(value)} className="flex space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="html" id="format-html" className="text-[#F15601]" />
                    <Label htmlFor="format-html" className="text-white">HTML</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="text" id="format-text" className="text-[#F15601]" />
                    <Label htmlFor="format-text" className="text-white">Paprastas tekstas</Label>
                  </div>
                </RadioGroup>
                <div>
                  <Label htmlFor="subject" className="text-white">Antraštė</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Jūsų laiško antraštė"
                    className="bg-white/10 border-gray-600 text-white placeholder:text-gray-400 focus:border-[#F15601] focus:ring-[#F15601] focus:ring-1"
                  />
                </div>
                <div>
                  <Label htmlFor="body" className="text-white">Turinys ({emailFormat === 'html' ? 'HTML' : 'Paprastas tekstas'})</Label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={emailFormat === 'html' ? "<p>Jūsų HTML turinys čia...</p>" : "Jūsų paprastas tekstas čia..."}
                    rows={15}
                    className="bg-white/10 border-gray-600 text-white placeholder:text-gray-400 focus:border-[#F15601] focus:ring-[#F15601] focus:ring-1"
                  />
                </div>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div>
              <CardTitle className="text-white mt-6">3. Peržiūra ir siuntimas</CardTitle>
              <CardDescription className="text-gray-300 mb-4">Peržiūrėkite informaciją prieš siunčiant.</CardDescription>
              <div className="space-y-4">
                <p className="text-white"><strong>Gavėjų skaičius:</strong> {selectedFans.length}</p>
                <p className="text-white"><strong>Antraštė:</strong> {subject}</p>
                <div>
                  <strong className="text-white">Turinio peržiūra:</strong>
                  {emailFormat === 'html' ? (
                    <div
                      className="border border-gray-600 rounded-md p-4 mt-2 bg-[#0A2065] max-h-96 overflow-auto text-white"
                      dangerouslySetInnerHTML={{ __html: body }}
                    />
                  ) : (
                    <pre className="border border-gray-600 rounded-md p-4 mt-2 bg-[#0A2065] max-h-96 overflow-auto whitespace-pre-wrap text-white">{body}</pre>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse sm:flex-row justify-between gap-2">
            <Button variant="outline" onClick={handlePrevStep} disabled={step === 0} className="w-full sm:w-auto border-gray-600 text-gray-300 hover:text-white hover:bg-[#0A2065]">
              Atgal
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={handleNextStep} className="w-full sm:w-auto bg-[#F15601] hover:bg-[#E04501] text-white">
                Toliau
              </Button>
            ) : (
              <Button onClick={handleSendEmail} disabled={isLoading} className="w-full sm:w-auto bg-[#F15601] hover:bg-[#E04501] text-white">
                {isLoading ? "Siunčiama..." : "Siųsti"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 