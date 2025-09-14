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
import { RGGenerator } from "@/components/generators/rg-generator";
import { CEPGenerator } from "@/components/generators/cep-generator";
import { RGValidator } from "@/components/validators/rg-validator";
import { UrlEncoder } from "@/components/utilities/url-encoder";
import { HashGenerator } from "@/components/utilities/hash-generator";
import { TimestampConverter } from "@/components/utilities/timestamp-converter";
import { CPFGenerator } from "@/components/generators/cpf-generator";
import { CNPJGenerator } from "@/components/generators/cnpj-generator";
import { PhoneGenerator } from "@/components/generators/phone-generator";
import { PasswordGenerator } from "@/components/generators/password-generator";
import { UUIDGenerator } from "@/components/generators/uuid-generator";
import { CPFValidator } from "@/components/validators/cpf-validator";
import { CNPJValidator } from "@/components/validators/cnpj-validator";
import { EmailValidator } from "@/components/validators/email-validator";
import { JWTDecoder } from "@/components/utilities/jwt-decoder";
import { Base64Converter } from "@/components/utilities/base64-converter";
import NotFound from "@/pages/NotFound";
import { History } from "@/components/history";

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
                  
                  {/* Generators */}
                  <Route path="/generators/cpf" element={<CPFGenerator />} />
                  <Route path="/generators/cnpj" element={<CNPJGenerator />} />
                  <Route path="/generators/phone" element={<PhoneGenerator />} />
                  <Route path="/generators/password" element={<PasswordGenerator />} />
                  <Route path="/generators/uuid" element={<UUIDGenerator />} />
                  <Route path="/generators/rg" element={<RGGenerator />} />
                  <Route path="/generators/cep" element={<CEPGenerator />} />
                  
                  {/* Validators */}
                  <Route path="/validators/cpf" element={<CPFValidator />} />
                  <Route path="/validators/cnpj" element={<CNPJValidator />} />
                  <Route path="/validators/email" element={<EmailValidator />} />
                  <Route path="/validators/rg" element={<RGValidator />} />
                  
                  {/* Utilities */}
                  <Route path="/utils/jwt" element={<JWTDecoder />} />
                  <Route path="/utils/base64" element={<Base64Converter />} />
                  <Route path="/utilities/url-encoder" element={<UrlEncoder />} />
                  <Route path="/utilities/hash-generator" element={<HashGenerator />} />
                  <Route path="/utilities/timestamp-converter" element={<TimestampConverter />} />
                  
                  {/* Productivity */}
                  <Route path="/history" element={<History />} />
                  
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
