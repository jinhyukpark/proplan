import React from "react";
import { Link, useLocation } from "wouter";
import { 
  ArrowRight, 
  MousePointer2, 
  Layout, 
  MessageSquare, 
  Zap, 
  Globe, 
  Users, 
  CheckCircle2,
  Menu,
  Sparkles,
  Search,
  PenTool,
  Share2,
  Shield,
  CreditCard,
  Building2,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Images
import workflowStep1 from "@assets/generated_images/workflow_step_1__connect_url.png";
import workflowStep2 from "@assets/generated_images/workflow_step_2__annotate_interface.png";
import workflowStep3 from "@assets/generated_images/workflow_step_3__team_collaboration.png";
import avatar1 from "@assets/generated_images/professional_user_avatar_1.png";
import avatar2 from "@assets/generated_images/professional_user_avatar_2.png";
import avatar3 from "@assets/generated_images/professional_user_avatar_3.png";
import logoImage from "@assets/generated_images/minimalist_geometric_logo_for_proplan.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function LandingPage() {
  const [_, setLocation] = useLocation();

  const handleNavigate = () => {
    setLocation("/projects");
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <img src={logoImage} alt="ProPlan Logo" className="w-8 h-8 rounded-lg" />
              <span>ProPlan</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden sm:flex" onClick={handleNavigate}>Log In</Button>
            <Button onClick={handleNavigate}>Get Started</Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center mb-16 relative z-10">
            <Badge variant="outline" className="mb-4 py-1.5 px-4 text-sm border-primary/20 bg-primary/5 text-primary rounded-full">
              <Sparkles className="w-3.5 h-3.5 mr-2 inline-block" />
              New: AI-Powered Specs
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              Where teams <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-blue-600 animate-gradient">
                design & plan together
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              ProPlan is the collaborative workspace where product teams annotate, plan, and specify web projects before writing a single line of code.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-base rounded-full group shadow-lg shadow-primary/20" onClick={handleNavigate}>
                Start Designing Free
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base rounded-full">
                View Demo
              </Button>
            </div>
          </div>

          {/* Abstract Visual / Mockup */}
          <div className="relative mx-auto max-w-5xl mt-12 perspective-[2000px]">
            <div className="relative rounded-xl border border-border/50 bg-background/50 shadow-2xl overflow-hidden aspect-[16/9] transform rotate-x-12 hover:rotate-x-0 transition-transform duration-700 ease-out group">
              {/* Mock Browser Interface */}
              <div className="absolute inset-0 flex flex-col">
                <div className="h-10 border-b border-border/50 bg-muted/20 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  </div>
                  <div className="mx-auto w-1/3 h-6 rounded bg-muted/30" />
                </div>
                <div className="flex-1 bg-zinc-900/5 relative overflow-hidden flex">
                   {/* Left Sidebar Mock */}
                   <div className="w-64 border-r border-border/30 bg-background/40 hidden md:block p-4 space-y-4">
                      <div className="h-4 w-24 bg-muted/30 rounded" />
                      <div className="space-y-2">
                        <div className="h-8 w-full bg-primary/10 rounded" />
                        <div className="h-8 w-full bg-muted/20 rounded" />
                        <div className="h-8 w-full bg-muted/20 rounded" />
                      </div>
                   </div>
                   {/* Canvas Mock */}
                   <div className="flex-1 p-8 flex items-center justify-center relative">
                      {/* Floating Cursors */}
                      <div className="absolute top-1/4 left-1/4 animate-float-slow z-20">
                        <div className="flex flex-col items-start">
                           <MousePointer2 className="w-5 h-5 text-blue-500 fill-blue-500" />
                           <div className="px-2 py-1 bg-blue-500 text-white text-[10px] rounded-r rounded-bl font-medium mt-1 shadow-md">
                             Alex
                           </div>
                        </div>
                      </div>
                      <div className="absolute bottom-1/3 right-1/4 animate-float-delayed z-20">
                        <div className="flex flex-col items-start">
                           <MousePointer2 className="w-5 h-5 text-amber-500 fill-amber-500" />
                           <div className="px-2 py-1 bg-amber-500 text-white text-[10px] rounded-r rounded-bl font-medium mt-1 shadow-md">
                             Sarah
                           </div>
                        </div>
                      </div>
                      
                      <div className="w-full max-w-lg aspect-video bg-background shadow-lg rounded-lg border border-border/40 p-6 space-y-4 group-hover:scale-[1.02] transition-transform duration-500">
                        <div className="h-8 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded" />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded" />
                          <div className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded" />
                        </div>
                      </div>
                   </div>
                   {/* Right Panel Mock */}
                   <div className="w-72 border-l border-border/30 bg-background/40 hidden lg:block p-4">
                      <div className="h-4 w-32 bg-muted/30 rounded mb-4" />
                      <div className="space-y-3">
                        <div className="p-3 bg-white dark:bg-zinc-900 rounded border border-border/30 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">A</div>
                            <span className="text-xs font-medium">Alex commented</span>
                          </div>
                          <div className="h-2 w-full bg-muted/30 rounded mb-1" />
                          <div className="h-2 w-2/3 bg-muted/30 rounded" />
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
            {/* Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-3xl -z-10 opacity-50" />
          </div>
        </div>
      </section>

      {/* Partners / Social Proof */}
      <section className="py-16 border-y border-border/40 bg-muted/10">
        <div className="container mx-auto px-6">
           <p className="text-center text-sm font-semibold text-muted-foreground mb-10 tracking-wider">TRUSTED BY INNOVATIVE TEAMS WORLDWIDE</p>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex justify-center"><Building2 className="w-8 h-8 mr-2" /><span className="text-xl font-bold">Acme Inc</span></div>
             <div className="flex justify-center"><Globe className="w-8 h-8 mr-2" /><span className="text-xl font-bold">Global</span></div>
             <div className="flex justify-center"><Zap className="w-8 h-8 mr-2" /><span className="text-xl font-bold">Bolt</span></div>
             <div className="flex justify-center"><Layout className="w-8 h-8 mr-2" /><span className="text-xl font-bold">Layer</span></div>
             <div className="flex justify-center"><Users className="w-8 h-8 mr-2" /><span className="text-xl font-bold">Unity</span></div>
           </div>
        </div>
      </section>

      {/* How it Works / Workflow */}
      <section id="how-it-works" className="py-32 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">From idea to implementation</h2>
            <p className="text-xl text-muted-foreground">
              A seamless workflow designed for modern product teams. Stop juggling multiple tools and bring everyone to the same page.
            </p>
          </div>

          <div className="space-y-32">
            {/* Step 1 */}
            <div className="grid md:grid-cols-2 gap-16 items-center">
               <div className="order-2 md:order-1">
                 <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 group">
                   <img src={workflowStep1} alt="Connect URL" className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700" />
                   <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
                 </div>
               </div>
               <div className="order-1 md:order-2 space-y-6">
                 <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mb-4">
                   <Search className="w-6 h-6" />
                 </div>
                 <h3 className="text-3xl font-bold">1. Connect any URL</h3>
                 <p className="text-lg text-muted-foreground leading-relaxed">
                   Simply enter a website URL or upload an image. ProPlan instantly creates a collaborative canvas over your live site or design mockup. No browser extensions required.
                 </p>
                 <ul className="space-y-3 text-muted-foreground">
                   <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Works with localhost</li>
                   <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Support for staging environments</li>
                   <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Instant image uploads</li>
                 </ul>
               </div>
            </div>

            {/* Step 2 */}
            <div className="grid md:grid-cols-2 gap-16 items-center">
               <div className="space-y-6">
                 <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center mb-4">
                   <PenTool className="w-6 h-6" />
                 </div>
                 <h3 className="text-3xl font-bold">2. Annotate & Specify</h3>
                 <p className="text-lg text-muted-foreground leading-relaxed">
                   Click anywhere to leave comments, add specs, or link pages. Create a visual sitemap automatically as you navigate and plan your project structure.
                 </p>
                 <ul className="space-y-3 text-muted-foreground">
                   <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Pin-point accuracy</li>
                   <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Rich text formatting</li>
                   <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Status tracking per item</li>
                 </ul>
               </div>
               <div>
                 <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 group">
                   <img src={workflowStep2} alt="Annotate Interface" className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700" />
                 </div>
               </div>
            </div>

            {/* Step 3 */}
            <div className="grid md:grid-cols-2 gap-16 items-center">
               <div className="order-2 md:order-1">
                 <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 group">
                   <img src={workflowStep3} alt="Team Collaboration" className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700" />
                 </div>
               </div>
               <div className="order-1 md:order-2 space-y-6">
                 <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 text-pink-600 flex items-center justify-center mb-4">
                   <Share2 className="w-6 h-6" />
                 </div>
                 <h3 className="text-3xl font-bold">3. Share & Collaborate</h3>
                 <p className="text-lg text-muted-foreground leading-relaxed">
                   Invite your team, stakeholders, or clients. See cursor movements in real-time, resolve comments, and move projects forward faster together.
                 </p>
                 <ul className="space-y-3 text-muted-foreground">
                   <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Real-time multiplayer</li>
                   <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Role-based permissions</li>
                   <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Shareable public links</li>
                 </ul>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Powerful features for pros</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to manage complex web projects without the chaos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Globe className="w-8 h-8 text-blue-500" />}
              title="Live URL Annotation"
              description="Overlay comments and specs directly on live websites. No more out-of-date screenshots."
            />
            <FeatureCard 
              icon={<MessageSquare className="w-8 h-8 text-green-500" />}
              title="Contextual Comments"
              description="Discuss design details right where they happen. Resolve threads and keep history."
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-amber-500" />}
              title="Interactive Prototypes"
              description="Link pages together to create navigational flows and user journeys instantly."
            />
            <FeatureCard 
              icon={<Layout className="w-8 h-8 text-purple-500" />}
              title="Visual Sitemaps"
              description="Automatically generate and organize sitemaps as you add pages to your project."
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8 text-pink-500" />}
              title="Team Collaboration"
              description="See who's viewing what in real-time. Work together seamlessly on the same canvas."
            />
            <FeatureCard 
              icon={<CheckCircle2 className="w-8 h-8 text-indigo-500" />}
              title="Spec Management"
              description="Track status of every element. From 'Draft' to 'Done', keep development in sync."
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-background border-t border-border/40">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Loved by product teams</h2>
            <p className="text-lg text-muted-foreground">
              See why leading designers and developers choose ProPlan for their web projects.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard 
              quote="ProPlan has completely transformed how we handle design handoffs. The visual sitemaps alone save us hours every week."
              author="Elena Rodriguez"
              role="Product Designer at CreativeLabs"
              avatar={avatar1}
            />
            <TestimonialCard 
              quote="Finally, a tool that lets me annotate live URLs properly. No more 'which version is this?' confusion in our Slack channels."
              author="Mark Thompson"
              role="Frontend Lead at TechStream"
              avatar={avatar2}
            />
            <TestimonialCard 
              quote="The ability to link pages and create quick flows directly on the canvas makes it so easy to explain user journeys to stakeholders."
              author="Sarah Chen"
              role="Product Manager at FlowSystems"
              avatar={avatar3}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-background">
         <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Simple, transparent pricing</h2>
              <p className="text-xl text-muted-foreground">
                Start for free, upgrade as your team grows. No hidden fees.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
               {/* Free Plan */}
               <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                 <CardHeader>
                   <CardTitle className="text-2xl">Starter</CardTitle>
                   <CardDescription>For individuals and hobbyists</CardDescription>
                   <div className="mt-4">
                     <span className="text-4xl font-bold">$0</span>
                     <span className="text-muted-foreground ml-2">/ month</span>
                   </div>
                 </CardHeader>
                 <CardContent>
                   <ul className="space-y-4 text-sm">
                     <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> 1 Project</li>
                     <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> Up to 3 pages per project</li>
                     <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> Basic annotations</li>
                     <li className="flex items-center gap-3 text-muted-foreground"><Shield className="w-4 h-4" /> Community Support</li>
                   </ul>
                 </CardContent>
                 <CardFooter>
                   <Button variant="outline" className="w-full" onClick={handleNavigate}>Get Started</Button>
                 </CardFooter>
               </Card>

               {/* Pro Plan */}
               <Card className="border-primary shadow-xl relative scale-105 bg-background z-10">
                 <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3">
                   <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white border-0 shadow-lg">Most Popular</Badge>
                 </div>
                 <CardHeader>
                   <CardTitle className="text-2xl">Team Pro</CardTitle>
                   <CardDescription>For growing product teams</CardDescription>
                   <div className="mt-4">
                     <span className="text-4xl font-bold">$29</span>
                     <span className="text-muted-foreground ml-2">/ month</span>
                   </div>
                 </CardHeader>
                 <CardContent>
                   <ul className="space-y-4 text-sm font-medium">
                     <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> Unlimited Projects</li>
                     <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> Unlimited Pages</li>
                     <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> Advanced Specs & History</li>
                     <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> Up to 10 Team Members</li>
                     <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> Priority Support</li>
                   </ul>
                 </CardContent>
                 <CardFooter>
                   <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleNavigate}>Start Free Trial</Button>
                 </CardFooter>
               </Card>

               {/* Enterprise Plan */}
               <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                 <CardHeader>
                   <CardTitle className="text-2xl">Enterprise</CardTitle>
                   <CardDescription>For large organizations</CardDescription>
                   <div className="mt-4">
                     <span className="text-4xl font-bold">Custom</span>
                   </div>
                 </CardHeader>
                 <CardContent>
                   <ul className="space-y-4 text-sm">
                     <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> Everything in Pro</li>
                     <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> SSO & SAML</li>
                     <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> Audit Logs</li>
                     <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> Dedicated Success Manager</li>
                     <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> Custom Contracts</li>
                   </ul>
                 </CardContent>
                 <CardFooter>
                   <Button variant="outline" className="w-full">Contact Sales</Button>
                 </CardFooter>
               </Card>
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground overflow-hidden relative">
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Ready to streamline your workflow?</h2>
          <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Join thousands of designers and developers building better web experiences with ProPlan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <Button size="lg" variant="secondary" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto" onClick={handleNavigate}>
               Get Started for Free
             </Button>
             <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto border-primary-foreground/20 hover:bg-primary-foreground/10 text-primary-foreground">
               Contact Sales
             </Button>
          </div>
        </div>
        
        {/* Background Decorative Circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 pt-20 pb-10 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-xl">
                <img src={logoImage} alt="ProPlan Logo" className="w-6 h-6 rounded" />
                <span>ProPlan</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The visual workspace for web planning and collaboration.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground">Enterprise</a></li>
                <li><a href="#" className="hover:text-foreground">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground">Community</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Careers</a></li>
                <li><a href="#" className="hover:text-foreground">Legal</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/50 text-sm text-muted-foreground">
            <p>&copy; 2024 ProPlan Inc. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
               <a href="#" className="hover:text-foreground">Twitter</a>
               <a href="#" className="hover:text-foreground">LinkedIn</a>
               <a href="#" className="hover:text-foreground">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl border border-border/50 bg-card hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function TestimonialCard({ quote, author, role, avatar }: { quote: string, author: string, role: string, avatar: string }) {
  return (
    <div className="p-8 rounded-2xl bg-muted/20 border border-border/40 flex flex-col h-full">
      <div className="mb-6 text-primary">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="opacity-40">
          <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.01697 21L5.01697 18C5.01697 16.8954 5.9124 16 7.01697 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H6.01697C5.46468 8 5.01697 8.44772 5.01697 9V11C5.01697 11.5523 4.56925 12 4.01697 12H3.01697V5H13.017V15C13.017 18.3137 10.3307 21 7.01697 21H5.01697Z" />
        </svg>
      </div>
      <p className="text-lg font-medium leading-relaxed mb-8 flex-1">"{quote}"</p>
      <div className="flex items-center gap-4 mt-auto">
        <Avatar className="w-12 h-12 border border-border">
          <AvatarImage src={avatar} alt={author} />
          <AvatarFallback>{author[0]}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-bold text-sm">{author}</div>
          <div className="text-xs text-muted-foreground">{role}</div>
        </div>
      </div>
    </div>
  );
}
