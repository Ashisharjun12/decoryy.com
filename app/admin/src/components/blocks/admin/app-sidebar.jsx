import { NavLink, useLocation } from "react-router-dom"
import { LayoutDashboardIcon, MapPinIcon, ImagesIcon, TagsIcon } from "lucide-react"
import { NavMain } from "@/components/blocks/admin/nav-main"
import { NavUser } from "@/components/blocks/admin/nav-user"
import { DecoryLogo } from "@/components/decory-logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Operational locations",
    url: "/locations",
    icon: <MapPinIcon />,
  },
  {
    title: "Media",
    url: "/media",
    icon: <ImagesIcon />,
  },
  {
    title: "Catalog",
    url: "/catalog",
    icon: <TagsIcon />,
  },
]

export function AppSidebar(props) {
  const location = useLocation()

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<NavLink to="/dashboard" />}>
              <DecoryLogo />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Decory</span>
                <span className="truncate text-xs">Admin</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} pathname={location.pathname} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
