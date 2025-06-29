
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Insumos from "./pages/Insumos";
import Racao from "./pages/Racao";
import Galpoes from "./pages/Galpoes";
import ProducaoOvos from "./pages/ProducaoOvos";
import Vendas from "./pages/Vendas";
import Despesas from "./pages/Despesas";
import ContasReceber from "./pages/ContasReceber";
import Relatorios from "./pages/Relatorios";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/insumos" element={<Insumos />} />
          <Route path="/racao" element={<Racao />} />
          <Route path="/galpoes" element={<Galpoes />} />
          <Route path="/ovos" element={<ProducaoOvos />} />
          <Route path="/vendas" element={<Vendas />} />
          <Route path="/despesas" element={<Despesas />} />
          <Route path="/contas-receber" element={<ContasReceber />} />
          <Route path="/relatorios" element={<Relatorios />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
