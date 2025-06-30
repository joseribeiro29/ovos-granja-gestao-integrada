
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface EstoqueItem {
  insumo: string;
  entradas: number;
  saidas: number;
  estoqueAtual: number;
  valorMedioKg: number;
  custoEstoque: number;
  estoqueMinimo: number;
  unidadeCompra: string;
  fatorConversao: number;
}

interface Insumo {
  id: string;
  nome: string;
  unidade: string;
  fatorConversaoKg: number;
  estoqueMinimo: number;
}

const EstoqueInsumos = () => {
  const [estoque, setEstoque] = useState<EstoqueItem[]>([]);

  useEffect(() => {
    const carregarEstoque = () => {
      console.log('=== CARREGANDO ESTOQUE DE INSUMOS ===');
      
      // Buscar insumos cadastrados
      const savedInsumos = localStorage.getItem('insumos');
      const insumos: Insumo[] = savedInsumos ? JSON.parse(savedInsumos) : [];
      
      // Buscar dados de estoque
      const savedEstoque = localStorage.getItem('estoqueInsumos');
      const dadosEstoque = savedEstoque ? JSON.parse(savedEstoque) : {};
      
      console.log('Insumos cadastrados:', insumos.length);
      console.log('Dados de estoque:', dadosEstoque);
      
      // Construir lista de estoque
      const estoqueAtualizado: EstoqueItem[] = insumos.map(insumo => {
        const dadosInsumo = dadosEstoque[insumo.nome] || {
          entradas: 0,
          saidas: 0,
          estoqueAtual: 0,
          valorMedioKg: 0
        };
        
        const custoEstoque = dadosInsumo.estoqueAtual * dadosInsumo.valorMedioKg;
        
        console.log(`Processando ${insumo.nome}:`, {
          entradas: dadosInsumo.entradas,
          saidas: dadosInsumo.saidas,
          estoqueAtual: dadosInsumo.estoqueAtual,
          valorMedioKg: dadosInsumo.valorMedioKg,
          custoEstoque
        });
        
        return {
          insumo: insumo.nome,
          entradas: dadosInsumo.entradas || 0,
          saidas: dadosInsumo.saidas || 0,
          estoqueAtual: dadosInsumo.estoqueAtual || 0,
          valorMedioKg: dadosInsumo.valorMedioKg || 0,
          custoEstoque: custoEstoque,
          estoqueMinimo: insumo.estoqueMinimo || 0,
          unidadeCompra: insumo.unidade,
          fatorConversao: insumo.fatorConversaoKg
        };
      });
      
      console.log('Estoque final montado:', estoqueAtualizado);
      setEstoque(estoqueAtualizado);
    };

    carregarEstoque();
    
    // Recarregar estoque quando dados mudarem
    const interval = setInterval(carregarEstoque, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (atual: number, minimo: number) => {
    if (atual <= minimo) {
      return <Badge variant="destructive">Crítico</Badge>;
    } else if (atual <= minimo * 1.5) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Baixo</Badge>;
    } else {
      return <Badge className="bg-green-500 hover:bg-green-600">Normal</Badge>;
    }
  };

  const valorTotalEstoque = estoque.reduce((total, item) => total + item.custoEstoque, 0);
  const alertasEstoque = estoque.filter(item => item.estoqueAtual <= item.estoqueMinimo).length;
  const totalKg = estoque.reduce((total, item) => total + item.estoqueAtual, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Total do Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {valorTotalEstoque.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Itens em Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estoque.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total em KG</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalKg.toFixed(0)} KG
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alertas de Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {alertasEstoque}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Controle de Estoque (Padronizado em KG)</CardTitle>
        </CardHeader>
        <CardContent>
          {estoque.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum insumo cadastrado ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Insumo</TableHead>
                  <TableHead>Entradas (KG)</TableHead>
                  <TableHead>Saídas (KG)</TableHead>
                  <TableHead>Estoque Atual (KG)</TableHead>
                  <TableHead>Equivale a</TableHead>
                  <TableHead>Valor Médio/KG</TableHead>
                  <TableHead>Custo do Estoque</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estoque.map((item) => (
                  <TableRow key={item.insumo}>
                    <TableCell className="font-medium">{item.insumo}</TableCell>
                    <TableCell className="text-green-600 font-medium">{item.entradas.toFixed(1)} KG</TableCell>
                    <TableCell className="text-red-600">{item.saidas.toFixed(1)} KG</TableCell>
                    <TableCell className="font-bold text-blue-600">
                      {item.estoqueAtual.toFixed(1)} KG
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {(item.estoqueAtual / item.fatorConversao).toFixed(1)} {item.unidadeCompra}
                    </TableCell>
                    <TableCell>R$ {item.valorMedioKg.toFixed(2)}</TableCell>
                    <TableCell className="font-medium">R$ {item.custoEstoque.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(item.estoqueAtual, item.estoqueMinimo)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EstoqueInsumos;
