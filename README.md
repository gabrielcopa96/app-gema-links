# App Gema Salud - Universal Links

Proyecto minimalista con Astro para manejar redirecciones de Universal Links (iOS) y App Links (Android).

## Setup

```bash
npm install
npm run dev
```

## Configuración Requerida

### 1. Archivos de verificación

Antes de deployar, actualiza:

- `public/.well-known/apple-app-site-association`: Reemplaza `TEAM_ID` con tu Apple Team ID
- `public/.well-known/assetlinks.json`: Reemplaza `SHA256_FINGERPRINT_AQUI` con tu fingerprint de Android

### 2. Obtener Apple Team ID

1. Ve a https://developer.apple.com/account
2. Membership → Team ID

### 3. Obtener SHA256 Fingerprint (Android)

```bash
# Para debug
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Para release (con EAS)
eas credentials
```

## Deploy

```bash
npm run build
```

Sube la carpeta `dist/` a tu servidor en `app.gemasa.com.ar`

## Testing

```bash
# Verificar archivos
curl https://app.gemasa.com.ar/.well-known/apple-app-site-association
curl https://app.gemasa.com.ar/.well-known/assetlinks.json

# Validar iOS
# https://search.developer.apple.com/appsearch-validation-tool/

# Validar Android
adb shell pm get-app-links com.gemasalud.gemasaludapp
```

## Rutas

### Landing Principal
- `/` - Landing page con deep link automático + botones de descarga

### Colaboraciones (para otras apps)
- `/open` - Redirige a la app con parámetros personalizados
- `/open?path=/profile` - Abre la app en una ruta específica
- `/open?path=/profile&ref=partner-app` - Con tracking de referencia

### Pagos (Mercado Pago)
- `/payment/success` - Pago exitoso
- `/payment/pending` - Pago pendiente
- `/payment/failure` - Pago fallido

## Uso para Colaboraciones

### Desde otra app hacia Gema Salud

Otras apps pueden usar estos links para redirigir a tu app:

```
# Abrir la app en home
https://app.gemasa.com.ar/open

# Abrir en una sección específica
https://app.gemasa.com.ar/open?path=/profile

# Con tracking de referencia
https://app.gemasa.com.ar/open?path=/services&ref=partner-app

# Con múltiples parámetros
https://app.gemasa.com.ar/open?path=/appointment&vet_id=123&ref=partner
```

### Desde Gema Salud hacia otra app

En tu app React Native, puedes abrir otras apps así:

```typescript
import { Linking } from 'react-native';

// Abrir otra app colaboradora
const openPartnerApp = async () => {
  const url = 'https://partner-app.com/open?ref=gemasalud';
  
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  } else {
    // Si no puede abrir, mostrar mensaje o abrir web
    await Linking.openURL('https://partner-app.com');
  }
};
```

## Configuración de Deep Links

### En tu app.json (Expo)

```json
{
  "expo": {
    "scheme": "gemasalud",
    "ios": {
      "bundleIdentifier": "com.gemasa.app",
      "associatedDomains": ["applinks:app.gemasa.com.ar"]
    },
    "android": {
      "package": "com.gemasalud.gemasaludapp",
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "app.gemasa.com.ar"
            },
            {
              "scheme": "gemasalud"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```
