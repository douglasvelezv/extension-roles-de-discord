// popup.js - Con descarga ZIP (TXT + imágenes de roles)

let allRoles = [];
let currentGuildId = null;
let currentGuildName = 'servidor';

const btnScan = document.getElementById('btnScan');
const btnDownload = document.getElementById('btnDownload');
const statsBar = document.getElementById('statsBar');
const searchWrap = document.getElementById('searchWrap');
const searchInput = document.getElementById('searchInput');
const mainContent = document.getElementById('mainContent');
const toast = document.getElementById('toast');

function setState(html) { mainContent.innerHTML = html; }

function showToast(msg, duration = 2500) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

function showError(msg) {
  statsBar.classList.remove('visible');
  searchWrap.classList.remove('visible');
  btnDownload.classList.remove('visible');
  setState(`
    <div class="state state-error">
      <div class="state-icon">⚠️</div>
      <div class="state-title">No se pudo leer</div>
      <div class="state-desc">${msg}</div>
    </div>
  `);
}

function showLoading(msg) {
  setState(`
    <div class="state">
      <div class="state-icon" style="animation:spin 1s linear infinite;display:inline-block;">⚙️</div>
      <div class="state-title">Escaneando...</div>
      <div class="state-desc">${msg || ''}</div>
    </div>
  `);
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function renderRoles(roles) {
  if (!roles.length) {
    return `<div style="text-align:center;padding:24px;color:#6b7280;font-size:12px;font-family:'DM Mono',monospace;">Sin resultados.</div>`;
  }
  let html = '<div class="roles-list">';
  roles.forEach(function(role, i) {
    var colorDotStyle = role.color ? 'background:' + role.color + '22; border-color:' + role.color + '55;' : '';
    var colorDotClass = role.color ? 'role-color-dot' : 'role-color-dot no-color';
    var emojiInDot = '';
    if (role.emoji) {
      if (role.emojiIsUrl) {
        emojiInDot = '<img src="' + role.emoji + '" class="role-emoji-img" alt="emoji">';
      } else {
        emojiInDot = role.emoji;
      }
    }
    var badges = '';
    if (role.name === '@everyone') badges += '<span class="role-badge badge-everyone">@everyone</span>';
    if (role.hoist) badges += '<span class="role-badge badge-hoist">visible</span>';
    if (role.managed) badges += '<span class="role-badge badge-managed">bot</span>';
    if (role.emojiIsUrl) badges += '<span class="role-badge badge-img">🖼 imagen</span>';
    var hexLabel = role.color
      ? '<span class="role-hex">' + role.color.toUpperCase() + '</span>'
      : '<span class="role-hex" style="color:#3a3d4a">sin color</span>';
    var nameColor = role.color ? 'style="color:' + role.color + '"' : '';

    html += `
      <div class="role-item" style="animation-delay:${i * 15}ms">
        <div class="${colorDotClass}" style="${colorDotStyle}">${emojiInDot}</div>
        <div class="role-info">
          <div class="role-name" ${nameColor}>${escapeHtml(role.name)}</div>
          <div class="role-meta">${hexLabel}${badges}</div>
        </div>
        <div class="role-position">#${role.position}</div>
      </div>`;
  });
  html += '</div>';
  return html;
}

function filterAndRender(query) {
  var filtered = query
    ? allRoles.filter(r => r.name.toLowerCase().includes(query.toLowerCase()))
    : allRoles;
  setState(renderRoles(filtered));
}

searchInput.addEventListener('input', () => filterAndRender(searchInput.value));

function processRoles(rolesData, guildId) {
  currentGuildId = guildId;
  allRoles = rolesData.map(role => {
    const colorInt = role.color || 0;
    const colorHex = colorInt === 0 ? null : '#' + colorInt.toString(16).padStart(6, '0');
    let emoji = null, emojiIsUrl = false;
    if (role.unicode_emoji) { emoji = role.unicode_emoji; }
    else if (role.icon) {
      // Usar tamaño máximo disponible: 128px
      emoji = 'https://cdn.discordapp.com/role-icons/' + role.id + '/' + role.icon + '.png?size=128';
      emojiIsUrl = true;
    }
    return {
      id: role.id, name: role.name, color: colorHex,
      emoji, emojiIsUrl,
      position: role.position || 0,
      hoist: role.hoist || false,
      managed: role.managed || false,
      mentionable: role.mentionable || false,
    };
  }).sort((a, b) => b.position - a.position);

  const colored = allRoles.filter(r => r.color).length;
  const withEmoji = allRoles.filter(r => r.emoji).length;
  const hoisted = allRoles.filter(r => r.hoist).length;

  document.getElementById('totalRoles').textContent = allRoles.length;
  document.getElementById('coloredRoles').textContent = colored;
  document.getElementById('emojiRoles').textContent = withEmoji;
  document.getElementById('hoistRoles').textContent = hoisted;

  statsBar.classList.add('visible');
  searchWrap.classList.add('visible');
  btnDownload.classList.add('visible');
  searchInput.value = '';
  filterAndRender('');
}

async function fetchRolesWithToken(token, guildId) {
  // Obtener info del guild también para el nombre
  const [rolesResp, guildResp] = await Promise.all([
    fetch('https://discord.com/api/v10/guilds/' + guildId + '/roles', {
      headers: { 'Authorization': token, 'Content-Type': 'application/json' }
    }),
    fetch('https://discord.com/api/v10/guilds/' + guildId, {
      headers: { 'Authorization': token, 'Content-Type': 'application/json' }
    })
  ]);

  if (!rolesResp.ok) {
    const err = await rolesResp.json().catch(() => ({}));
    throw new Error('API error ' + rolesResp.status + ': ' + (err.message || 'sin acceso'));
  }

  const roles = await rolesResp.json();
  if (guildResp.ok) {
    const guild = await guildResp.json();
    currentGuildName = guild.name || 'servidor';
  }
  return roles;
}

function extractGuildId(url) {
  const match = url && url.match(/discord\.com\/channels\/(\d+)/);
  return match ? match[1] : null;
}

// ========================
// DESCARGA ZIP
// ========================

// Función para sanitizar nombre de archivo
function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').replace(/\s+/g, '_').substring(0, 80);
}

