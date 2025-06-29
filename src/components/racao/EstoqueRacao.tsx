
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EstoqueRacao = () => {
  const [estoqueRacao, setEstoqueRacao] = useState({ quantidade: 0 });

  useEffect(() => {
    const savedEstoque = localStorage.getItem('estoqueRacao');
    if (savedEstoque) {
      setEstoqueRacao(JSON.parse(savedEstoque));
    }
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Estoque Central de Ração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {estoqueRacao.quantidade.toLocaleString()} kg
            </div>
            <div className="text-gray-600">
              Ração disponível no estoque
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EstoqueRacao;
