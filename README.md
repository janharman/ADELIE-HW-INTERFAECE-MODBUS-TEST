# AdeMbM

Pokud bude aplikace dostupná například na:

```text
https://example.com/xxx/
```

nastav ve `vite.config.js`:

```js
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [react()],
	base: '/xxx/',
})
```

Build vytvoříš příkazem:

```bash
npm run build
```

Výsledkem bude složka `dist`. Její obsah nahraj na server do adresáře, který server obsluhuje jako `/xxx/`.

Alternativně lze cestu zadat pouze při buildu:

```bash
npm run build -- --base=/xxx/
```

Důležité je, aby server podporoval historii React aplikace a při požadavku na `/xxx/` vracel `index.html`.