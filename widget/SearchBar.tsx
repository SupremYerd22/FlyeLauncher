import { Gtk } from "ags/gtk4"

type Props = {
  onSearch: (text: string) => void
  onReady?: (entry: Gtk.Entry) => void
}

export default function SearchBar({ onSearch, onReady }: Props) {
  return (
    <box class="searchbar" spacing={8}>
      <label class="distro-logo" label="󰣇" />
      <label class="distro-name" label="arch" />
      <Gtk.Separator orientation={Gtk.Orientation.VERTICAL} />
      <entry
        $={(self) => onReady?.(self)}
        hexpand
        placeholderText="Search apps..."
        onNotifyText={({ text }) => onSearch(text)}
      />
    </box>
  )
}
