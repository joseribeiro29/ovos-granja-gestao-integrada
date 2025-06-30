
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Package, 
  ChefHat, 
  Home, 
  Egg, 
  ShoppingCart, 
  Users,
  CreditCard, 
  BarChart3,
  FileText,
  Settings,
  Calculator
} from "lucide-react";
import OfflineManager from "@/components/OfflineManager";
import PWAInstaller from "@/components/PWAInstaller";

const Dashboard = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: "Insumos",
      description: "Cadastro, compras e controle de estoque",
      icon: Package,
      path: "/insumos",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200"
    },
    {
      title: "Produção de Ração",
      description: "Fórmulas, produção e estoque de ração",
      icon: ChefHat,
      path: "/racao",
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200"
    },
    {
      title: "Galpões",
      description: "Cadastro e controle de galpões",
      icon: Home,
      path: "/galpoes",
      color: "bg-green-50 hover:bg-green-100 border-green-200"
    },
    {
      title: "Produção de Ovos",
      description: "Registro diário de produção",
      icon: Egg,
      path: "/ovos",
      color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
    },
    {
      title: "Vendas",
      description: "Registro de vendas e controle",
      icon: ShoppingCart,
      path: "/vendas",
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200"
    },
    {
      title: "Gestão de Galpão",
      description: "Mortalidade, manejos e consumo de ração",
      icon: Users,
      path: "/gestao-galpao",
      color: "bg-teal-50 hover:bg-teal-100 border-teal-200"
    },
    {
      title: "Despesas",
      description: "Controle de despesas operacionais",
      icon: Settings,
      path: "/despesas",
      color: "bg-red-50 hover:bg-red-100 border-red-200"
    },
    {
      title: "Contas a Receber",
      description: "Gestão financeira de clientes",
      icon: CreditCard,
      path: "/contas-receber",
      color: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
    },
    {
      title: "Relatórios",
      description: "Dashboards e relatórios gerenciais",
      icon: BarChart3,
      path: "/relatorios",
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200"
    },
    {
      title: "Relatório de Galpão",
      description: "Análise detalhada por galpão",
      icon: FileText,
      path: "/relatorio-galpao",
      color: "bg-pink-50 hover:bg-pink-100 border-pink-200"
    },
    {
      title: "Relatório Financeiro",
      description: "Fluxo de caixa e transações",
      icon: Calculator,
      path: "/relatorio-financeiro",
      color: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema de Gestão Avícola
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Controle completo da sua produção de ovos - desde a compra de insumos até a venda final
          </p>
        </div>

        {/* Offline Manager */}
        <div className="mb-8">
          <OfflineManager />
        </div>

        {/* PWA Installer */}
        <PWAInstaller />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card 
                key={module.path}
                className={`cursor-pointer transition-all duration-200 ${module.color} hover:shadow-lg`}
                onClick={() => navigate(module.path)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Icon className="h-8 w-8 text-gray-700" />
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {module.description}
                  </CardDescription>
                  <Button variant="outline" className="w-full mt-4">
                    Acessar Módulo
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Card className="bg-white/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Fluxo de Trabalho Integrado
              </h2>
              <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-600">
                <span className="bg-white px-3 py-2 rounded-lg shadow">1. Compra de Insumos</span>
                <span>→</span>
                <span className="bg-white px-3 py-2 rounded-lg shadow">2. Produção de Ração</span>
                <span>→</span>
                <span className="bg-white px-3 py-2 rounded-lg shadow">3. Consumo nos Galpões</span>
                <span>→</span>
                <span className="bg-white px-3 py-2 rounded-lg shadow">4. Produção de Ovos</span>
                <span>→</span>
                <span className="bg-white px-3 py-2 rounded-lg shadow">5. Venda</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
