
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface EstoqueItem {
  insumo: string;
  entradas: number;
  saidas: number;
  estoqueAtual: number;
  custoUnitario: number;
  custoEstoque: number;
  estoqueMinimo: number;
}

const EstoqueInsumos = () => {
  // Mock data - em um sistema real, isso seria calculado automaticamente
  const estoque: EstoqueItem[] = [
    {
      insumo: 'Milho',
      entradas: 1000,
      saidas: 200,
      estoqueAtual: 800,
      custoUnitario: 1.50,
      custoEstoque: 1200,
      estoqueMinimo: 100
    },
    {
      insumo: 'Soja',
      entradas: 500,
      saidas: 100,
      estoqueAtual: 400,
      custoUnitario: 2.80,
      custoEstoque: 1120,
      estoqueMinimo: 50
    },
    {
      insumo: 'Farelo de Trigo',
      entradas: 300,
      saidas: 280,
      estoqueAtual: 20,
      custoUnitario: 1.20,
      custoEstoque: 24,
      estoqueMinimo: 100
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <CardTitle className="text-sm font-medium">Alertas de Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {estoque.filter(item => item.estoqueAtual <= item.estoqueMinimo).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Controle de Estoque</CardTitle>
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
                  <TableHead>Entradas</TableHead>
                  <TableHead>Saídas</TableHead>
                  <TableHead>Estoque Atual</TableHead>
                  <TableHead>Custo/Unidade</TableHead>
                  <TableHead>Custo do Estoque</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estoque.map((item) => (
                  <TableRow key={item.insumo}>
                    <TableCell className="font-medium">{item.insumo}</TableCell>
                    <TableCell>{item.entradas}</TableCell>
                    <TableCell>{item.saidas}</TableCell>
                    <TableCell className="font-medium">{item.estoqueAtual}</TableCell>
                    <TableCell>R$ {item.custoUnitario.toFixed(2)}</TableCell>
                    <TableCell>R$ {item.custoEstoque.toFixed(2)}</TableCell>
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
