import AstalApps from "gi://AstalApps"

// Sections from nav bar
export type Section = "apps" | "recent" | "actions" | "calc" 

// To app grid
type AppGroup = {
  label: string
  apps: AstalApps.Application[]
}