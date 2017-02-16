import _ from 'lodash'; // eslint-disable-line
import React, { Component, PropTypes } from 'react' // eslint-disable-line
import { connect } from '@folio/stripes-connect'; // eslint-disable-line
import Pane from '@folio/stripes-components/lib/Pane' // eslint-disable-line
import PaneMenu from '@folio/stripes-components/lib/PaneMenu' // eslint-disable-line
import Button from '@folio/stripes-components/lib/Button' // eslint-disable-line
import KeyValue from '@folio/stripes-components/lib/KeyValue' // eslint-disable-line
import {Row, Col} from 'react-bootstrap' // eslint-disable-line
import TextField from '@folio/stripes-components/lib/TextField' // eslint-disable-line
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList' // eslint-disable-line
import Icon from '@folio/stripes-components/lib/Icon' // eslint-disable-line
import Layer from '@folio/stripes-components/lib/Layer'; // eslint-disable-line

class ViewItem extends Component {

  static propTypes = {
    data: PropTypes.shape({
      item: PropTypes.arrayOf(PropTypes.object),
    }),
    mutator: React.PropTypes.shape({
      item: React.PropTypes.shape({
        PUT: React.PropTypes.func.isRequired,
      }),
    }),
  };

  static manifest = Object.freeze({
    items: {
      type: 'okapi',
      path: 'item-storage/items/:{itemid}',
      clear: false,
    },
  });

  constructor(props) {

    super(props);


    this.state = {
      editItemMode: false,
    };
    this.onClickEditItem = this.onClickEditItem.bind(this);
    this.onClickCloseEditItem = this.onClickCloseEditItem.bind(this);
    console.log("matt initial state: " + JSON.stringify(this.state));
    console.log("matt initial props: " + JSON.stringify(this.props.data));
  }

  // Edit Item Handlers
  onClickEditItem(e) {
    if (e) e.preventDefault();
    this.setState({
      editItemMode: true,
    });
  }

  onClickCloseEditItem(e) {
    if (e) e.preventDefault();
    this.setState({
      editItemMode: false,
    });
  }

  update(data) {
    this.props.mutator.item.PUT(data).then(() => {
      this.onClickCloseEditItem();
    });
  }

  render() {
    console.log('mattprops:'  + JSON.stringify(this.props), "type: " + typeof(this.props.data.item));
    console.log('mattstate: ' + JSON.stringify(this.state));
  //  const { data: { item } } = this.props;
    const detailMenu = <PaneMenu><button onClick={this.onClickEditItem} title="Edit Item"><Icon icon="edit" />Edit</button></PaneMenu>;

    const { data: { items }, params: { itemid } } = this.props;
    console.log('matt data: ' + JSON.stringify(this.props), 'matt item id: ' + itemid);
    if (!items || !itemid) return <div />;
    const item = items.find(i => i.id === itemid)

    return (
      <Pane defaultWidth="fill" paneTitle="Item Details" lastMenu={detailMenu}>
        <Row>
          {item.title}
        </Row>
      </Pane>
    )
  }

}

export default connect(ViewItem, 'items');
