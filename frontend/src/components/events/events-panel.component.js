import React, {Component} from 'react';
import classes from "./style/events-panel.module.css";

class EventsPanel extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={classes.Panel}>
        {this.props.eventList}
      </div>
    );
  }
}

export default EventsPanel;
