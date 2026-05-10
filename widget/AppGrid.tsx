import { Gtk } from "ags/gtk4"
import AstalApps from "gi://AstalApps"
import app from "ags/gtk4/app"
import { customCategories, XDG_CATEGORIES, CATEGORY_ORDER } from "./categories"
import { AppGroup } from "../flyeLauncherTypes"
import AllApps from "./components/appGrid/AllApps"

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
  onAllButtons?: (refs: Gtk.Button[]) => void
}

export default function AppGrid({ appsDb, onAllButtons }: Props) {
  const groups = groupApps(appsDb.get_list())

  function launch(application: AstalApps.Application) {
    application.launch()
    app.quit()
  }

  return (
    <box class="app-grid" orientation={Gtk.Orientation.VERTICAL} hexpand vexpand>

      <box class="app-grid-header">
        <label class="app-grid-title" label="APLICATIVOS" halign={Gtk.Align.START} hexpand />
        <label class="app-grid-hint" label="↑↓←→  navegar    Enter  abrir" halign={Gtk.Align.END} />
      </box>

      <AllApps groups={groups} launch={launch} onAllButtons={onAllButtons} />

    </box>
  )
}
