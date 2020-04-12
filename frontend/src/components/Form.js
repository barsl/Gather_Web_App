import React from 'react';
import {connect} from 'react-redux';
import {addImage} from './actions/imageActions';
import axios from 'axios';
import classes from './style/form.module.css';

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      image: '',
    };
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onChangeImage = this.onChangeImage.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChangeTitle = e => {
    this.setState({title: e.target.value});
  };

  onChangeImage = e => {
    this.setState({image: e.target.files[0]});
  };

  onSubmit(e) {
    e.preventDefault();

    let formData = new FormData();
    formData.append('title', this.state.title);
    formData.append('image', this.state.image);
    formData.append('event_id', this.props.event_id);

    this.props.addImage(formData);
    this.setState({
      title: '',
      image: '',
    });
    this.forceUpdate();
  }

  render() {
    return (
      <div className={['form-container', classes.FormContainer].join(' ')}>
        <p className="form-label">Upload an Image</p>
        <form
          className="custom-file"
          encType="multipart/form-data"
          onSubmit={this.onSubmit}
        >
          <div className={classes.HorizontalFlex}>
            <div className={['custom-file', classes.CustomFile].join(' ')}>
              <input
                type="file"
                className={['custom-file-input', classes.FileInput].join(' ')}
                onChange={this.onChangeImage}
              ></input>
              <label
                id="ImageLabel"
                className={['custom-file-label', classes.FileInput].join(' ')}
                htmlFor="customFile"
              >
                {this.state.image ? this.state.image.name : 'Choose file'}
              </label>
            </div>

            <button type="submit" className="btn btn-primary">
              Submit
            </button>

            <button
              className={['btn', 'btn-primary', classes.GifButton].join(' ')}
              href="#"
              onClick={() => {
                this.getGif();
              }}
            >
              Get GIF
            </button>
          </div>
        </form>
      </div>
    );
  }

  getGif() {
    axios
      .get('/events/pics/gif/' + this.props.event_id)
      .then(response => {
        window.location.href = response.data.url;
      })
      .catch(error => {
        console.log(error);
      });
  }
}

export default connect(null, {addImage})(Form);
