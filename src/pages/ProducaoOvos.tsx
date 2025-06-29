
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { ArrowDownUp, PlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Galpao {
  id: string;
  nome: string;
  lote: string;
  qtdeAves: number;
  dataChegadaLote: string;
}

interface ProducaoOvo {
  id: string;
  data: string;
  galpaoId: string;
  galpaoNome: string;
  ovosBons: number;
  ovosQuebrados: number;
}

const ProducaoOvos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [galpoes, setGalpoes] = useState<Galpao[]>([]);
  const [producoes, setProducoes] = useState<ProducaoOvo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    data: "",
    galpaoId: "",
    ovosBons: 0,
    ovosQuebrados: 0
  });

  useEffect(() => {
    const savedGalpoes = localStorage.getItem('galpoes');
    if (savedGalpoes) {
      setGalpoes(JSON.parse(savedGalpoes));
    }

    const savedProducoes = localStorage.getItem('producaoOvos');
    if (savedProducoes) {
      setProducoes(JSON.parse(savedProducoes));
    }
  }, []);

  const saveProducoes = (newProducoes: ProducaoOvo[]) => {
    localStorage.setItem('producaoOvos', JSON.stringify(newProducoes));
    setProducoes(newProducoes);
  };

  const updateEstoqueCentralOvos = (ovosBons: number) => {
    const estoqueAtual = localStorage.getItem('estoqueCentralOvos');
    const estoque = estoqueAtual ? JSON.parse(estoqueAtual) : { quantidade: 0, perdas: 0 };
    
    estoque.quantidade += ovosBons;
    localStorage.setItem('estoqueCentralOvos', JSON.stringify(estoque));
  };

  const updateTotalPerdas = (ovosQuebrados: number) => {
    const estoqueAtual = localStorage.getItem('estoqueCentralOvos');
    const estoque = estoqueAtual ? JSON.parse(estoqueAtual) : { quantidade: 0, perdas: 0 };
    
    estoque.perdas += ovosQuebrados;
    localStorage.setItem('estoqueCentralOvos', JSON.stringify(estoque));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedGalpao = galpoes.find(g => g.id === formData.galpaoId);
    if (!selectedGalpao) {
      toast({
        title: "Erro",
        description: "Selecione um galpão válido.",
        variant: "destructive"
      });
      return;
    }

    const newProducao: ProducaoOvo = {
      id: Date.now().toString(),
      data: formData.data,
      galpaoId: formData.galpaoId,
      galpaoNome: selectedGalpao.nome,
      ovosBons: formData.ovosBons,
      ovosQuebrados: formData.ovosQuebrados
    };

    const updatedProducoes = [...producoes, newProducao];
    saveProducoes(updatedProducoes);

    // Atualizar estoque central de ovos
    updateEstoqueCentralOvos(formData.ovosBons);
    updateTotalPerdas(formData.ovosQuebrados);

    toast({
      title: "Sucesso!",
      description: `Produção registrada. ${formData.ovosBons} ovos adicionados ao estoque central.`,
    });

    setFormData({ data: "", galpaoId: "", ovosBons: 0, ovosQuebrados: 0 });
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Produção de Ovos
            </h1>
            <p className="text-gray-600">
              Registro diário de produção - Entrada no estoque central
            </p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowDownUp className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>

        <Card className="mb-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="data">Data</Label>
                    <Input
                      id="data"
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="galpao">Galpão</Label>
                    <Select value={formData.galpaoId} onValueChange={(value) => setFormData({ ...formData, galpaoId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o galpão" />
                      </SelectTrigger>
                      <SelectContent>
                        {galpoes.map((galpao) => (
                          <SelectItem key={galpao.id} value={galpao.id}>
                            {galpao.nome} - {galpao.lote}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ovosBons">Ovos Bons</Label>
                    <Input
                      id="ovosBons"
                      type="number"
                      value={formData.ovosBons}
                      onChange={(e) => setFormData({ ...formData, ovosBons: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ovosQuebrados">Ovos Quebrados</Label>
                    <Input
                      id="ovosQuebrados"
                      type="number"
                      value={formData.ovosQuebrados}
                      onChange={(e) => setFormData({ ...formData, ovosQuebrados: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>
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
            <CardTitle>Histórico de Produção</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Galpão</TableHead>
                  <TableHead>Ovos Bons</TableHead>
                  <TableHead>Ovos Quebrados</TableHead>
                  <TableHead>Total Produzido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {producoes.map((producao) => (
                  <TableRow key={producao.id}>
                    <TableCell>{new Date(producao.data).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="font-medium">{producao.galpaoNome}</TableCell>
                    <TableCell className="text-green-600 font-bold">{producao.ovosBons}</TableCell>
                    <TableCell className="text-red-600">{producao.ovosQuebrados}</TableCell>
                    <TableCell className="font-medium">{producao.ovosBons + producao.ovosQuebrados}</TableCell>
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
    </div>
  );
};

export default ProducaoOvos;
