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
      <Link to={"/" }>delete</Link>
    </td>
  </tr>
)


class AllImages extends React.Component {

  constructor(props) {
    super(props);

    this.picsList = this.picsList.bind(this)

    this.state = { pics: [] };
  }

  componentDidMount() {
    console.log(this.props.event_id);

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
      return <Image url={pic} key={pic}/>;
    })
  }

  render() {

      return (
      <table className="table table-image">
        <thead className="thead-light">
          <tr>
            <th>Image</th>
            <th>Action</th>
          </tr>
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