// Generar contenido TXT
function generateTxt(roles, guildName) {
  const lines = [];
  lines.push('====================================================');
  lines.push('  DISCORD ROLE INSPECTOR - ' + guildName.toUpperCase());
  lines.push('====================================================');
  lines.push('Total de rangos: ' + roles.length);
  lines.push('Generado: ' + new Date().toLocaleString('es'));
  lines.push('====================================================');
  lines.push('');

  roles.forEach((role, i) => {
    lines.push('─────────────────────────────────────────────────');
    lines.push('Posición  : #' + role.position + ' (Rango ' + (i + 1) + ' de ' + roles.length + ')');
    lines.push('Nombre    : ' + role.name);
    lines.push('Color     : ' + (role.color ? role.color.toUpperCase() : 'Sin color (#000000 por defecto)'));
    lines.push('Emoji     : ' + (role.emoji
      ? (role.emojiIsUrl ? '[IMAGEN - ver carpeta imagenes/' + sanitizeFilename(role.name) + '.png]' : role.emoji)
      : 'Sin emoji'));
    lines.push('Usa imagen: ' + (role.emojiIsUrl ? 'SÍ' : 'NO'));
    lines.push('Visible   : ' + (role.hoist ? 'SÍ (aparece separado en la lista)' : 'NO'));
    lines.push('Bot/Managed: ' + (role.managed ? 'SÍ' : 'NO'));
    lines.push('Mencionable: ' + (role.mentionable ? 'SÍ' : 'NO'));
    lines.push('ID        : ' + role.id);
    lines.push('');
  });

  lines.push('====================================================');
  lines.push('  FIN DEL REPORTE');
  lines.push('====================================================');

  return lines.join('\n');
}

// Descargar imagen como blob
async function fetchImageBlob(url) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const blob = await resp.blob();
    return blob;
  } catch(e) {
    return null;
  }
}

