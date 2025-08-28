# Rastrear Camuflagem WZ — PWA (pronto para GitHub Pages)

Este pacote está ajustado para ser *instalável* (PWA) quando hospedado no **GitHub Pages** (ou Vercel/Netlify).

## O que foi ajustado
- `index.html`: aponta para `./manifest.webmanifest` e inclui `apple-touch-icon`.
- `manifest.webmanifest`: `id`, `start_url` e `scope` definidos como `./` e ícones com caminho `./icons/...`.
- `service-worker.js`: pré-cache relativo (sem `/` no começo) e estratégias corretas para assets e navegação.
- Removido o `manifest.json` duplicado para evitar conflito.

## Como publicar no GitHub Pages
1. Suba estes arquivos na branch `main` do seu repositório.
2. Em **Settings > Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`.
3. Abra a URL que o GitHub Pages fornecer (HTTPS).
4. No Android (Chrome), você verá **Instalar app** / **Adicionar à tela inicial** com modo *standalone*.
   - No iOS (Safari), use **Compartilhar > Adicionar à Tela de Início**.

> Dica: mantenha o arquivo `service-worker.js` na raiz do repositório (mesmo nível do `index.html`).

## Teste rápido de instalabilidade
- Abra a página no Chrome Desktop → DevTools (F12) → **Application > Manifest**. Verifique ícones, start_url e service worker ativo.
- Ative **Throttling > Offline** e recarregue: a página deve abrir offline (cache).
