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
  quantidadeKg: number;
  precoPorKg: number;
  custoIngrediente: number;
}

interface Formula {
  id: string;
  nome: string;
  faseAve: string;
  ingredientes: IngredienteFormula[];
  pesoTotalKg: number;
  custoTotalFormula: number;
  custoPorKg: number;
  custoTotalPor1000kg: number;
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
    quantidadeKg: 0
  });

  // Estados separados para os totais calculados
  const [pesoTotal, setPesoTotal] = useState(0);
  const [custoTotal, setCustoTotal] = useState(0);
  const [custoPorKg, setCustoPorKg] = useState(0);

  useEffect(() => {
    const savedFormulas = localStorage.getItem('formulasRacao');
    if (savedFormulas) {
      setFormulas(JSON.parse(savedFormulas));
    }

    loadInsumos();
  }, []);

  // Recalcula totais sempre que a lista de ingredientes muda
  useEffect(() => {
    calcularTotais();
  }, [ingredientes]);

  const calcularTotais = () => {
    console.log('Calculando totais. Ingredientes:', ingredientes);
    
    const pesoTotalCalculado = ingredientes.reduce((acc, ing) => {
      const peso = Number(ing.quantidadeKg) || 0;
      console.log(`Peso do ingrediente ${ing.insumoNome}: ${peso}`);
      return acc + peso;
    }, 0);
    
    const custoTotalCalculado = ingredientes.reduce((acc, ing) => {
      const custo = Number(ing.custoIngrediente) || 0;
      console.log(`Custo do ingrediente ${ing.insumoNome}: ${custo}`);
      return acc + custo;
    }, 0);
    
    const custoPorKgCalculado = pesoTotalCalculado > 0 ? custoTotalCalculado / pesoTotalCalculado : 0;
    
    console.log('Totals calculados:', {
      pesoTotal: pesoTotalCalculado,
      custoTotal: custoTotalCalculado,
      custoPorKg: custoPorKgCalculado
    });

    setPesoTotal(pesoTotalCalculado);
    setCustoTotal(custoTotalCalculado);
    setCustoPorKg(custoPorKgCalculado);
  };

  const loadInsumos = () => {
    console.log('Carregando insumos...');
    const savedInsumos = localStorage.getItem('insumos');
    
    if (savedInsumos) {
      const insumosData = JSON.parse(savedInsumos);
      console.log('Insumos base carregados:', insumosData);
      
      // Carregar preços dos insumos do estoque
      const savedEstoque = localStorage.getItem('estoqueInsumos');
      console.log('Estoque encontrado:', savedEstoque);
      
      if (savedEstoque) {
        const estoqueData = JSON.parse(savedEstoque);
        console.log('Dados do estoque:', estoqueData);
        
        const insumosComPreco = insumosData.map((insumo: Insumo) => {
          // Buscar o preço no estoque pelo nome do insumo
          const estoqueItem = estoqueData.find((item: any) => 
            item.nome === insumo.nome || item.insumoNome === insumo.nome
          );
          
          const precoCalculado = estoqueItem ? (estoqueItem.valorPorKg || estoqueItem.precoUnitario || 0) : 0;
          
          console.log(`Insumo: ${insumo.nome}, Preço encontrado: ${precoCalculado}`);
          
          return {
            ...insumo,
            precoPorKg: precoCalculado
          };
        });
        
        console.log('Insumos com preços aplicados:', insumosComPreco);
        setInsumos(insumosComPreco);
      } else {
        console.log('Nenhum estoque encontrado, usando preços zerados');
        const insumosComPrecoZero = insumosData.map((insumo: Insumo) => ({
          ...insumo,
          precoPorKg: 0
        }));
        setInsumos(insumosComPrecoZero);
      }
    } else {
      console.log('Nenhum insumo cadastrado encontrado');
      setInsumos([]);
    }
  };

  const saveFormulas = (newFormulas: Formula[]) => {
    localStorage.setItem('formulasRacao', JSON.stringify(newFormulas));
    setFormulas(newFormulas);
  };

  const adicionarIngrediente = () => {
    if (!novoIngrediente.insumoId || novoIngrediente.quantidadeKg <= 0) {
      toast({
        title: "Erro",
        description: "Selecione um insumo e informe a quantidade em KG.",
        variant: "destructive"
      });
      return;
    }

    const insumoSelecionado = insumos.find(i => i.id === novoIngrediente.insumoId);
    if (!insumoSelecionado) {
      toast({
        title: "Erro",
        description: "Insumo não encontrado.",
        variant: "destructive"
      });
      return;
    }

    // Verificar se o ingrediente já foi adicionado
    const ingredienteExistente = ingredientes.find(ing => ing.insumoId === novoIngrediente.insumoId);
    if (ingredienteExistente) {
      toast({
        title: "Erro",
        description: "Este ingrediente já foi adicionado à fórmula.",
        variant: "destructive"
      });
      return;
    }

    const precoPorKg = Number(insumoSelecionado.precoPorKg) || 0;
    const quantidade = Number(novoIngrediente.quantidadeKg) || 0;
    const custoIngrediente = quantidade * precoPorKg;

    console.log('Adicionando ingrediente:', {
      nome: insumoSelecionado.nome,
      quantidade,
      precoPorKg,
      custoIngrediente,
      insumoCompleto: insumoSelecionado
    });

    const novoIngredienteCompleto: IngredienteFormula = {
      id: Date.now().toString(),
      insumoId: novoIngrediente.insumoId,
      insumoNome: insumoSelecionado.nome,
      quantidadeKg: quantidade,
      precoPorKg: precoPorKg,
      custoIngrediente: custoIngrediente
    };

    setIngredientes([...ingredientes, novoIngredienteCompleto]);
    setNovoIngrediente({ insumoId: "", quantidadeKg: 0 });
    
    toast({
      title: "Sucesso!",
      description: `Ingrediente ${insumoSelecionado.nome} adicionado à fórmula.`,
    });
  };

  const removerIngrediente = (id: string) => {
    setIngredientes(ingredientes.filter(ing => ing.id !== id));
    toast({
      title: "Sucesso!",
      description: "Ingrediente removido da fórmula.",
    });
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

    const novaFormula: Formula = {
      id: formulaEditando?.id || Date.now().toString(),
      nome: dadosFormula.nome,
      faseAve: dadosFormula.faseAve,
      ingredientes: [...ingredientes],
      pesoTotalKg: pesoTotal,
      custoTotalFormula: custoTotal,
      custoPorKg: custoPorKg,
      custoTotalPor1000kg: custoPorKg * 1000
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

  const excluirFormula = (id: string) => {
    const updatedFormulas = formulas.filter(f => f.id !== id);
    saveFormulas(updatedFormulas);
    
    toast({
      title: "Sucesso!",
      description: "Fórmula excluída com sucesso.",
    });
  };

  const resetForm = () => {
    setDadosFormula({ nome: "", faseAve: "" });
    setIngredientes([]);
    setNovoIngrediente({ insumoId: "", quantidadeKg: 0 });
    setFormulaEditando(null);
    setShowFormFormula(false);
    setPesoTotal(0);
    setCustoTotal(0);
    setCustoPorKg(0);
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const podeAdicionarIngrediente = novoIngrediente.insumoId && novoIngrediente.quantidadeKg > 0;

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
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editarFormula(formula)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => excluirFormula(formula.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div><strong>Fase:</strong> {formula.faseAve}</div>
                    <div><strong>Ingredientes:</strong> {formula.ingredientes.length}</div>
                    <div><strong>Peso Total:</strong> {formula.pesoTotalKg.toFixed(2)} kg</div>
                    <div className="text-green-600 font-bold">
                      Custo/Kg: {formatarMoeda(formula.custoPorKg)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Custo Total: {formatarMoeda(formula.custoTotalFormula)}
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
                        {insumos.map((insumo) => (
                          <SelectItem key={insumo.id} value={insumo.id}>
                            {insumo.nome} - {formatarMoeda(insumo.precoPorKg || 0)}/kg
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quantidade (KG)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={novoIngrediente.quantidadeKg}
                      onChange={(e) => setNovoIngrediente({ ...novoIngrediente, quantidadeKg: Number(e.target.value) })}
                      placeholder="0.0"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={adicionarIngrediente} 
                      className="w-full"
                      disabled={!podeAdicionarIngrediente}
                    >
                      Adicionar Ingrediente
                    </Button>
                  </div>
                </div>

                {ingredientes.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ingrediente</TableHead>
                        <TableHead>Qtde (KG)</TableHead>
                        <TableHead>Preço/Kg</TableHead>
                        <TableHead>Custo</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ingredientes.map((ingrediente) => (
                        <TableRow key={ingrediente.id}>
                          <TableCell>{ingrediente.insumoNome}</TableCell>
                          <TableCell>{ingrediente.quantidadeKg.toFixed(2)} kg</TableCell>
                          <TableCell>{formatarMoeda(ingrediente.precoPorKg)}</TableCell>
                          <TableCell>{formatarMoeda(ingrediente.custoIngrediente)}</TableCell>
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
                      <div className="text-sm text-gray-600">Peso Total</div>
                      <div className="text-lg font-bold text-blue-600">
                        {pesoTotal.toFixed(2)} kg
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Custo Total</div>
                      <div className="text-lg font-bold text-green-600">
                        {formatarMoeda(custoTotal)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Custo por Kg</div>
                      <div className="text-lg font-bold text-orange-600">
                        {formatarMoeda(custoPorKg)}
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
