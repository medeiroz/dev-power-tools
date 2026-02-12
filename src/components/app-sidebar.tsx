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
  Zap,
  Shield,
  User,
  Building,
  MapPin,
  Phone,
  CreditCard,
  IdCard,
  Car,
  Lock,
  Calculator,
  Archive,
  FileType,
  History,
  Type,
  TestTube,
  Code,
  Briefcase
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
  { title: "JSON Escape/Unescape", url: "/json/escape", icon: Hash },
  { title: "JSON Compare", url: "/json/compare", icon: GitCompare },
  { title: "JSON Generator", url: "/json/generator", icon: Shuffle },
  { title: "Flatten/Unflatten", url: "/json/flatten", icon: Maximize2 },
];

const generators = [
  { title: "CPF Generator", url: "/generators/cpf", icon: User },
  { title: "CNPJ Generator", url: "/generators/cnpj", icon: Building },
  { title: "RG Generator", url: "/generators/rg", icon: IdCard },
  { title: "CEP Generator", url: "/generators/cep", icon: MapPin },
  { title: "Phone Generator", url: "/generators/phone", icon: Phone },
  { title: "Credit Card Generator", url: "/generators/credit-card", icon: CreditCard },
];

const validators = [
  { title: "CPF Validator", url: "/validators/cpf", icon: Shield },
  { title: "CNPJ Validator", url: "/validators/cnpj", icon: Shield },
  { title: "CEP Validator", url: "/validators/cep", icon: Shield },
  { title: "Phone Validator", url: "/validators/phone", icon: Shield },
  { title: "Email Validator", url: "/validators/email", icon: Shield },
  { title: "Credit Card Validator", url: "/validators/creditcard", icon: CreditCard },
  { title: "License Plate", url: "/validators/plate", icon: Shield },
];

const utilities = [
  { title: "JWT Decoder", url: "/utils/jwt", icon: Key },
  { title: "Base64 Encode/Decode", url: "/utils/base64", icon: FileType },
  { title: "URL Encode/Decode", url: "/utils/url", icon: Globe },
  { title: "Hash Generator", url: "/utils/hash", icon: Hash },
  { title: "Timestamp Converter", url: "/utils/timestamp", icon: Clock },
  { title: "Regex Tester", url: "/utils/regex", icon: Search },
  { title: "Diff Tool", url: "/utils/diff", icon: GitCompare },
  { title: "Lorem Ipsum", url: "/utils/lorem", icon: Type },
  { title: "Markdown Editor", url: "/utils/markdown", icon: FileType },
];

const productivity = [
  { title: "History", url: "/history", icon: History },
  { title: "Snippet Library", url: "/snippets", icon: Code },
  { title: "Regex Library", url: "/regex-library", icon: Archive },
  { title: "Currency Converter", url: "/currency", icon: Calculator },
  { title: "DDD Lookup", url: "/ddd", icon: Phone },
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

        {/* Developer Utilities */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80">
            {!isCollapsed && "Dev Utilities"}
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

        {/* Generators */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80">
            {!isCollapsed && "Generators"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {generators.map((item) => (
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

        {/* Validators */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80">
            {!isCollapsed && "Validators"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {validators.map((item) => (
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

        {/* Productivity */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80">
            {!isCollapsed && "Productivity"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {productivity.map((item) => (
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
