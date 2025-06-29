
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
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface Galpao {
  id: string;
  nome: string;
  lote: string;
  qtdeAves: number;
  dataChegadaLote: string;
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
  const [estoqueCentralOvos, setEstoqueCentralOvos] = useState({ quantidade: 0, perdas: 0 });
  const [estoqueRacao, setEstoqueRacao] = useState({ quantidade: 0 });

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

    const savedEstoqueOvos = localStorage.getItem('estoqueCentralOvos');
    if (savedEstoqueOvos) {
      setEstoqueCentralOvos(JSON.parse(savedEstoqueOvos));
    }

    const savedEstoqueRacao = localStorage.getItem('estoqueRacao');
    if (savedEstoqueRacao) {
      setEstoqueRacao(JSON.parse(savedEstoqueRacao));
    }
  }, []);

  // Calcular dados do dashboard
  const totalVendasValor = vendas.reduce((acc, venda) => acc + venda.valorTotal, 0);
  const totalOvosVendidos = vendas.reduce((acc, venda) => acc + venda.qtdeVendida, 0);

  // Calcular idade dos lotes
  const calcularIdade = (dataChegada: string) => {
    if (!dataChegada) return { dias: 0, semanas: 0 };
    
    const hoje = new Date();
    const chegada = new Date(dataChegada);
    const diffTime = hoje.getTime() - chegada.getTime();
    const dias = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const semanas = Math.floor(dias / 7);
    
    return { dias: Math.max(0, dias), semanas: Math.max(0, semanas) };
  };

  // Dados para gráficos - produção por galpão
  const producaoPorGalpao = galpoes.map(galpao => {
    const producaoGalpao = producoes.filter(p => p.galpaoId === galpao.id);
    const totalProducao = producaoGalpao.reduce((acc, p) => acc + p.ovosBons, 0);
    return {
      name: galpao.nome,
      producao: totalProducao
    };
  });

  const chartConfig = {
    producao: {
      label: "Produção",
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
              <CardTitle className="text-sm font-medium">Estoque Central de Ovos</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{estoqueCentralOvos.quantidade}</div>
              <p className="text-xs text-muted-foreground">ovos disponíveis</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Perdas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{estoqueCentralOvos.perdas}</div>
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
              <CardTitle className="text-sm font-medium">Estoque de Ração</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{estoqueRacao.quantidade}kg</div>
              <p className="text-xs text-muted-foreground">ração disponível</p>
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
                  <CardTitle>Estoque Centralizado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {estoqueCentralOvos.quantidade} ovos
                      </div>
                      <div className="text-sm text-gray-600">Estoque Central de Ovos</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="text-lg font-bold text-red-600">
                        {estoqueCentralOvos.perdas} ovos
                      </div>
                      <div className="text-sm text-gray-600">Total de Perdas</div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">
                        {estoqueRacao.quantidade} kg
                      </div>
                      <div className="text-sm text-gray-600">Estoque de Ração</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informações dos Galpões</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Galpão</TableHead>
                        <TableHead>Lote</TableHead>
                        <TableHead>Qtde Aves</TableHead>
                        <TableHead>Idade (semanas)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {galpoes.map((galpao) => {
                        const idade = calcularIdade(galpao.dataChegadaLote);
                        return (
                          <TableRow key={galpao.id}>
                            <TableCell className="font-medium">{galpao.nome}</TableCell>
                            <TableCell>{galpao.lote}</TableCell>
                            <TableCell>{galpao.qtdeAves}</TableCell>
                            <TableCell className="text-blue-600 font-medium">{idade.semanas}s</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="producao">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Produção por Galpão</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={producaoPorGalpao}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="producao" fill="var(--color-producao)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Produção</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Galpão</TableHead>
                        <TableHead>Ovos Bons</TableHead>
                        <TableHead>Perdas</TableHead>
                        <TableHead>% Perdas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {producoes.slice(-10).map((producao) => {
                        const total = producao.ovosBons + producao.ovosQuebrados;
                        const percPerdas = total > 0 ? ((producao.ovosQuebrados / total) * 100).toFixed(1) : "0.0";
                        return (
                          <TableRow key={producao.id}>
                            <TableCell>{new Date(producao.data).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell className="font-medium">{producao.galpaoNome}</TableCell>
                            <TableCell className="text-green-600">{producao.ovosBons}</TableCell>
                            <TableCell className="text-red-600">{producao.ovosQuebrados}</TableCell>
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
            </div>
          </TabsContent>

          <TabsContent value="financeiro">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      <span>Estoque Atual:</span>
                      <span className="font-bold text-blue-600">{estoqueCentralOvos.quantidade} ovos</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Total de Perdas:</span>
                      <span className="font-medium">{estoqueCentralOvos.perdas} ovos</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vendas Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Qtde</TableHead>
                        <TableHead>Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendas.slice(-10).map((venda) => (
                        <TableRow key={venda.id}>
                          <TableCell>{new Date(venda.data).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell className="font-medium">{venda.cliente}</TableCell>
                          <TableCell>{venda.qtdeVendida}</TableCell>
                          <TableCell className="text-green-600">R$ {venda.valorTotal.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
