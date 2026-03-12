# 🔗 Guía Completa: Universal Links (iOS) + App Links (Android)

## Fecha: 6 de enero de 2026

---

## ¿Qué son?

### Universal Links (iOS) + App Links (Android)
Son URLs HTTPS normales que:
- Si la app está instalada → Abren la app directamente
- Si la app NO está instalada → Abren la web (fallback automático)
- Sin confirmación del usuario (experiencia fluida)

### Ejemplo:
```
https://app.gemasa.com.ar/payment/success?subscription_id=123&payment_id=456
```

Cuando el usuario toca este link:
- **Con app instalada**: Abre la app de Gema Salud
- **Sin app instalada**: Abre la web en el navegador

---

## Paso 1: Configurar el Dominio

### 1.1. Crear subdominio

En tu DNS (donde tengas el dominio `gemasa.com.ar`), crea un registro A o CNAME:

```
app.gemasa.com.ar → Tu servidor (IP o CNAME)
```

### 1.2. Proyecto web simple

Crea un proyecto simple (puede ser HTML estático o Next.js/React):

```
app-gemasa-web/
├── .well-known/
│   ├── apple-app-site-association    # Para iOS
│   └── assetlinks.json                # Para Android
├── payment/
│   └── success.html                   # Página de éxito
└── index.html                         # Página principal
```

---

## Paso 2: Archivos de Verificación

### 2.1. iOS: `apple-app-site-association`

**Ubicación:** `https://app.gemasa.com.ar/.well-known/apple-app-site-association`

**Contenido:**
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.gemasa.app",
        "paths": [
          "/payment/*",
          "/subscription/*",
          "/app/*"
        ]
      }
    ]
  }
}
```

**Importante:**
- Reemplaza `TEAM_ID` con tu Apple Team ID (lo encuentras en tu cuenta de Apple Developer)
- El archivo NO debe tener extensión (sin `.json`)
- Debe servirse con `Content-Type: application/json`
- Debe estar en HTTPS (certificado SSL válido)

**¿Cómo obtener tu Team ID?**
1. Ve a https://developer.apple.com/account
2. Membership → Team ID

### 2.2. Android: `assetlinks.json`

**Ubicación:** `https://app.gemasa.com.ar/.well-known/assetlinks.json`

**Contenido:**
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.gemasalud.gemasaludapp",
      "sha256_cert_fingerprints": [
        "SHA256_FINGERPRINT_AQUI"
      ]
    }
  }
]
```

**¿Cómo obtener el SHA256 fingerprint?**

```bash
# Para debug (desarrollo)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Para release (producción)
# Si usas EAS Build:
eas credentials
# Selecciona tu proyecto → Android → Keystore → Ver SHA256

