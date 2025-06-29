
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { ArrowDownUp, BarChart3, PieChart, TrendingUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from "recharts";

interface Galpao {
  id: string;
  nome: string;
  lote: string;
  qtdeAves: number;
  estoqueAtualOvosBons: number;
  totalGeralPerdas: number;
}

interface ProducaoOvo {
  id: string;
  data: string;
  galpaoId: string;
  galpaoNome: string;
  ovosBons: number;
  ovosQuebrados: number;
}

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
}

const Relatorios = () => {
  const navigate = useNavigate();
  const [galpoes, setGalpoes] = useState<Galpao[]>([]);
  const [producoes, setProducoes] = useState<ProducaoOvo[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);

  useEffect(() => {
    const savedGalpoes = localStorage.getItem('galpoes');
    if (savedGalpoes) {
      setGalpoes(JSON.parse(savedGalpoes));
    }

    const savedProducoes = localStorage.getItem('producaoOvos');
    if (savedProducoes) {
      setProducoes(JSON.parse(savedProducoes));
    }

    const savedVendas = localStorage.getItem('vendas');
    if (savedVendas) {
      setVendas(JSON.parse(savedVendas));
    }
  }, []);

  // Calcular dados do dashboard
  const totalOvosEstoque = galpoes.reduce((acc, galpao) => acc + galpao.estoqueAtualOvosBons, 0);
  const totalPerdas = galpoes.reduce((acc, galpao) => acc + galpao.totalGeralPerdas, 0);
  const totalVendasValor = vendas.reduce((acc, venda) => acc + venda.valorTotal, 0);
  const totalOvosVendidos = vendas.reduce((acc, venda) => acc + venda.qtdeVendida, 0);

  // Dados para gráficos
  const estoqueData = galpoes.map(galpao => ({
    name: galpao.nome,
    estoque: galpao.estoqueAtualOvosBons,
    perdas: galpao.totalGeralPerdas
  }));

  const vendasPorGalpao = galpoes.map(galpao => {
    const vendasGalpao = vendas.filter(v => v.galpaoId === galpao.id);
    const totalVendas = vendasGalpao.reduce((acc, v) => acc + v.valorTotal, 0);
    return {
      name: galpao.nome,
      vendas: totalVendas
    };
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const chartConfig = {
    estoque: {
      label: "Estoque",
      color: "#22c55e"
    },
    perdas: {
      label: "Perdas",
      color: "#ef4444"
    },
    vendas: {
      label: "Vendas",
      color: "#3b82f6"
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Relatórios e Dashboard
            </h1>
            <p className="text-gray-600">
              Dashboards e relatórios gerenciais em tempo real
            </p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowDownUp className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>

        {/* Dashboard de Estoques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ovos em Estoque</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalOvosEstoque}</div>
              <p className="text-xs text-muted-foreground">ovos disponíveis</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Perdas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{totalPerdas}</div>
              <p className="text-xs text-muted-foreground">ovos quebrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vendas</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">R$ {totalVendasValor.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{totalOvosVendidos} ovos vendidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Galpões Ativos</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{galpoes.length}</div>
              <p className="text-xs text-muted-foreground">galpões cadastrados</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="estoques" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="estoques">Dashboard de Estoques</TabsTrigger>
            <TabsTrigger value="producao">Produção</TabsTrigger>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          </TabsList>

          <TabsContent value="estoques">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estoque por Galpão</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Galpão</TableHead>
                        <TableHead>Lote</TableHead>
                        <TableHead>Estoque Ovos</TableHead>
                        <TableHead>Perdas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {galpoes.map((galpao) => (
                        <TableRow key={galpao.id}>
                          <TableCell className="font-medium">{galpao.nome}</TableCell>
                          <TableCell>{galpao.lote}</TableCell>
                          <TableCell className="text-green-600 font-bold">{galpao.estoqueAtualOvosBons}</TableCell>
                          <TableCell className="text-red-600">{galpao.totalGeralPerdas}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gráfico de Estoques</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={estoqueData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="estoque" fill="var(--color-estoque)" />
                        <Bar dataKey="perdas" fill="var(--color-perdas)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="producao">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Produção por Galpão</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Galpão</TableHead>
                      <TableHead>Ovos Bons</TableHead>
                      <TableHead>Ovos Quebrados</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>% Perdas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {producoes.map((producao) => {
                      const total = producao.ovosBons + producao.ovosQuebrados;
                      const percPerdas = total > 0 ? ((producao.ovosQuebrados / total) * 100).toFixed(1) : "0.0";
                      return (
                        <TableRow key={producao.id}>
                          <TableCell>{new Date(producao.data).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell className="font-medium">{producao.galpaoNome}</TableCell>
                          <TableCell className="text-green-600">{producao.ovosBons}</TableCell>
                          <TableCell className="text-red-600">{producao.ovosQuebrados}</TableCell>
                          <TableCell className="font-bold">{total}</TableCell>
                          <TableCell className={`font-medium ${parseFloat(percPerdas) > 10 ? 'text-red-600' : 'text-gray-600'}`}>
                            {percPerdas}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financeiro">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vendas por Galpão</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={vendasPorGalpao}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="vendas" fill="var(--color-vendas)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo Financeiro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total de Vendas:</span>
                      <span className="font-bold text-green-600">R$ {totalVendasValor.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ovos Vendidos:</span>
                      <span className="font-medium">{totalOvosVendidos} unidades</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Preço Médio por Ovo:</span>
                      <span className="font-medium">
                        R$ {totalOvosVendidos > 0 ? (totalVendasValor / totalOvosVendidos).toFixed(2) : "0,00"}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Estoque Total Disponível:</span>
                      <span className="font-bold text-blue-600">{totalOvosEstoque} ovos</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Total de Perdas:</span>
                      <span className="font-medium">{totalPerdas} ovos</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Relatorios;
