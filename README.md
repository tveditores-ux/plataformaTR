# Trading App con Reconocimiento de Voz

Aplicación móvil (React Native) para bitácora de trading, calculadora de lotaje/gestión de riesgo y plan de 21 días con **entrada por voz**.

## 🚀 Inicio rápido

```bash
git clone <TU_REPO_GITHUB>.git
cd TradingApp
npm install
# iOS (macOS)
cd ios && pod install && cd ..
# ejecutar
npm run android   # o npm run ios
```

## 📦 Funcionalidades
- 🎤 Reconocimiento de voz en campos clave
- 📊 Bitácora de operaciones
- 🧮 Calculadora de lotaje y riesgo
- 📅 Plan 21 días (interés compuesto)
- 💾 Persistencia con AsyncStorage
- 🌙 UI dark optimizada para móviles

## 📁 Estructura
```
TradingApp/
├── App.js
├── app.json
├── index.js
├── package.json
├── src/
│   ├── components/
│   ├── utils/
│   └── styles/
├── android/…
└── ios/…
```

## 🔐 Permisos
- **Micrófono** (reconocimiento de voz)
- **Internet**

## 🛠️ Build
```bash
npm run build:android
npm run build:ios
```

## 📄 Licencia
MIT