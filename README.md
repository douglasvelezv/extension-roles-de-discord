# 🛡️ Discord Role Inspector

> Visualiza los rangos, colores y emojis de cualquier servidor de Discord directamente desde tu navegador.

![license MIT](https://img.shields.io/badge/license-MIT-blue.svg) ![version 1.0.0](https://img.shields.io/badge/version-1.0.0-green.svg) ![manifest v3](https://img.shields.io/badge/manifest-v3-orange.svg)

## 🚀 Características

### 🎨 Visualización de Rangos
- Muestra todos los roles del servidor con sus colores reales
- Visualiza el emoji o imagen de cada rango
- Indicadores visuales de posición jerárquica
- Vista con color del nombre de cada rango

### 📊 Estadísticas en Tiempo Real
- Contador total de rangos del servidor
- Cantidad de rangos con color personalizado
- Cantidad de rangos con emoji asignado
- Cantidad de rangos visibles/hoisted en la lista de miembros

### 🔍 Búsqueda Rápida
- Filtra rangos por nombre instantáneamente
- Resultados en tiempo real mientras escribes
- Interfaz limpia sin recargas

### ⬇️ Descarga en ZIP
- Exporta todos los rangos en un archivo `.txt` detallado
- Descarga automática de las imágenes personalizadas de los rangos
- Carpeta `imagenes/` organizada con los íconos en PNG/WebP/GIF
- Nombre del archivo incluye el nombre del servidor
- Generador ZIP nativo sin librerías externas

### 🔐 Seguridad y Privacidad
- Token obtenido directamente desde el `localStorage` de Discord Web
- No se almacena ni envía a ningún servidor externo
- Todo funciona localmente en tu navegador
- Código de fuente abierta verificable

## 📋 Requisitos

- Navegador **Google Chrome** (o basado en Chromium)
- Tener **Discord Web** abierto (`discord.com`) en una pestaña
- Estar dentro de un **canal de texto** de un servidor

## 🔧 Instalación

### Opción 1: Instalar manualmente (modo desarrollador)

1. Descarga o clona este repositorio:
   ```bash
   git clone https://github.com/douglasvelezv/extension-roles-de-discord.git
   ```
2. Abre Chrome y ve a `chrome://extensions/`
3. Activa el **Modo desarrollador** (esquina superior derecha)
4. Haz clic en **"Cargar extensión sin empaquetar"**
5. Selecciona la carpeta del repositorio clonado
6. La extensión aparecerá en tu barra de herramientas

## 📖 Instrucciones de Uso

1. **Abre Discord Web**: Ve a [discord.com](https://discord.com) en Chrome y entra a un servidor
2. **Navega a un canal**: Haz clic en cualquier canal de texto del servidor cuyos roles quieres ver
3. **Abre la extensión**: Haz clic en el ícono de Discord Role Inspector en la barra de herramientas
4. **Escanea**: Presiona el botón **"Escanear"**
5. **Explora**: Visualiza todos los rangos con sus colores, emojis y badges
6. **Busca**: Usa la barra de búsqueda para filtrar rangos por nombre
7. **Descarga**: Pulsa **"⬇️ ZIP"** para exportar todos los datos y las imágenes

## 🏗️ Estructura del Proyecto

```
extension-roles-de-discord/
├── manifest.json      # Configuración de la extensión (Manifest v3)
├── popup.html         # Interfaz de usuario del popup
├── popup.js           # Lógica principal: escaneo, render y descarga ZIP
├── content.js         # Script inyectado: obtiene token y guildId de Discord
├── icon16.png         # Ícono 16x16
├── icon48.png         # Ícono 48x48
├── icon128.png        # Ícono 128x128
└── README.md          # Este archivo
```

## 💻 Stack Tecnológico

- **Extensión**: Chrome Extension Manifest v3
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **API**: Discord API v10
- **Almacenamiento**: `localStorage` de Discord Web (lectura local)
- **ZIP**: Implementación nativa en JavaScript puro (sin librerías externas)

## 🔄 Flujo de la Extensión

```
┌─────────────────────────┐
│  Clic en "Escanear"     │ → Detecta pestaña activa de Discord
└──────────┬──────────────┘
           ↓
┌─────────────────────────┐
│  content.js inyectado   │ → Obtiene token y guildId del localStorage
└──────────┬──────────────┘
           ↓
┌─────────────────────────┐
│  Discord API v10        │ → GET /guilds/{id}/roles + /guilds/{id}
└──────────┬──────────────┘
           ↓
┌─────────────────────────┐
│  Render en popup        │ → Lista de rangos con color, emoji y badges
└──────────┬──────────────┘
           ↓
┌─────────────────────────┐
│  Descarga ZIP           │ → TXT con datos + imágenes de roles
└─────────────────────────┘
```

## 🎯 Detalles de los Rangos Mostrados

| Campo | Descripción |
|---|---|
| Nombre | Nombre del rango con su color real |
| Color | Hex del color (`#RRGGBB`) o "sin color" |
| Emoji | Unicode o imagen del rango (`role-icon`) |
| Posición | Jerarquía del rango en el servidor |
| `visible` | Badge si el rango aparece separado en la lista |
| `bot` | Badge si el rango es gestionado por un bot |
| `@everyone` | Badge para el rango base del servidor |
| `🖼 imagen` | Badge si el rango usa imagen personalizada |

## 📦 Formato del ZIP Exportado

```
roles_NombreServidor.zip
├── rangos_NombreServidor.txt    # Reporte completo con todos los datos
└── imagenes/
    ├── NombreRango1.png         # Imagen del rango (si tiene)
    ├── NombreRango2.webp
    └── ...
```

## ⚙️ Endpoints de Discord API Utilizados

```
GET /guilds/{id}/roles   // Lista todos los roles del servidor
GET /guilds/{id}         // Obtiene el nombre del servidor
```

### CDN de Discord para íconos de roles
```
https://cdn.discordapp.com/role-icons/{role_id}/{icon_hash}.png?size=128
```

## 🔒 Privacidad y Seguridad

- ✅ El token **NO se envía** a ningún servidor externo
- ✅ Todo funciona en tu navegador local
- ✅ El token se lee de `localStorage` de Discord, sin almacenamiento adicional
- ✅ Código verificable de fuente abierta
- ✅ No requiere permisos especiales en el servidor de Discord

## 🐛 Solución de Problemas

### "Abre Discord Web y entra a un canal de un servidor"
- Asegúrate de estar en `discord.com` (no en la app de escritorio)
- Haz clic en un canal de texto antes de escanear

### "No se pudo obtener el token de Discord"
- Recarga Discord completamente (`Ctrl + Shift + R`)
- Espera que cargue por completo y entra a un canal
- Vuelve a intentarlo

### "API error 403 o 401"
- El token puede haber expirado; recarga Discord y vuelve a escanear
- Asegúrate de ser miembro del servidor

### "Los íconos de rangos no cargan"
- Algunos íconos pueden tener restricciones de CORS
- Intenta descargar el ZIP de todos modos; los demás archivos se incluirán correctamente

## 🚧 Roadmap Futuro

- [ ] Filtros por tipo de rango (bot, hoist, con emoji, con color)
- [ ] Vista previa de colores en formato paleta
- [ ] Soporte para exportar en formato JSON
- [ ] Soporte multi-servidor (comparar roles entre servidores)
- [ ] Ordenamiento personalizado (por nombre, color, posición)
- [ ] Interfaz multiidioma

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](https://github.com/douglasvelezv/extension-roles-de-discord/blob/main/LICENSE) para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios grandes:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si encuentras problemas o tienes sugerencias:

- Abre un [Issue](https://github.com/douglasvelezv/extension-roles-de-discord/issues)
- Incluye detalles de tu problema
- Proporciona pasos para reproducir el error

## 👨‍💻 Autor

**douglasvelezv** - Discord Role Inspector

- GitHub: [@douglasvelezv](https://github.com/douglasvelezv)
- Proyecto: [extension-roles-de-discord](https://github.com/douglasvelezv/extension-roles-de-discord)

## ⭐ Agradecimientos

- Discord API por proporcionar acceso a los datos de los servidores
- Comunidad de GitHub por el feedback
- Chrome Extensions API por las herramientas de desarrollo

---

**Hecho con ❤️ por [douglasvelezv](https://github.com/douglasvelezv)**

[⬆ volver arriba](#%EF%B8%8F-discord-role-inspector)
