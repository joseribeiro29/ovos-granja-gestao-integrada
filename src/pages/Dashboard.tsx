
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  ArrowDownUp, 
  ChevronDown, 
  FileMinusIcon, 
  FilePlusIcon, 
  FolderPlusIcon,
  GridIcon,
  PlusIcon 
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: "Gestão de Insumos",
      description: "Cadastro, compras e controle de estoque",
      icon: <FolderPlusIcon className="h-8 w-8" />,
      path: "/insumos",
      color: "bg-blue-50 hover:bg-blue-100"
    },
    {
      title: "Produção de Ração",
      description: "Produção e estoque de ração",
      icon: <FilePlusIcon className="h-8 w-8" />,
      path: "/racao",
      color: "bg-green-50 hover:bg-green-100"
    },
    {
      title: "Gestão de Galpões",
      description: "Controle de galpões e lotes de aves",
      icon: <GridIcon className="h-8 w-8" />,
      path: "/galpoes",
      color: "bg-yellow-50 hover:bg-yellow-100"
    },
    {
      title: "Produção de Ovos",
      description: "Registro diário de produção",
      icon: <PlusIcon className="h-8 w-8" />,
      path: "/ovos",
      color: "bg-orange-50 hover:bg-orange-100"
    },
    {
      title: "Vendas",
      description: "Gestão de vendas e clientes",
      icon: <ArrowDownUp className="h-8 w-8" />,
      path: "/vendas",
      color: "bg-purple-50 hover:bg-purple-100"
    },
    {
      title: "Despesas",
      description: "Controle de despesas operacionais",
      icon: <FileMinusIcon className="h-8 w-8" />,
      path: "/despesas",
      color: "bg-red-50 hover:bg-red-100"
    },
    {
      title: "Relatórios",
      description: "Dashboards e relatórios gerenciais",
      icon: <ChevronDown className="h-8 w-8" />,
      path: "/relatorios",
      color: "bg-indigo-50 hover:bg-indigo-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sistema de Gestão - Granja de Ovos
          </h1>
          <p className="text-lg text-gray-600">
            Sistema integrado para controle completo da produção
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modules.map((module) => (
            <Card 
              key={module.path}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${module.color}`}
              onClick={() => navigate(module.path)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-blue-600">
                    {module.icon}
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {module.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ovos Produzidos:</span>
                  <span className="font-medium">0 unidades</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Vendas:</span>
                  <span className="font-medium">R$ 0,00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Galpões Ativos:</span>
                  <span className="font-medium">0</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alertas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  Nenhum alerta no momento
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate('/ovos/nova-producao')}
                >
                  Registrar Produção
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate('/vendas/nova-venda')}
                >
                  Nova Venda
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
