import React, { Component } from 'react';
import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react';
import Geocode from "react-geocode";

class GoogleMap extends Component {
    constructor(props) {
        super(props);
        Geocode.setApiKey("AIzaSyDjmOBK0u2QrCMhLTln-Z_yHWs9MzuzsSk");

        this.onMarkerClick = this.onMarkerClick.bind(this);
        this.onMapClicked = this.onMapClicked.bind(this);
        this.state = {
            showingInfoWindow: false,
            activeMarker: {},
            selectedPlace: {},
        };
    }

    onMarkerClick = (props, marker, e) =>
        this.setState({
            selectedPlace: props,
            activeMarker: marker,
            showingInfoWindow: true
        });

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
                    name: this.props.eventName,
                    position
                }
            })
        }
    };
    render() {
        const style = {
            width: `50vw`,
            height: `50vh`
        }

        return (
            <div>
                Google Maps
                <Map
                    google={this.props.google}
                    zoom={15}
                    initialCenter={{
                        lat: 43.856098,
                        lng: -79.337021
                    }}
                    onClick={this.onMapClicked}
                    style={style}
                >
                    <Marker
                        name={this.state.activeMarker.name}
                        onClick={this.onMarkerClick}
                        position={this.state.activeMarker.position} />

                    <InfoWindow
                        marker={this.state.activeMarker}
                        visible={this.state.showingInfoWindow}>
                        <div>
                            <h1>{this.state.selectedPlace.name}</h1>
                        </div>
                    </InfoWindow>
                </Map>
                }}
            </div >
        )
    }
}

export default GoogleApiWrapper({
    apiKey: (`AIzaSyDjmOBK0u2QrCMhLTln-Z_yHWs9MzuzsSk`)
})(GoogleMap);
