import React, { useState, useRef } from "react";
import { 
  Users, 
  FileText, 
  Image as ImageIcon, 
  AlertCircle, 
  Layers, 
  Calendar,
  Activity,
  ArrowRight,
  Play,
  Presentation,
  Clock,
  Edit3,
  History
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface ProjectStats {
  totalPages: number;
  totalFlows: number;
  totalPresentations: number;
  totalAssets: number;
  totalIssues: number;
  resolvedIssues: number;
}

interface RecentActivity {
  id: string;
  user: TeamMember;
  action: string;
  target: string;
  time: string;
}

interface FlowItem {
  id: string;
  name: string;
  description?: string;
}

interface PresentationItem {
  id: string;
  name: string;
  slideCount?: number;
}

interface ChangeLogItem {
  id: string;
  user: TeamMember;
  action: string;
  target: string;
  time: string;
  details?: string;
}

interface ProjectDashboardProps {
  projectName: string;
  projectDescription?: string;
  featuredImage?: string;
  teamMembers: TeamMember[];
  stats: ProjectStats;
  recentActivities: RecentActivity[];
  flows: FlowItem[];
  presentations: PresentationItem[];
  projectStartDate?: string;
  lastModifiedDate?: string;
  changeLogs?: ChangeLogItem[];
  onNavigateToItem: (type: string, id?: string) => void;
  onChangeFeaturedImage?: (imageUrl: string) => void;
}

export function ProjectDashboard({
  projectName,
  projectDescription,
  featuredImage,
  teamMembers,
  stats,
  recentActivities,
  flows,
  presentations,
  projectStartDate,
  lastModifiedDate,
  changeLogs = [],
  onNavigateToItem,
  onChangeFeaturedImage
}: ProjectDashboardProps) {
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onChangeFeaturedImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChangeFeaturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full overflow-auto bg-white dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto px-8 pt-8">
        <div 
          className="relative rounded-xl overflow-hidden mb-6 group cursor-pointer"
          onMouseEnter={() => setIsHoveringImage(true)}
          onMouseLeave={() => setIsHoveringImage(false)}
          onClick={handleImageClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          {featuredImage ? (
            <div className="h-48 w-full overflow-hidden rounded-xl">
              <img 
                src={featuredImage} 
                alt="" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="h-36 w-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl" />
          )}
          <div className={cn(
            "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 rounded-xl",
            isHoveringImage ? "opacity-100" : "opacity-0"
          )}>
            <div className="flex items-center gap-2 text-white">
              <Edit3 className="h-5 w-5" />
              <span className="font-medium">Change Cover Image</span>
            </div>
          </div>
        </div>

        <div className="flex items-end gap-4 mb-6">
          <div className="flex -space-x-2">
            {teamMembers.slice(0, 4).map((member) => (
              <Avatar key={member.id} className="w-10 h-10 border-2 border-white dark:border-neutral-950">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className="bg-violet-100 text-violet-700 text-sm">
                  {member.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ))}
            {teamMembers.length > 4 && (
              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-medium border-2 border-white dark:border-neutral-950">
                +{teamMembers.length - 4}
              </div>
            )}
          </div>
          <span className="text-sm text-muted-foreground pb-1">
            {teamMembers.length} members
          </span>
        </div>

        <h1 className="text-4xl font-bold mb-3">{projectName}</h1>
        {projectDescription && (
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl">{projectDescription}</p>
        )}

        <div className="flex items-center gap-6 mb-8 text-sm text-muted-foreground">
          {projectStartDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Started: {projectStartDate}</span>
            </div>
          )}
          {lastModifiedDate && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Last modified: {lastModifiedDate}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-5 gap-3 mb-10">
          <button
            onClick={() => onNavigateToItem('page')}
            className="group p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all text-left"
          >
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold">{stats.totalPages}</span>
            </div>
            <span className="text-xs text-muted-foreground">Pages</span>
          </button>
          <button
            onClick={() => onNavigateToItem('flow')}
            className="group p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all text-left"
          >
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <span className="text-2xl font-bold">{stats.totalFlows}</span>
            </div>
            <span className="text-xs text-muted-foreground">Flows</span>
          </button>
          <button
            onClick={() => onNavigateToItem('ppt')}
            className="group p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all text-left"
          >
            <div className="flex items-center gap-2 mb-2">
              <Layers className="h-4 w-4 text-orange-600" />
              <span className="text-2xl font-bold">{stats.totalPresentations}</span>
            </div>
            <span className="text-xs text-muted-foreground">Presentations</span>
          </button>
          <button
            onClick={() => onNavigateToItem('image')}
            className="group p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all text-left"
          >
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold">{stats.totalAssets}</span>
            </div>
            <span className="text-xs text-muted-foreground">Assets</span>
          </button>
          <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 text-left">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className={cn("h-4 w-4", stats.resolvedIssues === stats.totalIssues ? "text-green-600" : "text-amber-600")} />
              <span className="text-2xl font-bold">{stats.resolvedIssues}/{stats.totalIssues}</span>
            </div>
            <span className="text-xs text-muted-foreground">Issues</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 border-t border-neutral-200 dark:border-neutral-800 pt-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-semibold">User Flows</h2>
            </div>
            {flows.length > 0 ? (
              <div className="space-y-2">
                {flows.map((flow) => (
                  <button
                    key={flow.id}
                    onClick={() => onNavigateToItem('flow', flow.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors group text-left"
                  >
                    <div className="w-8 h-8 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Play className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{flow.name}</div>
                      {flow.description && (
                        <div className="text-sm text-muted-foreground">{flow.description}</div>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-4">No flows created yet</div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Presentation className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-semibold">Presentations</h2>
            </div>
            {presentations.length > 0 ? (
              <div className="space-y-2">
                {presentations.map((ppt) => (
                  <button
                    key={ppt.id}
                    onClick={() => onNavigateToItem('ppt', ppt.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors group text-left"
                  >
                    <div className="w-8 h-8 rounded bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <Layers className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{ppt.name}</div>
                      {ppt.slideCount !== undefined && (
                        <div className="text-sm text-muted-foreground">{ppt.slideCount} slides</div>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-4">No presentations created yet</div>
            )}
          </div>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-8 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-cyan-600" />
            <h2 className="text-lg font-semibold">Change History</h2>
          </div>
          {changeLogs.length > 0 ? (
            <div className="space-y-3">
              {changeLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={log.user.avatar} alt={log.user.name} />
                    <AvatarFallback className="text-xs">
                      {log.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{log.user.name}</span>
                      <span className="text-muted-foreground"> {log.action} </span>
                      <span className="font-medium">{log.target}</span>
                    </p>
                    {log.details && (
                      <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-4">No changes recorded yet</div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-8 pb-12">
          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-8">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Recent Activity</h2>
            </div>
            {recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                      <AvatarFallback className="text-xs">
                        {activity.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user.name}</span>
                        <span className="text-muted-foreground"> {activity.action} </span>
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-4">No recent activity</div>
            )}
          </div>

          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-8">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Team</h2>
            </div>
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="text-sm">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    {member.role && (
                      <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
