
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build completo...');

try {
  // 1. Build da aplicação web
  console.log('📦 Construindo aplicação web...');
  execSync('npm run build', { stdio: 'inherit' });

  // 2. Verificar se dist foi criado
  if (!fs.existsSync('dist')) {
    throw new Error('Pasta dist não foi criada');
  }

  console.log('✅ Build web concluído com sucesso!');
  console.log('\n🎯 Próximos passos:');
  console.log('\n📱 Para mobile:');
  console.log('1. npx cap sync');
  console.log('2. npx cap open ios (ou android)');
  
  console.log('\n💻 Para Windows (PWA):');
  console.log('1. node scripts/serve-local.js');
  console.log('2. Abra http://localhost:3000 no Chrome');
  console.log('3. Clique em "Instalar" na barra de endereços');
  
  console.log('\n💾 Para servir offline:');
  console.log('1. npm install -g serve');
  console.log('2. serve -s dist -l 3000');

} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
}
