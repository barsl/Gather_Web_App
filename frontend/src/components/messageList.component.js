import React, {Component, createRef} from 'react';
import classes from './style/chat.module.css';

class MessageList extends Component {
  constructor(props) {
    super(props);
    this.messagesView = createRef();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.messages !== this.props.messages) {
      this.messagesView.current.scrollTo(
        0,
        this.messagesView.current.scrollHeight,
      );
    }
  }

  render() {
    return (
      <div ref={this.messagesView} className={classes.MessagesView}>
        {this.props.messages.map((message, index) => {
          if (message.senderId === this.props.userName) {
            return (
              <div className={classes.Message} key={index}>
                <span className={classes.SenderName}>{message.senderId}</span>
                <div className={classes.MessageBox}>{message.text}</div>
              </div>
            );
          } else {
            return (
              <div className={classes.ReceivedMessage} key={index}>
                <span className={classes.ReceivedSenderName}>
                  {message.senderId}
                </span>
                <div className={classes.ReceivedMessageBox}>{message.text}</div>
              </div>
            );
          }
        })}
      </div>
    );
  }
}

export default MessageList;
