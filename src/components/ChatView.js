import React, {Component} from 'react';
import {Text, ImageBackground, ScrollView} from 'react-native';
import {
  Container,
  Header,
  Left,
  Body,
  Right,
  Button,
  Icon,
  Title,
  Footer,
  Item,
  Input,
  View,
} from 'native-base';
import firebase from 'react-native-firebase';
import bg from '../assets/chatbg.png';
import Axios from 'axios';

export default class ChatView extends Component {
  state = {
    email: '',
    friend: [],
    chats: [],
    chatText: '',
    notifId: '',
    keep: '',
  };

  componentDidMount() {
    firebase.auth().onAuthStateChanged(async _usr => {
      await firebase
        .firestore()
        .collection('chats')
        .where('users', '==', this.props.route.params.user)
        .onSnapshot(async res => {
          const chats = res.docs.map(_doc => _doc.data());
          await this.setState({
            email: _usr.email,
            friend: chats[0].users
              .filter(_friend => _friend !== _usr.email)
              .toString(),
            chats: chats[0].messages,
          });
          this.getIdNotif();
        });
    });
  }

  getIdNotif = () => {
    firebase
      .firestore()
      .collection('users')
      .doc(this.state.friend)
      .get()
      .then(res => {
        this.setState({
          notifId: res.data().notifId,
        });
      });
  };

  sendNotif = () => {
    Axios.post(
      'https://fcm.googleapis.com/fcm/send',
      {
        to: this.state.notifId,
        content_available: true,
        notification: {
          title: this.state.email,
          body: this.state.keep,
          priority: 'high',
          sound: 'Default',
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'key=AIzaSyC1SMoSO77oXENklPD6M5KpnS_E7kRtpgo',
        },
      },
    );
  };

  SendText = () => {
    if (this.state.chatText !== '') {
      this.setState({
        keep: this.state.chatText,
      });
      const docKey = this.props.route.params.user.sort().join(':');
      firebase
        .firestore()
        .collection('chats')
        .doc(docKey)
        .update({
          messages: firebase.firestore.FieldValue.arrayUnion({
            message: this.state.chatText,
            sender: this.state.email,
            timestamp: Date.now(),
          }),
          receiverHasRead: firebase.firestore.FieldValue.increment(1),
        })
        .then(() => {
          this.setState({
            chatText: '',
          });
        })
        .then(() => {
          this.sendNotif();
        });
    }
  };

  backButton = async () => {
    this.setState({
      email: '',
      friend: '',
      chats: [],
      chatText: '',
    });
    this.props.navigation.goBack();
  };

  render() {
    return (
      <Container>
        <ImageBackground
          source={bg}
          style={{
            width: '100%',
            height: '100%',
            flex: 1,
            resizeMode: 'cover',
            position: 'absolute',
          }}>
          <Header
            hasTabs
            androidStatusBarColor="#e91e63"
            style={{backgroundColor: '#e91e63'}}>
            <Left>
              <Button transparent onPress={() => this.backButton()}>
                <Icon name="arrow-back" />
              </Button>
            </Left>
            <Body>
              <Title>{this.state.friend}</Title>
            </Body>
            <Right>
              <Button transparent>
                <Icon name="menu" />
              </Button>
            </Right>
          </Header>
          {this.state.chats.length > 0 && (
            <ScrollView
              padder
              ref="scrollView"
              onContentSizeChange={(width, height) =>
                this.refs.scrollView.scrollTo({y: height})
              }>
              {this.state.chats.map((_msg, _index) => {
                function date(time) {
                  var date = new Date(parseInt(time));
                  var localeSpecificTime = date.toLocaleTimeString('id-ID');
                  return localeSpecificTime.slice(0, -3);
                }
                return (
                  <View key={_index}>
                    {_msg.sender !== this.state.email ? (
                      <View
                        style={{
                          backgroundColor: '#2196f3',
                          margin: 10,
                          marginRight: 100,
                          padding: 10,
                          alignSelf: 'flex-start',
                          borderRadius: 5,
                        }}>
                        <Text style={{color: '#fff'}}>{_msg.message}</Text>
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 12,
                            textAlign: 'left',
                          }}>
                          {date(_msg.timestamp)}
                        </Text>
                      </View>
                    ) : (
                      <View
                        style={{
                          backgroundColor: '#9e9e9e',
                          margin: 10,
                          marginLeft: 100,
                          padding: 10,
                          alignSelf: 'flex-end',
                          borderRadius: 5,
                        }}>
                        <Text style={{color: '#fff'}}>{_msg.message}</Text>
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 12,
                            textAlign: 'right',
                          }}>
                          {date(_msg.timestamp)}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}
          <Footer style={{backgroundColor: '#fff'}}>
            <Item style={{flex: 1}}>
              <Input
                placeholder="Message ..."
                style={{padding: 5}}
                value={this.state.chatText}
                onChangeText={chatText => this.setState({chatText})}
              />
              <Button transparent onPress={() => this.SendText()}>
                <Icon style={{color: '#e91e63'}} name="send" />
              </Button>
            </Item>
          </Footer>
        </ImageBackground>
      </Container>
    );
  }
}
