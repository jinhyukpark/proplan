import React, { useState } from "react";
import { Link } from "wouter";
import { 
  Search, 
  Plus, 
  Clock, 
  LayoutGrid, 
  List, 
  MoreHorizontal, 
  File, 
  Folder,
  ChevronDown,
  ChevronRight,
  PenTool,
  Settings,
  Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import thumbnailMobile from "@assets/generated_images/mobile_app_screens_flow_overview.png";
import thumbnailDark from "@assets/generated_images/dark_mode_analytics_dashboard_screens.png";
import thumbnailEcommerce from "@assets/generated_images/e-commerce_website_design_overview.png";
import thumbnailMedical from "@assets/generated_images/medical_software_interface_screens.png";

import avatar1 from "@assets/generated_images/professional_user_avatar_1.png";
import avatar2 from "@assets/generated_images/professional_user_avatar_2.png";
import avatar3 from "@assets/generated_images/professional_user_avatar_3.png";

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface Project {
  id: string;
  title: string;
  editedAt: string;
  thumbnail: string; // Now required and is a URL
  author: string;
  team: User[];
}

interface CategoryItem {
  id: string;
  name: string;
  type: 'folder' | 'project';
  children?: CategoryItem[];
}

const USERS: User[] = [
  { id: "u1", name: "Alex Designer", avatar: avatar1 },
  { id: "u2", name: "Sarah PM", avatar: avatar2 },
  { id: "u3", name: "Mike Dev", avatar: avatar3 },
];

const PROJECT_CATEGORIES: CategoryItem[] = [
  {
    id: 'c1',
    name: 'Marketing Sites',
    type: 'folder',
    children: [
      { id: 'p1', name: 'Illunex.com', type: 'project' },
      { id: 'p2', name: 'Landing Page v2', type: 'project' },
    ]
  },
  {
    id: 'c2',
    name: 'SaaS Products',
    type: 'folder',
    children: [
      { id: 'p3', name: 'EM-SaaS Platform', type: 'project' },
      { 
        id: 'c3', 
        name: 'Internal Tools', 
        type: 'folder',
        children: [
          { id: 'p4', name: 'Admin Dashboard', type: 'project' },
          { id: 'p5', name: 'Analytics', type: 'project' },
        ]
      },
    ]
  },
  {
    id: 'c4',
    name: 'Design Systems',
    type: 'folder',
    children: [
      { id: 'p6', name: 'Core UI Kit', type: 'project' },
    ]
  }
];

const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    title: "EM-SaaS",
    editedAt: "Edited 2 days ago",
    author: "Illunex",
    thumbnail: thumbnailDark,
    team: [USERS[0], USERS[1]]
  },
  {
    id: "2",
    title: "Stocklink",
    editedAt: "Edited 4 minutes ago",
    author: "Illunex",
    thumbnail: thumbnailMobile,
    team: [USERS[0], USERS[2], USERS[1]]
  },
  {
    id: "3",
    title: "Illunex (theme3)",
    editedAt: "Edited 1 month ago",
    author: "Illunex",
    thumbnail: thumbnailEcommerce,
    team: [USERS[1]]
  },
  {
    id: "4",
    title: "National Metal Info",
    editedAt: "Edited 7 months ago",
    author: "Illunex",
    thumbnail: thumbnailMedical,
    team: [USERS[0], USERS[1], USERS[2]]
  },
  {
    id: "5",
    title: "KETI Research",
    editedAt: "Edited 1 month ago",
    author: "Illunex",
    thumbnail: thumbnailMobile,
    team: [USERS[0], USERS[1], USERS[2], USERS[0]] // Test overflow
  },
  {
    id: "6",
    title: "KITECH",
    editedAt: "Edited 20 days ago",
    author: "Illunex",
    thumbnail: thumbnailEcommerce,
    team: [USERS[2], USERS[0]]
  },
  {
    id: "7",
    title: "EM-GPT (2025)",
    editedAt: "Edited 2 months ago",
    author: "Illunex",
    thumbnail: thumbnailDark,
    team: [USERS[0]]
  },
  {
    id: "8",
    title: "Tech Storm Admin",
    editedAt: "Edited 9 months ago",
    author: "Illunex",
    thumbnail: thumbnailMedical,
    team: [USERS[1], USERS[2]]
  },
];

