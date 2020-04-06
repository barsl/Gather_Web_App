import React, {Component} from 'react';
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';
import {
  getAddressFromCoordinates,
  getCoordinatesFromAddress,
} from '../util/MapUtil';
import './style/map.css';

class GoogleMap extends Component {
  constructor(props) {
    super(props);

    this.onMarkerClick = this.onMarkerClick.bind(this);
    this.onMapClicked = this.onMapClicked.bind(this);
    this.updateMarker = this.updateMarker.bind(this);

    this.state = {
      showingInfoWindow: false,
      activeMarker: {},
      selectedPlace: {},
      eventName: this.props.eventName,
      eventAddress: '',
      markerPos: {
        lat: 0,
        lng: 0,
      },
    };
  }

  componentDidMount() {
    if (this.props.location) {
      const [lat, lng] = this.props.location;
      this.setState({
        markerPos: {lat, lng},
        eventAddress: this.props.addressName,
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.addressName !== this.props.addressName) {
      if (this.updateTimer) clearTimeout(this.updateTimer);
      this.updateTimer = setTimeout(() => {
        getCoordinatesFromAddress(this.props.addressName).then(([lat, lng]) => {
          this.setState({
            markerPos: {lat, lng},
            eventAddress: this.props.addressName,
          });
        })
        .catch(() => console.log('No results found.'));
      }, 500);
    }
  }

  componentWillUnmount() {
    if (this.updateTimer) clearTimeout(this.updateTimer);
  }

  updateMarker(lat, lng) {
    getAddressFromCoordinates([lat, lng])
      .then(address => {
        this.setState({
          markerPos: {lat, lng},
          eventAddress: address,
        });

        this.props.onLocationChange(this.state.eventAddress);
      })
      .catch(err => console.error(err));
  }

  onMarkerClick = (props, marker, e) => {
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true,
    });
  };

  onMapClicked = (props, map, e) => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null,
      });
    } else {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      this.updateMarker(lat, lng);
    }
  };

  render() {
    return (
      <div className="map_small">
        <Map
          google={this.props.google}
          zoom={15}
          center={this.state.markerPos}
          onClick={this.onMapClicked}
        >
          <Marker
            name={this.state.eventName}
            onClick={this.onMarkerClick}
            position={this.state.markerPos}
          />

          <InfoWindow
            marker={this.state.activeMarker}
            visible={this.state.showingInfoWindow}
          >
            <div>
              <h4>{this.state.selectedPlace.name}</h4>
              <h6>{this.state.eventAddress}</h6>
            </div>
          </InfoWindow>
        </Map>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: `AIzaSyDjmOBK0u2QrCMhLTln-Z_yHWs9MzuzsSk`,
})(
  React.memo(GoogleMap, (prevProps, nextProps) => {
    return (
      prevProps.eventName === nextProps.eventName &&
      prevProps.addressName === nextProps.addressName &&
      prevProps.location === nextProps.location &&
      prevProps.loaded === nextProps.loaded &&
      prevProps.google === nextProps.google
    );
  }),
);
