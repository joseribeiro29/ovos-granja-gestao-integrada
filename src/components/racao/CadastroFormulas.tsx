
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusIcon, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Insumo {
  id: string;
  nome: string;
  unidade: string;
  precoPorKg?: number;
}

interface IngredienteFormula {
  id: string;
  insumoId: string;
  insumoNome: string;
  percentualMistura: number;
  precoPorKg: number;
  custoNaFormula: number;
}

interface Formula {
  id: string;
  nome: string;
  faseAve: string;
  ingredientes: IngredienteFormula[];
  custoTotalPor1000kg: number;
  custoPorKg: number;
}

const CadastroFormulas = () => {
  const { toast } = useToast();
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [showFormFormula, setShowFormFormula] = useState(false);
  const [formulaEditando, setFormulaEditando] = useState<Formula | null>(null);
  const [dadosFormula, setDadosFormula] = useState({
    nome: "",
    faseAve: ""
  });
  const [ingredientes, setIngredientes] = useState<IngredienteFormula[]>([]);
  const [novoIngrediente, setNovoIngrediente] = useState({
    insumoId: "",
    percentualMistura: 0
  });

  useEffect(() => {
    const savedFormulas = localStorage.getItem('formulasRacao');
    if (savedFormulas) {
      setFormulas(JSON.parse(savedFormulas));
    }

    const savedInsumos = localStorage.getItem('insumos');
    if (savedInsumos) {
      setInsumos(JSON.parse(savedInsumos));
    }
  }, []);

  const saveFormulas = (newFormulas: Formula[]) => {
    localStorage.setItem('formulasRacao', JSON.stringify(newFormulas));
    setFormulas(newFormulas);
  };

  const calcularCustos = () => {
    const totalPercentual = ingredientes.reduce((acc, ing) => acc + ing.percentualMistura, 0);
    
    if (totalPercentual !== 100) {
      return { custoTotal: 0, custoPorKg: 0 };
    }

    const custoTotal = ingredientes.reduce((acc, ing) => {
      const custoIngrediente = (ing.percentualMistura / 100) * 1000 * ing.precoPorKg;
      return acc + custoIngrediente;
    }, 0);

    return {
      custoTotal: custoTotal,
      custoPorKg: custoTotal / 1000
    };
  };

  const adicionarIngrediente = () => {
    if (!novoIngrediente.insumoId || novoIngrediente.percentualMistura <= 0) {
      toast({
        title: "Erro",
        description: "Selecione um insumo e informe o percentual.",
        variant: "destructive"
      });
      return;
    }

    const insumoSelecionado = insumos.find(i => i.id === novoIngrediente.insumoId);
    if (!insumoSelecionado || !insumoSelecionado.precoPorKg) {
      toast({
        title: "Erro",
        description: "Insumo não encontrado ou sem preço definido.",
        variant: "destructive"
      });
      return;
    }

    const custoNaFormula = (novoIngrediente.percentualMistura / 100) * 1000 * insumoSelecionado.precoPorKg;

    const novoIngredienteCompleto: IngredienteFormula = {
      id: Date.now().toString(),
      insumoId: novoIngrediente.insumoId,
      insumoNome: insumoSelecionado.nome,
      percentualMistura: novoIngrediente.percentualMistura,
      precoPorKg: insumoSelecionado.precoPorKg,
      custoNaFormula: custoNaFormula
    };

    setIngredientes([...ingredientes, novoIngredienteCompleto]);
    setNovoIngrediente({ insumoId: "", percentualMistura: 0 });
  };

  const removerIngrediente = (id: string) => {
    setIngredientes(ingredientes.filter(ing => ing.id !== id));
  };

  const salvarFormula = () => {
    if (!dadosFormula.nome || !dadosFormula.faseAve) {
      toast({
        title: "Erro",
        description: "Preencha nome e fase da ave.",
        variant: "destructive"
      });
      return;
    }

    if (ingredientes.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um ingrediente.",
        variant: "destructive"
      });
      return;
    }

    const totalPercentual = ingredientes.reduce((acc, ing) => acc + ing.percentualMistura, 0);
    if (totalPercentual !== 100) {
      toast({
        title: "Erro",
        description: `O total dos percentuais deve ser 100%. Atual: ${totalPercentual}%`,
        variant: "destructive"
      });
      return;
    }

    const { custoTotal, custoPorKg } = calcularCustos();

    const novaFormula: Formula = {
      id: formulaEditando?.id || Date.now().toString(),
      nome: dadosFormula.nome,
      faseAve: dadosFormula.faseAve,
      ingredientes: [...ingredientes],
      custoTotalPor1000kg: custoTotal,
      custoPorKg: custoPorKg
    };

    let updatedFormulas;
    if (formulaEditando) {
      updatedFormulas = formulas.map(f => f.id === formulaEditando.id ? novaFormula : f);
    } else {
      updatedFormulas = [...formulas, novaFormula];
    }

    saveFormulas(updatedFormulas);

    toast({
      title: "Sucesso!",
      description: `Fórmula ${formulaEditando ? 'atualizada' : 'cadastrada'} com sucesso.`,
    });

    resetForm();
  };

  const editarFormula = (formula: Formula) => {
    setFormulaEditando(formula);
    setDadosFormula({
      nome: formula.nome,
      faseAve: formula.faseAve
    });
    setIngredientes([...formula.ingredientes]);
    setShowFormFormula(true);
  };

  const resetForm = () => {
    setDadosFormula({ nome: "", faseAve: "" });
    setIngredientes([]);
    setNovoIngrediente({ insumoId: "", percentualMistura: 0 });
    setFormulaEditando(null);
    setShowFormFormula(false);
  };

  const { custoTotal, custoPorKg } = calcularCustos();
  const totalPercentual = ingredientes.reduce((acc, ing) => acc + ing.percentualMistura, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Fórmulas de Ração Cadastradas</CardTitle>
            <Button onClick={() => setShowFormFormula(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Nova Fórmula
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formulas.map((formula) => (
              <Card key={formula.id} className="bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    {formula.nome}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editarFormula(formula)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div><strong>Fase:</strong> {formula.faseAve}</div>
                    <div><strong>Ingredientes:</strong> {formula.ingredientes.length}</div>
                    <div className="text-green-600 font-bold">
                      Custo/Kg: R$ {formula.custoPorKg.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Custo 1000kg: R$ {formula.custoTotalPor1000kg.toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {formulas.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma fórmula cadastrada ainda.
            </div>
          )}
        </CardContent>
      </Card>

      {showFormFormula && (
        <Card>
          <CardHeader>
            <CardTitle>
              {formulaEditando ? 'Editar Fórmula' : 'Nova Fórmula de Ração'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome da Fórmula</Label>
                <Input
                  id="nome"
                  value={dadosFormula.nome}
                  onChange={(e) => setDadosFormula({ ...dadosFormula, nome: e.target.value })}
                  placeholder="Ex: Ração Pré-Postura FASE 1"
                />
              </div>
              <div>
                <Label htmlFor="faseAve">Fase da Ave</Label>
                <Input
                  id="faseAve"
                  value={dadosFormula.faseAve}
                  onChange={(e) => setDadosFormula({ ...dadosFormula, faseAve: e.target.value })}
                  placeholder="Ex: Pré-postura, Postura inicial"
                />
              </div>
            </div>

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Construtor de Receita</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Ingrediente</Label>
                    <Select value={novoIngrediente.insumoId} onValueChange={(value) => setNovoIngrediente({ ...novoIngrediente, insumoId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o insumo" />
                      </SelectTrigger>
                      <SelectContent>
                        {insumos.filter(insumo => insumo.precoPorKg).map((insumo) => (
                          <SelectItem key={insumo.id} value={insumo.id}>
                            {insumo.nome} - R$ {insumo.precoPorKg?.toFixed(2)}/kg
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>% na Mistura</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={novoIngrediente.percentualMistura}
                      onChange={(e) => setNovoIngrediente({ ...novoIngrediente, percentualMistura: Number(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={adicionarIngrediente} className="w-full">
                      Adicionar Ingrediente
                    </Button>
                  </div>
                </div>

                {ingredientes.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ingrediente</TableHead>
                        <TableHead>% Mistura</TableHead>
                        <TableHead>Preço/Kg</TableHead>
                        <TableHead>Custo na Fórmula</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ingredientes.map((ingrediente) => (
                        <TableRow key={ingrediente.id}>
                          <TableCell>{ingrediente.insumoNome}</TableCell>
                          <TableCell>{ingrediente.percentualMistura}%</TableCell>
                          <TableCell>R$ {ingrediente.precoPorKg.toFixed(2)}</TableCell>
                          <TableCell>R$ {ingrediente.custoNaFormula.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removerIngrediente(ingrediente.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                <div className="bg-white p-4 rounded border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-gray-600">Total Percentual</div>
                      <div className={`text-lg font-bold ${totalPercentual === 100 ? 'text-green-600' : 'text-red-600'}`}>
                        {totalPercentual}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Custo Total (1000kg)</div>
                      <div className="text-lg font-bold text-blue-600">
                        R$ {custoTotal.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Custo por Kg</div>
                      <div className="text-lg font-bold text-green-600">
                        R$ {custoPorKg.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={salvarFormula}>
                {formulaEditando ? 'Atualizar' : 'Salvar'} Fórmula
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CadastroFormulas;
