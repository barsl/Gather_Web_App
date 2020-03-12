import axios from 'axios';

export default {
    verifyAuth: function (callback) {
        axios.get('http://localhost:5000/verify')
            .then(res => {
                callback(res.data.isValid);
            })
            .catch(err => {
                console.error(err);
            })
    }
}
