
module.exports = {
  appId: 'app.lovable.00f0eb6443a94abea7da3c7a46022919',
  productName: 'Sistema de Gestão Avícola',
  directories: {
    output: 'release'
  },
  files: [
    'dist/**/*',
    'electron/**/*',
    'node_modules/**/*'
  ],
  extraMetadata: {
    main: 'electron/main.js'
  },
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64', 'ia32']
      }
    ],
    icon: 'electron/assets/icon.ico',
    publisherName: 'Sistema Avícola'
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Sistema de Gestão Avícola'
  },
  mac: {
    target: 'dmg',
    icon: 'electron/assets/icon.icns',
    category: 'public.app-category.business'
  },
  linux: {
    target: 'AppImage',
    icon: 'electron/assets/icon.png',
    category: 'Office'
  }
};
