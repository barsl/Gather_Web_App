import React from "react";
import { connect } from "react-redux";
import { Link } from 'react-router-dom';
import axios from 'axios';

const Image = props => (
  <tr>
    <td>
      <img
        className="w-25"
        src={props.url}
      />
    </td>

    <td>
      <a href="#" onClick={() => { props.deletePic(props.url) }}> Delete</a>
    </td>
  </tr>
)


class AllImages extends React.Component {

  constructor(props) {
    super(props);

    this.deletePic = this.deletePic.bind(this)
    this.picsList = this.picsList.bind(this)

    this.state = { pics: [] };
  }

  componentDidMount() {
    axios.get('/events/pics/get/'+this.props.event_id)
    .then(response => {
      this.setState({ pics: response.data })
      })
    .catch((error) => {
      console.log(error);
    })
  }

  picsList() {
    return this.state.pics.map(pic => {
      return <Image url={pic} key={pic} deletePic={this.deletePic}/>;
    })
  }

  deletePic(pic) {
    console.log("deleting pic");
    axios.post('/events/pics/delete', {event_id: this.props.event_id, url: pic})
    .then(() => {
        console.log("pic deleted");
      })
    .catch((error) => {
      console.log(error);
    })
  }

  render() {

      return (
      <table className="table table-image">
        <thead className="thead-light">
        </thead>
        <tbody>
          {this.picsList()}
        </tbody>
      </table>
      );

  }
}

const mapStateToProps = state => {
  return {
    images: Object.values(state.images)
  };
};

export default connect(
  mapStateToProps
)(AllImages);
