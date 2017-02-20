import React, { PropTypes } from 'react'; // eslint-disable-line
import {Row, Col} from 'react-bootstrap'; // eslint-disable-line
import Match from 'react-router/Match'; // eslint-disable-line

import { connect } from '@folio/stripes-connect'; // eslint-disable-line

import Pane from '@folio/stripes-components/lib/Pane'; // eslint-disable-line
import Paneset from '@folio/stripes-components/lib/Paneset'; // eslint-disable-line
import PaneMenu from '@folio/stripes-components/lib/PaneMenu'; // eslint-disable-line
import Button from '@folio/stripes-components/lib/Button'; // eslint-disable-line
import Icon from '@folio/stripes-components/lib/Icon'; // eslint-disable-line
import Checkbox from '@folio/stripes-components/lib/Checkbox'; // eslint-disable-line
import TextField from '@folio/stripes-components/lib/TextField'; // eslint-disable-line
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList'; // eslint-disable-line
import KeyValue from '@folio/stripes-components/lib/KeyValue'; // eslint-disable-line
import Layer from '@folio/stripes-components/lib/Layer'; // eslint-disable-line
import FilterPaneSearch from '@folio/stripes-components/lib/FilterPaneSearch'; // eslint-disable-line
import FilterControlGroup from '@folio/stripes-components/lib/FilterControlGroup'; // eslint-disable-line

import FilterGroups, { initialFilterState, filters2cql, onChangeFilter } from './FilterGroups';

import ViewItem from './ViewItem';
import ItemForm from './ItemForm';

const filterConfig = [
  {
    label: 'Item Types',
    name: 'item',
    cql: 'materialType',
    values: [
      { name: 'Books', cql: 'Book' },
      { name: 'DVDs', cql: 'DVD' },
      'Microfilm',
    ],
  }, {
    label: 'Location',
    name: 'location',
    cql: 'location.name',
    values: ['Main Library', 'Annex Library'],
  },
];

