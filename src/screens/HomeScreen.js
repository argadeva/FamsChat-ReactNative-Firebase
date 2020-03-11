import React, {Component} from 'react';
import {
  Container,
  Header,
  Tab,
  Tabs,
  TabHeading,
  Icon,
  Text,
  Left,
  Button,
  Body,
  Title,
  Right,
  Content,
  List,
  ListItem,
  Thumbnail,
  View,
  Fab,
} from 'native-base';
import Maps from '../components/Maps';
import firebase from 'react-native-firebase';
import ChatsList from '../components/ChatsList';
import FamilyView from '../components/FamilyList';
import Geolocation from 'react-native-geolocation-service';

class Home extends Component {
  state = {
    lat: null,
    lng: null,
  };

  signOutUser = async () => {
    await firebase.auth().signOut();
  };

  getNotif = () => {
    this.notificationListener = firebase
      .notifications()
      .onNotification(notification => {
        let notification_to_be_displayed = new firebase.notifications.Notification(
          {
            data: notification._android._notification._data,
            sound: 'default',
            show_in_foreground: true,
            title: notification.title,
            body: notification.body,
          },
        );

        if (Platform.OS == 'android') {
          notification_to_be_displayed.android
            .setPriority(firebase.notifications.Android.Priority.High)
            .android.setChannelId('Default')
            .android.setVibrate(1000);
        }

        firebase
          .notifications()
          .displayNotification(notification_to_be_displayed);
      });
  };

  getGeolocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        this.setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      error => {
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  sendData = async () => {
    const enable = firebase.messaging().hasPermission();
    if (enable) {
      const fcmToken = await firebase.messaging().getToken();
      await firebase.auth().onAuthStateChanged(async _usr => {
        firebase
          .firestore()
          .collection('users')
          .doc(_usr.email)
          .update({
            notifId: fcmToken,
            lat: this.state.lat,
            lng: this.state.lng,
          });
      });
    } else {
      try {
        firebase.messaging().requestPermission();
      } catch (e) {
        alert('user reject the permision');
      }
    }
  };

  async componentDidMount() {
    await this.getGeolocation();
    await this.getNotif();
    setTimeout(() => {
      this.sendData();
    }, 3000);
  }

  render() {
    return (
      <Container>
        <Header hasTabs>
          <Left>
            <Title>FamsChat</Title>
          </Left>
          <Right>
            <Button transparent onPress={() => this.signOutUser()}>
              <Icon name="ios-person" />
              <Text>MY PROFILE</Text>
            </Button>
          </Right>
        </Header>
        <Tabs initialPage={1}>
          <Tab
            heading={
              <TabHeading>
                <Text>FAMILY</Text>
              </TabHeading>
            }>
            <FamilyView screen={this.props} />
          </Tab>
          <Tab
            heading={
              <TabHeading>
                <Text>CHAT</Text>
              </TabHeading>
            }>
            <ChatsList screen={this.props} />
          </Tab>
          <Tab
            heading={
              <TabHeading>
                <Text>MAPS</Text>
              </TabHeading>
            }>
            <Maps data={this.state} />
          </Tab>
        </Tabs>
      </Container>
    );
  }
}

export default Home;
