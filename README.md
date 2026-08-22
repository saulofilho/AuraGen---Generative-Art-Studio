# 🌌 AuraGen Studio — Arte Generativa Abstrata & Algoritmos Complexos

> **Estúdio profissional de arte generativa abstrata no navegador**, permitindo criar obras visuais impressionantes utilizando equações matemáticas avançadas, física de partículas, teoria do caos e morfogênese biológica. Desenvolvido em **React 19 + TypeScript + Tailwind CSS** com suporte a exportação em **Ultra Alta Resolução (até 8K e SVG)**, compatibilidade total com **Mobile / Desktop** e pronto para publicação no **GitHub Pages**.

---

## ✨ Principais Recursos

- 🎨 **7 Motores Algorítmicos Matemáticos**:
  1. **Flow Fields (Campos de Fluxo Vetorial)**: Ruído Simplex 3D, Curl Noise incompressível, turbulência multi-oitavas (fBm), vórtices e simetria rotacional mandala (2x a 12x).
  2. **Strange Attractors (Teoria do Caos)**: Clifford Attractor, Lorenz Butterfly 3D, De Jong, Aizawa Spherical, Thomas Cycloid e Bedhead com mapeamento de densidade logarítmica (HDR Glow).
  3. **Geometria Sagrada & Harmonógrafos**: Espirais de Fibonacci / Phyllotaxis com modulação por ondas harmônicas, harmonógrafo de 4 pêndulos com decaimento exponencial físico e nós toroidais 3D.
  4. **Fractal Flame (IFS)**: Iterated Function System com transformações afins ponderadas e variações não-lineares (*Swirl, Julia, Polar, Spherical, Heart, Disc, Horseshoe*).
  5. **Reação-Difusão (Turing Gray-Scott)**: Simulação de morfogênese biológica (*Corais, Mitose celular, Solítons, Ondas Belousov*) com iluminação especular 3D (relief).
  6. **Voronoi & Delaunay Crystallization**: Cristalização celular com relaxamento de Lloyd, métricas de distância (*Euclidiana, Manhattan, Chebyshev*), malha dual de Delaunay e efeito Vitral (Stained Glass).
  7. **Harmônicos de Fourier (Epiciclos Orbitais)**: Séries harmônicas de phasors acoplados gerando curvas epocicloidais e armadilhas de luz neon.

- 🖼️ **Exportação em Ultra Alta Resolução**:
  - **Tiers de Resolução**: 1K (Web), 2K Quad HD (2048px), 4K Ultra HD (3840px) e **8K Master Cinema (7680px)**.
  - **Formatos Suportados**: `PNG` (com suporte a fundo transparente), `JPEG` (qualidade ajustável), `WebP`, `SVG` (vetores matemáticos perfeitos) e `JSON` (fórmulas e receitas para compartilhamento).
  - **Proporções de Wallpaper**: `1:1` (Instagram/Arte), `9:16` (Stories/Wallpaper Celular), `16:9` (Monitor 4K Desktop), `3:4` (Pôster Fine Art 300 DPI) e `21:9` (Ultrawide).

- 🎵 **Modulação Reativa por Áudio**:
  - **Sintetizador Ambiente Procedural**: Gera harmonias calmas em escala pentatônica conectadas aos parâmetros do canvas.
  - **Microfone em Tempo Real**: Conecte sua voz, palmas ou música ambiente para modular a turbulência e as ondas visuais ao vivo.

- 🕹️ **Controles Intuitivos & Interatividade**:
  - Interação por toque e mouse com modos de atração magnética, repulsão e vórtice em tempo real.
  - Catálogo de **Presets Mestres** pré-configurados com um clique.
  - Editor e seletor de paletas de cores e harmonia cromática.
  - Galeria local de obras salvas com persistência no navegador.
  - Atalhos rápidos de teclado (`Espaço`, `R`, `M`, `S`, `E`, `P`, `C`, `F`).

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 18+ instalado
- Gerenciador de pacotes npm, yarn ou pnpm

### Passos:
```bash
# 1. Clone o repositório
git clone https://github.com/SEU-USUARIO/auragen-generative-art.git

# 2. Acesse a pasta do projeto
cd auragen-generative-art

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento local (Porta 3000)
npm run dev
```

Abra no navegador em `http://localhost:3000`.

---

## 🌐 Publicação no GitHub Pages

O projeto já está configurado com `base: './'` no arquivo `vite.config.ts`, permitindo que todos os scripts, estilos e recursos funcionem perfeitamente em subdomínios e repositórios do GitHub Pages.

### Opção 1: Publicação Rápida via Script `gh-pages`

1. Instale o pacote `gh-pages` como dependência de desenvolvimento:
```bash
npm install -D gh-pages
```

2. No arquivo `package.json`, adicione os scripts de deploy:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

3. Execute o comando de deploy:
```bash
npm run deploy
```

4. No repositório no GitHub, vá em **Settings** > **Pages** e selecione a branch `gh-pages` na pasta `/ (root)`.

---

### Opção 2: Publicação Automática via GitHub Actions

Crie o arquivo `.github/workflows/deploy.yml` no seu repositório:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install dependencies
        run: npm install

      - name: Build project
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

Depois de fazer o push para a branch `main`, o GitHub criará e publicará seu site automaticamente em `https://SEU-USUARIO.github.io/auragen-generative-art/`.

---

## ⌨️ Atalhos de Teclado

| Tecla | Ação |
| :--- | :--- |
| **`Espaço`** | Pausar ou continuar o ciclo de animação |
| **`R`** | Sortear uma nova semente e parâmetros aleatórios |
| **`M`** | Mutar sutilmente os parâmetros atuais (±5%) |
| **`S`** | Captura rápida instantânea em formato PNG |
| **`E`** | Abrir modal de exportação em Ultra Alta Resolução (8K, 4K, SVG) |
| **`P`** | Abrir catálogo de Presets Mestres |
| **`C`** | Abrir seletor e construtor de Paletas de Cores |
| **`F`** | Alternar modo de Tela Cheia (Fullscreen) |
| **`Clique + Arraste`** | Interagir com as partículas do canvas (Atrair / Repelir / Vórtice) |

---

## 📐 Fundamentação Matemática dos Algoritmos

### 1. Curl Noise & Campos de Fluxo Incompressíveis
Derivado do rotacional do vetor potencial de ruído Simplex:
$$\vec{v}(x,y) = \left( \frac{\partial \psi}{\partial y}, -\frac{\partial \psi}{\partial x} \right)$$
Garante divergência nula ($\nabla \cdot \vec{v} = 0$), criando fluxos contínuos sem colapso de partículas.

### 2. Clifford Attractor
$$x_{n+1} = \sin(a \cdot y_n) + c \cdot \cos(a \cdot x_n)$$
$$y_{n+1} = \sin(b \cdot x_n) + d \cdot \cos(b \cdot y_n)$$
Mapeado com acumulação de densidade logarítmica:
$$I(x,y) = \left( \frac{\ln(D(x,y) + 1)}{\ln(D_{\max} + 1)} \right)^{1/\gamma}$$

### 3. Modelo de Reação-Difusão Gray-Scott
$$\frac{\partial u}{\partial t} = D_u \nabla^2 u - u v^2 + F(1 - u)$$
$$\frac{\partial v}{\partial t} = D_v \nabla^2 v + u v^2 - (F + k)v$$
Onde $F$ é a taxa de alimentação e $k$ é a taxa de decaimento químico, gerando espontaneamente padrões de Turing biológicos.

---

## 📄 Licença

Distribuído sob a licença MIT. Sinta-se livre para usar, estudar, modificar e compartilhar!
