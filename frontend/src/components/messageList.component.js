import React, {Component} from 'react';
import classes from './style/chat.module.css';

class MessageList extends Component {
  render() {
    return (
      <div className={classes.MessagesView}>
        {this.props.messages.map((message, index) => {
          if (message.senderId === this.props.userName) {
            return (
              <div className={classes.Message} key={index}>
                
                  <span className={classes.SenderName}>{message.senderId}</span>
                  <div className={classes.MessageBox}>{message.text}</div>
                
              </div>
            );
          }
          else {
            return (
                <div className={classes.ReceivedMessage} key={index}>
                  
                    <span className={classes.ReceivedSenderName}>{message.senderId}</span>
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
