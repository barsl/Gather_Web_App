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

        this.state = {
            showingInfoWindow: false,
            activeMarker: {},
            selectedPlace: {}
        };
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
            const position = { lat, lng };

            this.setState({
                activeMarker: {
                    name: '',
                    address: '',
                    position
                }
            })
        }
    }

    render() {
        return (
            <div className='map_small'>
                <Map
                    google={this.props.google}
                    zoom={15}
                    initialCenter={{
                        lat: 40,
                        lng: -79
                    }}
                    onClick={this.onMapClicked}
                >
                    <Marker
                        name=''
                        onClick={this.onMarkerClick}
                        position={this.state.activeMarker.position} />

                    <InfoWindow
                        marker={this.state.activeMarker}
                        visible={this.state.showingInfoWindow}>
                        <div>
                            <h1>{this.state.selectedPlace.name}</h1>
                            {/* <h4>{`\n${this.state.activeMarker.address}`}</h4> */}
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
