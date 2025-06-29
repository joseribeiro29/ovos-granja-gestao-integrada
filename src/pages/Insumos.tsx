
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { ArrowDownUp, PlusIcon } from "lucide-react";
import CadastroInsumos from "@/components/insumos/CadastroInsumos";
import ComprasInsumos from "@/components/insumos/ComprasInsumos";
import EstoqueInsumos from "@/components/insumos/EstoqueInsumos";

const Insumos = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestão de Insumos
            </h1>
            <p className="text-gray-600">
              Controle completo de insumos, compras e estoque
            </p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowDownUp className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>

        <Tabs defaultValue="cadastro" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cadastro">Cadastro de Insumos</TabsTrigger>
            <TabsTrigger value="compras">Compras</TabsTrigger>
            <TabsTrigger value="estoque">Controle de Estoque</TabsTrigger>
          </TabsList>

          <TabsContent value="cadastro">
            <CadastroInsumos />
          </TabsContent>

          <TabsContent value="compras">
            <ComprasInsumos />
          </TabsContent>

          <TabsContent value="estoque">
            <EstoqueInsumos />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Insumos;
