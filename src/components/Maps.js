import React, {Component} from 'react';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import firebase from 'react-native-firebase';

class Maps extends Component {
  state = {
    lat: null,
    lng: null,
    friends: [],
    users: [],
  };

  // getGeolocation = () => {
  //   Geolocation.getCurrentPosition(
  //     position => {
  //       this.setState({
  //         lat: position.coords.latitude,
  //         lng: position.coords.longitude,
  //       });
  //     },
  //     error => {
  //       console.log(error.code, error.message);
  //     },
  //     {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
  //   );
  // };

  getFriendLocation = () => {
    firebase.auth().onAuthStateChanged(async _usr => {
      let users = await firebase.firestore().collection('users');
      users = users.where('friends', 'array-contains', _usr.email);
      users.onSnapshot(async res => {
        const users = res.docs.map(_doc => _doc.data());
        await this.setState({
          users: users,
        });
      });
    });
  };

  componentDidMount() {
    this.getFriendLocation();
    this.setState({
      lat: this.props.data.lat,
      lng: this.props.data.lng,
    });
  }

  render() {
    return (
      <>
        {this.state.lat !== null ? (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{flex: 1}}
            showsUserLocation
            cacheEnabled
            loadingEnabled
            initialRegion={{
              latitude: this.state.lat,
              longitude: this.state.lng,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}>
            {this.state.users.length > 0 ? (
              <>
                {this.state.users.map((friend, index) => {
                  return (
                    <Marker
                      key={index}
                      coordinate={{
                        latitude: friend.lat,
                        longitude: friend.lng,
                      }}
                      title={friend.name}
                    />
                  );
                })}
              </>
            ) : null}
          </MapView>
        ) : null}
      </>
    );
  }
}

export default Maps;
