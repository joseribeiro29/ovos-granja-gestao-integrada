
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface Galpao {
  id: string;
  nome: string;
  lote: string;
  qtdeAves: number;
  estoqueAtualOvosBons: number;
  totalGeralPerdas: number;
}

const Galpoes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [galpoes, setGalpoes] = useState<Galpao[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    lote: "",
    qtdeAves: 0
  });

  useEffect(() => {
    const savedGalpoes = localStorage.getItem('galpoes');
    if (savedGalpoes) {
      setGalpoes(JSON.parse(savedGalpoes));
    }
  }, []);

  const saveGalpoes = (newGalpoes: Galpao[]) => {
    localStorage.setItem('galpoes', JSON.stringify(newGalpoes));
    setGalpoes(newGalpoes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newGalpao: Galpao = {
      id: Date.now().toString(),
      nome: formData.nome,
      lote: formData.lote,
      qtdeAves: formData.qtdeAves,
      estoqueAtualOvosBons: 0,
      totalGeralPerdas: 0
    };

    const updatedGalpoes = [...galpoes, newGalpao];
    saveGalpoes(updatedGalpoes);

    toast({
      title: "Sucesso!",
      description: "Galpão cadastrado com sucesso.",
    });

    setFormData({ nome: "", lote: "", qtdeAves: 0 });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    const updatedGalpoes = galpoes.filter(g => g.id !== id);
    saveGalpoes(updatedGalpoes);
    
    toast({
      title: "Galpão removido",
      description: "Galpão removido com sucesso.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestão de Galpões
            </h1>
            <p className="text-gray-600">
              Controle de galpões e estoque de ovos por galpão
            </p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowDownUp className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {galpoes.map((galpao) => (
            <Card key={galpao.id} className="bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  {galpao.nome}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(galpao.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription>Lote: {galpao.lote}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Qtde de Aves:</span>
                    <span className="font-medium">{galpao.qtdeAves}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Estoque Ovos Bons:</span>
                    <span className="font-bold text-green-600">{galpao.estoqueAtualOvosBons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">Total Perdas:</span>
                    <span className="font-medium text-red-600">{galpao.totalGeralPerdas}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Cadastro de Galpões</CardTitle>
              <Button onClick={() => setShowForm(!showForm)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Novo Galpão
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showForm && (
              <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome do Galpão</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lote">Lote</Label>
                    <Input
                      id="lote"
                      value={formData.lote}
                      onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="qtdeAves">Quantidade de Aves</Label>
                    <Input
                      id="qtdeAves"
                      type="number"
                      value={formData.qtdeAves}
                      onChange={(e) => setFormData({ ...formData, qtdeAves: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Salvar Galpão</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Galpão</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Qtde Aves</TableHead>
                  <TableHead>Estoque Ovos</TableHead>
                  <TableHead>Total Perdas</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {galpoes.map((galpao) => (
                  <TableRow key={galpao.id}>
                    <TableCell className="font-medium">{galpao.nome}</TableCell>
                    <TableCell>{galpao.lote}</TableCell>
                    <TableCell>{galpao.qtdeAves}</TableCell>
                    <TableCell className="text-green-600 font-bold">{galpao.estoqueAtualOvosBons}</TableCell>
                    <TableCell className="text-red-600">{galpao.totalGeralPerdas}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(galpao.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {galpoes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhum galpão cadastrado ainda.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Galpoes;
