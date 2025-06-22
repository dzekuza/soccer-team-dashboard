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
    { label: "Pasirinkite gavėjus" },
    { label: "Sukurkite el. laišką" },
    { label: "Peržiūra ir siuntimas" },
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
      
      const response = await fetch('/api/marketing/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send emails');
      }

      toast({ title: "Išsiųsta!", description: "Laiškai sėkmingai išsiųsti." });
      setStep(0);
      setSelectedFans([]);
      setSubject("");
      setBody("");

    } catch (error) {
      toast({
        title: "Klaida siunčiant",
        description: error instanceof Error ? error.message : "Įvyko nežinoma klaida.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTemplateSelect = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign) {
      setSubject(campaign.subject);
      if (campaign.body_html) {
        setBody(campaign.body_html);
        setEmailFormat("html");
      } else if (campaign.body_text) {
        setBody(campaign.body_text);
        setEmailFormat("text");
      }
    }
  };

  const totalEmailsSent = campaigns.reduce((acc, c) => acc + c.recipient_count, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Rinkodara</h1>
        <Card className="p-4 w-full md:w-auto">
          <p className="text-sm font-medium">Iš viso išsiųsta laiškų</p>
          <p className="text-2xl font-bold">{totalEmailsSent}</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <Stepper steps={steps.map(s => s.label)} currentStep={step} onStepChange={setStep} />
        </CardHeader>
        <CardContent>
          {step === 0 && (
            <div>
              <CardTitle>1. Pasirinkite gavėjus</CardTitle>
              <CardDescription className="mb-4">Pasirinkite vartotojus, kuriems norite siųsti laišką.</CardDescription>
              
              {/* Mobile View */}
              <div className="md:hidden space-y-2">
                <div className="flex items-center space-x-2 p-2 border-b">
                  <Checkbox
                    id="select-all-mobile"
                    checked={selectedFans.length > 0 && selectedFans.length === fans.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all-mobile" className="font-medium">Pasirinkti visus</Label>
                </div>
                {fans.map((fan, index) => (
                  <div key={`${fan.email}-${index}`} className="flex items-center space-x-3 p-2 border-b last:border-b-0">
                    <Checkbox
                      id={`fan-${index}-mobile`}
                      checked={selectedFans.includes(fan.email)}
                      onCheckedChange={(checked) => handleSelectFan(fan.email, !!checked)}
                    />
                    <Label htmlFor={`fan-${index}-mobile`} className="flex-1">
                      <div className="font-medium">{fan.name}</div>
                      <div className="text-sm text-gray-500">{fan.email}</div>
                    </Label>
                  </div>
                ))}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={selectedFans.length > 0 && selectedFans.length === fans.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Vardas</TableHead>
                      <TableHead>El. paštas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fans.map((fan, index) => (
                      <TableRow key={`${fan.email}-${index}`}>
                        <TableCell>
                          <Checkbox
                            checked={selectedFans.includes(fan.email)}
                            onCheckedChange={(checked) => handleSelectFan(fan.email, !!checked)}
                          />
                        </TableCell>
                        <TableCell>{fan.name}</TableCell>
                        <TableCell>{fan.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <CardTitle>2. Sukurkite el. laišką</CardTitle>
              <CardDescription className="mb-4">Sukurkite naują laišką arba pasirinkite iš seniau naudotų.</CardDescription>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Naudoti šabloną</Label>
                  <Select onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pasirinkite seną kampaniją..." />
                    </SelectTrigger>
                    <SelectContent>
                      {campaigns.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.subject} (Išsiųsta: {new Date(c.created_at).toLocaleDateString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">Arba</span>
                    </div>
                </div>

                <RadioGroup value={emailFormat} onValueChange={(value: "html" | "text") => setEmailFormat(value)} className="flex space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="html" id="format-html" />
                    <Label htmlFor="format-html">HTML</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="text" id="format-text" />
                    <Label htmlFor="format-text">Paprastas tekstas</Label>
                  </div>
                </RadioGroup>
                <div>
                  <Label htmlFor="subject">Antraštė</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Jūsų laiško antraštė"
                  />
                </div>
                <div>
                  <Label htmlFor="body">Turinys ({emailFormat === 'html' ? 'HTML' : 'Paprastas tekstas'})</Label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={emailFormat === 'html' ? "<p>Jūsų HTML turinys čia...</p>" : "Jūsų paprastas tekstas čia..."}
                    rows={15}
                  />
                </div>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div>
              <CardTitle>3. Peržiūra ir siuntimas</CardTitle>
              <CardDescription className="mb-4">Peržiūrėkite informaciją prieš siunčiant.</CardDescription>
              <div className="space-y-4">
                <p><strong>Gavėjų skaičius:</strong> {selectedFans.length}</p>
                <p><strong>Antraštė:</strong> {subject}</p>
                <div>
                  <strong>Turinio peržiūra:</strong>
                  {emailFormat === 'html' ? (
                    <div
                      className="border rounded-md p-4 mt-2 bg-gray-50 max-h-96 overflow-auto"
                      dangerouslySetInnerHTML={{ __html: body }}
                    />
                  ) : (
                    <pre className="border rounded-md p-4 mt-2 bg-gray-50 max-h-96 overflow-auto whitespace-pre-wrap">{body}</pre>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse sm:flex-row justify-between gap-2">
            <Button variant="outline" onClick={handlePrevStep} disabled={step === 0} className="w-full sm:w-auto">
              Atgal
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={handleNextStep} className="w-full sm:w-auto">Toliau</Button>
            ) : (
              <Button onClick={handleSendEmail} disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? "Siunčiama..." : "Siųsti"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 