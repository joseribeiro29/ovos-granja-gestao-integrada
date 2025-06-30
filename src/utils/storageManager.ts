
interface StorageData {
  [key: string]: any;
}

export class StorageManager {
  private static instance: StorageManager;

  private constructor() {}

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  // Salvar dados
  public saveData(key: string, data: any): void {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      console.log(`Dados salvos: ${key}`);
    } catch (error) {
      console.error(`Erro ao salvar dados ${key}:`, error);
    }
  }

  // Carregar dados
  public loadData<T>(key: string, defaultValue?: T): T | null {
    try {
      const serializedData = localStorage.getItem(key);
      if (serializedData === null) {
        return defaultValue || null;
      }
      return JSON.parse(serializedData) as T;
    } catch (error) {
      console.error(`Erro ao carregar dados ${key}:`, error);
      return defaultValue || null;
    }
  }

  // Remover dados
  public removeData(key: string): void {
    try {
      localStorage.removeItem(key);
      console.log(`Dados removidos: ${key}`);
    } catch (error) {
      console.error(`Erro ao remover dados ${key}:`, error);
    }
  }

  // Exportar todos os dados
  public exportAllData(): StorageData {
    const allData: StorageData = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            allData[key] = JSON.parse(value);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
    }
    return allData;
  }

  // Importar dados
  public importData(data: StorageData): void {
    try {
      Object.keys(data).forEach(key => {
        this.saveData(key, data[key]);
      });
      console.log('Dados importados com sucesso');
    } catch (error) {
      console.error('Erro ao importar dados:', error);
    }
  }

  // Fazer backup dos dados
  public downloadBackup(): void {
    try {
      const allData = this.exportAllData();
      const dataStr = JSON.stringify(allData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `backup-avicola-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } catch (error) {
      console.error('Erro ao fazer backup:', error);
    }
  }

  // Limpar todos os dados
  public clearAllData(): void {
    try {
      localStorage.clear();
      console.log('Todos os dados foram limpos');
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
    }
  }

  // Limpar dados específicos da aplicação
  public clearApplicationData(): void {
    try {
      const keysToRemove = [
        'insumos',
        'estoqueInsumos',
        'comprasInsumos',
        'formulasRacao',
        'estoqueRacao',
        'producaoRacao',
        'galpoes',
        'producaoOvos',
        'vendas',
        'mortalidade',
        'consumoRacao',
        'despesas',
        'contasReceber'
      ];

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Dados removidos: ${key}`);
      });

      console.log('Dados da aplicação foram limpos com sucesso');
    } catch (error) {
      console.error('Erro ao limpar dados da aplicação:', error);
    }
  }
}

export const storageManager = StorageManager.getInstance();
