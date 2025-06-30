
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, Trash2, Database } from "lucide-react";
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

  const handleClearData = () => {
    if (confirm("Tem certeza de que deseja limpar todos os dados? Esta ação não pode ser desfeita.")) {
      try {
        storageManager.clearAllData();
        toast({
          title: "Dados limpos",
          description: "Todos os dados foram removidos com sucesso!",
        });
        window.location.reload();
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao limpar dados",
          variant: "destructive",
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
          window.location.reload();
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
            onClick={handleClearData} 
            variant="destructive" 
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Limpar Dados
          </Button>
        </div>
        
        <div className="text-sm text-gray-600 space-y-2">
          <p>• <strong>Backup:</strong> Baixa todos os dados em arquivo JSON</p>
          <p>• <strong>Restaurar:</strong> Importa dados de arquivo de backup</p>
          <p>• <strong>Limpar:</strong> Remove todos os dados armazenados localmente</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfflineManager;
