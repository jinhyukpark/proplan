import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Settings, 
  Users, 
  CreditCard, 
  Receipt, 
  ChevronLeft,
  Plus,
  Mail,
  MoreHorizontal,
  Check,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Mock Data
import avatar1 from "@assets/generated_images/professional_user_avatar_1.png";
import avatar2 from "@assets/generated_images/professional_user_avatar_2.png";
import avatar3 from "@assets/generated_images/professional_user_avatar_3.png";

const TEAM_MEMBERS = [
  { id: "1", name: "Alex Designer", email: "alex@illunex.com", role: "Admin", avatar: avatar1, status: "Active" },
  { id: "2", name: "Sarah PM", email: "sarah@illunex.com", role: "Member", avatar: avatar2, status: "Active" },
  { id: "3", name: "Mike Dev", email: "mike@illunex.com", role: "Member", avatar: avatar3, status: "Active" },
  { id: "4", name: "David Marketing", email: "david@illunex.com", role: "Viewer", avatar: null, status: "Invited" },
];

export default function TeamSettings() {
  const [activeTab, setActiveTab] = useState("members");

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-border flex flex-col shrink-0 bg-muted/5">
        <div className="p-4 h-14 flex items-center border-b border-border/40">
           <Link href="/projects">
             <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
               <ChevronLeft className="w-4 h-4" />
               Back to Projects
             </Button>
           </Link>
        </div>
        
        <div className="p-4 pb-2">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
              I
            </div>
            <div>
              <h2 className="font-semibold text-sm">Illunex Team</h2>
              <p className="text-xs text-muted-foreground">Free Plan</p>
            </div>
          </div>
        </div>

        <div className="px-3 space-y-1">
          <Button 
            variant={activeTab === "general" ? "secondary" : "ghost"} 
            className="w-full justify-start gap-3"
            onClick={() => setActiveTab("general")}
          >
            <Settings className="w-4 h-4" />
            General Settings
          </Button>
          <Button 
            variant={activeTab === "members" ? "secondary" : "ghost"} 
            className="w-full justify-start gap-3"
            onClick={() => setActiveTab("members")}
          >
            <Users className="w-4 h-4" />
            Team Members
          </Button>
          <Button 
            variant={activeTab === "billing" ? "secondary" : "ghost"} 
            className="w-full justify-start gap-3"
            onClick={() => setActiveTab("billing")}
          >
            <CreditCard className="w-4 h-4" />
            Billing & Plans
          </Button>
          <Button 
            variant={activeTab === "invoices" ? "secondary" : "ghost"} 
            className="w-full justify-start gap-3"
            onClick={() => setActiveTab("invoices")}
          >
            <Receipt className="w-4 h-4" />
            Invoices
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8 md:p-12">
          
          {/* General Settings Section */}
          {activeTab === "general" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h1 className="text-2xl font-bold mb-2">Team Settings</h1>
                <p className="text-muted-foreground">Manage your team's profile and preferences.</p>
              </div>
              
              <Separator />

              <div className="grid gap-6">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Team Name</label>
                  <div className="flex gap-4">
                    <Input defaultValue="Illunex Team" className="max-w-md" />
                    <Button>Save</Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Team URL</label>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="bg-muted px-3 py-2 rounded-md border border-border">planner.app/team/</span>
                    <Input defaultValue="illunex" className="max-w-[200px]" />
                  </div>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Public Profile</label>
                    <p className="text-xs text-muted-foreground">Allow anyone to view your team's public projects</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="pt-6 border-t border-border">
                  <h3 className="text-sm font-medium text-destructive mb-2">Danger Zone</h3>
                  <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-destructive">Delete Team</p>
                      <p className="text-xs text-muted-foreground">Permanently remove this team and all of its data.</p>
                    </div>
                    <Button variant="destructive" size="sm">Delete Team</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Members Section */}
          {activeTab === "members" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Team Members</h1>
                  <p className="text-muted-foreground">Manage who has access to your projects.</p>
                </div>
                <Button className="gap-2">
                  <Mail className="w-4 h-4" />
                  Invite Member
                </Button>
              </div>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Pending Invitations (1)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                         <Mail className="w-4 h-4 text-muted-foreground" />
                       </div>
                       <div>
                         <p className="text-sm font-medium">david@illunex.com</p>
                         <p className="text-xs text-muted-foreground">Invited as Viewer • 2 days ago</p>
                       </div>
                     </div>
                     <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Revoke</Button>
                  </div>
                </CardContent>
              </Card>

              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/30 px-4 py-3 border-b border-border flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <div className="w-[40%]">User</div>
                  <div className="w-[30%]">Role</div>
                  <div className="w-[20%]">Status</div>
                  <div className="w-[10%]"></div>
                </div>
                
                <div className="divide-y divide-border">
                  {TEAM_MEMBERS.filter(m => m.status === 'Active').map((member) => (
                    <div key={member.id} className="px-4 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors">
                      <div className="w-[40%] flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={member.avatar || ""} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="w-[30%]">
                        <Badge variant="outline" className="font-normal">
                          {member.role}
                        </Badge>
                      </div>
                      <div className="w-[20%] flex items-center gap-2 text-xs text-green-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Active
                      </div>
                      <div className="w-[10%] flex justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Billing Section */}
          {activeTab === "billing" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h1 className="text-2xl font-bold mb-2">Billing & Plans</h1>
                <p className="text-muted-foreground">Manage your subscription and payment methods.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Current Plan */}
                <Card className="border-primary/50 bg-primary/5 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4">
                     <Badge className="bg-primary text-primary-foreground hover:bg-primary">Current Plan</Badge>
                   </div>
                   <CardHeader>
                     <CardTitle>Team Pro</CardTitle>
                     <CardDescription>Perfect for growing teams</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4">
                     <div className="text-3xl font-bold">$29<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                     <ul className="space-y-2 text-sm">
                       <li className="flex items-center gap-2">
                         <Check className="w-4 h-4 text-primary" /> Unlimited Projects
                       </li>
                       <li className="flex items-center gap-2">
                         <Check className="w-4 h-4 text-primary" /> Up to 10 Team Members
                       </li>
                       <li className="flex items-center gap-2">
                         <Check className="w-4 h-4 text-primary" /> Advanced Analytics
                       </li>
                       <li className="flex items-center gap-2">
                         <Check className="w-4 h-4 text-primary" /> Priority Support
                       </li>
                     </ul>
                   </CardContent>
                   <CardFooter>
                     <Button className="w-full">Manage Subscription</Button>
                   </CardFooter>
                </Card>

                {/* Upgrade Option */}
                <Card>
                   <CardHeader>
                     <CardTitle>Enterprise</CardTitle>
                     <CardDescription>For large organizations</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4">
                     <div className="text-3xl font-bold">$99<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                     <ul className="space-y-2 text-sm text-muted-foreground">
                       <li className="flex items-center gap-2">
                         <Check className="w-4 h-4" /> Unlimited Team Members
                       </li>
                       <li className="flex items-center gap-2">
                         <Check className="w-4 h-4" /> SSO & Advanced Security
                       </li>
                       <li className="flex items-center gap-2">
                         <Check className="w-4 h-4" /> Dedicated Success Manager
                       </li>
                       <li className="flex items-center gap-2">
                         <Check className="w-4 h-4" /> Custom Contracts
                       </li>
                     </ul>
                   </CardContent>
                   <CardFooter>
                     <Button variant="outline" className="w-full">Contact Sales</Button>
                   </CardFooter>
                </Card>
              </div>

              <div className="pt-8">
                <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
                <div className="border border-border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-muted rounded border border-border flex items-center justify-center">
                       <div className="w-6 h-4 bg-orange-500/20 rounded-sm" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Mastercard ending in 4242</p>
                      <p className="text-xs text-muted-foreground">Expires 12/28</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
                <Button variant="ghost" className="mt-2 text-primary pl-0 hover:bg-transparent hover:underline">
                  + Add payment method
                </Button>
              </div>
            </div>
          )}

          {/* Invoices Section */}
          {activeTab === "invoices" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h1 className="text-2xl font-bold mb-2">Invoices</h1>
                <p className="text-muted-foreground">View and download past invoices.</p>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/30 px-6 py-3 border-b border-border flex items-center text-xs font-medium text-muted-foreground">
                  <div className="w-[25%]">Date</div>
                  <div className="w-[25%]">Amount</div>
                  <div className="w-[25%]">Status</div>
                  <div className="w-[25%] text-right">Action</div>
                </div>
                
                {[
                  { date: "Dec 01, 2025", amount: "$29.00", status: "Paid" },
                  { date: "Nov 01, 2025", amount: "$29.00", status: "Paid" },
                  { date: "Oct 01, 2025", amount: "$29.00", status: "Paid" },
                  { date: "Sep 01, 2025", amount: "$29.00", status: "Paid" },
                ].map((invoice, i) => (
                  <div key={i} className="px-6 py-4 flex items-center border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <div className="w-[25%] text-sm">{invoice.date}</div>
                    <div className="w-[25%] text-sm font-medium">{invoice.amount}</div>
                    <div className="w-[25%]">
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 font-normal">
                        {invoice.status}
                      </Badge>
                    </div>
                    <div className="w-[25%] text-right">
                      <Button variant="ghost" size="sm" className="h-8">
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}