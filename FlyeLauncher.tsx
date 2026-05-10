import { For, createState } from "ags"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import Graphene from "gi://Graphene"
import AstalApps from "gi://AstalApps"
import app from "ags/gtk4/app"
import SearchBar from "./widget/SearchBar"
import SideNav from "./widget/SideNav"
import AppGrid from "./widget/AppGrid"
import { Section } from "./flyeLauncherTypes"

const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

export default function FliLauncher() {
  let contentbox: Gtk.Box
  let win: Astal.Window
  let searchEntry: Gtk.Entry | undefined

  const appsDb = new AstalApps.Apps()
  const [results, setResults] = createState(new Array<AstalApps.Application>())
  const [searching, setSearching] = createState(false)

  // Nav Bar Sections
  const [selectedSection, setSelectedSection] = createState<Section>('recent')

 

  function onSearch(text: string) {
    if (text === "") {
      setResults([])
      setSearching(false)
    } else {
      setResults(appsDb.fuzzy_query(text).slice(0, 8))
      setSearching(true)
    }
  }

  function launch(application: AstalApps.Application) {
    application.launch()
    app.quit()
  }

  function onKey(
    _e: Gtk.EventControllerKey,
    keyval: number,
    _k: number,
    _mod: Gdk.ModifierType,
  ) {
    if (keyval === Gdk.KEY_Escape) app.quit()
  }

  function onClick(_e: Gtk.GestureClick, _b: number, x: number, y: number) {
    const [, rect] = contentbox.compute_bounds(win)
    if (!rect.contains_point(new Graphene.Point({ x, y }))) {
      app.quit()
      return true
    }
  }

  return (
    <window
      $={(ref) => (win = ref)}
      name="launcher"
      anchor={TOP | BOTTOM | LEFT | RIGHT}
      exclusivity={Astal.Exclusivity.IGNORE}
      keymode={Astal.Keymode.EXCLUSIVE}
      onNotifyVisible={({ visible }) => {
        if (visible) searchEntry?.grab_focus()
        else searchEntry?.set_text("")
      }}
    >
      <Gtk.EventControllerKey onKeyPressed={onKey} />
      <Gtk.GestureClick onPressed={onClick} />
      <box
        $={(ref) => (contentbox = ref)}
        class="launcher-panel"
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.CENTER}
        orientation={Gtk.Orientation.VERTICAL}
      >
        <SearchBar onSearch={onSearch} onReady={(e) => (searchEntry = e)} />

        <Gtk.Paned
          class="launcher-body"
          orientation={Gtk.Orientation.HORIZONTAL}
          $={(self) => self.set_position(160)}
        >
          {/* Coluna esquerda — SideNav */}
          <box class="sidenav-pane">
            <SideNav setActive={setSelectedSection} active={selectedSection} appCount={appsDb.get_list().length} />
          </box>

          {/* Coluna direita — conteúdo principal */}
          <box class="launcher-main" orientation={Gtk.Orientation.VERTICAL} hexpand vexpand>

            {/* Resultados de busca */}
            <box
              class="search-results"
              orientation={Gtk.Orientation.VERTICAL}
              visible={searching}
            >
              <For each={results}>
                {(application) => (
                  <button class="app-item" onClicked={() => launch(application)}>
                    <box spacing={10}>
                      <image iconName={application.iconName} pixelSize={22} />
                      <label label={application.name} halign={Gtk.Align.START} hexpand />
                    </box>
                  </button>
                )}
              </For>
            </box>

            {/* Grid de apps por categoria */}
            <box visible={searching((v) => !v)} hexpand vexpand>
              <AppGrid appsDb={appsDb} />
            </box>

          </box>
        </Gtk.Paned>
      </box>
    </window>
  )
}
