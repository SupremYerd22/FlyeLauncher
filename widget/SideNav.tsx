import { createState } from "ags"
import { Gtk } from "ags/gtk4"

export type Section = "apps" | "recent" | "actions" | "calc"

type NavItemDef = {
  id: Section
  icon: string
  label: string
  count?: number
}

type Props = {
  active?: Section
  onSelect?: (section: Section) => void
  appCount?: number
}

export default function SideNav({ active: initialActive = "recent", onSelect, appCount }: Props) {

  const NAV_ITEMS: NavItemDef[] = [
    { id: "apps",    icon: "󰀻", label: "Aplicativos", count: appCount },
    { id: "recent",  icon: "󰔚", label: "Recentes",    count: 0 },
    { id: "actions", icon: "󱐋", label: "Ações",       count: 0 },
  ]

  const [active, setActive] = createState<Section>(initialActive)

  function select(section: Section) {
    setActive(section)
    onSelect?.(section)
  }

  return (
    <box class="sidenav" orientation={Gtk.Orientation.VERTICAL} spacing={2}>
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
    </box>
  )
}
