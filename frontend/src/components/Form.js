import React from "react";
import { connect } from "react-redux";
import { addImage } from "./actions/imageActions";
import axios from 'axios';
import AxiosAPI from "./AxiosAPI";

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      image: ""
    };
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onChangeImage = this.onChangeImage.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChangeTitle = e => {
    this.setState({ title: e.target.value });
  };

  onChangeImage = e => {
    this.setState({ image: e.target.files[0] });
  };

  onSubmit(e) {
    e.preventDefault();

    let formData = new FormData();
    formData.append("title", this.state.title);
    formData.append("image", this.state.image);
    formData.append("event_id", this.props.event_id);

    this.props.addImage(formData);
    this.setState({
      title: "",
      image: ""
    });
  }

  render() {
    return (
      <div className="form-container">
        <form encType="multipart/form-data" onSubmit={this.onSubmit}>
          <h3>Event Gallery</h3>
          <label className="form-label">Choose an Image</label>
          <input
            type="file"
            className="form-input"
            onChange={this.onChangeImage}
          />
          <button type="submit" className="submit-btn">
            Submit!
          </button>
          <a href="#" onClick={() => { this.getGif() }}>Get GIF</a>
        </form>
      </div>
    );
  }


  getGif() {
    AxiosAPI.get('/events/pics/gif/'+this.props.event_id)
    .then(response => {
      window.location.href = response.data.url
      })
    .catch((error) => {
      console.log(error);
    })

  }

}

export default connect(
  null,
  { addImage }
)(Form);
