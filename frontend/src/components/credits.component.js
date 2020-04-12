import { withRouter, Link } from 'react-router-dom';
import React, { Component } from 'react';

class Credits extends Component {
    render() {
        return (
            <div>
                <h1>Credits</h1>
                <ul>
                    <li>
                        <a href="https://www.youtube.com/watch?v=7CqJlxBYj-M&fbclid=IwAR3Srv_yMjoiTzMHxjhrrAy2CEa7ndgmBtd2rjeJn1Qs7k7ai4Zvev_Eljw">MERN Setup</a>
                    </li>
                    <li>
                        <a href="https://www.youtube.com/watch?v=zNcNghhKZjo&list=PLcCp4mjO-z9_y8lByvIfNgA_F18l-soQv&index=9">Authentication</a>
                    </li>
                    <li>
                        <a href="https://www.youtube.com/watch?v=S9maJY5JcZc">Authentication 2</a>
                    </li>
                    <li>
                        <a href="https://daveceddia.com/access-control-allow-origin-cors-errors-in-react-express/">CORS</a>
                    </li>
                    <li>
                        <a href="https://pusher.com/docs/chatkit/reference/javascript">Chat room</a>
                    </li>
                    <li>
                        <a href="https://medium.com/@aliglenesk/how-to-embed-a-google-map-in-your-react-app-23866d759e92">Maps</a>
                    </li>
                    <li>
                        <a href="https://www.npmjs.com/package/react-geocode">Geocoding</a>
                    </li>
                    <li>
                        <a href="https://www.npmjs.com/package/google-maps-react">Maps package</a>
                    </li>
                    <li>
                        <a href="https://stackoverflow.com/questions/51421714/how-to-add-marker-onclick-and-show-my-geolocation-in-google-maps-react?rq=1">Map Markers</a>
                    </li>
                    <li>
                        <a href="https://medium.com/@ethanryan/making-a-simple-real-time-collaboration-app-with-react-node-express-and-yjs-a261597fdd44">Sockets</a>
                    </li>
                    <li>
                        <a href="https://medium.com/better-programming/image-upload-with-cloudinary-mern-f18812d5d023">Cloudinary</a>
                    </li>
                </ul>
            </div>
        )
    }
}

export default withRouter(Credits);