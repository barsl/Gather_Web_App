import React, { Component } from 'react';
import classes from './style/chat.module.css';

class MessageList extends Component {

    render() {
        return (
            <div className={classes.MessagesView}>
                {this.props.messages.map((message, index) => (
                    <div className={classes.Message} key={index}>
                        <div>
                            <span className={classes.SenderName}>{message.senderId}</span>
                            <div className={classes.MessageBox}>{message.text}</div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }
}

export default MessageList;