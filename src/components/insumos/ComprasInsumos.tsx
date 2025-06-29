
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
  const insumosDisponiveis = [
    'Milho', 'Soja', 'Farelo de Trigo', 'Calcário', 'Sal', 'Premix Vitamínico'
  ];

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

    const compra: Compra = {
      id: Date.now().toString(),
      data: novaCompra.data,
      insumo: novaCompra.insumo,
      quantidade: parseFloat(novaCompra.quantidade),
      valorTotal: parseFloat(novaCompra.valorTotal),
      fornecedor: novaCompra.fornecedor
    };

    setCompras([...compras, compra]);
    setNovaCompra({ data: '', insumo: '', quantidade: '', valorTotal: '', fornecedor: '' });
    
    toast({
      title: "Sucesso",
      description: "Compra registrada com sucesso!"
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
                    <SelectItem key={insumo} value={insumo}>{insumo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input
                id="quantidade"
                type="number"
                step="0.01"
                value={novaCompra.quantidade}
                onChange={(e) => setNovaCompra({...novaCompra, quantidade: e.target.value})}
                placeholder="0"
                required
              />
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
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Fornecedor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compras.map((compra) => (
                  <TableRow key={compra.id}>
                    <TableCell>{new Date(compra.data).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="font-medium">{compra.insumo}</TableCell>
                    <TableCell>{compra.quantidade}</TableCell>
                    <TableCell>R$ {compra.valorTotal.toFixed(2)}</TableCell>
                    <TableCell>{compra.fornecedor}</TableCell>
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

export default ComprasInsumos;
