# Configuración de Google OAuth

## Pasos para configurar Google OAuth

### 1. Crear un proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+ (Google+ API)

### 2. Configurar OAuth Consent Screen

1. Ve a **APIs & Services** > **OAuth consent screen**
2. Selecciona **External** como tipo de usuario
3. Completa la información requerida:
   - Nombre de la aplicación
   - Email de soporte
   - Logo (opcional)
   - Dominios autorizados
4. Agrega los scopes necesarios:
   - `userinfo.email`
   - `userinfo.profile`
5. Guarda los cambios

### 3. Crear credenciales OAuth 2.0

1. Ve a **APIs & Services** > **Credentials**
2. Haz clic en **Create Credentials** > **OAuth client ID**
3. Selecciona **Web application** como tipo de aplicación
4. Configura:
   - **Nombre**: MatchUp (o el nombre que prefieras)
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - Tu dominio de producción (cuando lo tengas)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/auth/callback`
     - `https://tu-dominio.com/auth/callback` (producción)
5. Haz clic en **Create**
6. Copia el **Client ID** y **Client Secret**

### 4. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# Google OAuth
GOOGLE_CLIENT_ID=tu-client-id-aqui
GOOGLE_CLIENT_SECRET=tu-client-secret-aqui

# Supabase (si aún no las tienes)
NEXT_PUBLIC_SUPABASE_URL=tu-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-supabase-anon-key
```

### 5. Configurar Supabase

1. Ve a tu proyecto de Supabase Dashboard
2. Ve a **Authentication** > **Providers**
3. Encuentra **Google** en la lista
4. Habilita el provider
5. Ingresa tu **Client ID** y **Client Secret** de Google
6. Configura la **Redirect URL** (Supabase te la proporciona)
7. Guarda los cambios

### 6. Reiniciar Supabase local (si usas Supabase local)

```bash
npm run supabase:stop
npm run supabase:start
```

### 7. Probar la autenticación

1. Inicia el servidor de desarrollo: `npm run dev`
2. Ve a `http://localhost:3000/auth/signin`
3. Haz clic en "Continuar con Google"
4. Deberías ser redirigido a la pantalla de consentimiento de Google
5. Después de autorizar, deberías ser redirigido de vuelta a tu aplicación

## Solución de problemas

### Error: redirect_uri_mismatch

- Verifica que la URL de redirección en Google Cloud Console coincida exactamente con la configurada en tu aplicación
- Asegúrate de incluir el protocolo (`http://` o `https://`)

### Error: invalid_client

- Verifica que el Client ID y Client Secret sean correctos
- Asegúrate de que las variables de entorno estén cargadas correctamente

### Error: access_denied

- El usuario canceló el proceso de autenticación
- Verifica que el OAuth Consent Screen esté configurado correctamente

## Archivos modificados

- `src/app/auth/callback/route.ts` - Maneja el callback de OAuth
- `src/lib/services/auth.service.ts` - Servicio de autenticación con método `signInWithGoogle()`
- `src/components/auth/GoogleSignInButton.tsx` - Componente del botón de Google
- `src/app/auth/signin/page.tsx` - Página de inicio de sesión con botón de Google
- `supabase/config.toml` - Configuración de Google OAuth para Supabase local

## Notas importantes

- Las credenciales de Google OAuth son sensibles. **NUNCA** las subas al repositorio
- Agrega `.env.local` a tu `.gitignore`
- Para producción, configura las variables de entorno en tu plataforma de hosting
- Actualiza las URLs autorizadas en Google Cloud Console cuando despliegues a producción