// Convertir blob a ArrayBuffer
function blobToArrayBuffer(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

// ===== Mini ZIP builder (sin librería externa) =====
// Implementación básica de ZIP en JavaScript puro

function crc32(data) {
  const table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[i] = c;
    }
    return t;
  })();
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function encodeString(str) {
  return new TextEncoder().encode(str);
}

function uint16LE(n) { return [n & 0xFF, (n >> 8) & 0xFF]; }
function uint32LE(n) { return [n & 0xFF, (n >> 8) & 0xFF, (n >> 16) & 0xFF, (n >> 24) & 0xFF]; }

function buildZip(files) {
  // files: [{name: string, data: Uint8Array}]
  const localHeaders = [];
  const centralHeaders = [];
  let offset = 0;

  const now = new Date();
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);

  for (const file of files) {
    const nameBytes = encodeString(file.name);
    const data = file.data instanceof Uint8Array ? file.data : new Uint8Array(file.data);
    const crc = crc32(data);
    const size = data.length;

    // Local file header
    const local = new Uint8Array([
      0x50, 0x4B, 0x03, 0x04, // signature
      0x14, 0x00,             // version needed
      0x00, 0x00,             // flags
      0x00, 0x00,             // compression (store)
      ...uint16LE(dosTime),
      ...uint16LE(dosDate),
      ...uint32LE(crc),
      ...uint32LE(size),
      ...uint32LE(size),
      ...uint16LE(nameBytes.length),
      0x00, 0x00,             // extra field length
      ...nameBytes,
    ]);

    localHeaders.push({ local, data, nameBytes, crc, size, offset, dosTime, dosDate });
    offset += local.length + size;
  }

  // Central directory
  const centralParts = [];
  for (const f of localHeaders) {
    const central = new Uint8Array([
      0x50, 0x4B, 0x01, 0x02, // signature
      0x14, 0x00,             // version made by
      0x14, 0x00,             // version needed
      0x00, 0x00,             // flags
      0x00, 0x00,             // compression
      ...uint16LE(f.dosTime),
      ...uint16LE(f.dosDate),
      ...uint32LE(f.crc),
      ...uint32LE(f.size),
      ...uint32LE(f.size),
      ...uint16LE(f.nameBytes.length),
      0x00, 0x00,             // extra
      0x00, 0x00,             // comment
      0x00, 0x00,             // disk start
      0x00, 0x00,             // internal attr
      0x00, 0x00, 0x00, 0x00, // external attr
      ...uint32LE(f.offset),
      ...f.nameBytes,
    ]);
    centralParts.push(central);
  }

  const centralSize = centralParts.reduce((s, c) => s + c.length, 0);

  // End of central directory
  const eocd = new Uint8Array([
    0x50, 0x4B, 0x05, 0x06,
    0x00, 0x00,
    0x00, 0x00,
    ...uint16LE(localHeaders.length),
    ...uint16LE(localHeaders.length),
    ...uint32LE(centralSize),
    ...uint32LE(offset),
    0x00, 0x00,
  ]);

  // Concatenar todo
  const totalSize = offset + centralSize + eocd.length;
  const result = new Uint8Array(totalSize);
  let pos = 0;

  for (const f of localHeaders) {
    result.set(f.local, pos); pos += f.local.length;
    result.set(f.data, pos); pos += f.data.length;
  }
  for (const c of centralParts) {
    result.set(c, pos); pos += c.length;
  }
  result.set(eocd, pos);

  return result;
}

