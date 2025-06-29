
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface EstoqueItem {
  insumo: string;
  entradasKg: number;
  saidasKg: number;
  estoqueAtualKg: number;
  valorMedioKg: number;
  custoEstoque: number;
  estoqueMinimo: number;
  unidadeCompra: string;
  fatorConversao: number;
}

const EstoqueInsumos = () => {
  // Mock data - em um sistema real, isso seria calculado automaticamente
  const estoque: EstoqueItem[] = [
    {
      insumo: 'Milho',
      entradasKg: 1000,
      saidasKg: 200,
      estoqueAtualKg: 800,
      valorMedioKg: 1.30,
      custoEstoque: 1040,
      estoqueMinimo: 100,
      unidadeCompra: 'Saco',
      fatorConversao: 50
    },
    {
      insumo: 'Soja',
      entradasKg: 500,
      saidasKg: 100,
      estoqueAtualKg: 400,
      valorMedioKg: 2.80,
      custoEstoque: 1120,
      estoqueMinimo: 50,
      unidadeCompra: 'Saco',
      fatorConversao: 50
    },
    {
      insumo: 'Farelo de Trigo',
      entradasKg: 240,
      saidasKg: 220,
      estoqueAtualKg: 20,
      valorMedioKg: 1.20,
      custoEstoque: 24,
      estoqueMinimo: 100,
      unidadeCompra: 'Saco',
      fatorConversao: 40
    }
  ];

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
  const alertasEstoque = estoque.filter(item => item.estoqueAtualKg <= item.estoqueMinimo).length;

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
              {estoque.reduce((total, item) => total + item.estoqueAtualKg, 0).toFixed(0)} KG
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
              Nenhum item em estoque.
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
                    <TableCell>{item.entradasKg.toFixed(1)} KG</TableCell>
                    <TableCell>{item.saidasKg.toFixed(1)} KG</TableCell>
                    <TableCell className="font-medium text-green-600">
                      {item.estoqueAtualKg.toFixed(1)} KG
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {(item.estoqueAtualKg / item.fatorConversao).toFixed(1)} {item.unidadeCompra}
                    </TableCell>
                    <TableCell>R$ {item.valorMedioKg.toFixed(2)}</TableCell>
                    <TableCell>R$ {item.custoEstoque.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(item.estoqueAtualKg, item.estoqueMinimo)}</TableCell>
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