class Items extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
  };

  static propTypes = {
    data: PropTypes.object.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      query: PropTypes.object,
    }).isRequired,
  };

  static manifest = Object.freeze({
    addItemMode: { },
    items: {
      type: 'okapi',
      records: 'items',
      path: (queryParams, _pathComponents, _resourceValues) => {
        const { query, filters, sort } = queryParams || {};

        let cql;
        if (query) {
          cql = `materialType="${query}" or barcode="${query}*" or title="${query}*"`;
        }

        const filterCql = filters2cql(filterConfig, filters);
        if (filterCql) {
          if (cql) {
            cql = `(${cql}) and ${filterCql}`;
          } else {
            cql = filterCql;
          }
        }

        if (sort) {
          if (cql === undefined) cql = 'materialType=*';
          cql += ` sortby ${sort}`;
        }

        let path = 'item-storage/items';
        if (cql) path += `?query=${encodeURIComponent(cql)}`;

        console.log(`query=${query} filters=${filters} sort=${sort} -> ${path}`);
        return path;
      },
      staticFallback: { path: 'item-storage/items' },
    },
  });

  constructor(props) {
    super(props);

    const query = props.location.query || {};
    this.state = {
      filters: initialFilterState(filterConfig, query.filters),
      selectedItem: {},
      searchTerm: query.query || '',
      sortOrder: query.sort || '',
    };
    props.mutator.addItemMode.replace({ mode: false });

    this.onChangeFilter = onChangeFilter.bind(this);
    this.onChangeSearch = this.onChangeSearch.bind(this);
    this.onClearSearch = this.onClearSearch.bind(this);
    this.onSort = this.onSort.bind(this);
    this.onSelectRow = this.onSelectRow.bind(this);

    this.onClickAddNewItem = this.onClickAddNewItem.bind(this);
  }

  onChangeSearch(e) {
    const query = e.target.value;
    console.log(`User searched for '${query}' at '${this.props.location.pathname}'`);

    this.setState({ searchTerm: query });
    this.updateSearch(query, this.state.sortOrder, this.state.filters);
  }

  onClearSearch() {
    console.log('User cleared search');
    this.setState({ searchTerm: '' });
    this.context.router.transitionTo(this.props.location.pathname);
  }

  onSort(e, meta) {
    const sortOrder = meta.name;
    console.log('User sorted by', sortOrder);
    this.setState({ sortOrder });
    this.updateSearch(this.state.searchTerm, sortOrder, this.state.filters);
  }

  // Results Handler
  // row selection handler
  onSelectRow(e, meta) {
    const itemId = meta.id;
    this.setState({ selectedItem: meta });
    this.context.router.transitionTo(`/items/view/${itemId}${this.props.location.search}`);

    console.log('User clicked', itemId, 'location = ', this.props.location);
  }

  // AddItem Handlers
  onClickAddNewItem(e) {
    if (e) e.preventDefault();
    this.props.mutator.addItemMode.replace({ mode: true })
  }

  // We need to explicitly pass changed values into this function,
  // as state-change only happens after event is handled.
  updateSearch(query, sortOrder, filters) {
    console.log(`updateSearch('${query}', '${sortOrder}',`, filters, ')');
    let transitionLoc = this.props.location.pathname;
    const params = {};
    if (query) params.query = query;
    if (sortOrder) params.sort = sortOrder;

    const activeFilters = [];
    for (const name in filters) {
      if (filters[name]) activeFilters.push(name);
    }

    if (activeFilters) params.filters = activeFilters.join(',');

    const keys = Object.keys(params);
    if (keys.length) {
      // eslint-disable-next-line prefer-template
      transitionLoc += '?' + keys.map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
    }
    this.context.router.transitionTo(transitionLoc);
  }

  render() {
    const { data, pathname } = this.props;
    const items = data.items || [];

    /* searchHeader is a 'custom pane header'*/
    const searchHeader = <FilterPaneSearch id="SearchField" onChange={this.onChangeSearch} onClear={this.onClearSearch} value={this.state.searchTerm} />;
    const resultMenu = <PaneMenu><button><Icon icon="bookmark" /></button></PaneMenu>;

    const resultsFormatter = {
      materialType: x => x.materialType.name,
      location: x => x.location.name,
    };

    return (
      <Paneset>
        {/* Filter Pane */}
        <Pane defaultWidth="16%" header={searchHeader}>
          <FilterGroups config={filterConfig} filters={this.state.filters} onChangeFilter={this.onChangeFilter} />
          <FilterControlGroup label="Actions">
            <Button fullWidth onClick={this.onClickAddNewItem}>New item</Button>
          </FilterControlGroup>
        </Pane>
        {/* Results Pane */}
        <Pane
          defaultWidth="40%"
          paneTitle={
            <div style={{ textAlign: 'center' }}>
              <strong>Results</strong>
              <div>
                <em>{items.length} Result{items.length === 1 ? '' : 's'} Found</em>
              </div>
            </div>
          }
          lastMenu={resultMenu}
        >
          <MultiColumnList
            contentData={items}
            selectedRow={this.state.selectedItem}
            rowMetadata={['title','id']}
            headerMetadata={{ title: { _id: '001' } }}
            formatter={resultsFormatter}
            onRowClick={this.onSelectRow}
            onHeaderClick={this.onSort}
            visibleColumns={['materialType', 'location', 'barcode', 'title']}
            fullWidth
            sortOrder={this.state.sortOrder}
            isEmptyMessage={`No results found for "${this.state.searchTerm}". Please check your spelling and filters.`}
          />
        </Pane>

        {/* Details Pane */}
        <Match pattern={`${pathname}/view/:itemid`} render={props => <ViewItem placeholder={'placeholder'} {...props} />} />
        <Layer isOpen={ data.addItemMode ? data.addItemMode.mode : false } label="Add New Item Dialog">
          <ItemForm
            onSubmit={(record) => { this.create(record); }}
            onCancel={this.onClickCloseNewItem}
          />
        </Layer>

      </Paneset>
    );
  }
}

export default Items;
