import app from "ags/gtk4/app"
import style from "./style.scss"
import Applauncher from "./FlyeLauncher"
import Gtk from "gi://Gtk?version=4.0"

let applauncher: Gtk.Window

app.start({
  css: style,
  gtkTheme: "Adwaita",
  requestHandler(request, res) {
    const argv = Array.isArray(request) ? request : [request]
    switch (argv[0]) {
      case "toggle":
        applauncher.visible = !applauncher.visible
        return res("ok")
      default:
        return res("unknown command")
    }
  },
  main() {
    applauncher = Applauncher() as Gtk.Window
    app.add_window(applauncher)
    applauncher.present()
  },
})