import { NavLink } from "react-router";
import { namedRoutes, type NamedRoute } from "~/routes";

function DesktopNavButton({ route }: { route: NamedRoute }) {
  return (
    <NavLink to={route.path} className={({ isActive }) => (
      `${isActive ? 'bg-slate-800' : 'hover:bg-slate-600'} text-2xl text-white h-full px-4 flex flex-col justify-center`
    )}>{route.name}</NavLink>
  );
}

function MobileNavButton({ route }: { route: NamedRoute }) {
  return (
    <NavLink to={route.path} className={({ isActive }) => (
      `${isActive ? 'bg-slate-200' : 'hover:bg-slate-100 bg-slate-50'} text-2xl text-right text-black px-4 py-2 flex flex-col justify-center`
    )}>{route.name}</NavLink>
  );
}

export function ResponsiveNavButtons() {
  const desktopButtons: React.JSX.Element[] = [];
  const mobileButtons: React.JSX.Element[] = [];
  for (let r = 0; r < namedRoutes.length; r++) {
    desktopButtons.push(<DesktopNavButton route={namedRoutes[r]} key={`desktop-navlink-${r}`} />);
    mobileButtons.push(<MobileNavButton route={namedRoutes[r]} key={`desktop-navlink-${r}`} />);
  }

  return (
    <div className="h-full">
      <div className="md:flex hidden flex-row gap-2 items-center h-full">
        {desktopButtons}
      </div>
      <div className="md:hidden h-full relative" id="mobile-nav-container">
        <div className="h-full" id="mobile-nav-burger">
          Borger
        </div>
        <div className="absolute right-0 overflow-hidden hidden flex-col border-slate-500 border-b-1 border-x-1 rounded-b-md" id="mobile-nav-menu">
          {mobileButtons}
        </div>
      </div>
    </div>
  )
}
