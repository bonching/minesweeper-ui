import React from "react";
import {
    withGoogleMap,
    withScriptjs,
    GoogleMap,
    Polyline,
    Marker,
} from "react-google-maps";

const customGradient = [
    'rgba(0, 255, 255, 0)',
    'rgba(0, 255, 255, 1)',
    'rgba(191, 0, 31, 1)',
    'rgba(255, 0, 0, 1)',
];

class Map extends React.Component {
    state = {
        progress: [],
        gradient: customGradient,
        radius: 20,
        opacity: 0.5,
        metalLocations: []
    };

    customIcon = {
        url: "https://w7.pngwing.com/pngs/347/213/png-transparent-space-rover-icon.png", // url
        scaledSize: new window.google.maps.Size(50, 50), // scaled size
        origin: new window.google.maps.Point(0, 0), // origin
        anchor: new window.google.maps.Point(0, 0) // anchor
    };

    landmineIcon = {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROzDGVlkoz0ww03bCsS3n898vQvirxXTdtgA&s", // url
        scaledSize: new window.google.maps.Size(25, 25), // scaled size
        origin: new window.google.maps.Point(0, 0), // origin
        anchor: new window.google.maps.Point(0, 0) // anchor
    };

    path = [
        {lat: 14.173694681619912, lng: 122.9088747691727},
        {lat: 14.173632268246577, lng: 122.90891768451694},
        {lat: 14.173569854856078, lng: 122.90894987102511},
        {lat: 14.173533447037034, lng: 122.9089820575333},
        {lat: 14.173471033619347, lng: 122.90900887962344},
        {lat: 14.173413821304706, lng: 122.90905715938571},
        {lat: 14.173341005610679, lng: 122.90908934589389},
        {lat: 14.173367011218378, lng: 122.90915371891025},
        {lat: 14.173382614581556, lng: 122.90920736309054},
        {lat: 14.173408620184487, lng: 122.90926637168887},
        {lat: 14.173434625784425, lng: 122.9093253802872},
        {lat: 14.173455430262226, lng: 122.90935756679538},
        {lat: 14.173465832500426, lng: 122.90939511772159},
        {lat: 14.173486636975374, lng: 122.90942193981174},
        {lat: 14.173502240330333, lng: 122.909470219574},
        {lat: 14.173538648154391, lng: 122.90951313491824},
        {lat: 14.173559452622662, lng: 122.90954532142642},
        {lat: 14.173580257089023, lng: 122.90959896560672},
        {lat: 14.173590659321498, lng: 122.9096311521149}
    ];

    velocity = 5;
    initialDate = new Date();

    getDistance = () => {
        // seconds between when the component loaded and now
        const differentInTime = (new Date() - this.initialDate) / 1000; // pass to seconds
        return differentInTime * this.velocity; // d = v*t -- thanks Newton!
    };

    componentDidMount = () => {
        this.interval = window.setInterval(this.moveObject, 1000);
    };

    componentWillUnmount = () => {
        window.clearInterval(this.interval);
    };

    moveObject = () => {
        const distance = this.getDistance();
        if (!distance) {
            return;
        }

        let progress = this.path.filter(
            coordinates => coordinates.distance < distance
        );

        let _loc = [...this.state.metalLocations];
        if ([3, 12].includes(progress.length)) {
            _loc.push(this.path[progress.length - 1]);
        }

        const nextLine = this.path.find(
            coordinates => coordinates.distance > distance
        );
        if (!nextLine) {
            this.setState({progress});
            return; // it's the end!
        }
        const lastLine = progress[progress.length - 1];

        const lastLineLatLng = new window.google.maps.LatLng(
            lastLine.lat,
            lastLine.lng
        );

        const nextLineLatLng = new window.google.maps.LatLng(
            nextLine.lat,
            nextLine.lng
        );

        // distance of this line
        const totalDistance = nextLine.distance - lastLine.distance;
        const percentage = (distance - lastLine.distance) / totalDistance;

        const position = window.google.maps.geometry.spherical.interpolate(
            lastLineLatLng,
            nextLineLatLng,
            percentage
        );

        progress = progress.concat(position);
        this.setState({progress, metalLocations: _loc});
    };

    componentWillMount = () => {
        this.path = this.path.map((coordinates, i, array) => {
            if (i === 0) {
                return {...coordinates, distance: 0}; // it begins here!
            }
            const {lat: lat1, lng: lng1} = coordinates;
            const latLong1 = new window.google.maps.LatLng(lat1, lng1);

            const {lat: lat2, lng: lng2} = array[0];
            const latLong2 = new window.google.maps.LatLng(lat2, lng2);

            // in meters:
            const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
                latLong1,
                latLong2
            );

            return {...coordinates, distance};
        });

        console.log(this.path);
    };

    render = () => {
        return (
            <GoogleMap
                defaultZoom={19}
                defaultCenter={{lat: 14.17356205318106, lng: 122.90938975330356}}
            >
                {this.state.progress && (
                    <>
                        <Polyline
                            path={this.state.progress}
                            options={{strokeColor: "green", strokeWeight: 10}}
                        />
                        <Marker
                            position={this.state.progress[this.state.progress.length - 1]}
                            icon={this.customIcon}
                            zIndex={2}
                        />

                        {this.state.metalLocations.map((position, i) => (
                            <Marker
                                key={i}
                                position={position}
                                icon={this.landmineIcon}
                                zIndex={1}
                            />
                        ))}
                    </>
                )}
            </GoogleMap>
        );
    };
}

const MapComponent = withScriptjs(withGoogleMap(Map));

export default () => (
    <MapComponent
        googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
        loadingElement={<div style={{height: `100%`}}/>}
        containerElement={<div style={{height: `800px`, width: "100%"}}/>}
        mapElement={<div style={{height: `100%`}}/>}
    />
);
