
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { ArrowDownUp } from "lucide-react";
import CadastroFormulas from "@/components/racao/CadastroFormulas";
import ProducaoRacao from "@/components/racao/ProducaoRacao";
import EstoqueRacao from "@/components/racao/EstoqueRacao";

const Racao = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Produção de Ração
            </h1>
            <p className="text-gray-600">
              Fórmulas, produção e controle de estoque de ração
            </p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowDownUp className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>

        <Tabs defaultValue="formulas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="formulas">Fórmulas de Ração</TabsTrigger>
            <TabsTrigger value="producao">Produção</TabsTrigger>
            <TabsTrigger value="estoque">Estoque de Ração</TabsTrigger>
          </TabsList>

          <TabsContent value="formulas">
            <CadastroFormulas />
          </TabsContent>

          <TabsContent value="producao">
            <ProducaoRacao />
          </TabsContent>

          <TabsContent value="estoque">
            <EstoqueRacao />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Racao;
