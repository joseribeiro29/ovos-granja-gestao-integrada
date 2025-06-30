
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

## 💻 Versão Desktop/Windows

### Opção 1: PWA Instalável (Recomendado)
A aplicação já está configurada como PWA e pode ser "instalada" no Windows:

1. **Build da aplicação**:
```bash
npm run build
```

2. **Servir localmente**:
```bash
# Instalar servidor simples
npm install -g serve

# Servir a aplicação
serve -s dist -l 3000
```

3. **Instalar como PWA**:
   - Abra `http://localhost:3000` no Chrome/Edge
   - Clique no ícone de "instalar" na barra de endereços
   - A aplicação será instalada como um app nativo do Windows

### Opção 2: Electron (Alternativa - pode ter problemas)
Se quiser tentar o Electron novamente:

```bash
# Instalar dependências (pode falhar em alguns sistemas)
npm install electron electron-builder --save-dev

# Build
npm run build
npm run electron:build
```

### Opção 3: Servidor Local Permanente
Para usar offline permanentemente:

1. **Criar executável simples**:
```bash
# Instalar dependências
npm install -g pkg http-server

# Criar script servidor
echo "const handler = require('serve-handler'); const http = require('http'); const server = http.createServer((req, res) => { return handler(req, res, { public: './dist' }); }); server.listen(3000, () => { console.log('Aplicação rodando em http://localhost:3000'); });" > server.js

# Criar executável
pkg server.js --targets node16-win-x64 --output sistema-avicola.exe
```

## 🔧 Funcionalidades Offline

### Armazenamento Local
- Todos os dados são salvos no `localStorage`
- Backup/Restore através do componente `OfflineManager`
- Service Worker para cache de assets

### PWA Features
- Instalável no Windows, Mac, Linux
- Funciona offline
- Ícones e splash screen configurados
- Atalhos rápidos no menu iniciar

## 📋 Checklist Pré-Build

### Mobile
- [ ] Ícones preparados (iOS: 1024x1024, Android: múltiplos tamanhos)
- [ ] Splash screens configurados
- [ ] Certificados de assinatura (iOS/Android)

### Desktop/PWA
- [ ] Service Worker configurado
- [ ] Manifest.json atualizado
- [ ] Ícones PWA preparados
- [ ] Teste de funcionalidade offline

## 🚨 Solução de Problemas

### PWA não instala
- Verifique se está usando HTTPS ou localhost
- Confirme que manifest.json está acessível
- Teste em Chrome/Edge (melhor suporte PWA)

### Electron falha no build
- Use a opção PWA como alternativa
- Problemas com node-gyp são comuns no Windows
- Considere usar Docker para build

### Mobile build falha
- Verifique Xcode/Android Studio atualizados
- Execute `npx cap doctor` para diagnóstico
- Limpe cache: `npx cap clean`

## 📞 Recomendação

**Para Windows**: Use a versão PWA - é mais simples, funciona offline e se instala como um app nativo sem os problemas do Electron.

**Para Mobile**: Use Capacitor normalmente - funciona muito bem.

---

**Versão**: 2.0.0  
**Última atualização**: 2025-06-30
