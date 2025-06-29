
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Formula {
  id: string;
  nome: string;
  faseAve: string;
  ingredientes: any[];
  custoTotalPor1000kg: number;
  custoPorKg: number;
}

interface ProducaoRacao {
  id: string;
  data: string;
  formulaId: string;
  formulaNome: string;
  quantidadeProduzida: number;
  custoTotal: number;
  custoPorKg: number;
}

const ProducaoRacao = () => {
  const { toast } = useToast();
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [producoes, setProducoes] = useState<ProducaoRacao[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    data: "",
    formulaId: "",
    quantidadeProduzida: 0
  });

  useEffect(() => {
    const savedFormulas = localStorage.getItem('formulasRacao');
    if (savedFormulas) {
      setFormulas(JSON.parse(savedFormulas));
    }

    const savedProducoes = localStorage.getItem('producoesRacao');
    if (savedProducoes) {
      setProducoes(JSON.parse(savedProducoes));
    }
  }, []);

  const saveProducoes = (newProducoes: ProducaoRacao[]) => {
    localStorage.setItem('producoesRacao', JSON.stringify(newProducoes));
    setProducoes(newProducoes);
  };

  const updateEstoqueRacao = (quantidadeProduzida: number) => {
    const estoqueAtual = localStorage.getItem('estoqueRacao');
    const estoque = estoqueAtual ? JSON.parse(estoqueAtual) : { quantidade: 0 };
    
    estoque.quantidade += quantidadeProduzida;
    localStorage.setItem('estoqueRacao', JSON.stringify(estoque));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formulaSelecionada = formulas.find(f => f.id === formData.formulaId);
    if (!formulaSelecionada) {
      toast({
        title: "Erro",
        description: "Selecione uma fórmula válida.",
        variant: "destructive"
      });
      return;
    }

    const custoTotal = (formData.quantidadeProduzida / 1000) * formulaSelecionada.custoTotalPor1000kg;

    const novaProducao: ProducaoRacao = {
      id: Date.now().toString(),
      data: formData.data,
      formulaId: formData.formulaId,
      formulaNome: formulaSelecionada.nome,
      quantidadeProduzida: formData.quantidadeProduzida,
      custoTotal: custoTotal,
      custoPorKg: formulaSelecionada.custoPorKg
    };

    const updatedProducoes = [...producoes, novaProducao];
    saveProducoes(updatedProducoes);

    // Atualizar estoque central de ração
    updateEstoqueRacao(formData.quantidadeProduzida);

    toast({
      title: "Sucesso!",
      description: `Produção registrada. ${formData.quantidadeProduzida}kg de ração adicionados ao estoque.`,
    });

    setFormData({ data: "", formulaId: "", quantidadeProduzida: 0 });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Registrar Nova Produção</CardTitle>
            <Button onClick={() => setShowForm(!showForm)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Nova Produção
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="data">Data de Produção</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="formula">Fórmula</Label>
                  <Select value={formData.formulaId} onValueChange={(value) => setFormData({ ...formData, formulaId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a fórmula" />
                    </SelectTrigger>
                    <SelectContent>
                      {formulas.map((formula) => (
                        <SelectItem key={formula.id} value={formula.id}>
                          {formula.nome} - R$ {formula.custoPorKg.toFixed(2)}/kg
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantidade">Quantidade a Produzir (kg)</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    value={formData.quantidadeProduzida}
                    onChange={(e) => setFormData({ ...formData, quantidadeProduzida: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
              
              {formData.formulaId && formData.quantidadeProduzida > 0 && (
                <div className="p-3 bg-blue-50 rounded">
                  <div className="text-sm text-gray-600 mb-1">Previsão de Custo:</div>
                  <div className="text-lg font-bold text-blue-600">
                    R$ {((formData.quantidadeProduzida / 1000) * (formulas.find(f => f.id === formData.formulaId)?.custoTotalPor1000kg || 0)).toFixed(2)}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit">Registrar Produção</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Produção de Ração</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Fórmula</TableHead>
                <TableHead>Quantidade (kg)</TableHead>
                <TableHead>Custo/kg</TableHead>
                <TableHead>Custo Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {producoes.map((producao) => (
                <TableRow key={producao.id}>
                  <TableCell>{new Date(producao.data).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="font-medium">{producao.formulaNome}</TableCell>
                  <TableCell>{producao.quantidadeProduzida}kg</TableCell>
                  <TableCell>R$ {producao.custoPorKg.toFixed(2)}</TableCell>
                  <TableCell className="font-bold text-green-600">R$ {producao.custoTotal.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {producoes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma produção registrada ainda.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProducaoRacao;
