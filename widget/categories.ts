/**
 * Categorias personalizadas de apps.
 * Chave: nome do app (app.name) OU nome do desktop entry (app.entry)
 * Valor: nome da categoria que vai aparecer no grid
 *
 * Exemplos:
 *   "Steam":       "JOGOS",
 *   "heroic":      "JOGOS",       ← pelo entry (desktop file id)
 *   "Bottles":     "JOGOS",
 *   "Obsidian":    "ESCRITÓRIO",
 */
export const customCategories: Record<string, string> = {
  // adicione aqui
}

/**
 * Mapeamento XDG → nome exibido (fallback quando não há categoria personalizada).
 */
export const XDG_CATEGORIES: Record<string, string> = {
  Network:     "INTERNET",
  WebBrowser:  "INTERNET",
  AudioVideo:  "MÍDIA",
  Audio:       "MÍDIA",
  Video:       "MÍDIA",
  Graphics:    "GRÁFICOS",
  Development: "DESENVOLVIMENTO",
  IDE:         "DESENVOLVIMENTO",
  TextEditor:  "DESENVOLVIMENTO",
  System:      "SISTEMA",
  Settings:    "SISTEMA",
  Office:      "ESCRITÓRIO",
  Game:        "JOGOS",
  Utility:     "UTILITÁRIOS",
  Education:   "EDUCAÇÃO",
  Science:     "DESENVOLVIMENTO",
}

export const CATEGORY_ORDER = [
  "INTERNET", "MÍDIA", "GRÁFICOS", "DESENVOLVIMENTO",
  "ESCRITÓRIO", "SISTEMA", "JOGOS", "UTILITÁRIOS", "EDUCAÇÃO", "OUTROS",
]
