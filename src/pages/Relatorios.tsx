
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { ArrowDownUp, BarChart3, PieChart, TrendingUp, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Cell } from "recharts";

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
  status: string;
  dataVencimento?: string;
}

interface Compra {
  id: string;
  data: string;
  insumo: string;
  quantidade: number;
  valorTotal: number;
}

interface Despesa {
  id: string;
  data: string;
  descricao: string;
  valor: number;
}

interface ConsumoRacao {
  id: string;
  data: string;
  galpaoId: string;
  galpaoNome: string;
  quantidadeConsumida: number;
}

const Relatorios = () => {
  const navigate = useNavigate();
  const [galpoes, setGalpoes] = useState<Galpao[]>([]);
  const [producoes, setProducoes] = useState<ProducaoOvo[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [consumos, setConsumos] = useState<ConsumoRacao[]>([]);
  const [estoqueCentralOvos, setEstoqueCentralOvos] = useState({ quantidade: 0, perdas: 0 });
  const [estoqueRacao, setEstoqueRacao] = useState({ quantidade: 0 });
  const [insumos, setInsumos] = useState<any[]>([]);

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

    const savedCompras = localStorage.getItem('comprasInsumos');
    if (savedCompras) {
      setCompras(JSON.parse(savedCompras));
    }

    const savedDespesas = localStorage.getItem('despesas');
    if (savedDespesas) {
      setDespesas(JSON.parse(savedDespesas));
    }

    const savedConsumos = localStorage.getItem('consumosRacao');
    if (savedConsumos) {
      setConsumos(JSON.parse(savedConsumos));
    }

    const savedEstoqueOvos = localStorage.getItem('estoqueCentralOvos');
    if (savedEstoqueOvos) {
      setEstoqueCentralOvos(JSON.parse(savedEstoqueOvos));
    }

    const savedEstoqueRacao = localStorage.getItem('estoqueRacao');
    if (savedEstoqueRacao) {
      setEstoqueRacao(JSON.parse(savedEstoqueRacao));
    }

    const savedInsumos = localStorage.getItem('insumos');
    if (savedInsumos) {
      setInsumos(JSON.parse(savedInsumos));
    }
  }, []);

  // Calcular KPIs principais
  const totalAves = galpoes.reduce((acc, galpao) => acc + galpao.qtdeAves, 0);
  
  const hoje = new Date().toISOString().split('T')[0];
  const producaoHoje = producoes.filter(p => p.data === hoje).reduce((acc, p) => acc + p.ovosBons, 0);
  const taxaPosturaGeral = totalAves > 0 ? (producaoHoje / totalAves * 100).toFixed(1) : "0.0";

  const custoMedioRacao = 2.50; // Este valor deveria vir das fórmulas de ração

  const mesAtual = new Date().getMonth();
  const anoAtual = new Date().getFullYear();
  
  const vendasMesAtual = vendas.filter(v => {
    const dataVenda = new Date(v.data);
    return dataVenda.getMonth() === mesAtual && dataVenda.getFullYear() === anoAtual;
  });
  const receitaMesAtual = vendasMesAtual.reduce((acc, v) => acc + v.valorTotal, 0);

  const comprasMesAtual = compras.filter(c => {
    const dataCompra = new Date(c.data);
    return dataCompra.getMonth() === mesAtual && dataCompra.getFullYear() === anoAtual;
  });
  const despesasMesAtual = despesas.filter(d => {
    const dataDespesa = new Date(d.data);
    return dataDespesa.getMonth() === mesAtual && dataDespesa.getFullYear() === anoAtual;
  });
  const custoMesAtual = comprasMesAtual.reduce((acc, c) => acc + c.valorTotal, 0) + 
                       despesasMesAtual.reduce((acc, d) => acc + d.valor, 0);

  const contasReceber = vendas.filter(v => v.status === 'Pendente').reduce((acc, v) => acc + v.valorTotal, 0);

  // Dados para gráficos
  const ultimos30Dias = Array.from({ length: 30 }, (_, i) => {
    const data = new Date();
    data.setDate(data.getDate() - i);
    return data.toISOString().split('T')[0];
  }).reverse();

  const producaoDiaria = ultimos30Dias.map(data => {
    const producaoData = producoes.filter(p => p.data === data);
    const totalOvos = producaoData.reduce((acc, p) => acc + p.ovosBons, 0);
    return {
      data: new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      ovos: totalOvos
    };
  });

  const consumoPorGalpao = galpoes.map(galpao => {
    const consumoGalpao = consumos.filter(c => c.galpaoId === galpao.id);
    const totalConsumo = consumoGalpao.reduce((acc, c) => acc + c.quantidadeConsumida, 0);
    return {
      name: galpao.nome,
      consumo: totalConsumo
    };
  });

  const cores = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // Alertas do sistema
  const alertas = [];
  
  // Verificar insumos com estoque baixo
  const estoqueInsumos = JSON.parse(localStorage.getItem('estoqueInsumos') || '[]');
  estoqueInsumos.forEach((estoque: any) => {
    const insumo = insumos.find(i => i.id === estoque.insumoId);
    if (insumo && estoque.estoqueAtual < insumo.estoqueMinimo) {
      alertas.push({
        tipo: 'estoque',
        mensagem: `${insumo.nome} - Estoque: ${estoque.estoqueAtual}kg (Mín: ${insumo.estoqueMinimo}kg)`
      });
    }
  });

  // Verificar contas vencidas
  const dataAtual = new Date();
  vendas.filter(v => v.status === 'Pendente' && v.dataVencimento).forEach(venda => {
    const dataVenc = new Date(venda.dataVencimento!);
    if (dataVenc < dataAtual) {
      alertas.push({
        tipo: 'vencimento',
        mensagem: `${venda.cliente} - R$ ${venda.valorTotal.toFixed(2)} (Venc: ${dataVenc.toLocaleDateString('pt-BR')})`
      });
    }
  });

  const chartConfig = {
    ovos: {
      label: "Ovos",
      color: "#22c55e"
    },
    consumo: {
      label: "Consumo",
      color: "#f59e0b"
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard Gerencial
            </h1>
            <p className="text-gray-600">
              Sala de comando com indicadores em tempo real
            </p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowDownUp className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Aves</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalAves}</div>
              <p className="text-xs text-muted-foreground">aves ativas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Postura</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{taxaPosturaGeral}%</div>
              <p className="text-xs text-muted-foreground">hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custo Médio Ração</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">R$ {custoMedioRacao.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">por kg</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita (Mês)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ {receitaMesAtual.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">vendas do mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custo (Mês)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">R$ {custoMesAtual.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">compras + despesas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contas a Receber</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">R$ {contasReceber.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">pendentes</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="graficos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="graficos">Gráficos</TabsTrigger>
            <TabsTrigger value="estoques">Estoques</TabsTrigger>
            <TabsTrigger value="producao">Produção</TabsTrigger>
            <TabsTrigger value="alertas">Alertas</TabsTrigger>
          </TabsList>

          <TabsContent value="graficos">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Produção Diária (Últimos 30 dias)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={producaoDiaria}>
                        <XAxis dataKey="data" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line dataKey="ovos" stroke="var(--color-ovos)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Consumo de Ração por Galpão</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <pie
                          data={consumoPorGalpao}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="consumo"
                        >
                          {consumoPorGalpao.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                          ))}
                        </pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <div className="mt-4">
                    {consumoPorGalpao.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: cores[index % cores.length] }}
                        />
                        <span className="text-sm">{item.name}: {item.consumo.toFixed(1)}kg</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

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
                  <CardTitle>Últimas Compras de Insumos</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Insumo</TableHead>
                        <TableHead>Qtde</TableHead>
                        <TableHead>Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {compras.slice(-5).map((compra) => (
                        <TableRow key={compra.id}>
                          <TableCell>{new Date(compra.data).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell className="font-medium">{compra.insumo}</TableCell>
                          <TableCell>{compra.quantidade}kg</TableCell>
                          <TableCell className="text-green-600">R$ {compra.valorTotal.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Galpão</TableHead>
                        <TableHead>Aves</TableHead>
                        <TableHead>Produção Hoje</TableHead>
                        <TableHead>Taxa Postura</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {galpoes.map((galpao) => {
                        const producaoGalpaoHoje = producoes.filter(p => p.galpaoId === galpao.id && p.data === hoje)
                          .reduce((acc, p) => acc + p.ovosBons, 0);
                        const taxaPostura = galpao.qtdeAves > 0 ? 
                          (producaoGalpaoHoje / galpao.qtdeAves * 100).toFixed(1) : "0.0";
                        
                        return (
                          <TableRow key={galpao.id}>
                            <TableCell className="font-medium">{galpao.nome}</TableCell>
                            <TableCell>{galpao.qtdeAves}</TableCell>
                            <TableCell className="text-green-600">{producaoGalpaoHoje}</TableCell>
                            <TableCell className="text-blue-600 font-medium">{taxaPostura}%</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
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
                        <TableHead>Taxa Postura</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {producoes.slice(-10).map((producao) => {
                        const galpao = galpoes.find(g => g.id === producao.galpaoId);
                        const taxaPostura = galpao && galpao.qtdeAves > 0 ? 
                          (producao.ovosBons / galpao.qtdeAves * 100).toFixed(1) : "0.0";
                        
                        return (
                          <TableRow key={producao.id}>
                            <TableCell>{new Date(producao.data).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell className="font-medium">{producao.galpaoNome}</TableCell>
                            <TableCell className="text-green-600">{producao.ovosBons}</TableCell>
                            <TableCell className="text-blue-600 font-medium">{taxaPostura}%</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alertas">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Alertas do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alertas.length > 0 ? (
                  <div className="space-y-3">
                    {alertas.map((alerta, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg border-l-4 ${
                          alerta.tipo === 'estoque' ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`h-4 w-4 ${
                            alerta.tipo === 'estoque' ? 'text-red-500' : 'text-yellow-500'
                          }`} />
                          <span className="text-sm font-medium">
                            {alerta.tipo === 'estoque' ? 'Estoque Baixo' : 'Conta Vencida'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{alerta.mensagem}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum alerta no momento</p>
                    <p className="text-sm">Sistema funcionando normalmente</p>
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

export default Relatorios;
