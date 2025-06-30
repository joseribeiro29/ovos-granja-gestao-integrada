
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
  precoKg?: number;
}

interface Ingrediente {
  insumo: string;
  quantidade: number;
  precoKg: number;
  custo: number;
}

interface Formula {
  id: string;
  nome: string;
  faseAve: string;
  ingredientes: Ingrediente[];
  custoTotalPor1000kg: number;
  custoPorKg: number;
  pesoTotal: number;
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

  // Estados para os cálculos
  const [pesoTotalDaFormula, setPesoTotalDaFormula] = useState(0);
  const [custoTotalDaFormula, setCustoTotalDaFormula] = useState(0);
  const [custoFinalPorKg, setCustoFinalPorKg] = useState(0);

  // Limpar dados ao inicializar
  useEffect(() => {
    console.log("Limpando dados existentes...");
    localStorage.removeItem('formulasRacao');
    setFormulas([]);
  }, []);

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
  }, []);

  // UseEffect para recalcular automaticamente quando a lista de ingredientes mudar
  useEffect(() => {
    console.log("Recalculando custos devido a mudança nos ingredientes...");
    
    // Calcular peso total da fórmula
    const pesoTotal = ingredientes.reduce((total, ingrediente) => {
      const quantidade = ingrediente.quantidade || 0;
      console.log(`Ingrediente: ${ingrediente.insumo}, Quantidade: ${quantidade}kg`);
      return total + quantidade;
    }, 0);

    // Calcular custo total da fórmula
    const custoTotal = ingredientes.reduce((total, ingrediente) => {
      const custo = ingrediente.custo || 0;
      console.log(`Ingrediente: ${ingrediente.insumo}, Custo: R$ ${custo.toFixed(2)}`);
      return total + custo;
    }, 0);

    // Calcular custo por kg com proteção contra divisão por zero
    let custoPorKg = 0;
    if (pesoTotal > 0) {
      custoPorKg = custoTotal / pesoTotal;
    }

    console.log("=== CÁLCULOS FINAIS ===");
    console.log(`Peso Total da Fórmula: ${pesoTotal.toFixed(2)}kg`);
    console.log(`Custo Total da Fórmula: R$ ${custoTotal.toFixed(2)}`);
    console.log(`Custo por Kg: R$ ${custoPorKg.toFixed(2)}`);
    console.log("========================");

    // Atualizar os estados
    setPesoTotalDaFormula(pesoTotal);
    setCustoTotalDaFormula(custoTotal);
    setCustoFinalPorKg(custoPorKg);
  }, [ingredientes]);

  const adicionarIngrediente = () => {
    if (!novoIngrediente.insumo || novoIngrediente.quantidade <= 0) {
      toast({
        title: "Erro",
        description: "Selecione um insumo e informe uma quantidade válida.",
        variant: "destructive"
      });
      return;
    }

    // Verificar se o ingrediente já foi adicionado
    const ingredienteExistente = ingredientes.find(ing => ing.insumo === novoIngrediente.insumo);
    if (ingredienteExistente) {
      toast({
        title: "Erro",
        description: "Este ingrediente já foi adicionado à fórmula.",
        variant: "destructive"
      });
      return;
    }

    const insumoSelecionado = insumos.find(i => i.nome === novoIngrediente.insumo);
    
    if (!insumoSelecionado) {
      toast({
        title: "Erro",
        description: "Insumo selecionado não encontrado.",
        variant: "destructive"
      });
      return;
    }

    const precoKg = insumoSelecionado.precoKg || 0;
    
    if (precoKg === 0) {
      toast({
        title: "Aviso",
        description: "Este insumo não possui preço cadastrado. Custo será R$ 0,00.",
        variant: "default"
      });
    }

    const custo = precoKg * novoIngrediente.quantidade;

    console.log(`=== ADICIONANDO INGREDIENTE ===`);
    console.log(`Insumo: ${novoIngrediente.insumo}`);
    console.log(`Quantidade: ${novoIngrediente.quantidade}kg`);
    console.log(`Preço por Kg: R$ ${precoKg.toFixed(2)}`);
    console.log(`Custo do Ingrediente: R$ ${custo.toFixed(2)}`);
    console.log("===============================");

    const novoIngredienteCompleto: Ingrediente = {
      insumo: novoIngrediente.insumo,
      quantidade: novoIngrediente.quantidade,
      precoKg: precoKg,
      custo: custo
    };

    setIngredientes(prev => [...prev, novoIngredienteCompleto]);
    setNovoIngrediente({ insumo: "", quantidade: 0 });

    toast({
      title: "Ingrediente adicionado",
      description: `${novoIngrediente.insumo} - ${novoIngrediente.quantidade}kg adicionado. Custo: ${custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
    });
  };

  const removerIngrediente = (index: number) => {
    const ingredienteRemovido = ingredientes[index];
    const novosIngredientes = ingredientes.filter((_, i) => i !== index);
    setIngredientes(novosIngredientes);
    
    console.log(`Ingrediente removido: ${ingredienteRemovido.insumo}`);
    
    toast({
      title: "Ingrediente removido",
      description: `${ingredienteRemovido.insumo} removido da fórmula.`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.faseAve) {
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
        description: "Adicione pelo menos um ingrediente à fórmula.",
        variant: "destructive"
      });
      return;
    }

    const novaFormula: Formula = {
      id: Date.now().toString(),
      nome: formData.nome,
      faseAve: formData.faseAve,
      ingredientes: [...ingredientes],
      custoTotalPor1000kg: custoTotalDaFormula,
      custoPorKg: custoFinalPorKg,
      pesoTotal: pesoTotalDaFormula
    };

    const updatedFormulas = [...formulas, novaFormula];
    localStorage.setItem('formulasRacao', JSON.stringify(updatedFormulas));
    setFormulas(updatedFormulas);

    console.log("=== FÓRMULA SALVA ===");
    console.log(`Nome: ${formData.nome}`);
    console.log(`Fase: ${formData.faseAve}`);
    console.log(`Peso Total: ${pesoTotalDaFormula.toFixed(2)}kg`);
    console.log(`Custo Total: R$ ${custoTotalDaFormula.toFixed(2)}`);
    console.log(`Custo por Kg: R$ ${custoFinalPorKg.toFixed(2)}`);
    console.log("====================");

    toast({
      title: "Sucesso!",
      description: `Fórmula "${formData.nome}" cadastrada. Custo por Kg: ${custoFinalPorKg.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
    });

    // Reset form
    setFormData({ nome: "", faseAve: "" });
    setIngredientes([]);
    setShowForm(false);
  };

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

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ingredientes da Fórmula</h3>
                
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
                            {insumo.nome} - {(insumo.precoKg || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/kg
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
                      min="0.1"
                      value={novoIngrediente.quantidade || ''}
                      onChange={(e) => setNovoIngrediente({ ...novoIngrediente, quantidade: Number(e.target.value) })}
                      placeholder="0.0"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" onClick={adicionarIngrediente} className="w-full">
                      Adicionar
                    </Button>
                  </div>
                </div>

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
                        {ingredientes.map((ingrediente, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{ingrediente.insumo}</TableCell>
                            <TableCell>{ingrediente.quantidade.toFixed(1)}kg</TableCell>
                            <TableCell className="font-semibold text-blue-600">
                              {ingrediente.precoKg.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </TableCell>
                            <TableCell className="font-bold text-green-600">
                              {ingrediente.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </TableCell>
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
                        ))}
                      </TableBody>
                    </Table>
                    
                    <div className="p-4 bg-blue-50 border-t">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Peso Total: </span>
                          <span className="font-bold text-blue-600 text-lg">{pesoTotalDaFormula.toFixed(1)}kg</span>
                        </div>
                        <div>
                          <span className="font-medium">Custo Total: </span>
                          <span className="font-bold text-blue-600 text-lg">{custoTotalDaFormula.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                        <div>
                          <span className="font-medium">Custo por Kg: </span>
                          <span className="font-bold text-green-600 text-xl">{custoFinalPorKg.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
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
                      <p className="text-gray-600">Peso Total: {formula.pesoTotal?.toFixed(1) || 0}kg</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Custo por Kg</p>
                      <p className="font-bold text-green-600 text-xl">{formula.custoPorKg.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <p><strong>Ingredientes:</strong></p>
                    {formula.ingredientes.map((ing, idx) => (
                      <p key={idx} className="ml-4">
                        • {ing.insumo}: {ing.quantidade.toFixed(1)}kg ({ing.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                      </p>
                    ))}
                    <p className="mt-2"><strong>Custo Total:</strong> {formula.custoTotalPor1000kg.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
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
