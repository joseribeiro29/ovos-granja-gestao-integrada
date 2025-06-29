
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowDownUp, CheckCircle, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Venda {
  id: string;
  data: string;
  cliente: string;
  galpaoId: string;
  galpaoNome: string;
  produto: string;
  qtdeVendida: number;
  valorUnitario: number;
  valorTotal: number;
  formaPagamento: string;
  dataVencimento?: string;
  statusPagamento: string;
  dataPagamento?: string;
}

const ContasReceber = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroDataVencimento, setFiltroDataVencimento] = useState("");

  useEffect(() => {
    const savedVendas = localStorage.getItem('vendas');
    if (savedVendas) {
      setVendas(JSON.parse(savedVendas));
    }
  }, []);

  const saveVendas = (newVendas: Venda[]) => {
    localStorage.setItem('vendas', JSON.stringify(newVendas));
    setVendas(newVendas);
  };

  const handleConfirmarPagamento = (vendaId: string) => {
    const updatedVendas = vendas.map(venda => {
      if (venda.id === vendaId) {
        return {
          ...venda,
          statusPagamento: 'Pago',
          dataPagamento: new Date().toISOString().split('T')[0]
        };
      }
      return venda;
    });
    
    saveVendas(updatedVendas);
    
    toast({
      title: "Pagamento confirmado!",
      description: "O status da venda foi atualizado para 'Pago'.",
    });
  };

  const vendasPendentes = vendas.filter(venda => venda.statusPagamento === 'Pendente');
  const vendasPagas = vendas.filter(venda => venda.statusPagamento === 'Pago');

  const vendasPendentesFiltradas = vendasPendentes.filter(venda => {
    const matchCliente = !filtroCliente || venda.cliente.toLowerCase().includes(filtroCliente.toLowerCase());
    const matchData = !filtroDataVencimento || venda.dataVencimento === filtroDataVencimento;
    return matchCliente && matchData;
  });

  const totalAPagar = vendasPendentesFiltradas.reduce((total, venda) => total + venda.valorTotal, 0);

  const clientesUnicos = [...new Set(vendas.map(venda => venda.cliente))];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Contas a Receber
            </h1>
            <p className="text-gray-600">
              Gestão financeira de clientes e controle de pagamentos
            </p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowDownUp className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">R$ {totalAPagar.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Vendas Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{vendasPendentes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Vendas Quitadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{vendasPagas.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pendentes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pendentes">Pagamentos Pendentes</TabsTrigger>
            <TabsTrigger value="historico">Histórico de Pagamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="pendentes">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pagamentos Pendentes</CardTitle>
                  <div className="flex gap-2">
                    <Filter className="h-4 w-4 text-gray-500 mt-2" />
                    <span className="text-sm text-gray-500">Filtros:</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="filtroCliente">Cliente</Label>
                    <Input
                      id="filtroCliente"
                      placeholder="Filtrar por cliente..."
                      value={filtroCliente}
                      onChange={(e) => setFiltroCliente(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="filtroData">Data de Vencimento</Label>
                    <Input
                      id="filtroData"
                      type="date"
                      value={filtroDataVencimento}
                      onChange={(e) => setFiltroDataVencimento(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Data da Venda</TableHead>
                      <TableHead>Data de Vencimento</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendasPendentesFiltradas.map((venda) => (
                      <TableRow key={venda.id}>
                        <TableCell className="font-medium">{venda.cliente}</TableCell>
                        <TableCell>{new Date(venda.data).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            venda.dataVencimento && new Date(venda.dataVencimento) < new Date() 
                              ? 'text-red-600' 
                              : 'text-orange-600'
                          }`}>
                            {venda.dataVencimento ? new Date(venda.dataVencimento).toLocaleDateString('pt-BR') : '-'}
                          </span>
                        </TableCell>
                        <TableCell>{venda.produto}</TableCell>
                        <TableCell className="font-bold text-red-600">R$ {venda.valorTotal.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleConfirmarPagamento(venda.id)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirmar Pagamento
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {vendasPendentesFiltradas.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {filtroCliente || filtroDataVencimento 
                      ? "Nenhuma venda encontrada com os filtros aplicados."
                      : "Nenhuma venda pendente de pagamento."
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Pagamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Data da Venda</TableHead>
                      <TableHead>Data do Pagamento</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Forma de Pagamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendasPagas.map((venda) => (
                      <TableRow key={venda.id}>
                        <TableCell className="font-medium">{venda.cliente}</TableCell>
                        <TableCell>{new Date(venda.data).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                          {venda.dataPagamento ? new Date(venda.dataPagamento).toLocaleDateString('pt-BR') : '-'}
                        </TableCell>
                        <TableCell>{venda.produto}</TableCell>
                        <TableCell className="font-bold text-green-600">R$ {venda.valorTotal.toFixed(2)}</TableCell>
                        <TableCell>{venda.formaPagamento}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {vendasPagas.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum pagamento registrado ainda.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ContasReceber;
