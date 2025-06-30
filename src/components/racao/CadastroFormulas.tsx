import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusIcon, TrashIcon } from "lucide-react";
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
  fatorConversaoKg: number;
  estoqueMinimo: number;
  precoKg?: number; // Added optional precoKg property
}

interface Ingrediente {
  insumo: string;
  quantidade: number;
  custo: number;
}

interface Formula {
  id: string;
  nome: string;
  faseAve: string;
  ingredientes: Ingrediente[];
  custoTotalPor1000kg: number;
  custoPorKg: number;
}

const CadastroFormulas = () => {
  const { toast } = useToast();
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    faseAve: ""
  });
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [novoIngrediente, setNovoIngrediente] = useState({
    insumo: "",
    quantidade: 0
  });

  const loadInsumos = () => {
    try {
      console.log("Carregando insumos...");
      const savedInsumos = localStorage.getItem('insumos');
      const estoqueData = localStorage.getItem('estoqueInsumos');
      
      if (savedInsumos) {
        const insumosBase = JSON.parse(savedInsumos);
        console.log("Insumos base carregados:", insumosBase);
        
        if (estoqueData) {
          const estoque = JSON.parse(estoqueData);
          console.log("Estoque encontrado:", estoque);
          console.log("Dados do estoque:", estoque);
          
          // CORREÇÃO CRÍTICA: estoque é um objeto, não array
          // Criar array de insumos com preços do estoque
          const insumosComPreco = insumosBase.map((insumo: Insumo) => {
            const estoqueItem = estoque[insumo.nome];
            const preco = estoqueItem?.valorPorKg || estoqueItem?.precoUnitario || 0;
            
            console.log(`Insumo: ${insumo.nome}, Preço encontrado: R$ ${preco}`);
            
            return {
              ...insumo,
              precoKg: preco
            };
          });
          
          setInsumos(insumosComPreco);
          console.log("Insumos com preços carregados:", insumosComPreco);
        } else {
          console.log("Nenhum estoque encontrado, carregando insumos sem preços");
          setInsumos(insumosBase.map((insumo: Insumo) => ({ ...insumo, precoKg: 0 })));
        }
      } else {
        console.log("Nenhum insumo cadastrado encontrado");
        setInsumos([]);
      }
    } catch (error) {
      console.error("Erro ao carregar insumos:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de insumos.",
        variant: "destructive"
      });
      setInsumos([]);
    }
  };

  useEffect(() => {
    loadInsumos();
    
    const savedFormulas = localStorage.getItem('formulasRacao');
    if (savedFormulas) {
      try {
        setFormulas(JSON.parse(savedFormulas));
      } catch (error) {
        console.error("Erro ao carregar fórmulas:", error);
        setFormulas([]);
      }
    }
  }, []);

  const calcularCustos = (ingredientesList: Ingrediente[]) => {
    if (!ingredientesList || ingredientesList.length === 0) {
      return { custoTotal: 0, custoPorKg: 0 };
    }

    const custoTotal = ingredientesList.reduce((total, ingrediente) => {
      return total + (ingrediente.custo || 0);
    }, 0);

    const pesoTotal = ingredientesList.reduce((total, ingrediente) => {
      return total + (ingrediente.quantidade || 0);
    }, 0);

    const custoPorKg = pesoTotal > 0 ? custoTotal / pesoTotal : 0;

    return { custoTotal, custoPorKg };
  };

  const adicionarIngrediente = () => {
    if (!novoIngrediente.insumo || novoIngrediente.quantidade <= 0) {
      toast({
        title: "Erro",
        description: "Selecione um insumo e informe uma quantidade válida.",
        variant: "destructive"
      });
      return;
    }

    // Buscar preço do insumo selecionado
    const insumoSelecionado = insumos.find(i => i.nome === novoIngrediente.insumo);
    const precoKg = insumoSelecionado?.precoKg || 0;
    const custo = precoKg * novoIngrediente.quantidade;

    console.log(`Adicionando ingrediente:`, {
      insumo: novoIngrediente.insumo,
      quantidade: novoIngrediente.quantidade,
      precoKg,
      custo
    });

    const novoIngredienteCompleto: Ingrediente = {
      insumo: novoIngrediente.insumo,
      quantidade: novoIngrediente.quantidade,
      custo: custo
    };

    const novosIngredientes = [...ingredientes, novoIngredienteCompleto];
    setIngredientes(novosIngredientes);
    setNovoIngrediente({ insumo: "", quantidade: 0 });

    const { custoTotal, custoPorKg } = calcularCustos(novosIngredientes);
    console.log(`Custos recalculados - Total: R$ ${custoTotal.toFixed(2)}, Por Kg: R$ ${custoPorKg.toFixed(2)}`);

    toast({
      title: "Ingrediente adicionado",
      description: `${novoIngrediente.insumo} adicionado com sucesso. Custo: R$ ${custo.toFixed(2)}`,
    });
  };

  const removerIngrediente = (index: number) => {
    const novosIngredientes = ingredientes.filter((_, i) => i !== index);
    setIngredientes(novosIngredientes);
    
    toast({
      title: "Ingrediente removido",
      description: "Ingrediente removido da fórmula.",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (ingredientes.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um ingrediente à fórmula.",
        variant: "destructive"
      });
      return;
    }

    const { custoTotal, custoPorKg } = calcularCustos(ingredientes);

    const novaFormula: Formula = {
      id: Date.now().toString(),
      nome: formData.nome,
      faseAve: formData.faseAve,
      ingredientes: [...ingredientes],
      custoTotalPor1000kg: custoTotal,
      custoPorKg: custoPorKg
    };

    const updatedFormulas = [...formulas, novaFormula];
    localStorage.setItem('formulasRacao', JSON.stringify(updatedFormulas));
    setFormulas(updatedFormulas);

    toast({
      title: "Sucesso!",
      description: `Fórmula "${formData.nome}" cadastrada com sucesso!`,
    });

    // Reset form
    setFormData({ nome: "", faseAve: "" });
    setIngredientes([]);
    setShowForm(false);
  };

  // Função para verificar se dados estão carregados
  if (!insumos) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">Carregando insumos...</p>
      </div>
    );
  }

  const { custoTotal, custoPorKg } = calcularCustos(ingredientes);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cadastro de Fórmulas de Ração</CardTitle>
              <CardDescription>
                Crie fórmulas de ração especificando ingredientes e quantidades
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Nova Fórmula
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-6 p-6 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome da Fórmula</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Ração Inicial"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="faseAve">Fase da Ave</Label>
                  <Select value={formData.faseAve} onValueChange={(value) => setFormData({ ...formData, faseAve: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a fase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inicial">Inicial (0-6 semanas)</SelectItem>
                      <SelectItem value="crescimento">Crescimento (7-16 semanas)</SelectItem>
                      <SelectItem value="postura">Postura (17+ semanas)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Seção de Ingredientes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ingredientes da Fórmula</h3>
                
                {/* Adicionar Ingrediente */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded bg-white">
                  <div>
                    <Label>Insumo</Label>
                    <Select value={novoIngrediente.insumo} onValueChange={(value) => setNovoIngrediente({ ...novoIngrediente, insumo: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o insumo" />
                      </SelectTrigger>
                      <SelectContent>
                        {insumos.map((insumo) => (
                          <SelectItem key={insumo.id} value={insumo.nome}>
                            {insumo.nome} - R$ {(insumo.precoKg || 0).toFixed(2)}/kg
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quantidade (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={novoIngrediente.quantidade}
                      onChange={(e) => setNovoIngrediente({ ...novoIngrediente, quantidade: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" onClick={adicionarIngrediente} className="w-full">
                      Adicionar
                    </Button>
                  </div>
                </div>

                {/* Lista de Ingredientes */}
                {ingredientes.length > 0 && (
                  <div className="border rounded">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Insumo</TableHead>
                          <TableHead>Quantidade (kg)</TableHead>
                          <TableHead>Preço/Kg</TableHead>
                          <TableHead>Custo Total</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ingredientes.map((ingrediente, index) => {
                          const insumoInfo = insumos.find(i => i.nome === ingrediente.insumo);
                          const precoKg = insumoInfo?.precoKg || 0;
                          
                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{ingrediente.insumo}</TableCell>
                              <TableCell>{ingrediente.quantidade}kg</TableCell>
                              <TableCell>R$ {precoKg.toFixed(2)}</TableCell>
                              <TableCell className="font-bold text-green-600">R$ {ingrediente.custo.toFixed(2)}</TableCell>
                              <TableCell>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removerIngrediente(index)}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    
                    {/* Resumo dos Custos */}
                    <div className="p-4 bg-blue-50 border-t">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Custo Total (1000kg): </span>
                          <span className="font-bold text-blue-600">R$ {custoTotal.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="font-medium">Custo por Kg: </span>
                          <span className="font-bold text-blue-600">R$ {custoPorKg.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit">Salvar Fórmula</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Lista de Fórmulas Cadastradas */}
      <Card>
        <CardHeader>
          <CardTitle>Fórmulas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {formulas.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma fórmula cadastrada ainda.</p>
          ) : (
            <div className="grid gap-4">
              {formulas.map((formula) => (
                <div key={formula.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{formula.nome}</h3>
                      <p className="text-gray-600">Fase: {formula.faseAve}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Custo por Kg</p>
                      <p className="font-bold text-green-600">R$ {formula.custoPorKg.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <p><strong>Ingredientes:</strong></p>
                    {formula.ingredientes.map((ing, idx) => (
                      <p key={idx} className="ml-4">
                        • {ing.insumo}: {ing.quantidade}kg (R$ {ing.custo.toFixed(2)})
                      </p>
                    ))}
                    <p className="mt-2"><strong>Custo Total (1000kg):</strong> R$ {formula.custoTotalPor1000kg.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CadastroFormulas;
