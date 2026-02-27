// content.js - Intercepta el token de Discord y lo pasa al popup

(function() {
  // Método 1: Obtener token desde localStorage de Discord
  function getToken() {
    try {
      // Discord guarda el token en localStorage
      const token = localStorage.getItem('token');
      if (token) return token.replace(/"/g, '');
    } catch(e) {}
    
    try {
      // Alternativa: buscar en las cookies/storage de Discord
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const val = localStorage.getItem(key);
        if (val && val.length > 50 && /^[A-Za-z0-9_\-\.]+$/.test(val.replace(/"/g,''))) {
          const clean = val.replace(/"/g,'');
          // Los tokens de Discord tienen formato específico: base64.timestamp.hash
          if (clean.split('.').length === 3 && clean.length > 50) {
            return clean;
          }
        }
      }
    } catch(e) {}
    
    return null;
  }

  // Método 2: Obtener guildId de la URL actual
  function getGuildIdFromUrl() {
    const match = window.location.href.match(/discord\.com\/channels\/(\d+)/);
    return match ? match[1] : null;
  }

  // Escuchar mensajes del popup
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'getDiscordData') {
      const token = getToken();
      const guildId = getGuildIdFromUrl();
      sendResponse({ 
        token: token, 
        guildId: guildId,
        url: window.location.href
      });
      return true;
    }
  });

  // Guardar en window para fallback
  window.__dri = {
    getToken: getToken,
    getGuildId: getGuildIdFromUrl
  };
})();
