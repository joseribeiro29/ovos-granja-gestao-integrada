import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { ArrowDownUp, PlusIcon, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Galpao {
  id: string;
  nome: string;
  lote: string;
  qtdeAves: number;
  estoqueAtualOvosBons: number;
  totalGeralPerdas: number;
}

interface EventoMortalidade {
  id: string;
  data: string;
  galpaoId: string;
  galpaoNome: string;
  qtdeAves: number;
  causa: string;
}

interface EventoManejo {
  id: string;
  data: string;
  galpaoId: string;
  galpaoNome: string;
  tipoManejo: string;
  descricao: string;
  custoManejo: number;
}

interface ConsumoRacao {
  id: string;
  data: string;
  galpaoId: string;
  galpaoNome: string;
  tipoRacao: string;
  quantidadeConsumida: number;
}

const GestaoGalpao = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [galpoes, setGalpoes] = useState<Galpao[]>([]);
  const [eventosMortalidade, setEventosMortalidade] = useState<EventoMortalidade[]>([]);
  const [eventosManejo, setEventosManejo] = useState<EventoManejo[]>([]);
  const [consumosRacao, setConsumosRacao] = useState<ConsumoRacao[]>([]);
  const [formulas, setFormulas] = useState<any[]>([]);
  const [showMortalidadeForm, setShowMortalidadeForm] = useState(false);
  const [showManejoForm, setShowManejoForm] = useState(false);
  const [showConsumoForm, setShowConsumoForm] = useState(false);
  
  const [mortalidadeForm, setMortalidadeForm] = useState({
    data: "",
    galpaoId: "",
    qtdeAves: 0,
    causa: ""
  });

  const [manejoForm, setManejoForm] = useState({
    data: "",
    galpaoId: "",
    tipoManejo: "",
    descricao: "",
    custoManejo: 0
  });

  const [consumoForm, setConsumoForm] = useState({
    data: "",
    galpaoId: "",
    tipoRacao: "",
    quantidadeConsumida: 0
  });

  useEffect(() => {
    const savedGalpoes = localStorage.getItem('galpoes');
    if (savedGalpoes) {
      setGalpoes(JSON.parse(savedGalpoes));
    }

    const savedMortalidade = localStorage.getItem('eventosMortalidade');
    if (savedMortalidade) {
      setEventosMortalidade(JSON.parse(savedMortalidade));
    }

    const savedManejo = localStorage.getItem('eventosManejo');
    if (savedManejo) {
      setEventosManejo(JSON.parse(savedManejo));
    }

    const savedConsumos = localStorage.getItem('consumosRacao');
    if (savedConsumos) {
      setConsumosRacao(JSON.parse(savedConsumos));
    }

    const savedFormulas = localStorage.getItem('formulasRacao');
    if (savedFormulas) {
      setFormulas(JSON.parse(savedFormulas));
    }
  }, []);

  const saveGalpoes = (newGalpoes: Galpao[]) => {
    localStorage.setItem('galpoes', JSON.stringify(newGalpoes));
    setGalpoes(newGalpoes);
  };

  const handleMortalidadeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedGalpao = galpoes.find(g => g.id === mortalidadeForm.galpaoId);
    if (!selectedGalpao) {
      toast({
        title: "Erro",
        description: "Selecione um galpão válido.",
        variant: "destructive"
      });
      return;
    }

    if (mortalidadeForm.qtdeAves > selectedGalpao.qtdeAves) {
      toast({
        title: "Erro",
        description: `O galpão ${selectedGalpao.nome} possui apenas ${selectedGalpao.qtdeAves} aves.`,
        variant: "destructive"
      });
      return;
    }

    const newEvento: EventoMortalidade = {
      id: Date.now().toString(),
      data: mortalidadeForm.data,
      galpaoId: mortalidadeForm.galpaoId,
      galpaoNome: selectedGalpao.nome,
      qtdeAves: mortalidadeForm.qtdeAves,
      causa: mortalidadeForm.causa
    };

    const updatedEventos = [...eventosMortalidade, newEvento];
    setEventosMortalidade(updatedEventos);
    localStorage.setItem('eventosMortalidade', JSON.stringify(updatedEventos));

    const updatedGalpoes = galpoes.map(galpao => {
      if (galpao.id === mortalidadeForm.galpaoId) {
        return {
          ...galpao,
          qtdeAves: galpao.qtdeAves - mortalidadeForm.qtdeAves
        };
      }
      return galpao;
    });
    saveGalpoes(updatedGalpoes);

    toast({
      title: "Sucesso!",
      description: `Mortalidade registrada. ${mortalidadeForm.qtdeAves} aves foram deduzidas do ${selectedGalpao.nome}.`,
    });

    setMortalidadeForm({ data: "", galpaoId: "", qtdeAves: 0, causa: "" });
    setShowMortalidadeForm(false);
  };

  const handleManejoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedGalpao = galpoes.find(g => g.id === manejoForm.galpaoId);
    if (!selectedGalpao) {
      toast({
        title: "Erro",
        description: "Selecione um galpão válido.",
        variant: "destructive"
      });
      return;
    }

    const newEvento: EventoManejo = {
      id: Date.now().toString(),
      data: manejoForm.data,
      galpaoId: manejoForm.galpaoId,
      galpaoNome: selectedGalpao.nome,
      tipoManejo: manejoForm.tipoManejo,
      descricao: manejoForm.descricao,
      custoManejo: manejoForm.custoManejo
    };

    const updatedEventos = [...eventosManejo, newEvento];
    setEventosManejo(updatedEventos);
    localStorage.setItem('eventosManejo', JSON.stringify(updatedEventos));

    toast({
      title: "Sucesso!",
      description: "Manejo registrado com sucesso.",
    });

    setManejoForm({ data: "", galpaoId: "", tipoManejo: "", descricao: "", custoManejo: 0 });
    setShowManejoForm(false);
  };

  const handleConsumoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedGalpao = galpoes.find(g => g.id === consumoForm.galpaoId);
    if (!selectedGalpao) {
      toast({
        title: "Erro",
        description: "Selecione um galpão válido.",
        variant: "destructive"
      });
      return;
    }

    // Verificar se há ração suficiente no estoque
    const estoqueRacao = localStorage.getItem('estoqueRacao');
    const estoque = estoqueRacao ? JSON.parse(estoqueRacao) : { quantidade: 0 };
    
    if (consumoForm.quantidadeConsumida > estoque.quantidade) {
      toast({
        title: "Erro",
        description: `Estoque insuficiente. Disponível: ${estoque.quantidade}kg`,
        variant: "destructive"
      });
      return;
    }

    const novoConsumo: ConsumoRacao = {
      id: Date.now().toString(),
      data: consumoForm.data,
      galpaoId: consumoForm.galpaoId,
      galpaoNome: selectedGalpao.nome,
      tipoRacao: consumoForm.tipoRacao,
      quantidadeConsumida: consumoForm.quantidadeConsumida
    };

    const updatedConsumos = [...consumosRacao, novoConsumo];
    setConsumosRacao(updatedConsumos);
    localStorage.setItem('consumosRacao', JSON.stringify(updatedConsumos));

    // Dar baixa no estoque de ração
    estoque.quantidade -= consumoForm.quantidadeConsumida;
    localStorage.setItem('estoqueRacao', JSON.stringify(estoque));

    toast({
      title: "Sucesso!",
      description: `Consumo registrado. ${consumoForm.quantidadeConsumida}kg deduzidos do estoque.`,
    });

    setConsumoForm({ data: "", galpaoId: "", tipoRacao: "", quantidadeConsumida: 0 });
    setShowConsumoForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestão de Galpão
            </h1>
            <p className="text-gray-600">
              Controle completo de eventos, manejos e consumo de ração por galpão
            </p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowDownUp className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>

        <Tabs defaultValue="mortalidade" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mortalidade">Mortalidade</TabsTrigger>
            <TabsTrigger value="manejo">Manejos</TabsTrigger>
            <TabsTrigger value="consumo">Consumo de Ração</TabsTrigger>
          </TabsList>

          <TabsContent value="mortalidade">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Registrar Mortalidade</CardTitle>
                  <Button onClick={() => setShowMortalidadeForm(!showMortalidadeForm)}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Nova Mortalidade
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showMortalidadeForm && (
                  <form onSubmit={handleMortalidadeSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dataMortalidade">Data</Label>
                        <Input
                          id="dataMortalidade"
                          type="date"
                          value={mortalidadeForm.data}
                          onChange={(e) => setMortalidadeForm({ ...mortalidadeForm, data: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="galpaoMortalidade">Galpão</Label>
                        <Select value={mortalidadeForm.galpaoId} onValueChange={(value) => setMortalidadeForm({ ...mortalidadeForm, galpaoId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o galpão" />
                          </SelectTrigger>
                          <SelectContent>
                            {galpoes.map((galpao) => (
                              <SelectItem key={galpao.id} value={galpao.id}>
                                {galpao.nome} - {galpao.qtdeAves} aves
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="qtdeAvesMortalidade">Quantidade de Aves</Label>
                        <Input
                          id="qtdeAvesMortalidade"
                          type="number"
                          value={mortalidadeForm.qtdeAves}
                          onChange={(e) => setMortalidadeForm({ ...mortalidadeForm, qtdeAves: Number(e.target.value) })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="causaMortalidade">Causa / Observação</Label>
                        <Input
                          id="causaMortalidade"
                          value={mortalidadeForm.causa}
                          onChange={(e) => setMortalidadeForm({ ...mortalidadeForm, causa: e.target.value })}
                          placeholder="Ex: Doença, Predador, etc."
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Registrar Mortalidade</Button>
                      <Button type="button" variant="outline" onClick={() => setShowMortalidadeForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Galpão</TableHead>
                      <TableHead>Qtde Aves</TableHead>
                      <TableHead>Causa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventosMortalidade.map((evento) => (
                      <TableRow key={evento.id}>
                        <TableCell>{new Date(evento.data).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{evento.galpaoNome}</TableCell>
                        <TableCell className="text-red-600 font-bold">{evento.qtdeAves}</TableCell>
                        <TableCell>{evento.causa}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {eventosMortalidade.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma mortalidade registrada ainda.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manejo">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Registrar Manejo</CardTitle>
                  <Button onClick={() => setShowManejoForm(!showManejoForm)}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Novo Manejo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showManejoForm && (
                  <form onSubmit={handleManejoSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dataManejo">Data</Label>
                        <Input
                          id="dataManejo"
                          type="date"
                          value={manejoForm.data}
                          onChange={(e) => setManejoForm({ ...manejoForm, data: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="galpaoManejo">Galpão</Label>
                        <Select value={manejoForm.galpaoId} onValueChange={(value) => setManejoForm({ ...manejoForm, galpaoId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o galpão" />
                          </SelectTrigger>
                          <SelectContent>
                            {galpoes.map((galpao) => (
                              <SelectItem key={galpao.id} value={galpao.id}>
                                {galpao.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tipoManejo">Tipo de Manejo</Label>
                        <Select value={manejoForm.tipoManejo} onValueChange={(value) => setManejoForm({ ...manejoForm, tipoManejo: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Vacina">Vacina</SelectItem>
                            <SelectItem value="Pesagem">Pesagem</SelectItem>
                            <SelectItem value="Debicagem">Debicagem</SelectItem>
                            <SelectItem value="Transferência">Transferência</SelectItem>
                            <SelectItem value="Outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="custoManejo">Custo (R$)</Label>
                        <Input
                          id="custoManejo"
                          type="number"
                          step="0.01"
                          value={manejoForm.custoManejo}
                          onChange={(e) => setManejoForm({ ...manejoForm, custoManejo: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="descricaoManejo">Descrição</Label>
                      <Textarea
                        id="descricaoManejo"
                        value={manejoForm.descricao}
                        onChange={(e) => setManejoForm({ ...manejoForm, descricao: e.target.value })}
                        placeholder="Ex: Aplicação da vacina NewCastle"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Registrar Manejo</Button>
                      <Button type="button" variant="outline" onClick={() => setShowManejoForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Galpão</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Custo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventosManejo.map((evento) => (
                      <TableRow key={evento.id}>
                        <TableCell>{new Date(evento.data).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{evento.galpaoNome}</TableCell>
                        <TableCell>{evento.tipoManejo}</TableCell>
                        <TableCell>R$ {evento.custoManejo.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {eventosManejo.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum manejo registrado ainda.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consumo">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Registrar Consumo Diário de Ração</CardTitle>
                  <Button onClick={() => setShowConsumoForm(!showConsumoForm)}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Novo Consumo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showConsumoForm && (
                  <form onSubmit={handleConsumoSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dataConsumo">Data</Label>
                        <Input
                          id="dataConsumo"
                          type="date"
                          value={consumoForm.data}
                          onChange={(e) => setConsumoForm({ ...consumoForm, data: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="galpaoConsumo">Galpão</Label>
                        <Select value={consumoForm.galpaoId} onValueChange={(value) => setConsumoForm({ ...consumoForm, galpaoId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o galpão" />
                          </SelectTrigger>
                          <SelectContent>
                            {galpoes.map((galpao) => (
                              <SelectItem key={galpao.id} value={galpao.id}>
                                {galpao.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tipoRacao">Tipo de Ração</Label>
                        <Select value={consumoForm.tipoRacao} onValueChange={(value) => setConsumoForm({ ...consumoForm, tipoRacao: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de ração" />
                          </SelectTrigger>
                          <SelectContent>
                            {formulas.map((formula) => (
                              <SelectItem key={formula.id} value={formula.nome}>
                                {formula.nome} - {formula.faseAve}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="quantidadeConsumida">Quantidade Consumida (KG)</Label>
                        <Input
                          id="quantidadeConsumida"
                          type="number"
                          step="0.1"
                          value={consumoForm.quantidadeConsumida}
                          onChange={(e) => setConsumoForm({ ...consumoForm, quantidadeConsumida: Number(e.target.value) })}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Registrar Consumo</Button>
                      <Button type="button" variant="outline" onClick={() => setShowConsumoForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Galpão</TableHead>
                      <TableHead>Tipo de Ração</TableHead>
                      <TableHead>Qtde Consumida (KG)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consumosRacao.map((consumo) => (
                      <TableRow key={consumo.id}>
                        <TableCell>{new Date(consumo.data).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{consumo.galpaoNome}</TableCell>
                        <TableCell>{consumo.tipoRacao}</TableCell>
                        <TableCell className="text-orange-600 font-bold">{consumo.quantidadeConsumida.toFixed(1)} kg</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {consumosRacao.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum consumo registrado ainda.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GestaoGalpao;
