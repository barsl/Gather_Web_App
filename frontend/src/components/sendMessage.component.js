import React, { Component } from 'react';

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
            <div>
                <form onSubmit={this.onSubmit}>
                    <input
                        type="text"
                        value={this.state.text}
                        placeholder="Enter message"
                        onChange={this.onChange}>
                    </input>
                    <input type="submit" />
                </form>
            </div>
        )
    }
}

export default SendMessageForm;