// ========================
// Botón de descarga
// ========================
btnDownload.addEventListener('click', async function() {
  if (!allRoles.length) return;

  btnDownload.textContent = '⏳ ...';
  btnDownload.classList.add('loading');
  showToast('⏳ Preparando archivos...', 8000);

  try {
    const zipFiles = [];

    // 1. Generar TXT
    const txtContent = generateTxt(allRoles, currentGuildName);
    zipFiles.push({
      name: 'rangos_' + sanitizeFilename(currentGuildName) + '.txt',
      data: new TextEncoder().encode(txtContent)
    });

    // 2. Descargar imágenes de roles que las tengan
    const rolesConImagen = allRoles.filter(r => r.emojiIsUrl && r.emoji);

    if (rolesConImagen.length > 0) {
      // Descargar todas las imágenes en paralelo (máximo 5 a la vez)
      const chunkSize = 5;
      for (let i = 0; i < rolesConImagen.length; i += chunkSize) {
        const chunk = rolesConImagen.slice(i, i + chunkSize);
        const results = await Promise.all(chunk.map(async role => {
          const blob = await fetchImageBlob(role.emoji);
          if (!blob) return null;
          const ab = await blobToArrayBuffer(blob);
          
          // Determinar extensión por tipo
          let ext = 'png';
          if (blob.type.includes('gif')) ext = 'gif';
          else if (blob.type.includes('webp')) ext = 'webp';
          else if (blob.type.includes('jpeg') || blob.type.includes('jpg')) ext = 'jpg';

          return {
            name: 'imagenes/' + sanitizeFilename(role.name) + '.' + ext,
            data: new Uint8Array(ab)
          };
        }));
        results.filter(Boolean).forEach(f => zipFiles.push(f));
      }
    }

    // 3. Construir ZIP
    const zipData = buildZip(zipFiles);
    const blob = new Blob([zipData], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);

    // 4. Descargar
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roles_' + sanitizeFilename(currentGuildName) + '.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const imgCount = rolesConImagen.length;
    showToast('✅ ZIP descargado (' + allRoles.length + ' rangos, ' + imgCount + ' imágenes)', 3000);

  } catch(err) {
    showToast('❌ Error: ' + err.message, 3000);
  } finally {
    btnDownload.textContent = '⬇️ ZIP';
    btnDownload.classList.remove('loading');
  }
});

// ========================
// Escanear
// ========================
btnScan.addEventListener('click', async function() {
  btnScan.textContent = '...';
  btnScan.classList.add('loading');
  showLoading('Buscando datos...');

  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];

    if (!tab || !tab.url || !tab.url.includes('discord.com')) {
      showError('Abre Discord Web (discord.com) y entra a un canal de un servidor.');
      return;
    }

    const guildId = tab.url.match(/discord\.com\/channels\/(\d+)/)?.[1];
    if (!guildId) {
      showError('Haz clic en un canal de texto dentro del servidor y luego presiona Escanear.');
      return;
    }

    showLoading('Obteniendo token...');

    try {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
    } catch(e) {}

    await new Promise(r => setTimeout(r, 400));

    let token = null;
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          try {
            const t = localStorage.getItem('token');
            if (t) return t.replace(/"/g, '');
          } catch(e) {}
          try {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              const val = localStorage.getItem(key);
              if (!val) continue;
              const clean = val.replace(/^"|"$/g, '');
              const parts = clean.split('.');
              if (parts.length === 3 && clean.length > 50 && /^[\w\-\.]+$/.test(clean)) return clean;
            }
          } catch(e) {}
          return null;
        }
      });
      if (results?.[0]?.result) token = results[0].result;
    } catch(e) {}

    if (!token) {
      showError('No se pudo obtener el token de Discord.<br><br>Recarga Discord completamente y vuelve a intentarlo estando dentro de un canal.');
      return;
    }

    showLoading('Cargando roles del servidor...');
    const roles = await fetchRolesWithToken(token, guildId);
    processRoles(roles, guildId);

  } catch(err) {
    showError('Error: ' + err.message);
  } finally {
    btnScan.textContent = 'Escanear';
    btnScan.classList.remove('loading');
  }
});

async function fetchRolesWithToken(token, guildId) {
  const [rolesResp, guildResp] = await Promise.all([
    fetch('https://discord.com/api/v10/guilds/' + guildId + '/roles', {
      headers: { 'Authorization': token }
    }),
    fetch('https://discord.com/api/v10/guilds/' + guildId, {
      headers: { 'Authorization': token }
    })
  ]);
  if (!rolesResp.ok) {
    const err = await rolesResp.json().catch(() => ({}));
    throw new Error('API error ' + rolesResp.status + ': ' + (err.message || 'sin acceso'));
  }
  const roles = await rolesResp.json();
  if (guildResp.ok) {
    const guild = await guildResp.json();
    currentGuildName = guild.name || 'servidor';
  }
  return roles;
}