# O si tienes el keystore:
keytool -list -v -keystore tu-keystore.jks -alias tu-alias
```

Copia el SHA256 (sin los dos puntos `:`) y pégalo en el archivo.

---

## Paso 3: Configurar Expo (app.json)

```json
{
  "expo": {
    "scheme": "gemasalud",
    "ios": {
      "bundleIdentifier": "com.gemasa.app",
      "associatedDomains": [
        "applinks:app.gemasa.com.ar"
      ]
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
              "host": "app.gemasa.com.ar",
              "pathPrefix": "/payment"
            },
            {
              "scheme": "https",
              "host": "app.gemasa.com.ar",
              "pathPrefix": "/subscription"
            },
            {
              "scheme": "https",
              "host": "app.gemasa.com.ar",
              "pathPrefix": "/app"
            }
          ],
          "category": [
            "BROWSABLE",
            "DEFAULT"
          ]
        }
      ]
    }
  }
}
```

**Importante:**
- `autoVerify: true` es crucial para App Links (Android)
- Los `pathPrefix` deben coincidir con los paths en `assetlinks.json`

---

## Paso 4: Página Web de Retorno

### Opción A: HTML Estático Simple

**Archivo:** `payment/success.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pago Exitoso - Gema Salud</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    
    .container {
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .success-icon {
      width: 80px;
      height: 80px;
      background: #4CAF50;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      animation: scaleIn 0.5s ease-out;
    }
    
    .success-icon::after {
      content: '✓';
      color: white;
      font-size: 50px;
      font-weight: bold;
    }
    
    @keyframes scaleIn {
      from {
        transform: scale(0);
      }
      to {
        transform: scale(1);
      }
    }
    
    h1 {
      color: #333;
      margin-bottom: 10px;
      font-size: 24px;
    }
    
    p {
      color: #666;
      margin-bottom: 30px;
      line-height: 1.6;
    }
    
    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 30px;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 600;
      transition: transform 0.2s;
    }
    
    .button:hover {
      transform: translateY(-2px);
    }
    
    .info {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 10px;
      margin: 20px 0;
      font-size: 14px;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      margin: 5px 0;
    }
    
    .info-label {
      color: #666;
    }
    
    .info-value {
      color: #333;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="success-icon"></div>
    <h1>¡Pago Exitoso!</h1>
    <p>Tu suscripción ha sido activada correctamente</p>
    
    <div class="info" id="paymentInfo">
      <!-- Se llenará con JavaScript -->
    </div>
    
    <div class="spinner" id="spinner"></div>
    <p id="redirectMessage">Redirigiendo a la aplicación...</p>
    
    <a href="#" class="button" id="manualButton" style="display: none;">
      Abrir Gema Salud
    </a>
    
    <p style="margin-top: 20px; font-size: 12px; color: #999;">
      Si no tienes la app instalada, 
      <a href="https://play.google.com/store/apps/details?id=com.gemasalud.gemasaludapp" 
         style="color: #667eea;">descárgala aquí</a>
    </p>
  </div>

  <script>
    // Obtener parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionId = urlParams.get('subscription_id');
    const paymentId = urlParams.get('payment_id');
    const status = urlParams.get('status') || 'approved';
    
    // Mostrar información del pago
    const paymentInfo = document.getElementById('paymentInfo');
    paymentInfo.innerHTML = `
      <div class="info-row">
        <span class="info-label">ID de Suscripción:</span>
        <span class="info-value">${subscriptionId || 'N/A'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">ID de Pago:</span>
        <span class="info-value">${paymentId || 'N/A'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Estado:</span>
        <span class="info-value">Aprobado</span>
      </div>
    `;
    
    // Construir la URL de la app
    // Esta URL será interceptada por iOS/Android si la app está instalada
    const appUrl = `https://app.gemasa.com.ar/payment/success?subscription_id=${subscriptionId}&payment_id=${paymentId}&status=${status}`;
    
    console.log('Intentando abrir app con URL:', appUrl);
    
    // Intentar abrir la app inmediatamente
    window.location.href = appUrl;
    
    // Configurar botón manual
    const manualButton = document.getElementById('manualButton');
    manualButton.href = appUrl;
    
    // Después de 3 segundos, mostrar botón manual
    setTimeout(() => {
      document.getElementById('spinner').style.display = 'none';
      document.getElementById('redirectMessage').textContent = 
        'Si la aplicación no se abrió automáticamente:';
      manualButton.style.display = 'inline-block';
    }, 3000);
    
    // Fallback: Si después de 5 segundos sigue aquí, 
    // significa que la app no está instalada
    setTimeout(() => {
      // Opcional: Redirigir a la tienda de apps
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS) {
        // Redirigir a App Store
        // window.location.href = 'https://apps.apple.com/app/idXXXXXXXXX';
      } else if (isAndroid) {
        // Redirigir a Play Store
        // window.location.href = 'https://play.google.com/store/apps/details?id=com.gemasalud.gemasaludapp';
      }
    }, 5000);
  </script>
