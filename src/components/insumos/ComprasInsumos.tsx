
import { useState } from "react";
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
  valorTotal: number;
  fornecedor: string;
  qtdeTotalKg: number;
  valorPorKg: number;
  valorPorUnidade: number;
}

interface InsumoData {
  nome: string;
  unidade: string;
  fatorConversaoKg: number;
}

const ComprasInsumos = () => {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [novaCompra, setNovaCompra] = useState({
    data: '',
    insumo: '',
    quantidade: '',
    valorTotal: '',
    fornecedor: ''
  });
  const { toast } = useToast();

  // Mock data - em um sistema real, isso viria do módulo de cadastro
  const insumosDisponiveis: InsumoData[] = [
    { nome: 'Milho', unidade: 'Saco', fatorConversaoKg: 50 },
    { nome: 'Soja', unidade: 'Saco', fatorConversaoKg: 50 },
    { nome: 'Farelo de Trigo', unidade: 'Saco', fatorConversaoKg: 40 },
    { nome: 'Calcário', unidade: 'KG', fatorConversaoKg: 1 },
    { nome: 'Sal', unidade: 'Saco', fatorConversaoKg: 25 },
    { nome: 'Premix Vitamínico', unidade: 'Saco', fatorConversaoKg: 20 }
  ];

  const insumoSelecionado = insumosDisponiveis.find(i => i.nome === novaCompra.insumo);

  // Verifica se deve exibir o valor por unidade (apenas para unidades contáveis)
  const shouldShowValuePerUnit = insumoSelecionado && 
    ['Saco', 'Caixa', 'Fardo', 'Unidade'].includes(insumoSelecionado.unidade);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novaCompra.data || !novaCompra.insumo || !novaCompra.quantidade || !novaCompra.valorTotal) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const insumoData = insumosDisponiveis.find(i => i.nome === novaCompra.insumo);
    if (!insumoData) {
      toast({
        title: "Erro",
        description: "Insumo não encontrado",
        variant: "destructive"
      });
      return;
    }

    const quantidade = parseFloat(novaCompra.quantidade);
    const valorTotal = parseFloat(novaCompra.valorTotal);
    const qtdeTotalKg = quantidade * insumoData.fatorConversaoKg;
    const valorPorKg = qtdeTotalKg > 0 ? valorTotal / qtdeTotalKg : 0;
    const valorPorUnidade = quantidade > 0 ? valorTotal / quantidade : 0;

    const compra: Compra = {
      id: Date.now().toString(),
      data: novaCompra.data,
      insumo: novaCompra.insumo,
      quantidade: quantidade,
      valorTotal: valorTotal,
      fornecedor: novaCompra.fornecedor,
      qtdeTotalKg: qtdeTotalKg,
      valorPorKg: valorPorKg,
      valorPorUnidade: valorPorUnidade
    };

    setCompras([...compras, compra]);
    setNovaCompra({ data: '', insumo: '', quantidade: '', valorTotal: '', fornecedor: '' });
    
    toast({
      title: "Sucesso",
      description: `Compra registrada! ${qtdeTotalKg}kg adicionados ao estoque.`
    });
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
                  {insumosDisponiveis.map((insumo) => (
                    <SelectItem key={insumo.nome} value={insumo.nome}>
                      {insumo.nome} ({insumo.unidade})
                    </SelectItem>
                  ))}
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
                  = {(parseFloat(novaCompra.quantidade) * insumoSelecionado.fatorConversaoKg).toFixed(2)} KG
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorTotal">Valor Total (R$) *</Label>
              <Input
                id="valorTotal"
                type="number"
                step="0.01"
                value={novaCompra.valorTotal}
                onChange={(e) => setNovaCompra({...novaCompra, valorTotal: e.target.value})}
                placeholder="0,00"
                required
              />
              {insumoSelecionado && novaCompra.quantidade && novaCompra.valorTotal && (
                <div className="space-y-1">
                  <p className="text-xs text-blue-600">
                    = R$ {(parseFloat(novaCompra.valorTotal) / (parseFloat(novaCompra.quantidade) * insumoSelecionado.fatorConversaoKg)).toFixed(2)}/KG
                  </p>
                  {shouldShowValuePerUnit && (
                    <p className="text-xs text-purple-600">
                      = R$ {(parseFloat(novaCompra.valorTotal) / parseFloat(novaCompra.quantidade)).toFixed(2)}/{insumoSelecionado.unidade}
                    </p>
                  )}
                </div>
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
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Valor/KG</TableHead>
                  <TableHead>Valor/Unidade</TableHead>
                  <TableHead>Fornecedor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compras.map((compra) => {
                  const insumoInfo = insumosDisponiveis.find(i => i.nome === compra.insumo);
                  const showValuePerUnit = insumoInfo && ['Saco', 'Caixa', 'Fardo', 'Unidade'].includes(insumoInfo.unidade);
                  
                  return (
                    <TableRow key={compra.id}>
                      <TableCell>{new Date(compra.data).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="font-medium">{compra.insumo}</TableCell>
                      <TableCell>{compra.quantidade}</TableCell>
                      <TableCell className="font-medium text-green-600">{compra.qtdeTotalKg.toFixed(2)} KG</TableCell>
                      <TableCell>R$ {compra.valorTotal.toFixed(2)}</TableCell>
                      <TableCell className="text-blue-600">R$ {compra.valorPorKg.toFixed(2)}/KG</TableCell>
                      <TableCell className="text-purple-600">
                        {showValuePerUnit ? (
                          `R$ ${compra.valorPorUnidade.toFixed(2)}/${insumoInfo?.unidade}`
                        ) : (
                          '-'
                        )}
                      </TableCell>
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
