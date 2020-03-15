import React, { Component } from 'react';
import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react';

class GoogleMap extends Component {
    constructor(props) {
        super(props);

        this.onMarkerClick = this.onMarkerClick.bind(this);
        this.onMapClicked = this.onMapClicked.bind(this);
        this.state = {
            showingInfoWindow: false,
            markers: [],
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

            this.setState({
                markers: [...this.state.markers, { name: "", position: { lat, lng } }]
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
                    {this.state.markers.map((marker, index) => (
                        <Marker
                            key={index}
                            name={marker.name}
                            onClick={this.onMarkerClick}
                            position={marker.position} />
                    ))}


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
