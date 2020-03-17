import React, { Component } from 'react';
import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react';
import Geocode from "react-geocode";
import './style/map.css';

class GoogleMap extends Component {

    constructor(props) {
        super(props);
        Geocode.setApiKey("AIzaSyDjmOBK0u2QrCMhLTln-Z_yHWs9MzuzsSk");

        this.onMarkerClick = this.onMarkerClick.bind(this);
        this.onMapClicked = this.onMapClicked.bind(this);
        this.updateMarker = this.updateMarker.bind(this);

        this.state = {
            showingInfoWindow: false,
            activeMarker: {},
            selectedPlace: {},
            eventName: this.props.eventName,
            eventAddress: '',
            markerLat: 0,
            marketLng: 0
        };
    }

    componentDidMount() {
        let lat = this.props.address[0];
        let lng = this.props.address[1];
        this.updateMarker(lat, lng);
    }

    updateMarker(lat, lng) {
        Geocode.fromLatLng(lat, lng)
            .then(res => {
                this.setState({
                    markerLat: lat,
                    markerLng: lng,
                    eventAddress: res.results[0].formatted_address,
                })

                this.props.onAddressChange(this.state.eventAddress);
            })
            .catch(err => console.error(err));
    }

    onMarkerClick = (props, marker, e) => {
        this.setState({
            selectedPlace: props,
            activeMarker: marker,
            showingInfoWindow: true
        });
    }

    onMapClicked = (props, map, e) => {
        if (this.state.showingInfoWindow) {
            this.setState({
                showingInfoWindow: false,
                activeMarker: null
            })
        }
        else {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();

            this.updateMarker(lat, lng);
        }
    }

    render() {
        return (
            <div className='map_small'>
                <Map
                    google={this.props.google}
                    zoom={15}
                    center={{ lat: this.state.markerLat, lng: this.state.markerLng }}
                    onClick={this.onMapClicked}
                >
                    <Marker
                        name={this.state.eventName}
                        onClick={this.onMarkerClick}
                        position={{ lat: this.state.markerLat, lng: this.state.markerLng }} />

                    <InfoWindow
                        marker={this.state.activeMarker}
                        visible={this.state.showingInfoWindow}>
                        <div>
                            <h4>{this.state.selectedPlace.name}</h4>
                            <h6>{this.state.eventAddress}</h6>
                        </div>
                    </InfoWindow>
                </Map>
            </div >
        )
    }
}

export default GoogleApiWrapper({
    apiKey: (`AIzaSyDjmOBK0u2QrCMhLTln-Z_yHWs9MzuzsSk`)
})(GoogleMap);
