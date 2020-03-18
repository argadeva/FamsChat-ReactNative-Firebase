import React, {Component} from 'react';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import firebase from 'react-native-firebase';
import {Thumbnail, Text} from 'native-base';

class Maps extends Component {
  state = {
    lat: -6.391982,
    lng: 106.826729,
    friends: [],
    users: [],
  };

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
                      description={friend.email}
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
