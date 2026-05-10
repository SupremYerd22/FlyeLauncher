import { Gtk } from "ags/gtk4";
import Pango from "gi://Pango?version=1.0";
import { AppGroup } from "../../../flyeLauncherTypes";
import AstalApps from "gi://AstalApps"

type props = {
  groups: AppGroup[]
  launch: (application: AstalApps.Application) => void
  onAllButtons?: (refs: Gtk.Button[]) => void
}

export default function AllApps({ groups, launch, onAllButtons }: props) {
  const allButtonRefs: Gtk.Button[] = []
  const totalApps = groups.reduce((sum, g) => sum + g.apps.length, 0)
  let buttonIdx = 0

  return (
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
                  <button
                    class="app-card"
                    $={(ref) => {
                      allButtonRefs[buttonIdx++] = ref
                      if (buttonIdx === totalApps) onAllButtons?.(allButtonRefs)
                    }}
                    onClicked={() => launch(application)}
                  >
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
  )
}