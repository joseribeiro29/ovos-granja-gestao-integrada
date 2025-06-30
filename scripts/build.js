
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build completo...');

// 1. Build da aplicação web
console.log('📦 Construindo aplicação web...');
execSync('npm run build', { stdio: 'inherit' });

// 2. Compilar Electron
console.log('⚡ Compilando Electron...');
execSync('tsc electron/main.ts --outDir dist-electron --target es2020 --module commonjs --esModuleInterop', { stdio: 'inherit' });

// 3. Copiar assets do Electron
console.log('📋 Copiando assets...');
if (!fs.existsSync('dist-electron/assets')) {
  fs.mkdirSync('dist-electron/assets', { recursive: true });
}

console.log('✅ Build completo finalizado!');
console.log('\n📱 Para build mobile:');
console.log('1. npm run cap:sync');
console.log('2. npm run cap:ios ou npm run cap:android');
console.log('\n💻 Para build desktop:');
console.log('1. npm run electron:build');
