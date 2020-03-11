import React, {Component} from 'react';
import {ImageBackground, StatusBar} from 'react-native';
import firebase from 'react-native-firebase';
import splash from '../assets/splash.png';

export default class SplashScreen extends Component {
  componentDidMount = () => {
    firebase.auth().onAuthStateChanged(user => {
      setTimeout(() => {
        if (user) {
          this.props.navigation.replace('HomeScreen');
        } else {
          this.props.navigation.replace('LoginScreen');
        }
      }, 2000);
    });
  };

  render() {
    return (
      <>
        <StatusBar hidden />
        <ImageBackground
          source={splash}
          style={{width: '100%', height: '100%'}}
        />
      </>
    );
  }
}
