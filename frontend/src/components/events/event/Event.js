import React from 'react';
import {Link, withRouter} from 'react-router-dom';
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
    if (!props.event.public || user.username === props.event.username) {
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
    <div
      className="Square"
      onClick={() => props.history.push('/event/' + props.event._id)}
    >
      <div className="EventIconHolder">
        <div className="EventIcon" />

        {(props.eventType === 'invited' || props.eventType === 'public') && (
            <div
              className="AttendButton"
              onClick={e => {
                e.stopPropagation();
                props.setAttending(props.event, true);
              }}
            >
              attend
            </div>
        )}

        {props.eventType === 'attending' && (
          <div
            className="UnattendButton"
            onClick={e => {
              e.stopPropagation();
              props.setAttending(props.event, false);
            }}
          >
            unattend
          </div>
        )}

      </div>
      <div className="EventInfo">
        <h5 className="Title">{props.event.title}</h5>
        <p className="Time">
          {new Date(props.event.startDate).toLocaleString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: 'numeric',
            minute: 'numeric',
          })}
        </p>
        <p className="Description">{props.event.description}</p>
      </div>
    </div>

    // <tr>
    //   <td>
    //     <Link to={'/event/' + props.event._id}>{props.event.title}</Link>
    //   </td>
    //   <td>{props.event.description}</td>
    //   <td>
    //     {new Date(props.event.startDate).toLocaleString('en-CA', {
    //       year: 'numeric',
    //       month: '2-digit',
    //       day: '2-digit',
    //       hour: 'numeric',
    //       minute: 'numeric',
    //     })}
    //   </td>
    //   <td>{actionsComponent}</td>
    // </tr>
  );
};

export default withRouter(Event);
