
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
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Cell, Pie } from "recharts";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('Carregando dados dos relatórios...');

        // Carregar dados do localStorage com fallbacks seguros
        const savedGalpoes = localStorage.getItem('galpoes');
        const savedProducoes = localStorage.getItem('producaoOvos');
        const savedVendas = localStorage.getItem('vendas');
        const savedCompras = localStorage.getItem('comprasInsumos');
        const savedDespesas = localStorage.getItem('despesas');
        const savedConsumos = localStorage.getItem('consumosRacao');
        const savedEstoqueOvos = localStorage.getItem('estoqueCentralOvos');
        const savedEstoqueRacao = localStorage.getItem('estoqueRacao');
        const savedInsumos = localStorage.getItem('insumos');

        // Parse com fallbacks seguros
        setGalpoes(savedGalpoes ? JSON.parse(savedGalpoes) : []);
        setProducoes(savedProducoes ? JSON.parse(savedProducoes) : []);
        setVendas(savedVendas ? JSON.parse(savedVendas) : []);
        setCompras(savedCompras ? JSON.parse(savedCompras) : []);
        setDespesas(savedDespesas ? JSON.parse(savedDespesas) : []);
        setConsumos(savedConsumos ? JSON.parse(savedConsumos) : []);
        setEstoqueCentralOvos(savedEstoqueOvos ? JSON.parse(savedEstoqueOvos) : { quantidade: 0, perdas: 0 });
        setEstoqueRacao(savedEstoqueRacao ? JSON.parse(savedEstoqueRacao) : { quantidade: 0 });
        setInsumos(savedInsumos ? JSON.parse(savedInsumos) : []);

        console.log('Dados carregados com sucesso');
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados dos relatórios');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Mostrar tela de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando relatórios...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar tela de erro
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao Carregar</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcular KPIs principais com proteção contra erros
  const totalAves = Array.isArray(galpoes) ? galpoes.reduce((acc, galpao) => acc + (galpao?.qtdeAves || 0), 0) : 0;
  
  const hoje = new Date().toISOString().split('T')[0];
  const producaoHoje = Array.isArray(producoes) ? 
    producoes.filter(p => p?.data === hoje).reduce((acc, p) => acc + (p?.ovosBons || 0), 0) : 0;
  const taxaPosturaGeral = totalAves > 0 ? (producaoHoje / totalAves * 100).toFixed(1) : "0.0";

  const custoMedioRacao = 2.50;

  const mesAtual = new Date().getMonth();
  const anoAtual = new Date().getFullYear();
  
  const vendasMesAtual = Array.isArray(vendas) ? vendas.filter(v => {
    if (!v?.data) return false;
    const dataVenda = new Date(v.data);
    return dataVenda.getMonth() === mesAtual && dataVenda.getFullYear() === anoAtual;
  }) : [];
  const receitaMesAtual = vendasMesAtual.reduce((acc, v) => acc + (v?.valorTotal || 0), 0);

  const comprasMesAtual = Array.isArray(compras) ? compras.filter(c => {
    if (!c?.data) return false;
    const dataCompra = new Date(c.data);
    return dataCompra.getMonth() === mesAtual && dataCompra.getFullYear() === anoAtual;
  }) : [];
  
  const despesasMesAtual = Array.isArray(despesas) ? despesas.filter(d => {
    if (!d?.data) return false;
    const dataDespesa = new Date(d.data);
    return dataDespesa.getMonth() === mesAtual && dataDespesa.getFullYear() === anoAtual;
  }) : [];
  
  const custoMesAtual = comprasMesAtual.reduce((acc, c) => acc + (c?.valorTotal || 0), 0) + 
                       despesasMesAtual.reduce((acc, d) => acc + (d?.valor || 0), 0);

  const contasReceber = Array.isArray(vendas) ? 
    vendas.filter(v => v?.status === 'Pendente').reduce((acc, v) => acc + (v?.valorTotal || 0), 0) : 0;

  // Dados para gráficos com proteção
  const ultimos30Dias = Array.from({ length: 30 }, (_, i) => {
    const data = new Date();
    data.setDate(data.getDate() - i);
    return data.toISOString().split('T')[0];
  }).reverse();

  const producaoDiaria = ultimos30Dias.map(data => {
    const producaoData = Array.isArray(producoes) ? 
      producoes.filter(p => p?.data === data) : [];
    const totalOvos = producaoData.reduce((acc, p) => acc + (p?.ovosBons || 0), 0);
    return {
      data: new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      ovos: totalOvos
    };
  });

  const consumoPorGalpao = Array.isArray(galpoes) ? galpoes.map(galpao => {
    const consumoGalpao = Array.isArray(consumos) ? 
      consumos.filter(c => c?.galpaoId === galpao?.id) : [];
    const totalConsumo = consumoGalpao.reduce((acc, c) => acc + (c?.quantidadeConsumida || 0), 0);
    return {
      name: galpao?.nome || 'Sem nome',
      consumo: totalConsumo
    };
  }) : [];

  const cores = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // Alertas do sistema com proteção
  const alertas = [];
  
  try {
    // Verificar insumos com estoque baixo
    const estoqueInsumos = JSON.parse(localStorage.getItem('estoqueInsumos') || '[]');
    if (Array.isArray(estoqueInsumos) && Array.isArray(insumos)) {
      estoqueInsumos.forEach((estoque: any) => {
        const insumo = insumos.find(i => i?.id === estoque?.insumoId);
        if (insumo && estoque?.estoqueAtual < insumo?.estoqueMinimo) {
          alertas.push({
            tipo: 'estoque',
            mensagem: `${insumo.nome} - Estoque: ${estoque.estoqueAtual}kg (Mín: ${insumo.estoqueMinimo}kg)`
          });
        }
      });
    }

    // Verificar contas vencidas
    const dataAtual = new Date();
    if (Array.isArray(vendas)) {
      vendas.filter(v => v?.status === 'Pendente' && v?.dataVencimento).forEach(venda => {
        if (venda?.dataVencimento) {
          const dataVenc = new Date(venda.dataVencimento);
          if (dataVenc < dataAtual) {
            alertas.push({
              tipo: 'vencimento',
              mensagem: `${venda.cliente || 'Cliente'} - R$ ${(venda.valorTotal || 0).toFixed(2)} (Venc: ${dataVenc.toLocaleDateString('pt-BR')})`
            });
          }
        }
      });
    }
  } catch (err) {
    console.error('Erro ao processar alertas:', err);
  }

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
                  {producaoDiaria.length > 0 ? (
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
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhum dado de produção disponível</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Consumo de Ração por Galpão</CardTitle>
                </CardHeader>
                <CardContent>
                  {consumoPorGalpao.length > 0 && consumoPorGalpao.some(item => item.consumo > 0) ? (
                    <>
                      <ChartContainer config={chartConfig} className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
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
                            </Pie>
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
                    </>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhum dado de consumo disponível</p>
                      </div>
                    </div>
                  )}
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
                  {Array.isArray(compras) && compras.length > 0 ? (
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
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Nenhuma compra registrada</p>
                    </div>
                  )}
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
                  {Array.isArray(galpoes) && galpoes.length > 0 ? (
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
                          const producaoGalpaoHoje = Array.isArray(producoes) ? 
                            producoes.filter(p => p?.galpaoId === galpao?.id && p?.data === hoje)
                              .reduce((acc, p) => acc + (p?.ovosBons || 0), 0) : 0;
                          const taxaPostura = galpao?.qtdeAves > 0 ? 
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
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Nenhum galpão cadastrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Produção</CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(producoes) && producoes.length > 0 ? (
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
                          const galpao = Array.isArray(galpoes) ? 
                            galpoes.find(g => g?.id === producao?.galpaoId) : null;
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
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Nenhuma produção registrada</p>
                    </div>
                  )}
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
