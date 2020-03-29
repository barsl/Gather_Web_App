import React from 'react';
import {Link} from 'react-router-dom';
import classes from './Event.module.css';

const Event = props => {
  const editLink = (
    <Link
      key={"editLink"}
      to={"/edit/" + props.event._id}
    >
      edit
    </Link>
  );
  const deleteLink = (
    <button
      type="button"
      className={classes["link-button"]}
      key={"deleteLink"}
      onClick={() => {
        props.deleteEvent(props.event);
      }}
    >
      delete
    </button>
  );
  const attendLink = (
    <button
      key={"attendLink"}
      className={classes["link-button"]}
      onClick={() => {
        props.setAttending(props.event, true);
      }}
    >
      attend
    </button>
  );

  const unattendLink = (
    <button
      key={"unattendLink"}
      className={classes["link-button"]}
      onClick={() => {
        props.setAttending(props.event, false);
      }}
    >
      unattend
    </button>
  );

  const actions = [];

  if (!props.event.public || props.eventType === "created") {
    actions.push(editLink);
  }

  if (props.eventType === "attending") {
    actions.push(unattendLink);
  }

  if (props.eventType === "invited" || props.eventType === "public") {
    actions.push(attendLink);
  }
  if (props.eventType === "created") {
    actions.push(deleteLink);
  }

  const actionsComponent = actions.reduce(
    (prev, curr, i) => [...prev, i > 0 ? " | " : null, curr],
    []
  );

  return (
    <tr>
      <td>
        <Link to={"/eventChat/" + props.event.title}>{props.event.title}</Link>
      </td>
      <td>{props.event.description}</td>
      <td>{props.event.date.substring(0, 10)}</td>
      <td>{actionsComponent}</td>
    </tr>
  );
};

export default Event;