export default function ProjectList() {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'c1': true,
    'c2': true,
    'c3': false,
    'c4': false
  });

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderTree = (items: CategoryItem[], level = 0) => {
    return items.map(item => (
      <div key={item.id} className="w-full">
        {item.type === 'folder' ? (
          <div>
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start gap-2 font-medium text-muted-foreground hover:text-foreground h-8 px-2",
                level > 0 && "pl-4"
              )}
              onClick={() => toggleCategory(item.id)}
              style={{ paddingLeft: `${(level * 12) + 8}px` }}
            >
              {expandedCategories[item.id] ? (
                <ChevronDown className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              )}
              <span className="truncate">{item.name}</span>
            </Button>
            {expandedCategories[item.id] && item.children && (
              <div className="flex flex-col">
                {renderTree(item.children, level + 1)}
              </div>
            )}
          </div>
        ) : (
          <Link href="/planner">
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start gap-2 font-normal text-muted-foreground/80 hover:text-foreground h-8 px-2",
              )}
              style={{ paddingLeft: `${(level * 12) + 24}px` }}
            >
              <Hash className="w-3 h-3 shrink-0 opacity-50" />
              <span className="truncate">{item.name}</span>
            </Button>
          </Link>
        )}
      </div>
    ));
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-60 border-r border-border flex flex-col shrink-0">
        <div className="p-4 h-14 flex items-center border-b border-border/40">
           <div className="font-bold text-lg tracking-tight flex items-center gap-2">
             <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground text-xs">P</div>
             Planner
           </div>
        </div>
        
        <div className="p-3 space-y-1">
          <Button variant="ghost" className="w-full justify-start gap-2 font-medium bg-muted/50">
            <Clock className="w-4 h-4" />
            Recents
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 font-medium text-muted-foreground">
            <File className="w-4 h-4" />
            Drafts
          </Button>
        </div>

        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mt-2">
          Project Files
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 pb-2">
           {renderTree(PROJECT_CATEGORIES)}
        </div>

        <div className="mt-auto p-4 border-t border-border">
           <div className="text-xs font-medium text-muted-foreground mb-2">Team</div>
           <Link href="/team-settings">
             <div className="flex items-center gap-2 text-sm font-medium p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors group">
               <div className="w-6 h-6 rounded bg-indigo-500 text-white flex items-center justify-center text-[10px] group-hover:scale-110 transition-transform">I</div>
               Illunex Team
               <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                 <Settings className="w-3 h-3 text-muted-foreground" />
               </div>
             </div>
           </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-16 border-b border-border flex items-center px-6 gap-4">
           <div className="flex-1 flex justify-center max-w-3xl mx-auto">
             <div className="relative w-full">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
               <Input 
                 className="pl-10 h-10 bg-muted/50 border-transparent focus:bg-background focus:border-primary/20 focus:shadow-sm transition-all rounded-full" 
                 placeholder="Search projects..." 
               />
             </div>
           </div>
           
           <div className="flex items-center gap-2 shrink-0">
             <div className="hidden md:flex items-center gap-2 mr-2">
                <span className="text-xs text-muted-foreground">Plan:</span>
                <Badge variant="secondary" className="font-normal bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                  Team License
                </Badge>
             </div>
             <div className="w-px h-6 bg-border mx-1 hidden md:block" />
             <Button variant="outline" size="icon">
                <LayoutGrid className="w-4 h-4" />
             </Button>
             <Button variant="outline" size="icon">
                <List className="w-4 h-4" />
             </Button>
             <div className="w-px h-6 bg-border mx-1" />
             <Button>
               <Plus className="w-4 h-4 mr-2" />
               New Project
             </Button>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-muted/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recently viewed</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground text-xs gap-1">
              Last viewed <ChevronDown className="w-3 h-3" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {MOCK_PROJECTS.map((project) => (
              <Link key={project.id} href="/planner">
                <div className="group cursor-pointer flex flex-col bg-card rounded-xl border border-border/60 hover:shadow-lg hover:border-primary/20 transition-all overflow-hidden">
                  {/* Thumbnail Card Area */}
                  <div className="aspect-[16/10] relative overflow-hidden border-b border-border/40">
                     <img 
                       src={project.thumbnail} 
                       alt={project.title}
                       className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                     />
                  </div>

                  {/* Info Section */}
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Project Icon */}
                      <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <PenTool className="w-5 h-5" />
                      </div>
                      
                      <div className="flex flex-col min-w-0">
                        <h3 className="font-semibold text-sm truncate leading-tight mb-0.5 group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          {project.editedAt}
                        </p>
                      </div>
                    </div>
                    
                    {/* Team Avatars & Menu */}
                    <div className="flex items-center gap-2 shrink-0">
                       <div className="flex -space-x-2">
                          {project.team.slice(0, 3).map((user, i) => (
                            <Avatar key={`${project.id}-user-${i}`} className="w-8 h-8 border-2 border-card ring-1 ring-border/10">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="text-[10px] bg-muted">{user.name[0]}</AvatarFallback>
                            </Avatar>
                          ))}
                          {project.team.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-medium text-muted-foreground ring-1 ring-border/10">
                              +{project.team.length - 3}
                            </div>
                          )}
                       </div>
                       
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Open</DropdownMenuItem>
                          <DropdownMenuItem>Rename</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
