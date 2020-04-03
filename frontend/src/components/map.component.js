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
        if (this.props.location) {
            let lat = this.props.location[0];
            let lng = this.props.location[1];
            this.updateMarker(lat, lng);
        }

        this.interval = setInterval(() => {
            if (this.props.addressName !== this.state.eventAddress) {
                Geocode.fromAddress(this.props.addressName)
                    .then(res => {
                        this.setState({
                            markerLat: res.results[0].geometry.location.lat,
                            markerLng: res.results[0].geometry.location.lng,
                            eventAddress: this.props.addressName
                        })
                    })
                    .catch(err => { })
            }
        }, 5000);
    }

    updateMarker(lat, lng) {
        Geocode.fromLatLng(lat, lng)
            .then(res => {
                this.setState({
                    markerLat: lat,
                    markerLng: lng,
                    eventAddress: res.results[0].formatted_address,
                })

                this.props.onLocationChange(this.state.eventAddress);
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