</body>
</html>
```

### Opción B: Next.js (Más Profesional)

Si prefieres algo más robusto:

```bash
npx create-next-app@latest app-gemasa-web
cd app-gemasa-web
```

**`pages/payment/success.tsx`:**
```typescript
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PaymentSuccess() {
  const router = useRouter();
  const { subscription_id, payment_id, status } = router.query;

  useEffect(() => {
    // Construir URL de la app
    const appUrl = `https://app.gemasa.com.ar/payment/success?subscription_id=${subscription_id}&payment_id=${payment_id}&status=${status}`;
    
    // Intentar abrir la app
    window.location.href = appUrl;
  }, [subscription_id, payment_id, status]);

  return (
    <div className="container">
      <h1>¡Pago Exitoso!</h1>
      <p>Redirigiendo a la aplicación...</p>
      {/* ... resto del HTML ... */}
    </div>
  );
}
```

---

## Paso 5: Configurar Handler en la App

**Archivo:** `app/_layout.tsx`

```typescript
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // Handler para cuando la app está cerrada
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        console.log('[UniversalLink] App abierta con URL:', initialUrl);
        handleUniversalLink(initialUrl);
      }
    };

    // Handler para cuando la app está abierta/background
    const subscription = Linking.addEventListener('url', (event) => {
      console.log('[UniversalLink] URL recibida:', event.url);
      handleUniversalLink(event.url);
    });

    handleInitialURL();

    return () => {
      subscription.remove();
    };
  }, []);

  const handleUniversalLink = (url: string) => {
    try {
      // Parsear la URL
      const { hostname, path, queryParams } = Linking.parse(url);
      
      console.log('[UniversalLink] Parsed:', { hostname, path, queryParams });

      // Verificar que sea nuestro dominio
      if (hostname !== 'app.gemasa.com.ar') {
        console.log('[UniversalLink] Dominio no reconocido:', hostname);
        return;
      }

      // Manejar diferentes rutas
      if (path === 'payment/success') {
        handlePaymentSuccess(queryParams);
      } else if (path === 'payment/pending') {
        handlePaymentPending(queryParams);
      } else if (path === 'payment/failure') {
        handlePaymentFailure(queryParams);
      }
    } catch (error) {
      console.error('[UniversalLink] Error al procesar URL:', error);
    }
  };

  const handlePaymentSuccess = async (params: any) => {
    const { subscription_id, payment_id, status } = params;
    
    console.log('[Payment] Pago exitoso:', { subscription_id, payment_id, status });
    
    // Mostrar notificación
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '¡Pago exitoso!',
        body: 'Tu suscripción ha sido activada correctamente',
        data: { subscription_id, payment_id },
      },
      trigger: null,
    });

    // Refrescar perfil para obtener la suscripción actualizada
    // (esto depende de tu implementación)
    try {
      const { affiliateService } = await import('@/services/affiliateService');
      await affiliateService.getAffiliateProfile();
    } catch (error) {
      console.error('[Payment] Error al refrescar perfil:', error);
    }

    // Navegar a home con parámetro de éxito
    router.replace({
      pathname: '/(tabs)/explore',
      params: { paymentSuccess: 'true', subscription_id }
    });
  };

  const handlePaymentPending = async (params: any) => {
    const { subscription_id, status } = params;
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Pago pendiente',
        body: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.',
        data: { subscription_id },
      },
      trigger: null,
    });

    router.replace({
      pathname: '/(tabs)/explore',
      params: { paymentPending: 'true' }
    });
  };

  const handlePaymentFailure = async (params: any) => {
    const { subscription_id, status, error } = params;
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Error en el pago',
        body: 'Hubo un problema con tu pago. Por favor, intenta nuevamente.',
        data: { subscription_id, error },
      },
      trigger: null,
    });

    router.replace({
      pathname: '/subscription-signup',
      params: { paymentError: 'true' }
    });
  };

  // ... resto del layout
}
```

---

## Paso 6: Configurar Mercado Pago

En tu backend, cuando creas la preferencia de pago:

```typescript
const preference = {
  items: [
    {
      title: 'Suscripción Gema Salud',
      quantity: 1,
      unit_price: plan.price,
    }
  ],
  back_urls: {
    success: `https://app.gemasa.com.ar/payment/success?subscription_id=${subscriptionId}`,
    pending: `https://app.gemasa.com.ar/payment/pending?subscription_id=${subscriptionId}`,
    failure: `https://app.gemasa.com.ar/payment/failure?subscription_id=${subscriptionId}`,
  },
  auto_return: 'approved',
  notification_url: `https://tubackend.com/webhooks/mercadopago`,
};
```

---

## Paso 7: Desplegar

### 7.1. Subir archivos de verificación

```bash
# Estructura en tu servidor
/var/www/app.gemasa.com.ar/
├── .well-known/
│   ├── apple-app-site-association
│   └── assetlinks.json
├── payment/
│   ├── success.html
│   ├── pending.html
│   └── failure.html
└── index.html
```

### 7.2. Configurar Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name app.gemasa.com.ar;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/app.gemasa.com.ar;
    index index.html;

    # Archivos de verificación
    location /.well-known/ {
        default_type application/json;
        add_header Content-Type application/json;
        add_header Access-Control-Allow-Origin *;
    }

    # Páginas de pago
    location /payment/ {
        try_files $uri $uri/ =404;
    }

    # Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 7.3. Rebuild de la app

```bash
# Limpiar y reconstruir
npx expo prebuild --clean

