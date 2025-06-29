
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusIcon, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Insumo {
  id: string;
  nome: string;
  unidade: string;
  fatorConversaoKg: number;
  estoqueMinimo: number;
}

const CadastroInsumos = () => {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [editandoInsumo, setEditandoInsumo] = useState<Insumo | null>(null);
  const [novoInsumo, setNovoInsumo] = useState({
    nome: '',
    unidade: '',
    fatorConversaoKg: '',
    estoqueMinimo: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    const savedInsumos = localStorage.getItem('insumos');
    if (savedInsumos) {
      setInsumos(JSON.parse(savedInsumos));
    }
  }, []);

  const saveInsumos = (novosInsumos: Insumo[]) => {
    localStorage.setItem('insumos', JSON.stringify(novosInsumos));
    setInsumos(novosInsumos);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novoInsumo.nome || !novoInsumo.unidade || !novoInsumo.fatorConversaoKg) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const insumo: Insumo = {
      id: editandoInsumo?.id || Date.now().toString(),
      nome: novoInsumo.nome,
      unidade: novoInsumo.unidade,
      fatorConversaoKg: parseFloat(novoInsumo.fatorConversaoKg),
      estoqueMinimo: parseFloat(novoInsumo.estoqueMinimo) || 0
    };

    let updatedInsumos;
    if (editandoInsumo) {
      updatedInsumos = insumos.map(i => i.id === editandoInsumo.id ? insumo : i);
    } else {
      updatedInsumos = [...insumos, insumo];
    }

    saveInsumos(updatedInsumos);
    setNovoInsumo({ nome: '', unidade: '', fatorConversaoKg: '', estoqueMinimo: '' });
    setEditandoInsumo(null);
    
    toast({
      title: "Sucesso",
      description: editandoInsumo ? "Insumo atualizado com sucesso!" : "Insumo cadastrado com sucesso!"
    });
  };

  const editarInsumo = (insumo: Insumo) => {
    setEditandoInsumo(insumo);
    setNovoInsumo({
      nome: insumo.nome,
      unidade: insumo.unidade,
      fatorConversaoKg: insumo.fatorConversaoKg.toString(),
      estoqueMinimo: insumo.estoqueMinimo.toString()
    });
  };

  const cancelarEdicao = () => {
    setEditandoInsumo(null);
    setNovoInsumo({ nome: '', unidade: '', fatorConversaoKg: '', estoqueMinimo: '' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            {editandoInsumo ? 'Editar Insumo' : 'Cadastrar Novo Insumo'}
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
              <Label htmlFor="unidade">Unidade de Compra *</Label>
              <Select 
                value={novoInsumo.unidade} 
                onValueChange={(value) => setNovoInsumo({...novoInsumo, unidade: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KG">KG</SelectItem>
                  <SelectItem value="Saco">Saco</SelectItem>
                  <SelectItem value="Litro">Litro</SelectItem>
                  <SelectItem value="Unidade">Unidade</SelectItem>
                  <SelectItem value="Tonelada">Tonelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatorConversao">Fator de Conversão para KG *</Label>
              <Input
                id="fatorConversao"
                type="number"
                step="0.01"
                value={novoInsumo.fatorConversaoKg}
                onChange={(e) => setNovoInsumo({...novoInsumo, fatorConversaoKg: e.target.value})}
                placeholder="Ex: 50 (se 1 saco = 50kg)"
                required
              />
              <p className="text-xs text-gray-500">
                Quantos KG tem em 1 {novoInsumo.unidade || 'unidade'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estoqueMinimo">Estoque Mínimo (KG)</Label>
              <Input
                id="estoqueMinimo"
                type="number"
                step="0.01"
                value={novoInsumo.estoqueMinimo}
                onChange={(e) => setNovoInsumo({...novoInsumo, estoqueMinimo: e.target.value})}
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-4 flex gap-2">
              <Button type="submit" className="w-full md:w-auto">
                <PlusIcon className="mr-2 h-4 w-4" />
                {editandoInsumo ? 'Atualizar' : 'Cadastrar'} Insumo
              </Button>
              {editandoInsumo && (
                <Button type="button" variant="outline" onClick={cancelarEdicao}>
                  Cancelar
                </Button>
              )}
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
                  <TableHead>Unidade de Compra</TableHead>
                  <TableHead>Fator Conversão (KG)</TableHead>
                  <TableHead>Estoque Mínimo (KG)</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insumos.map((insumo) => (
                  <TableRow key={insumo.id}>
                    <TableCell className="font-medium">{insumo.nome}</TableCell>
                    <TableCell>{insumo.unidade}</TableCell>
                    <TableCell>{insumo.fatorConversaoKg} KG/{insumo.unidade}</TableCell>
                    <TableCell>{insumo.estoqueMinimo} KG</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editarInsumo(insumo)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
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
