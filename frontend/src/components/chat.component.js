import React, {Component} from 'react';
import Chatkit from '@pusher/chatkit-client';
import MessageList from './messageList.component';
import {withRouter} from 'react-router-dom';
import SendMessageForm from './sendMessage.component';
import {AuthContext} from './auth/context/AuthContext';
import classes from './style/chat.module.css';

class ChatScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      currentUser: {},
      currentRoom: {},
    };
    this.sendMessage = this.sendMessage.bind(this);
  }
  static contextType = AuthContext;
  componentDidMount() {
    const chatManager = new Chatkit.ChatManager({
      instanceLocator: 'v1:us1:1956d6a4-c213-42ad-b3a5-ac091e1b514a',
      userId: this.context.user.username,
      tokenProvider: new Chatkit.TokenProvider({
        url: '/chat/auth',
      }),
    });

    return chatManager
      .connect()
      .then(currentUser => {
        this.setState({
          currentUser,
        });
        currentUser
          .subscribeToRoom({
            roomId: this.props.roomId,
            messageLimit: 100,
            hooks: {
              onMessage: message => {
                this.setState({
                  messages: [...this.state.messages, message],
                });
              },
            },
          })
          .then(currentRoom => {
            this.setState({
              currentRoom,
            });
          })
          .catch(err => {
            console.log(err);
            this.props.history.push('/eventsList');
          });
      })
      .catch(err => {
        console.log(err);
        this.props.history.push('/');
      });
  }

  sendMessage(text) {
    this.state.currentUser.sendMessage({
      roomId: this.state.currentRoom.id,
      text,
    });
  }

  render() {
    return (
      <div className={[classes.ChatScreen, 'sticky-top'].join(' ')}>
        <h5 className={classes.ChatHeader}>Chat</h5>
        <MessageList messages={this.state.messages} />
        <SendMessageForm onSubmit={this.sendMessage} />
      </div>
    );
  }
}

export default withRouter(ChatScreen);