# iOS
npx expo run:ios

# Android
npx expo run:android
```

---

## Testing

### 1. Verificar archivos de verificación

```bash
# iOS
curl https://app.gemasa.com.ar/.well-known/apple-app-site-association

# Android
curl https://app.gemasa.com.ar/.well-known/assetlinks.json
```

### 2. Validar con herramientas oficiales

**iOS:**
https://search.developer.apple.com/appsearch-validation-tool/

**Android:**
```bash
adb shell pm get-app-links com.gemasalud.gemasaludapp
```

### 3. Probar en dispositivo real

Envía el link por WhatsApp/Email:
```
https://app.gemasa.com.ar/payment/success?subscription_id=123&payment_id=456
```

Toca el link y verifica que:
- ✅ Abre la app automáticamente (si está instalada)
- ✅ Abre la web (si no está instalada)
- ✅ Sin confirmación del usuario

---

## Troubleshooting

### iOS no abre la app

1. Verifica que el Team ID sea correcto
2. Verifica que el archivo esté en HTTPS
3. Verifica que el `Content-Type` sea `application/json`
4. Reinstala la app (iOS cachea la configuración)

### Android no abre la app

1. Verifica el SHA256 fingerprint
2. Verifica que `autoVerify: true` esté en app.json
3. Verifica que los paths coincidan
4. Ejecuta: `adb shell pm verify-app-links --re-verify com.gemasalud.gemasaludapp`

---

## Resumen

✅ **Ventajas de Universal Links / App Links:**
- Experiencia fluida (sin confirmación)
- Fallback automático a web
- Funcionan en todos los navegadores
- Solución profesional

✅ **Lo que necesitas:**
1. Dominio con HTTPS: `app.gemasa.com.ar`
2. Archivos de verificación en `.well-known/`
3. Página web simple de retorno
4. Configuración en `app.json`
5. Handler en `_layout.tsx`

✅ **Esfuerzo:**
- Proyecto web: 1-2 horas (HTML estático simple)
- Configuración: 30 minutos
- Testing: 1 hora

**Total: ~3-4 horas de trabajo**

---

**Estado:** 📝 Documentado - Listo para implementar
**Recomendación:** Usa Universal Links / App Links (esta guía) en lugar de deep links simples
