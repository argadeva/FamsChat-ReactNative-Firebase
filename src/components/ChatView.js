import React, {Component} from 'react';
import {Text, View} from 'react-native';
import {
  Container,
  Header,
  Left,
  Body,
  Right,
  Button,
  Icon,
  Title,
  Content,
  Footer,
  Item,
  Input,
  List,
  ListItem,
  Thumbnail,
} from 'native-base';
import firebase from 'react-native-firebase';

export default class ChatView extends Component {
  state = {
    email: '',
    friend: [],
    chats: [],
    chatText: '',
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
            friend: chats[0].users.filter(_friend => _friend !== _usr.email),
            chats: chats[0].messages,
          });
        });
    });
  }

  SendText = () => {
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
      });
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
        <Header>
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
          <KeyboardAwareScrollView
            contentContainerStyle={{flexGrow: 1}}
            enableOnAndroid={true}>
            <Content style={{backgroundColor: '#3ff'}}>
              {this.state.chats.map((_msg, _index) => {
                return (
                  <List key={_index}>
                    <ListItem avatar>
                      <Left>
                        <Thumbnail
                          source={{
                            uri:
                              'https://dummyimage.com/300x300/008cff/ffffff.jpg',
                          }}
                        />
                      </Left>
                      <Body>
                        <Text note>{_msg.message}</Text>
                      </Body>
                      <Right>
                        <Text note>18.18</Text>
                      </Right>
                    </ListItem>
                  </List>
                );
              })}
            </Content>
          </KeyboardAwareScrollView>
        )}
        <Footer style={{backgroundColor: '#fff'}}>
          <Item style={{flex: 1}}>
            <Input
              placeholder="Search"
              style={{padding: 5}}
              value={this.state.chatText}
              onChangeText={chatText => this.setState({chatText})}
            />
            <Button transparent onPress={() => this.SendText()}>
              <Icon name="ios-send" />
            </Button>
          </Item>
        </Footer>
      </Container>
    );
  }
}
