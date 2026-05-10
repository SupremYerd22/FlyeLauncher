import { Accessor, createState, Setter } from "ags"
import { Gtk } from "ags/gtk4"
import { Section } from "../flyeLauncherTypes"

type Theme = 'default' | 'system'

type NavItemDef = {
  id: Section
  icon: string
  label: string
  count?: number
}

type Props = {
  active: Accessor<Section>
  onSelect?: (section: Section) => void
  appCount?: number
  setActive: Setter<Section>
  theme?: Accessor<Theme>
  onThemeToggle?: () => void
}

export default function SideNav({ active, setActive, onSelect, appCount, theme, onThemeToggle }: Props) {

  const NAV_ITEMS: NavItemDef[] = [
    { id: "apps",    icon: "󰀻", label: "Aplicativos", count: appCount },
    { id: "recent",  icon: "󰔚", label: "Recentes",    count: 0 },
    { id: "actions", icon: "󱐋", label: "Ações",       count: 0 },
  ]

  function select(section: Section) {
    setActive(section)
    onSelect?.(section)
  }

  return (
    <box class="sidenav" orientation={Gtk.Orientation.VERTICAL} spacing={2} vexpand>
      <label
        class="nav-header"
        label="NAVEGAR"
        halign={Gtk.Align.START}
      />
      {NAV_ITEMS.map((item) => (
        <button
          class={active((a) => `nav-item${a === item.id ? " active" : ""}`)}
          onClicked={() => select(item.id)}
        >
          <box spacing={10}>
            <label class="nav-icon" label={item.icon} />
            <label
              class="nav-label"
              label={item.label}
              hexpand
              halign={Gtk.Align.START}
            />
            {item.count !== undefined && (
              <label class="nav-badge" label={String(item.count)} />
            )}
          </box>
        </button>
      ))}

      <box vexpand />

      <Gtk.Separator class="nav-divider" orientation={Gtk.Orientation.HORIZONTAL} />

      <button class="nav-item" onClicked={onThemeToggle}>
        <box spacing={10}>
          <label class="nav-icon" label={theme ? theme((t) => t === 'default' ? '󰔎' : '󰖔') : '󰔎'} />
          <label
            class="nav-label"
            label={theme ? theme((t) => t === 'default' ? 'Padrão' : 'Sistema') : 'Padrão'}
            hexpand
            halign={Gtk.Align.START}
          />
        </box>
      </button>
    </box>
  )
}
