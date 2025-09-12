import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Code2,
  Braces,
  Minimize2,
  Maximize2,
  GitCompare,
  Shuffle,
  Hash,
  Key,
  Clock,
  Search,
  FileText,
  Globe,
  Settings,
  Zap
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const jsonTools = [
  { title: "JSON Beautify", url: "/json/beautify", icon: Code2 },
  { title: "JSON Minify", url: "/json/minify", icon: Minimize2 },
  { title: "JSON Escape", url: "/json/escape", icon: Hash },
  { title: "JSON Compare", url: "/json/compare", icon: GitCompare },
  { title: "JSON Generator", url: "/json/generator", icon: Shuffle },
  { title: "Flatten/Unflatten", url: "/json/flatten", icon: Maximize2 },
];

const utilities = [
  { title: "JWT Decoder", url: "/utils/jwt", icon: Key },
  { title: "Base64 Encode/Decode", url: "/utils/base64", icon: FileText },
  { title: "URL Encode/Decode", url: "/utils/url", icon: Globe },
  { title: "UUID Generator", url: "/utils/uuid", icon: Hash },
  { title: "Timestamp Converter", url: "/utils/timestamp", icon: Clock },
  { title: "Regex Tester", url: "/utils/regex", icon: Search },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isCollapsed = state === "collapsed";

  const getNavClassName = (active: boolean) =>
    active 
      ? "bg-primary/20 text-primary border-r-2 border-primary font-medium" 
      : "hover:bg-sidebar-accent/50 transition-smooth";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"}>
      <SidebarContent className="bg-sidebar">
        {/* Header */}
        <div className={`p-4 border-b border-sidebar-border ${isCollapsed ? 'px-2' : ''}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-semibold text-sidebar-foreground">DevTools</h1>
                <p className="text-xs text-sidebar-foreground/60">JSON & Utilities</p>
              </div>
            )}
          </div>
        </div>

        {/* JSON Tools */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80">
            {!isCollapsed && "JSON Tools"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {jsonTools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) => getNavClassName(isActive)}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && <span className="ml-2">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Other Utilities */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80">
            {!isCollapsed && "Utilities"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {utilities.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) => getNavClassName(isActive)}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && <span className="ml-2">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
