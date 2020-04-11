import React, { Component } from 'react';
import classes from "./style/chat.module.css";

class SendMessageForm extends Component {
    constructor() {
        super();
        this.state = {
            text: []
        }

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentDidMount() {

    }

    onChange(e) {
        this.setState({
            text: e.target.value
        })
    }

    onSubmit(e) {
        e.preventDefault();
        this.props.onSubmit(this.state.text);
        this.setState({
            text: ""
        });
    }

    render() {
        return (
            <div className={classes.MessageComposer}>
                <form className={classes.MessageForm} onSubmit={this.onSubmit}>
                    <input
                        className={classes.TextInput}
                        type="text"
                        value={this.state.text}
                        onChange={this.onChange}>
                    </input>
                    <input className={["btn", "btn-primary", classes.SendButton].join(" ")} type="submit" value="send"/>
                </form>
            </div>
        )
    }
}

export default SendMessageForm;