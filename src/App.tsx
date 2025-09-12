import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { JsonBeautify } from "@/components/json-beautify";
import { JsonMinify } from "@/components/json-minify";
import { JsonEscape } from "@/components/json-escape";
import { JsonGenerator } from "@/components/json-generator";
import { JsonCompare } from "@/components/json-compare";
import { JsonFlatten } from "@/components/json-flatten";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen w-full bg-background">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
                <SidebarTrigger className="lg:hidden" />
                <div className="hidden lg:block" />
                <div className="text-sm text-muted-foreground font-mono">
                  DevTools v1.0
                </div>
              </header>
              
              {/* Main Content */}
              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<JsonBeautify />} />
                  <Route path="/json/beautify" element={<JsonBeautify />} />
                  <Route path="/json/minify" element={<JsonMinify />} />
                  <Route path="/json/escape" element={<JsonEscape />} />
                  <Route path="/json/generator" element={<JsonGenerator />} />
                  <Route path="/json/compare" element={<JsonCompare />} />
                  <Route path="/json/flatten" element={<JsonFlatten />} />
                  {/* TODO: Add utility routes */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
