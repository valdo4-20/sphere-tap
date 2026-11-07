import {
  CircleDot,
  ChartNoAxesCombined,
  Wallet,
  UserRound,
} from "lucide-react";
import useSphereNavigation from "./useSphereNavigation";
export const routes = [
 {id:"Hoje",label:"Hoje",icon:CircleDot},
 {id:"Análises",label:"Progresso",icon:ChartNoAxesCombined},
 {id:"Carteira",label:"Carteira",icon:Wallet},
 {id:"Perfil",label:"Perfil",icon:UserRound},
];
export default function SphereShell({ route, onRoute, children, guide, immersive = false }) {
  const nav = useSphereNavigation(route, Boolean(guide));
  return (
    <div className={`app-shell sphere-tap-shell ${immersive?"walking-live-shell":""}`}>
      <header
        className={`topbar ${nav.atTop ? "at-top" : "scrolled"} ${nav.hidden ? "nav-hidden" : ""} ${nav.collapsed ? "nav-collapsed" : ""}`}
      >
        <nav
          className="nav-glass"
          aria-label="Navegação principal"
          data-guide="nav"
          onFocusCapture={nav.expand}
        >
          {routes.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-link ${id === "Carteira" ? "nav-link-library" : ""} ${route === id ? "active" : ""}`}
              aria-label={label}
              aria-current={route === id ? "page" : undefined}
              onClick={(e) => {
                onRoute(id);
                if (id === route)
                  window.scrollTo({ top: 0, behavior: "instant" });
                if (e.detail > 0) e.currentTarget.blur();
              }}
              tabIndex={0}
            >
              <Icon size={15} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </header>
      <main className="content" id="main-content">
        {children}
      </main>
    </div>
  );
}
