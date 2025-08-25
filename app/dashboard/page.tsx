import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2, Calendar, Ticket, Users, QrCode } from "lucide-react"

export default function DashboardPage() {
  return (
    <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Suvestinė</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Renginiai</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +2 nuo praėjusio mėnesio
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bilietai</CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">
                  +12% nuo praėjusio mėnesio
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gerbėjai</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5,678</div>
                <p className="text-xs text-muted-foreground">
                  +8% nuo praėjusio mėnesio
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">QR skenavimai</CardTitle>
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">892</div>
                <p className="text-xs text-muted-foreground">
                  +5% nuo praėjusio mėnesio
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Paskutiniai renginiai</CardTitle>
                <CardDescription>
                  Jūsų komandos renginiai šį mėnesį
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">FK Banga vs FK Žalgiris</p>
                      <p className="text-sm text-muted-foreground">2024-01-15 19:00</p>
                    </div>
                    <div className="text-sm text-muted-foreground">1,234 bilietai</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">FK Banga vs FK Kauno Žalgiris</p>
                      <p className="text-sm text-muted-foreground">2024-01-22 20:00</p>
                    </div>
                    <div className="text-sm text-muted-foreground">987 bilietai</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">FK Banga vs FK Panevėžys</p>
                      <p className="text-sm text-muted-foreground">2024-01-29 19:30</p>
                    </div>
                    <div className="text-sm text-muted-foreground">756 bilietai</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Greitos veiksmai</CardTitle>
                <CardDescription>
                  Dažniausiai naudojamos funkcijos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">Naujas renginys</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
                    <div className="flex items-center space-x-2">
                      <Ticket className="h-4 w-4" />
                      <span className="text-sm font-medium">Bilietų valdymas</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
                    <div className="flex items-center space-x-2">
                      <QrCode className="h-4 w-4" />
                      <span className="text-sm font-medium">QR skaitytuvas</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">Gerbėjų sąrašas</span>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
  )
}
