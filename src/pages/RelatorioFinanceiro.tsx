import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { ArrowDownUp, FileText } from "lucide-react";

interface TransacaoFinanceira {
  data: string;
  descricao: string;
  entrada: number;
  saida: number;
  saldo: number;
}

const RelatorioFinanceiro = () => {
  const navigate = useNavigate();
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [transacoes, setTransacoes] = useState<TransacaoFinanceira[]>([]);
  const [saldoTotal, setSaldoTotal] = useState(0);

  const gerarRelatorio = () => {
    if (!dataInicial || !dataFinal) {
      return;
    }

    const transacoesTemp: TransacaoFinanceira[] = [];
    let saldoAcumulado = 0;

    console.log('GERANDO RELATÓRIO FINANCEIRO - Período:', dataInicial, 'até', dataFinal);

    // Buscar vendas pagas
    const vendas = JSON.parse(localStorage.getItem('vendas') || '[]');
    const vendasPagas = vendas.filter((venda: any) => 
      venda.statusPagamento === 'Pago' &&
      new Date(venda.data) >= new Date(dataInicial) &&
      new Date(venda.data) <= new Date(dataFinal)
    );
    console.log('Vendas pagas encontradas:', vendasPagas.length);

    // CORREÇÃO CRÍTICA: Buscar TODAS as compras de insumos
    const compras = JSON.parse(localStorage.getItem('compras') || '[]');
    const comprasNoperiodo = compras.filter((compra: any) =>
      new Date(compra.data) >= new Date(dataInicial) &&
      new Date(compra.data) <= new Date(dataFinal)
    );
    console.log('Compras de insumos encontradas:', comprasNoperiodo.length);

    // CORREÇÃO CRÍTICA: Buscar TODAS as despesas
    const despesas = JSON.parse(localStorage.getItem('despesas') || '[]');
    const despesasNoperiodo = despesas.filter((despesa: any) =>
      new Date(despesa.data) >= new Date(dataInicial) &&
      new Date(despesa.data) <= new Date(dataFinal)
    );
    console.log('Despesas encontradas:', despesasNoperiodo.length);

    // Agregar todas as transações
    const todasTransacoes = [
      // ENTRADAS: Vendas pagas
      ...vendasPagas.map((venda: any) => ({
        data: venda.data,
        descricao: `Venda de Ovos - Cliente ${venda.cliente || 'N/A'}`,
        entrada: venda.valorTotal || 0,
        saida: 0,
        tipo: 'entrada'
      })),
      // SAÍDAS: Compras de insumos
      ...comprasNoperiodo.map((compra: any) => ({
        data: compra.data,
        descricao: `Compra de ${compra.insumo} - ${compra.fornecedor || 'N/A'}`,
        entrada: 0,
        saida: compra.valorTotal || 0,
        tipo: 'saida'
      })),
      // SAÍDAS: Despesas operacionais
      ...despesasNoperiodo.map((despesa: any) => ({
        data: despesa.data,
        descricao: despesa.descricao || 'Despesa',
        entrada: 0,
        saida: despesa.valor || 0,
        tipo: 'saida'
      }))
    ];

    console.log('Total de transações agregadas:', todasTransacoes.length);

    // Ordenar por data
    todasTransacoes.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

    // Calcular saldo acumulado
    const transacoesComSaldo = todasTransacoes.map(transacao => {
      saldoAcumulado += transacao.entrada - transacao.saida;
      return {
        data: transacao.data,
        descricao: transacao.descricao,
        entrada: transacao.entrada,
        saida: transacao.saida,
        saldo: saldoAcumulado
      };
    });

    setTransacoes(transacoesComSaldo);
    setSaldoTotal(saldoAcumulado);
    
    console.log('RELATÓRIO GERADO - Saldo final:', saldoAcumulado);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const totalEntradas = transacoes.reduce((acc, t) => acc + t.entrada, 0);
  const totalSaidas = transacoes.reduce((acc, t) => acc + t.saida, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Relatório Financeiro
            </h1>
            <p className="text-gray-600">
              Fluxo de caixa detalhado com todas as transações (vendas, compras de insumos e despesas)
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label htmlFor="dataInicial">Data Inicial</Label>
                <Input
                  id="dataInicial"
                  type="date"
                  value={dataInicial}
                  onChange={(e) => setDataInicial(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dataFinal">Data Final</Label>
                <Input
                  id="dataFinal"
                  type="date"
                  value={dataFinal}
                  onChange={(e) => setDataFinal(e.target.value)}
                />
              </div>
              <Button onClick={gerarRelatorio} className="w-full md:w-auto">
                Gerar Relatório
              </Button>
            </div>
          </CardContent>
        </Card>

        {transacoes.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Total de Entradas</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatarValor(totalEntradas)}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Total de Saídas</div>
                    <div className="text-2xl font-bold text-red-600">
                      {formatarValor(totalSaidas)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      (Compras + Despesas)
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Saldo Final</div>
                    <div className={`text-2xl font-bold ${saldoTotal >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatarValor(saldoTotal)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Fluxo de Caixa Detalhado</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Entrada (R$)</TableHead>
                      <TableHead className="text-right">Saída (R$)</TableHead>
                      <TableHead className="text-right">Saldo (R$)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transacoes.map((transacao, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatarData(transacao.data)}</TableCell>
                        <TableCell>{transacao.descricao}</TableCell>
                        <TableCell className="text-right">
                          {transacao.entrada > 0 ? (
                            <span className="text-green-600 font-medium">
                              {formatarValor(transacao.entrada)}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {transacao.saida > 0 ? (
                            <span className="text-red-600 font-medium">
                              {formatarValor(transacao.saida)}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-bold ${transacao.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {formatarValor(transacao.saldo)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {transacoes.length === 0 && dataInicial && dataFinal && (
          <Card>
            <CardContent className="p-8">
              <div className="text-center text-gray-500">
                Nenhuma transação encontrada no período selecionado.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RelatorioFinanceiro;
