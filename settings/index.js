// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React, { PropTypes } from 'react';
import Switch from 'react-router-dom/Switch';
import Route from 'react-router-dom/Route';
import Link from 'react-router-dom/Link';

import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import NavList from '@folio/stripes-components/lib/NavList';
import NavListSection from '@folio/stripes-components/lib/NavListSection';

// Should this list be loaded dynamically from configuration?
import MaterialTypesSettings from './MaterialTypesSettings';

const pages = [
  {
    route: 'mtypes',
    label: 'Material types',
    component: MaterialTypesSettings,
    // No perm needed yet
  },
];


const Settings = (props) => {
  const navLinks = pages.map((p) => {
    if (p.perm && !props.stripes.hasPerm(p.perm)) return null;
    return (
      <Link
        key={p.route}
        to={`${props.match.path}/${p.route}`}
      >{p.label}</Link>
    );
  }).filter(l => l);

  const routes = pages.map((p) => {
    const Current = props.stripes.connect(p.component);
    return (<Route
      key={p.route}
      path={`${props.match.path}/${p.route}`}
      render={props2 => <Current {...props2} stripes={props.stripes} />}
    />);
  });

  return (
    <Paneset nested defaultWidth="80%">
      <Pane defaultWidth="25%" paneTitle="Items">
        <NavList>
          <NavListSection activeLink="">
            {navLinks}
          </NavListSection>
        </NavList>
      </Pane>

      <Switch>
        {routes}
        <Route component={() => <div>Choose category</div>} />
      </Switch>
    </Paneset>
  );
};

Settings.propTypes = {
  stripes: PropTypes.shape({
    connect: PropTypes.func.isRequired,
    hasPerm: PropTypes.func.isRequired,
  }).isRequired,
};

export default Settings;
