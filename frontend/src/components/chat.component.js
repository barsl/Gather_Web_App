import React, { Component } from 'react';
import Chatkit from '@pusher/chatkit-client';
import MessageList from './messageList.component';
import Cookies from 'js-cookie';

class ChatScreen extends Component {
    constructor() {
        super();
        this.state = {
            messages: []
        }
    }
    componentDidMount() {
        const chatManager = new Chatkit.ChatManager({
            instanceLocator: 'v1:us1:1956d6a4-c213-42ad-b3a5-ac091e1b514a',
            userId: Cookies.get('username'),
            tokenProvider: new Chatkit.TokenProvider({
                url: 'http://localhost:5000/chat/auth'
            })
        })

        chatManager
            .connect()
            .then(currentUser => {
                currentUser.subscribeToRoom({
                    roomId: this.props.match.params.id,
                    messageLimit: 100,
                    hooks: {
                        onNewMessage: message => {
                            this.setState({
                                message: [...this.state.messages, message]
                            })
                        }
                    }
                })
            })
            .catch(err => console.error(err))
    }

    render() {
        return (
            <div>
                <MessageList messages={this.state.messages} />
            </div>
        )
    }
}

export default ChatScreen;