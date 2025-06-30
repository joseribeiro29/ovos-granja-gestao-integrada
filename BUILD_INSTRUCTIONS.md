
# 📱💻 Instruções de Build - Sistema de Gestão Avícola

## 🚀 Configuração Inicial

1. **Transferir para GitHub**:
   - Clique no botão "GitHub" no Lovable
   - Crie um repositório
   - Clone: `git clone [SEU_REPO]`
   - `cd [NOME_DO_PROJETO]`
   - `npm install`

## 📱 Build Mobile (iOS/Android)

### Pré-requisitos
- **iOS**: macOS com Xcode instalado
- **Android**: Android Studio instalado

### Comandos
```bash
# 1. Build da aplicação web
npm run build

# 2. Adicionar plataformas
npx cap add ios
npx cap add android

# 3. Sincronizar arquivos
npx cap sync

# 4. Abrir no IDE nativo
npx cap open ios     # Para iOS (Xcode)
npx cap open android # Para Android (Android Studio)

# 5. Build final no IDE nativo
# iOS: Pressione ⌘+B no Xcode, depois Archive
# Android: Build > Generate Signed Bundle/APK
```

### Configurações Importantes
- **iOS**: Configure signing team no Xcode
- **Android**: Gere keystore para assinatura
- **Ícones**: Coloque ícones em `ios/App/App/Assets.xcassets` e `android/app/src/main/res`

## 💻 Build Desktop (Windows/Mac/Linux)

### Comandos
```bash
# 1. Build da aplicação web
npm run build

# 2. Compilar Electron
npx tsc electron/main.ts --outDir dist-electron --target es2020 --module commonjs --esModuleInterop

# 3. Build executável
npx electron-builder --win  # Windows
npx electron-builder --mac  # macOS
npx electron-builder --linux # Linux

# Arquivos serão gerados na pasta 'release/'
```

### Scripts NPM Sugeridos (adicione ao package.json)
```json
{
  "scripts": {
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:8080 && electron dist-electron/main.js\"",
    "electron:build": "npm run build && npx tsc electron/main.ts --outDir dist-electron --target es2020 --module commonjs --esModuleInterop && electron-builder",
    "cap:sync": "cap sync",
    "cap:ios": "cap open ios",
    "cap:android": "cap open android"
  }
}
```

## 🔧 Funcionalidades Offline

### Armazenamento Local
- Todos os dados são salvos no `localStorage`
- Backup/Restore através do componente `OfflineManager`
- Service Worker para cache de assets

### Gerenciamento de Dados
- **Backup**: Exporta dados para arquivo JSON
- **Restore**: Importa dados de backup
- **Limpar**: Remove todos os dados locais

## 📋 Checklist Pré-Build

### Mobile
- [ ] Ícones preparados (iOS: 1024x1024, Android: múltiplos tamanhos)
- [ ] Splash screens configurados
- [ ] Permissões definidas (se necessário)
- [ ] Certificados de assinatura (iOS/Android)

### Desktop
- [ ] Ícone principal (.ico para Windows, .icns para Mac)
- [ ] Configurações de assinatura (opcional)
- [ ] Metadados da aplicação
- [ ] Auto-updater configurado (opcional)

## 🚨 Solução de Problemas

### Erros Comuns Mobile
- **Build falha**: Verificar Xcode/Android Studio atualizados
- **Ícones não aparecem**: Verificar caminhos e formatos
- **App não inicia**: Verificar configurações de servidor no capacitor.config.ts

### Erros Comuns Desktop
- **Electron não inicia**: Verificar compilação TypeScript
- **Build falha**: Verificar electron-builder.config.js
- **Assets faltando**: Verificar caminhos no electron/assets/

## 📞 Suporte

- Verifique logs de build para erros específicos
- Teste em dispositivos/emuladores antes do build final
- Mantenha backups dos dados antes de updates

---

**Versão**: 1.0.0  
**Última atualização**: $(date)
```
