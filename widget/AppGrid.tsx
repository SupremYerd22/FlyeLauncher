import { Gtk } from "ags/gtk4"
import AstalApps from "gi://AstalApps"
import Pango from "gi://Pango"
import app from "ags/gtk4/app"
import { customCategories, XDG_CATEGORIES, CATEGORY_ORDER } from "./categories"

type AppGroup = {
  label: string
  apps: AstalApps.Application[]
}

function getCategory(application: AstalApps.Application): string {
  // 1. categoria personalizada por nome ou entry
  if (customCategories[application.name])  return customCategories[application.name]
  if (customCategories[application.entry]) return customCategories[application.entry]

  // 2. fallback: categorias XDG do .desktop
  for (const cat of application.categories) {
    if (XDG_CATEGORIES[cat]) return XDG_CATEGORIES[cat]
  }

  return "OUTROS"
}

function groupApps(apps: AstalApps.Application[]): AppGroup[] {
  const map = new Map<string, AstalApps.Application[]>()
  for (const a of apps) {
    const cat = getCategory(a)
    if (!map.has(cat)) map.set(cat, [])
    map.get(cat)!.push(a)
  }
  return CATEGORY_ORDER
    .filter((cat) => map.has(cat))
    .map((cat) => ({ label: cat, apps: map.get(cat)! }))
}

type Props = {
  appsDb: AstalApps.Apps
}

export default function AppGrid({ appsDb }: Props) {
  const groups = groupApps(appsDb.get_list())

  function launch(application: AstalApps.Application) {
    application.launch()
    app.quit()
  }

  return (
    <box class="app-grid" orientation={Gtk.Orientation.VERTICAL} hexpand vexpand>

      <box class="app-grid-header">
        <label class="app-grid-title" label="//  APLICATIVOS" halign={Gtk.Align.START} hexpand />
        <label class="app-grid-hint" label="↑↓←→  navegar    Enter  abrir" halign={Gtk.Align.END} />
      </box>

      <Gtk.ScrolledWindow hexpand vexpand>
        <box class="app-grid-content" orientation={Gtk.Orientation.VERTICAL} spacing={20}>
          {groups.map((group) => (
            <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
              <label class="category-label" label={group.label} halign={Gtk.Align.START} />
              <Gtk.FlowBox
                max_children_per_line={6}
                min_children_per_line={2}
                selectionMode={Gtk.SelectionMode.NONE}
                homogeneous
                columnSpacing={4}
                rowSpacing={4}
              >
                {group.apps.map((application) => (
                  <button class="app-card" onClicked={() => launch(application)}>
                    <box
                      orientation={Gtk.Orientation.VERTICAL}
                      spacing={6}
                      halign={Gtk.Align.CENTER}
                    >
                      <image iconName={application.iconName} pixelSize={52} />
                      <label
                        label={application.name}
                        maxWidthChars={12}
                        ellipsize={Pango.EllipsizeMode.END}
                        halign={Gtk.Align.CENTER}
                      />
                    </box>
                  </button>
                ))}
              </Gtk.FlowBox>
            </box>
          ))}
        </box>
      </Gtk.ScrolledWindow>

    </box>
  )
}
