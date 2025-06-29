
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

interface Venda {
  id: string;
  data: string;
  cliente: string;
  produto: string;
  qtdeVendida: number;
  valorUnitario: number;
  valorTotal: number;
  formaPagamento: string;
  dataVencimento?: string;
  statusPagamento: string;
  dataPagamento?: string;
}

const Vendas = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [estoqueAtual, setEstoqueAtual] = useState(0);
  const [formData, setFormData] = useState({
    data: "",
    cliente: "",
    produto: "",
    qtdeVendida: 0,
    valorUnitario: 0,
    formaPagamento: "",
    dataVencimento: ""
  });

  useEffect(() => {
    const savedVendas = localStorage.getItem('vendas');
    if (savedVendas) {
      setVendas(JSON.parse(savedVendas));
    }

    // Carregar estoque central de ovos
    const estoqueCentral = localStorage.getItem('estoqueCentralOvos');
    if (estoqueCentral) {
      const estoque = JSON.parse(estoqueCentral);
      setEstoqueAtual(estoque.quantidade || 0);
    }
  }, []);

  const saveVendas = (newVendas: Venda[]) => {
    localStorage.setItem('vendas', JSON.stringify(newVendas));
    setVendas(newVendas);
  };

  const updateEstoqueCentralOvos = (qtdeVendida: number) => {
    const estoqueAtualData = localStorage.getItem('estoqueCentralOvos');
    const estoque = estoqueAtualData ? JSON.parse(estoqueAtualData) : { quantidade: 0, perdas: 0 };
    
    estoque.quantidade -= qtdeVendida;
    localStorage.setItem('estoqueCentralOvos', JSON.stringify(estoque));
    setEstoqueAtual(estoque.quantidade);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de estoque
    if (formData.qtdeVendida > estoqueAtual) {
      toast({
        title: "Estoque insuficiente!",
        description: `Estoque atual: ${estoqueAtual} ovos. Quantidade solicitada: ${formData.qtdeVendida} ovos.`,
        variant: "destructive"
      });
      return;
    }

    // Validação da data de vencimento para pagamentos a prazo
    if (formData.formaPagamento === "A Prazo" && !formData.dataVencimento) {
      toast({
        title: "Erro",
        description: "Data de vencimento é obrigatória para vendas a prazo.",
        variant: "destructive"
      });
      return;
    }

    const valorTotal = formData.qtdeVendida * formData.valorUnitario;

    // Definir status do pagamento baseado na forma de pagamento
    let statusPagamento = "Pago";
    let dataPagamento = new Date().toISOString().split('T')[0];
    
    if (formData.formaPagamento === "A Prazo") {
      statusPagamento = "Pendente";
      dataPagamento = undefined;
    }

    const newVenda: Venda = {
      id: Date.now().toString(),
      data: formData.data,
      cliente: formData.cliente,
      produto: formData.produto,
      qtdeVendida: formData.qtdeVendida,
      valorUnitario: formData.valorUnitario,
      valorTotal: valorTotal,
      formaPagamento: formData.formaPagamento,
      dataVencimento: formData.formaPagamento === "A Prazo" ? formData.dataVencimento : undefined,
      statusPagamento: statusPagamento,
      dataPagamento: dataPagamento
    };

    const updatedVendas = [...vendas, newVenda];
    saveVendas(updatedVendas);

    // Atualizar estoque central
    updateEstoqueCentralOvos(formData.qtdeVendida);

    toast({
      title: "Sucesso!",
      description: `Venda registrada. ${formData.qtdeVendida} ovos deduzidos do estoque central.`,
    });

    setFormData({ 
      data: "", 
      cliente: "", 
      produto: "", 
      qtdeVendida: 0, 
      valorUnitario: 0,
      formaPagamento: "",
      dataVencimento: ""
    });
    setShowForm(false);
  };

  const valorTotal = formData.qtdeVendida * formData.valorUnitario;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Vendas
            </h1>
            <p className="text-gray-600">
              Gestão de vendas e saída do estoque central - Estoque atual: <span className="font-bold text-green-600">{estoqueAtual} ovos</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/contas-receber')} variant="outline">
              Contas a Receber
            </Button>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowDownUp className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Registrar Nova Venda</CardTitle>
              <Button onClick={() => setShowForm(!showForm)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Nova Venda
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showForm && (
              <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="cliente">Cliente</Label>
                    <Input
                      id="cliente"
                      value={formData.cliente}
                      onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 rounded">
                  <div className="text-sm font-medium text-blue-700">
                    Estoque Disponível: {estoqueAtual} ovos
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="produto">Produto</Label>
                    <Select value={formData.produto} onValueChange={(value) => setFormData({ ...formData, produto: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o produto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dúzia de Ovos">Dúzia de Ovos</SelectItem>
                        <SelectItem value="Caixa de Ovos (30 unid)">Caixa de Ovos (30 unid)</SelectItem>
                        <SelectItem value="Bandeja de Ovos">Bandeja de Ovos</SelectItem>
                        <SelectItem value="Ovos Avulsos">Ovos Avulsos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="qtdeVendida">Qtde Vendida (ovos)</Label>
                    <Input
                      id="qtdeVendida"
                      type="number"
                      value={formData.qtdeVendida}
                      onChange={(e) => setFormData({ ...formData, qtdeVendida: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="valorUnitario">Valor por Ovo (R$)</Label>
                    <Input
                      id="valorUnitario"
                      type="number"
                      step="0.01"
                      value={formData.valorUnitario}
                      onChange={(e) => setFormData({ ...formData, valorUnitario: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Valor Total (R$)</Label>
                    <div className="p-2 bg-gray-100 border rounded-md font-bold text-green-600">
                      R$ {valorTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                    <Select value={formData.formaPagamento} onValueChange={(value) => setFormData({ ...formData, formaPagamento: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma de pagamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="À Vista (Dinheiro/Pix)">À Vista (Dinheiro/Pix)</SelectItem>
                        <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                        <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                        <SelectItem value="A Prazo">A Prazo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.formaPagamento === "A Prazo" && (
                    <div>
                      <Label htmlFor="dataVencimento">Data de Vencimento</Label>
                      <Input
                        id="dataVencimento"
                        type="date"
                        value={formData.dataVencimento}
                        onChange={(e) => setFormData({ ...formData, dataVencimento: e.target.value })}
                        required
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Registrar Venda</Button>
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
            <CardTitle>Histórico de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Qtde</TableHead>
                  <TableHead>Valor Unit.</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Forma Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendas.map((venda) => (
                  <TableRow key={venda.id}>
                    <TableCell>{new Date(venda.data).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="font-medium">{venda.cliente}</TableCell>
                    <TableCell>{venda.produto}</TableCell>
                    <TableCell>{venda.qtdeVendida}</TableCell>
                    <TableCell>R$ {venda.valorUnitario.toFixed(2)}</TableCell>
                    <TableCell className="font-bold text-green-600">R$ {venda.valorTotal.toFixed(2)}</TableCell>
                    <TableCell>{venda.formaPagamento}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        venda.statusPagamento === 'Pago' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {venda.statusPagamento}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {vendas.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhuma venda registrada ainda.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Vendas;
