import React from 'react';
import {Link} from 'react-router-dom';
import {useAuthContext} from '../../auth/context/AuthContext';
import './Event.css';

const Event = props => {
  const {user} = useAuthContext();
  const editLink = (
    <Link
      className="btn btn-link"
      key={'editLink'}
      to={{pathname: '/edit/' + props.event._id, event_id: props.event._id}}
    >
      edit
    </Link>
  );
  const deleteLink = (
    <button
      type="button"
      className="btn btn-link"
      key={'deleteLink'}
      onClick={() => {
        props.deleteEvent(props.event);
      }}
    >
      delete
    </button>
  );
  const attendLink = (
    <button
      key={'attendLink'}
      className="btn btn-link"
      onClick={() => {
        props.setAttending(props.event, true);
      }}
    >
      attend
    </button>
  );

  const unattendLink = (
    <button
      key={'unattendLink'}
      className="btn btn-link"
      onClick={() => {
        props.setAttending(props.event, false);
      }}
    >
      unattend
    </button>
  );

  const actions = [];

  if (props.eventType !== 'archive') {
    if (!props.event.public) {
      actions.push(editLink);
    }

    if (props.eventType === 'attending') {
      actions.push(unattendLink);
    }

    if (props.eventType === 'invited' || props.eventType === 'public') {
      actions.push(attendLink);
    }
  }

  if (user.username === props.event.username) {
    actions.push(deleteLink);
  }

  const actionsComponent = actions.reduce(
    (prev, curr, i) => [...prev, i > 0 ? ' | ' : null, curr],
    [],
  );

  return (
    <tr>
      <td>
        <Link to={'/eventChat/' + props.event.title}>{props.event.title}</Link>
      </td>
      <td>{props.event.description}</td>
      <td>
        {new Date(props.event.date).toLocaleString('en-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: 'numeric',
          minute: 'numeric',
        })}
      </td>
      <td>{actionsComponent}</td>
    </tr>
  );
};

export default Event;
