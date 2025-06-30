
# 📱🌐 Instruções de Build - Sistema de Gestão Avícola

## 🚀 Configuração Inicial

1. **Transferir para GitHub**:
   - Clique no botão "GitHub" no Lovable
   - Crie um repositório
   - Clone: `git clone [SEU_REPO]`
   - `cd [NOME_DO_PROJETO]`
   - `npm install`

## 🌐 Build Web

### Desenvolvimento Local
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

### Deploy Web
- **Netlify/Vercel**: Conecte seu repositório GitHub
- **Manual**: Faça upload da pasta `dist/` após `npm run build`

## 📱 Build Mobile (iOS/Android)

### Pré-requisitos
- **iOS**: macOS com Xcode instalado
- **Android**: Android Studio instalado

### Comandos
```bash
# 1. Build da aplicação web
npm run build

# 2. Adicionar plataformas (primeira vez)
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

### Web
- [ ] Build sem erros (`npm run build`)
- [ ] Testes funcionais
- [ ] Otimização de assets
- [ ] Configuração de domínio (se aplicável)

### Mobile
- [ ] Ícones preparados (iOS: 1024x1024, Android: múltiplos tamanhos)
- [ ] Splash screens configurados
- [ ] Permissões definidas (se necessário)
- [ ] Certificados de assinatura (iOS/Android)

## 🚨 Solução de Problemas

### Erros Comuns Web
- **Build falha**: Verificar dependências e TypeScript
- **Assets não carregam**: Verificar caminhos públicos
- **Performance**: Otimizar imports e lazy loading

### Erros Comuns Mobile
- **Build falha**: Verificar Xcode/Android Studio atualizados
- **Ícones não aparecem**: Verificar caminhos e formatos
- **App não inicia**: Verificar configurações de servidor no capacitor.config.ts

## 📞 Suporte

- Verifique logs de build para erros específicos
- Teste em dispositivos/emuladores antes do build final
- Mantenha backups dos dados antes de updates

---

**Versão**: 2.0.0  
**Última atualização**: 2025-06-30
