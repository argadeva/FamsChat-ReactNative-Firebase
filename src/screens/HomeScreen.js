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
  H3,
  Item,
  Input,
} from 'native-base';
import Maps from '../components/Maps';
import firebase from 'react-native-firebase';
import ChatsList from '../components/ChatsList';
import FamilyView from '../components/FamilyList';
import Geolocation from 'react-native-geolocation-service';
import Modal from 'react-native-modal';

class Home extends Component {
  state = {
    lat: null,
    lng: null,
    modal: false,
  };

  signOutUser = async () => {
    await firebase
      .auth()
      .signOut()
      .then(() => {
        this.setState({modal: false});
        this.props.navigation.replace('SplashScreen');
      });
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
            .android.setChannelId('DefaultChannel')
            .android.setVibrate(1000);
        }

        firebase
          .notifications()
          .displayNotification(notification_to_be_displayed);
      });
  };

  getGeolocation = () => {
    Geolocation.watchPosition(
      position => {
        this.sendData(position);
        this.setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      error => {
        console.log(error.code, error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        distanceFilter: 1,
        useSignificantChanges: true,
      },
    );
  };

  sendData = async position => {
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
            lat: position.coords.latitude,
            lng: position.coords.longitude,
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
  }

  render() {
    return (
      <Container>
        <Header
          hasTabs
          androidStatusBarColor="#e91e63"
          style={{backgroundColor: '#e91e63'}}>
          <Left style={{paddingLeft: 10}}>
            <Title>FamsChat</Title>
          </Left>
          <Right>
            <Button transparent onPress={() => this.setState({modal: true})}>
              <Icon name="ios-log-out" />
              <Text>Sign Out</Text>
            </Button>
          </Right>
        </Header>
        <Tabs
          initialPage={1}
          tabBarUnderlineStyle={{backgroundColor: '#ffba00'}}
          tabContainerStyle={{
            elevation: 0,
          }}>
          <Tab
            heading={
              <TabHeading style={{backgroundColor: '#e91e63'}}>
                <Text style={{color: '#fff'}}>FAMILY</Text>
              </TabHeading>
            }>
            <FamilyView screen={this.props} />
          </Tab>
          <Tab
            heading={
              <TabHeading style={{backgroundColor: '#e91e63'}}>
                <Text style={{color: '#fff'}}>CHAT</Text>
              </TabHeading>
            }>
            <ChatsList screen={this.props} />
          </Tab>
          <Tab
            heading={
              <TabHeading style={{backgroundColor: '#e91e63'}}>
                <Text style={{color: '#fff'}}>MAPS</Text>
              </TabHeading>
            }>
            <Maps data={this.state} />
          </Tab>
        </Tabs>
        <Modal
          style={{justifyContent: 'flex-end'}}
          onSwipeComplete={() => this.setState({modal: false})}
          swipeDirection={['left', 'right', 'down']}
          isVisible={this.state.modal}>
          <View
            style={{backgroundColor: '#fff', padding: 30, borderRadius: 20}}>
            <Text
              note
              style={{alignSelf: 'center', color: 'red', marginBottom: 30}}>
              Are you sure you want to logout?
            </Text>
            <View style={{flex: 1, flexDirection: 'row', marginBottom: 30}}>
              <Button
                onPress={() => this.setState({modal: false})}
                rounded
                small
                style={{
                  backgroundColor: '#2196f3',
                  justifyContent: 'center',
                  flex: 1,
                  marginHorizontal: 10,
                }}>
                <Text>Cancel</Text>
              </Button>
              <Button
                onPress={() => this.signOutUser()}
                rounded
                small
                style={{
                  backgroundColor: '#e91e63',
                  justifyContent: 'center',
                  flex: 1,
                  marginHorizontal: 10,
                }}>
                <Text>Logout</Text>
              </Button>
            </View>
          </View>
        </Modal>
      </Container>
    );
  }
}

export default Home;
