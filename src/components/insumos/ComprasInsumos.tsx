
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Compra {
  id: string;
  data: string;
  insumo: string;
  quantidade: number;
  valorPorUnidade: number;
  valorTotal: number;
  fornecedor: string;
  qtdeTotalKg: number;
  valorPorKg: number;
}

interface Insumo {
  id: string;
  nome: string;
  unidade: string;
  fatorConversaoKg: number;
}

const ComprasInsumos = () => {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [novaCompra, setNovaCompra] = useState({
    data: '',
    insumo: '',
    quantidade: '',
    valorPorUnidade: '',
    fornecedor: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    // Carregar insumos cadastrados dinamicamente
    const savedInsumos = localStorage.getItem('insumos');
    if (savedInsumos) {
      setInsumos(JSON.parse(savedInsumos));
    }

    const savedCompras = localStorage.getItem('compras');
    if (savedCompras) {
      setCompras(JSON.parse(savedCompras));
    }
  }, []);

  const insumoSelecionado = insumos.find(i => i.nome === novaCompra.insumo);

  // Calcula valores automaticamente
  const quantidade = parseFloat(novaCompra.quantidade) || 0;
  const valorPorUnidade = parseFloat(novaCompra.valorPorUnidade) || 0;
  const valorTotal = quantidade * valorPorUnidade;
  const qtdeTotalKg = insumoSelecionado ? quantidade * insumoSelecionado.fatorConversaoKg : 0;
  const valorPorKg = qtdeTotalKg > 0 ? valorTotal / qtdeTotalKg : 0;

  const updateEstoqueInsumos = (nomeInsumo: string, quantidadeKg: number, valorPorKg: number) => {
    console.log(`INICIANDO ATUALIZAÇÃO DE ESTOQUE para ${nomeInsumo}`);
    
    // Buscar estoque atual
    const savedEstoque = localStorage.getItem('estoqueInsumos');
    const estoque = savedEstoque ? JSON.parse(savedEstoque) : {};
    
    console.log('Estoque antes da atualização:', estoque);
    
    // Inicializar insumo no estoque se não existir
    if (!estoque[nomeInsumo]) {
      estoque[nomeInsumo] = { 
        entradas: 0, 
        saidas: 0, 
        estoqueAtual: 0, 
        valorMedioKg: 0 
      };
      console.log(`Insumo ${nomeInsumo} inicializado no estoque`);
    }
    
    // CORREÇÃO CRÍTICA: Somar a quantidade às entradas
    const entradasAnteriores = estoque[nomeInsumo].entradas || 0;
    const saidasAtuais = estoque[nomeInsumo].saidas || 0;
    
    estoque[nomeInsumo].entradas = entradasAnteriores + quantidadeKg;
    estoque[nomeInsumo].estoqueAtual = estoque[nomeInsumo].entradas - saidasAtuais;
    estoque[nomeInsumo].valorMedioKg = valorPorKg;
    
    console.log(`ESTOQUE ATUALIZADO: ${nomeInsumo}`);
    console.log(`- Entradas anteriores: ${entradasAnteriores}kg`);
    console.log(`- Quantidade adicionada: ${quantidadeKg}kg`);
    console.log(`- Novas entradas: ${estoque[nomeInsumo].entradas}kg`);
    console.log(`- Saídas: ${saidasAtuais}kg`);
    console.log(`- Estoque atual: ${estoque[nomeInsumo].estoqueAtual}kg`);
    console.log(`- Valor por kg: R$ ${valorPorKg.toFixed(2)}`);
    
    // Salvar estoque atualizado
    localStorage.setItem('estoqueInsumos', JSON.stringify(estoque));
    console.log('Estoque salvo no localStorage:', estoque);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novaCompra.data || !novaCompra.insumo || !novaCompra.quantidade || !novaCompra.valorPorUnidade) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const insumoData = insumos.find(i => i.nome === novaCompra.insumo);
    if (!insumoData) {
      toast({
        title: "Erro",
        description: "Insumo não encontrado",
        variant: "destructive"
      });
      return;
    }

    console.log('=== REGISTRANDO NOVA COMPRA ===');
    console.log('Dados da compra:', {
      insumo: novaCompra.insumo,
      quantidade: quantidade,
      qtdeTotalKg: qtdeTotalKg,
      valorTotal: valorTotal,
      valorPorKg: valorPorKg
    });

    // ETAPA 1: Registrar a compra
    const compra: Compra = {
      id: Date.now().toString(),
      data: novaCompra.data,
      insumo: novaCompra.insumo,
      quantidade: quantidade,
      valorPorUnidade: valorPorUnidade,
      valorTotal: valorTotal,
      fornecedor: novaCompra.fornecedor,
      qtdeTotalKg: qtdeTotalKg,
      valorPorKg: valorPorKg
    };

    const updatedCompras = [...compras, compra];
    setCompras(updatedCompras);
    localStorage.setItem('compras', JSON.stringify(updatedCompras));
    console.log('Compra registrada com sucesso');

    // ETAPA 2: CORREÇÃO CRÍTICA - Atualizar estoque de insumos
    updateEstoqueInsumos(novaCompra.insumo, qtdeTotalKg, valorPorKg);

    setNovaCompra({ data: '', insumo: '', quantidade: '', valorPorUnidade: '', fornecedor: '' });
    
    toast({
      title: "Sucesso",
      description: `Compra registrada! ${qtdeTotalKg.toFixed(2)}kg adicionados ao estoque de ${novaCompra.insumo}.`
    });

    console.log('=== COMPRA FINALIZADA COM SUCESSO ===');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Registrar Nova Compra
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data da Compra *</Label>
              <Input
                id="data"
                type="date"
                value={novaCompra.data}
                onChange={(e) => setNovaCompra({...novaCompra, data: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="insumo">Insumo *</Label>
              <Select 
                value={novaCompra.insumo} 
                onValueChange={(value) => setNovaCompra({...novaCompra, insumo: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o insumo" />
                </SelectTrigger>
                <SelectContent>
                  {insumos.length === 0 ? (
                    <SelectItem value="vazio" disabled>Nenhum insumo cadastrado</SelectItem>
                  ) : (
                    insumos.map((insumo) => (
                      <SelectItem key={insumo.id} value={insumo.nome}>
                        {insumo.nome} ({insumo.unidade})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantidade">
                Quantidade *
                {insumoSelecionado && ` (${insumoSelecionado.unidade})`}
              </Label>
              <Input
                id="quantidade"
                type="number"
                step="0.01"
                value={novaCompra.quantidade}
                onChange={(e) => setNovaCompra({...novaCompra, quantidade: e.target.value})}
                placeholder="0"
                required
              />
              {insumoSelecionado && novaCompra.quantidade && (
                <p className="text-xs text-green-600">
                  = {qtdeTotalKg.toFixed(2)} KG
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorPorUnidade">
                Valor por {insumoSelecionado?.unidade || 'Unidade'} (R$) *
              </Label>
              <Input
                id="valorPorUnidade"
                type="number"
                step="0.01"
                value={novaCompra.valorPorUnidade}
                onChange={(e) => setNovaCompra({...novaCompra, valorPorUnidade: e.target.value})}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorTotal">Valor Total (R$) - Calculado</Label>
              <Input
                id="valorTotal"
                type="text"
                value={valorTotal > 0 ? `R$ ${valorTotal.toFixed(2)}` : ''}
                readOnly
                className="bg-gray-100 font-medium text-green-600"
                placeholder="Calculado automaticamente"
              />
              {valorPorKg > 0 && (
                <p className="text-xs text-blue-600">
                  = R$ {valorPorKg.toFixed(2)}/KG
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fornecedor">Fornecedor</Label>
              <Input
                id="fornecedor"
                value={novaCompra.fornecedor}
                onChange={(e) => setNovaCompra({...novaCompra, fornecedor: e.target.value})}
                placeholder="Nome do fornecedor"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <Button type="submit" className="w-full md:w-auto">
                <PlusIcon className="mr-2 h-4 w-4" />
                Registrar Compra
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Compras</CardTitle>
        </CardHeader>
        <CardContent>
          {compras.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhuma compra registrada ainda. Registre a primeira compra acima.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Insumo</TableHead>
                  <TableHead>Qtde Comprada</TableHead>
                  <TableHead>Total em KG</TableHead>
                  <TableHead>Valor/Unidade</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Valor/KG</TableHead>
                  <TableHead>Fornecedor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compras.map((compra) => {
                  const insumoInfo = insumos.find(i => i.nome === compra.insumo);
                  
                  return (
                    <TableRow key={compra.id}>
                      <TableCell>{new Date(compra.data).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="font-medium">{compra.insumo}</TableCell>
                      <TableCell>{compra.quantidade}</TableCell>
                      <TableCell className="font-medium text-green-600">{compra.qtdeTotalKg.toFixed(2)} KG</TableCell>
                      <TableCell className="text-purple-600">R$ {compra.valorPorUnidade.toFixed(2)}/{insumoInfo?.unidade}</TableCell>
                      <TableCell className="font-medium">R$ {compra.valorTotal.toFixed(2)}</TableCell>
                      <TableCell className="text-blue-600">R$ {compra.valorPorKg.toFixed(2)}/KG</TableCell>
                      <TableCell>{compra.fornecedor}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprasInsumos;
