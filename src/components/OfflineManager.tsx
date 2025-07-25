
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, Trash2, Database, AlertTriangle } from "lucide-react";
import { storageManager } from "@/utils/storageManager";
import { useToast } from "@/hooks/use-toast";

const OfflineManager = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  const handleDownloadBackup = () => {
    try {
      storageManager.downloadBackup();
      toast({
        title: "Backup criado",
        description: "Arquivo de backup baixado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar backup",
        variant: "destructive",
      });
    }
  };

  const handleClearAllData = () => {
    if (confirm("⚠️ ATENÇÃO: Tem certeza de que deseja limpar TODOS os dados? Esta ação não pode ser desfeita e removerá:\n\n• Todos os insumos cadastrados\n• Todo o estoque\n• Todas as fórmulas de ração\n• Todos os galpões\n• Toda a produção de ovos\n• Todas as vendas\n• Todas as despesas\n• Contas a receber\n\nDigite 'CONFIRMAR' para prosseguir:")) {
      const confirmacao = prompt("Digite 'CONFIRMAR' para limpar todos os dados:");
      if (confirmacao === 'CONFIRMAR') {
        try {
          storageManager.clearApplicationData();
          toast({
            title: "✅ Dados limpos",
            description: "Todos os dados da aplicação foram removidos com sucesso!",
          });
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (error) {
          toast({
            title: "Erro",
            description: "Erro ao limpar dados",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Operação cancelada",
          description: "Limpeza de dados cancelada por segurança.",
        });
      }
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          storageManager.importData(data);
          toast({
            title: "Dados importados",
            description: "Backup restaurado com sucesso!",
          });
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (error) {
          toast({
            title: "Erro",
            description: "Erro ao importar backup",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Gerenciamento de Dados Offline
        </CardTitle>
        <CardDescription>
          Status: <span className={isOnline ? "text-green-600" : "text-red-600"}>
            {isOnline ? "Online" : "Offline"}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={handleDownloadBackup} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Fazer Backup
          </Button>
          
          <label className="cursor-pointer">
            <Button asChild className="flex items-center gap-2 w-full">
              <span>
                <Upload className="h-4 w-4" />
                Restaurar Backup
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
          
          <Button 
            onClick={handleClearAllData} 
            variant="destructive" 
            className="flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Limpar Dados
          </Button>
        </div>
        
        <div className="text-sm text-gray-600 space-y-2 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 text-yellow-800 font-medium mb-2">
            <AlertTriangle className="h-4 w-4" />
            Importante - Funcionalidades de Backup
          </div>
          <p>• <strong>Backup:</strong> Baixa todos os dados em arquivo JSON</p>
          <p>• <strong>Restaurar:</strong> Importa dados de arquivo de backup</p>
          <p>• <strong>Limpar Dados:</strong> Remove todos os dados armazenados (insumos, estoque, fórmulas, galpões, produção, vendas, despesas, etc.)</p>
          <p className="text-red-600 font-medium mt-2">⚠️ A limpeza de dados é irreversível! Faça backup antes.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfflineManager;
