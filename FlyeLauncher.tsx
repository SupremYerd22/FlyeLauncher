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
  let appGridButtons: Gtk.Button[] = []
  const searchButtonMap = new Map<AstalApps.Application, Gtk.Button>()
  let sideNavButtons: Gtk.Button[] = []
  let tabZone: 'grid' | 'nav' = 'grid'

  function isPrintable(keyval: number): boolean {
    return keyval >= 0x20 && keyval !== 0x7F && keyval < 0xFE00
  }

  const appsDb = new AstalApps.Apps()
  const [results, setResults] = createState(new Array<AstalApps.Application>())
  const [searching, setSearching] = createState(false)

  // Nav Bar Sections
  const [selectedSection, setSelectedSection] = createState<Section>('recent')

  // Theme
  const [theme, setTheme] = createState<'default' | 'system'>('default')
  function toggleTheme() {
    setTheme(theme() === 'default' ? 'system' : 'default')
  }


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
  ): boolean {
    if (keyval === Gdk.KEY_Escape) { app.quit(); return true }

    if (keyval === Gdk.KEY_Tab || keyval === Gdk.KEY_ISO_Left_Tab) {
      if (tabZone === 'grid') {
        sideNavButtons[0]?.grab_focus()
        tabZone = 'nav'
      } else {
        appGridButtons[0]?.grab_focus()
        tabZone = 'grid'
      }
      return true
    }

    if (searching() && (keyval === Gdk.KEY_Up || keyval === Gdk.KEY_Down)) {
      const btns = results().map((a) => searchButtonMap.get(a)).filter((b): b is Gtk.Button => !!b)
      const focused = win.get_focus()
      const currentIdx = btns.indexOf(focused as Gtk.Button)
      const newIdx = keyval === Gdk.KEY_Up
        ? Math.max(0, currentIdx - 1)
        : Math.min(btns.length - 1, currentIdx + 1)
      btns[newIdx]?.grab_focus()
      return true
    }

    if (tabZone === 'grid' && !searching() && (
      keyval === Gdk.KEY_Up || keyval === Gdk.KEY_Down ||
      keyval === Gdk.KEY_Left || keyval === Gdk.KEY_Right
    )) {
      const focused = win.get_focus()
      const currentIdx = appGridButtons.indexOf(focused as Gtk.Button)
      if (currentIdx === -1) { appGridButtons[0]?.grab_focus(); return true }

      if (keyval === Gdk.KEY_Left) {
        appGridButtons[Math.max(0, currentIdx - 1)]?.grab_focus()
        return true
      }
      if (keyval === Gdk.KEY_Right) {
        appGridButtons[Math.min(appGridButtons.length - 1, currentIdx + 1)]?.grab_focus()
        return true
      }

      // Up / Down: use pixel positions to find the spatially correct neighbor
      const positions = appGridButtons.map((b) => {
        const [ok, r] = b.compute_bounds(win)
        return ok ? { b, cx: r.origin.x + r.size.width / 2, cy: r.origin.y + r.size.height / 2 } : null
      })
      const cur = positions[currentIdx]
      if (!cur) return true

      const isUp = keyval === Gdk.KEY_Up
      const candidates = positions.filter((p) => p && (isUp ? p.cy < cur.cy - 5 : p.cy > cur.cy + 5))
      if (!candidates.length) return true

      const targetCy = isUp
        ? Math.max(...candidates.map((p) => p!.cy))
        : Math.min(...candidates.map((p) => p!.cy))
      const rowItems = candidates.filter((p) => Math.abs(p!.cy - targetCy) < 5)
      const best = rowItems.reduce((a, b) =>
        Math.abs(a!.cx - cur.cx) <= Math.abs(b!.cx - cur.cx) ? a : b
      )!
      best.b.grab_focus()
      return true
    }

    if (tabZone === 'nav' && (keyval === Gdk.KEY_Up || keyval === Gdk.KEY_Down)) {
      const focused = win.get_focus()
      const currentIdx = sideNavButtons.indexOf(focused as Gtk.Button)
      const newIdx = keyval === Gdk.KEY_Up
        ? Math.max(0, currentIdx - 1)
        : Math.min(sideNavButtons.length - 1, currentIdx + 1)
      sideNavButtons[newIdx]?.grab_focus()
      return true
    }

    if (isPrintable(keyval) && win.get_focus() !== searchEntry) {
      searchEntry?.grab_focus()
      searchEntry?.set_text((searchEntry.get_text() ?? '') + String.fromCodePoint(keyval))
      searchEntry?.set_position(-1)
      return true
    }

    return false
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
      $={(ref) => {
        win = ref
        const keyCtrl = new Gtk.EventControllerKey()
        keyCtrl.set_propagation_phase(Gtk.PropagationPhase.CAPTURE)
        keyCtrl.connect('key-pressed', onKey)
        ref.add_controller(keyCtrl)
      }}
      name="launcher"
      anchor={TOP | BOTTOM | LEFT | RIGHT}
      exclusivity={Astal.Exclusivity.IGNORE}
      keymode={Astal.Keymode.EXCLUSIVE}
      onNotifyVisible={({ visible }) => {
        if (visible) {
          tabZone = 'grid'
          appGridButtons[0]?.grab_focus()
        } else {
          searchEntry?.set_text("")
        }
      }}
    >
      <Gtk.GestureClick onPressed={onClick} />
      <box
        $={(ref) => (contentbox = ref)}
        class={theme((t) => `launcher-panel${t === 'system' ? ' theme-system' : ''}`)}
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
            <SideNav
              setActive={setSelectedSection}
              active={selectedSection}
              appCount={appsDb.get_list().length}
              theme={theme}
              onThemeToggle={toggleTheme}
              onReady={(refs) => (sideNavButtons = refs)}
            />
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
                  <button
                    class="app-item"
                    $={(ref) => searchButtonMap.set(application, ref)}
                    onClicked={() => launch(application)}
                  >
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
              <AppGrid appsDb={appsDb} onAllButtons={(refs) => (appGridButtons = refs)} />
            </box>

          </box>
        </Gtk.Paned>
      </box>
    </window>
  )
}
