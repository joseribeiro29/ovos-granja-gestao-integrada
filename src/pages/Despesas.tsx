
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { ArrowDownUp, PlusIcon, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CategoriaDespesa {
  id: string;
  nome: string;
  descricao?: string;
}

interface Despesa {
  id: string;
  data: string;
  descricao: string;
  categoria: string;
  valor: number;
}

const Despesas = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categorias, setCategorias] = useState<CategoriaDespesa[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [showCategoriaForm, setShowCategoriaForm] = useState(false);
  const [showDespesaForm, setShowDespesaForm] = useState(false);
  const [editandoCategoria, setEditandoCategoria] = useState<CategoriaDespesa | null>(null);
  
  const [categoriaForm, setCategoriaForm] = useState({
    nome: "",
    descricao: ""
  });

  const [despesaForm, setDespesaForm] = useState({
    data: "",
    descricao: "",
    categoria: "",
    valor: 0
  });

  useEffect(() => {
    const savedCategorias = localStorage.getItem('categoriasDespesas');
    if (savedCategorias) {
      setCategorias(JSON.parse(savedCategorias));
    } else {
      // Categorias padrão
      const categoriasDefault = [
        { id: "1", nome: "Salários", descricao: "Pagamento de funcionários" },
        { id: "2", nome: "Energia Elétrica", descricao: "Conta de luz" },
        { id: "3", nome: "Combustível", descricao: "Gasolina, diesel, etc." },
        { id: "4", nome: "Manutenção", descricao: "Reparos e manutenções" },
        { id: "5", nome: "Impostos", descricao: "Taxas e impostos" }
      ];
      setCategorias(categoriasDefault);
      localStorage.setItem('categoriasDespesas', JSON.stringify(categoriasDefault));
    }

    const savedDespesas = localStorage.getItem('despesas');
    if (savedDespesas) {
      setDespesas(JSON.parse(savedDespesas));
    }
  }, []);

  const saveCategorias = (newCategorias: CategoriaDespesa[]) => {
    localStorage.setItem('categoriasDespesas', JSON.stringify(newCategorias));
    setCategorias(newCategorias);
  };

  const saveDespesas = (newDespesas: Despesa[]) => {
    localStorage.setItem('despesas', JSON.stringify(newDespesas));
    setDespesas(newDespesas);
  };

  const handleCategoriaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoriaForm.nome) {
      toast({
        title: "Erro",
        description: "O nome da categoria é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    if (editandoCategoria) {
      const updatedCategorias = categorias.map(cat => 
        cat.id === editandoCategoria.id 
          ? { ...cat, nome: categoriaForm.nome, descricao: categoriaForm.descricao }
          : cat
      );
      saveCategorias(updatedCategorias);
      
      toast({
        title: "Sucesso!",
        description: "Categoria atualizada com sucesso.",
      });
    } else {
      const novaCategoria: CategoriaDespesa = {
        id: Date.now().toString(),
        nome: categoriaForm.nome,
        descricao: categoriaForm.descricao
      };

      const updatedCategorias = [...categorias, novaCategoria];
      saveCategorias(updatedCategorias);

      toast({
        title: "Sucesso!",
        description: "Categoria cadastrada com sucesso.",
      });
    }

    setCategoriaForm({ nome: "", descricao: "" });
    setEditandoCategoria(null);
    setShowCategoriaForm(false);
  };

  const handleDespesaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!despesaForm.data || !despesaForm.descricao || !despesaForm.categoria || despesaForm.valor <= 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const novaDespesa: Despesa = {
      id: Date.now().toString(),
      data: despesaForm.data,
      descricao: despesaForm.descricao,
      categoria: despesaForm.categoria,
      valor: despesaForm.valor
    };

    const updatedDespesas = [...despesas, novaDespesa];
    saveDespesas(updatedDespesas);

    toast({
      title: "Sucesso!",
      description: "Despesa registrada com sucesso.",
    });

    setDespesaForm({ data: "", descricao: "", categoria: "", valor: 0 });
    setShowDespesaForm(false);
  };

  const editarCategoria = (categoria: CategoriaDespesa) => {
    setEditandoCategoria(categoria);
    setCategoriaForm({
      nome: categoria.nome,
      descricao: categoria.descricao || ""
    });
    setShowCategoriaForm(true);
  };

  const excluirCategoria = (id: string) => {
    const updatedCategorias = categorias.filter(cat => cat.id !== id);
    saveCategorias(updatedCategorias);
    
    toast({
      title: "Categoria removida",
      description: "Categoria excluída com sucesso.",
    });
  };

  const excluirDespesa = (id: string) => {
    const updatedDespesas = despesas.filter(desp => desp.id !== id);
    saveDespesas(updatedDespesas);
    
    toast({
      title: "Despesa removida",
      description: "Despesa excluída com sucesso.",
    });
  };

  const totalDespesas = despesas.reduce((acc, despesa) => acc + despesa.valor, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Controle de Despesas
            </h1>
            <p className="text-gray-600">
              Gestão completa de categorias e lançamento de despesas operacionais
            </p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowDownUp className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>

        {/* Card de resumo */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                R$ {totalDespesas.toFixed(2)}
              </div>
              <div className="text-gray-600">
                Total de despesas registradas
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="despesas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="despesas">Lançamento de Despesas</TabsTrigger>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
          </TabsList>

          <TabsContent value="despesas">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Registrar Nova Despesa</CardTitle>
                  <Button onClick={() => setShowDespesaForm(!showDespesaForm)}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Nova Despesa
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showDespesaForm && (
                  <form onSubmit={handleDespesaSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dataDespesa">Data da Despesa</Label>
                        <Input
                          id="dataDespesa"
                          type="date"
                          value={despesaForm.data}
                          onChange={(e) => setDespesaForm({ ...despesaForm, data: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="categoriaDespesa">Categoria</Label>
                        <Select value={despesaForm.categoria} onValueChange={(value) => setDespesaForm({ ...despesaForm, categoria: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categorias.map((categoria) => (
                              <SelectItem key={categoria.id} value={categoria.nome}>
                                {categoria.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="descricaoDespesa">Descrição da Despesa</Label>
                        <Input
                          id="descricaoDespesa"
                          value={despesaForm.descricao}
                          onChange={(e) => setDespesaForm({ ...despesaForm, descricao: e.target.value })}
                          placeholder="Ex: Conta de luz do mês de janeiro"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="valorDespesa">Valor (R$)</Label>
                        <Input
                          id="valorDespesa"
                          type="number"
                          step="0.01"
                          value={despesaForm.valor}
                          onChange={(e) => setDespesaForm({ ...despesaForm, valor: Number(e.target.value) })}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Registrar Despesa</Button>
                      <Button type="button" variant="outline" onClick={() => setShowDespesaForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {despesas.map((despesa) => (
                      <TableRow key={despesa.id}>
                        <TableCell>{new Date(despesa.data).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="font-medium">{despesa.descricao}</TableCell>
                        <TableCell>{despesa.categoria}</TableCell>
                        <TableCell className="text-red-600 font-bold">R$ {despesa.valor.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => excluirDespesa(despesa.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {despesas.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma despesa registrada ainda.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categorias">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Gerenciar Categorias</CardTitle>
                  <Button onClick={() => setShowCategoriaForm(!showCategoriaForm)}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Nova Categoria
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showCategoriaForm && (
                  <form onSubmit={handleCategoriaSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nomeCategoria">Nome da Categoria</Label>
                        <Input
                          id="nomeCategoria"
                          value={categoriaForm.nome}
                          onChange={(e) => setCategoriaForm({ ...categoriaForm, nome: e.target.value })}
                          placeholder="Ex: Veterinário"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="descricaoCategoria">Descrição (Opcional)</Label>
                        <Input
                          id="descricaoCategoria"
                          value={categoriaForm.descricao}
                          onChange={(e) => setCategoriaForm({ ...categoriaForm, descricao: e.target.value })}
                          placeholder="Descrição da categoria"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">
                        {editandoCategoria ? 'Atualizar' : 'Salvar'} Categoria
                      </Button>
                      <Button type="button" variant="outline" onClick={() => {
                        setShowCategoriaForm(false);
                        setEditandoCategoria(null);
                        setCategoriaForm({ nome: "", descricao: "" });
                      }}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categorias.map((categoria) => (
                      <TableRow key={categoria.id}>
                        <TableCell className="font-medium">{categoria.nome}</TableCell>
                        <TableCell>{categoria.descricao || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => editarCategoria(categoria)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => excluirCategoria(categoria.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Despesas;
