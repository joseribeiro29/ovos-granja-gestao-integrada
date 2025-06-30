import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { ArrowDownUp, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Galpao {
  id: string;
  nome: string;
  lote: string;
  qtdeAves: number;
}

interface ProducaoOvo {
  id: string;
  data: string;
  galpaoId: string;
  ovosBons: number;
  ovosQuebrados: number;
}

interface ConsumoRacao {
  id: string;
  data: string;
  galpaoId: string;
  quantidadeConsumida: number;
  tipoRacao: string;
}

interface DadosDiarios {
  data: string;
  producaoOvos: number;
  consumoRacao: number;
  perdas: number;
  taxaPostura: number;
}

const RelatorioGalpao = () => {
  const navigate = useNavigate();
  const [galpoes, setGalpoes] = useState<Galpao[]>([]);
  const [producoes, setProducoes] = useState<ProducaoOvo[]>([]);
  const [consumos, setConsumos] = useState<ConsumoRacao[]>([]);
  const [formulas, setFormulas] = useState<any[]>([]);
  
  const [filtros, setFiltros] = useState({
    galpaoId: "",
    dataInicial: "",
    dataFinal: ""
  });

  const [dadosFiltrados, setDadosFiltrados] = useState<DadosDiarios[]>([]);
  const [resumo, setResumo] = useState({
    consumoTotal: 0,
    producaoTotal: 0,
    custoTotal: 0
  });

  useEffect(() => {
    const savedGalpoes = localStorage.getItem('galpoes');
    if (savedGalpoes) {
      setGalpoes(JSON.parse(savedGalpoes));
    }

    const savedProducoes = localStorage.getItem('producaoOvos');
    if (savedProducoes) {
      setProducoes(JSON.parse(savedProducoes));
    }

    const savedConsumos = localStorage.getItem('consumosRacao');
    if (savedConsumos) {
      setConsumos(JSON.parse(savedConsumos));
    }

    const savedFormulas = localStorage.getItem('formulasRacao');
    if (savedFormulas) {
      setFormulas(JSON.parse(savedFormulas));
    }
  }, []);

  const gerarRelatorio = () => {
    if (!filtros.galpaoId || !filtros.dataInicial || !filtros.dataFinal) {
      return;
    }

    const dataInicio = new Date(filtros.dataInicial);
    const dataFim = new Date(filtros.dataFinal);
    const galpaoSelecionado = galpoes.find(g => g.id === filtros.galpaoId);

    // Filtrar dados por galpão e período
    const producoesFiltradas = producoes.filter(p => 
      p.galpaoId === filtros.galpaoId &&
      new Date(p.data) >= dataInicio &&
      new Date(p.data) <= dataFim
    );

    const consumosFiltrados = consumos.filter(c => 
      c.galpaoId === filtros.galpaoId &&
      new Date(c.data) >= dataInicio &&
      new Date(c.data) <= dataFim
    );

    // Agrupar dados por data
    const dadosAgrupados: { [key: string]: DadosDiarios } = {};

    // Adicionar dados de produção
    producoesFiltradas.forEach(producao => {
      const dataKey = producao.data;
      if (!dadosAgrupados[dataKey]) {
        dadosAgrupados[dataKey] = {
          data: dataKey,
          producaoOvos: 0,
          consumoRacao: 0,
          perdas: 0,
          taxaPostura: 0
        };
      }
      dadosAgrupados[dataKey].producaoOvos += producao.ovosBons;
      dadosAgrupados[dataKey].perdas += producao.ovosQuebrados;
      
      // Calcular taxa de postura
      if (galpaoSelecionado && galpaoSelecionado.qtdeAves > 0) {
        dadosAgrupados[dataKey].taxaPostura = (producao.ovosBons / galpaoSelecionado.qtdeAves) * 100;
      }
    });

    // Adicionar dados de consumo
    consumosFiltrados.forEach(consumo => {
      const dataKey = consumo.data;
      if (!dadosAgrupados[dataKey]) {
        dadosAgrupados[dataKey] = {
          data: dataKey,
          producaoOvos: 0,
          consumoRacao: 0,
          perdas: 0,
          taxaPostura: 0
        };
      }
      dadosAgrupados[dataKey].consumoRacao += consumo.quantidadeConsumida;
    });

    // Converter para array e ordenar por data
    const dadosArray = Object.values(dadosAgrupados).sort((a, b) => 
      new Date(a.data).getTime() - new Date(b.data).getTime()
    );

    setDadosFiltrados(dadosArray);

    // Calcular resumo
    const consumoTotal = consumosFiltrados.reduce((acc, c) => acc + c.quantidadeConsumida, 0);
    const producaoTotal = producoesFiltradas.reduce((acc, p) => acc + p.ovosBons, 0);
    
    // Calcular custo médio da ração (assumindo um custo médio de R$ 2,50/kg)
    const custoMedioRacao = 2.50; // Isso deveria vir das fórmulas
    const custoTotal = consumoTotal * custoMedioRacao;

    setResumo({
      consumoTotal,
      producaoTotal,
      custoTotal
    });
  };

  const galpaoSelecionado = galpoes.find(g => g.id === filtros.galpaoId);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Relatório Detalhado de Galpão
            </h1>
            <p className="text-gray-600">
              Análise detalhada de produção e consumo por período
            </p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowDownUp className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Filtros do Relatório
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="galpao">Selecionar Galpão</Label>
                <Select value={filtros.galpaoId} onValueChange={(value) => setFiltros({ ...filtros, galpaoId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha o galpão" />
                  </SelectTrigger>
                  <SelectContent>
                    {galpoes.map((galpao) => (
                      <SelectItem key={galpao.id} value={galpao.id}>
                        {galpao.nome} - Lote {galpao.lote}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dataInicial">Data Inicial</Label>
                <Input
                  id="dataInicial"
                  type="date"
                  value={filtros.dataInicial}
                  onChange={(e) => setFiltros({ ...filtros, dataInicial: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="dataFinal">Data Final</Label>
                <Input
                  id="dataFinal"
                  type="date"
                  value={filtros.dataFinal}
                  onChange={(e) => setFiltros({ ...filtros, dataFinal: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={gerarRelatorio} className="w-full md:w-auto">
              <FileText className="mr-2 h-4 w-4" />
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        {dadosFiltrados.length > 0 && (
          <>
            {/* Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Consumo Total de Ração</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {resumo.consumoTotal.toFixed(2)} KG
                  </div>
                  <p className="text-sm text-gray-600">No período selecionado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Produção Total de Ovos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {resumo.producaoTotal} UNID
                  </div>
                  <p className="text-sm text-gray-600">Ovos bons produzidos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Custo Total com Ração</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    R$ {resumo.custoTotal.toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-600">Baseado no consumo</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabela detalhada */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Detalhamento Diário - {galpaoSelecionado?.nome}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Produção de Ovos (UNID)</TableHead>
                      <TableHead>Taxa de Postura (%)</TableHead>
                      <TableHead>Consumo de Ração (KG)</TableHead>
                      <TableHead>Perdas (Ovos Quebrados)</TableHead>
                      <TableHead>% Perdas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dadosFiltrados.map((dia, index) => {
                      const totalOvos = dia.producaoOvos + dia.perdas;
                      const percPerdas = totalOvos > 0 ? ((dia.perdas / totalOvos) * 100).toFixed(1) : "0.0";
                      
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {new Date(dia.data).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="text-green-600 font-bold">
                            {dia.producaoOvos}
                          </TableCell>
                          <TableCell className="text-blue-600 font-bold">
                            {dia.taxaPostura.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-orange-600 font-bold">
                            {dia.consumoRacao.toFixed(2)} kg
                          </TableCell>
                          <TableCell className="text-red-600">
                            {dia.perdas}
                          </TableCell>
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
          </>
        )}

        {dadosFiltrados.length === 0 && filtros.galpaoId && filtros.dataInicial && filtros.dataFinal && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">
                Nenhum dado encontrado para o período e galpão selecionados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RelatorioGalpao;
