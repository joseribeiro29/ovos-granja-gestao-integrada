
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Insumo {
  id: string;
  nome: string;
  unidade: string;
  custoPorUnidade: number;
  estoqueMinimo: number;
}

const CadastroInsumos = () => {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [novoInsumo, setNovoInsumo] = useState({
    nome: '',
    unidade: '',
    custoPorUnidade: '',
    estoqueMinimo: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novoInsumo.nome || !novoInsumo.unidade || !novoInsumo.custoPorUnidade) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const insumo: Insumo = {
      id: Date.now().toString(),
      nome: novoInsumo.nome,
      unidade: novoInsumo.unidade,
      custoPorUnidade: parseFloat(novoInsumo.custoPorUnidade),
      estoqueMinimo: parseFloat(novoInsumo.estoqueMinimo) || 0
    };

    setInsumos([...insumos, insumo]);
    setNovoInsumo({ nome: '', unidade: '', custoPorUnidade: '', estoqueMinimo: '' });
    
    toast({
      title: "Sucesso",
      description: "Insumo cadastrado com sucesso!"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Cadastrar Novo Insumo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Insumo *</Label>
              <Input
                id="nome"
                value={novoInsumo.nome}
                onChange={(e) => setNovoInsumo({...novoInsumo, nome: e.target.value})}
                placeholder="Ex: Milho, Soja, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidade">Unidade *</Label>
              <Select 
                value={novoInsumo.unidade} 
                onValueChange={(value) => setNovoInsumo({...novoInsumo, unidade: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KG">KG</SelectItem>
                  <SelectItem value="Litro">Litro</SelectItem>
                  <SelectItem value="Unidade">Unidade</SelectItem>
                  <SelectItem value="Saco">Saco</SelectItem>
                  <SelectItem value="Tonelada">Tonelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custo">Custo por Unidade (R$) *</Label>
              <Input
                id="custo"
                type="number"
                step="0.01"
                value={novoInsumo.custoPorUnidade}
                onChange={(e) => setNovoInsumo({...novoInsumo, custoPorUnidade: e.target.value})}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
              <Input
                id="estoqueMinimo"
                type="number"
                step="0.01"
                value={novoInsumo.estoqueMinimo}
                onChange={(e) => setNovoInsumo({...novoInsumo, estoqueMinimo: e.target.value})}
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-4">
              <Button type="submit" className="w-full md:w-auto">
                <PlusIcon className="mr-2 h-4 w-4" />
                Cadastrar Insumo
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Insumos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {insumos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum insumo cadastrado ainda. Cadastre o primeiro insumo acima.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Insumo</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Custo/Unidade</TableHead>
                  <TableHead>Estoque Mínimo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insumos.map((insumo) => (
                  <TableRow key={insumo.id}>
                    <TableCell className="font-medium">{insumo.nome}</TableCell>
                    <TableCell>{insumo.unidade}</TableCell>
                    <TableCell>R$ {insumo.custoPorUnidade.toFixed(2)}</TableCell>
                    <TableCell>{insumo.estoqueMinimo} {insumo.unidade}</TableCell>
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

export default CadastroInsumos;
