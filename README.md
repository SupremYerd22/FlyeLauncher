# FlyeLauncher

Um launcher de aplicativos moderno para Linux, construído com AGS e GTK4, com paleta visual inspirada no Arch Linux.

---

## O que é AGS?

[AGS (Aylur's GTK Shell)](https://github.com/Aylur/ags) é um framework para criar interfaces gráficas no Linux usando GTK4 com uma sintaxe declarativa em TypeScript/JSX — similar ao React, mas voltado para o ecossistema desktop Linux. Ele se integra ao Wayland via Astal e permite criar widgets, launchers, barras de status e outros componentes de shell com reatividade nativa.

---

## Descrição

FlyeLauncher é um launcher de aplicativos focado em teclado, projetado para ambientes Wayland. Ele exibe todos os apps instalados agrupados por categoria, permite pesquisa fuzzy em tempo real e oferece navegação completa sem o mouse.

O visual padrão usa a paleta oficial do Arch Linux (`#1793d1`) sobre fundos escuros, com suporte alternativo ao tema GTK do sistema.

---

## Benefícios

- **Zero dependência de mouse** — navegação completa por teclado
- **Pesquisa fuzzy** — encontra apps mesmo com erros de digitação
- **Leve e rápido** — sem Electron, sem runtime pesado; GTK4 nativo
- **Dois temas** — paleta fixa Arch Linux ou tema GTK do sistema operacional
- **Categorias automáticas** — apps agrupados por categoria XDG do `.desktop`
- **Wayland nativo** — integrado via Astal, sem XWayland

---

## Funções

### Pesquisa
- Digite qualquer letra ou número em qualquer momento para abrir a busca automaticamente
- A pesquisa usa fuzzy matching (`AstalApps`) e exibe até 8 resultados
- Apague o campo para voltar ao grid de apps
- **Setas cima/baixo** navegam pelos resultados enquanto pesquisa

### Navegação por teclado
| Tecla | Ação |
|---|---|
| Qualquer letra/número | Foca a barra de pesquisa e insere o caractere |
| `↑ ↓ ← →` | Navega o grid de apps (quando sem pesquisa) |
| `↑ ↓` | Navega resultados da busca (quando pesquisando) |
| `Tab` / `Shift+Tab` | Alterna foco entre o grid e a barra lateral |
| `↑ ↓` | Navega seções da barra lateral (quando ela está focada) |
| `Enter` | Abre o app selecionado |
| `Esc` | Fecha o launcher |
| Clique fora | Fecha o launcher |

### Grid de aplicativos
- Apps agrupados por categoria (Internet, Mídia, Desenvolvimento, etc.)
- Categorias definidas via mapeamento XDG + overrides personalizados em `widget/categories`
- Navegação espacial: cima/baixo encontram o app na linha acima/abaixo pelo alinhamento de pixels

### Barra lateral
- Seções: **Aplicativos**, **Recentes**, **Ações**
- Botão de alternância de tema no rodapé

### Temas
- **Padrão** — paleta Arch Linux (`#1793d1`, fundos `#0d1117` / `#090d12`)
- **Sistema** — usa as variáveis GTK do tema ativo (`@theme_bg_color`, `@accent_bg_color`, etc.)

---

## Como executar

Para rodar diretamente durante o desenvolvimento, sem precisar buildar:

```bash
ags run app.ts
```

O launcher inicia oculto. Para exibi-lo ou ocultá-lo, envie um request pela CLI em outro terminal:

```bash
ags request toggle
```

> O comando `toggle` é tratado pelo `requestHandler` em `app.ts` e alterna a visibilidade da janela.

---

## Como buildar

O build gera um binário único (GJS bundle) que pode ser distribuído ou instalado no sistema:

```bash
ags bundle app.ts flie-launcher
```

Isso compila todo o TypeScript/JSX, SCSS e assets em um único arquivo executável chamado `flie-launcher`.

Para especificar um diretório de saída diferente:

```bash
ags bundle app.ts dist/flie-launcher
```

---

## Etapas pós build

Após gerar o binário, as etapas recomendadas para integração com o sistema são:

**1. Tornar o binário executável e mover para o PATH**
```bash
chmod +x flie-launcher
sudo mv flie-launcher /usr/local/bin/flie-launcher
```

**2. Criar um arquivo `.desktop` para autostart ou integração com o WM**
```ini
# ~/.config/autostart/flie-launcher.desktop
[Desktop Entry]
Type=Application
Name=FlyeLauncher
Exec=flie-launcher
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
```

**3. Configurar um atalho de teclado no compositor Wayland**

Adicione um bind no seu compositor (Hyprland, Sway, etc.) para acionar o toggle:

```bash
# Exemplo — Hyprland (hyprland.conf)
bind = SUPER, Space, exec, ags request toggle -a flie-launcher
```

```bash
# Exemplo — Sway (config)
bindsym Mod4+space exec ags request toggle -a flie-launcher
```

O launcher permanece rodando em background e a janela é apenas mostrada/escondida a cada chamada do toggle, garantindo abertura instantânea.

---

## Estrutura

```
FlyeLauncher.tsx          # Janela principal, controle de teclado e estado global
widget/
  SearchBar.tsx           # Barra de pesquisa
  SideNav.tsx             # Navegação lateral e toggle de tema
  AppGrid.tsx             # Container do grid de apps
  components/
    appGrid/
      AllApps.tsx         # Renderização do grid com FlowBox por categoria
      categories.ts       # Mapeamento XDG e categorias personalizadas
style.scss                # Estilos (tema padrão + tema sistema)
flyeLauncherTypes.d.ts    # Tipos compartilhados
```

---

## Dependências

- [`ags`](https://github.com/Aylur/ags) — framework GTK4 + TypeScript
- [`gnim`](https://github.com/Aylur/gnim) — bindings GObject para TypeScript
- `AstalApps` — biblioteca Astal para listar e buscar aplicativos instalados
