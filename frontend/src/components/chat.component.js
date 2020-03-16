import React, { Component } from 'react';
import Chatkit from '@pusher/chatkit-client';
import MessageList from './messageList.component';
import Cookies from 'js-cookie';
import SendMessageForm from './sendMessage.component';

class ChatScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            currentUser: {},
            currentRoom: {}
        }
        this.sendMessage = this.sendMessage.bind(this);
    }
    componentDidMount() {
        const chatManager = new Chatkit.ChatManager({
            instanceLocator: 'v1:us1:1956d6a4-c213-42ad-b3a5-ac091e1b514a',
            userId: Cookies.get('username'),
            tokenProvider: new Chatkit.TokenProvider({
                url: 'http://localhost:5000/chat/auth'
            })
        })

        return chatManager
            .connect()
            .then(currentUser => {
                this.setState({
                    currentUser
                });
                currentUser.subscribeToRoom({
                    roomId: this.props.roomId,
                    messageLimit: 100,
                    hooks: {
                        onMessage: message => {
                            this.setState({
                                messages: [...this.state.messages, message]
                            })
                        }
                    }
                })
                    .then(currentRoom => {
                        this.setState({
                            currentRoom
                        })
                    })
                    .catch(err => this.props.history.push('/eventsList'))
            })
            .catch(err => this.props.history.push('/'))
    }

    sendMessage(text) {
        this.state.currentUser.sendMessage({
            roomId: this.state.currentRoom.id,
            text
        });
    }

    render() {
        return (
            <div>
                <h1>Chat</h1>
                <MessageList messages={this.state.messages} />
                <SendMessageForm onSubmit={this.sendMessage} />
            </div>
        )
    }
}

export default ChatScreen;