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
  Item,
  Input,
  H3,
} from 'native-base';
import {Modal} from 'react-native';
import firebase from 'react-native-firebase';

class FamilyList extends Component {
  state = {
    email: '',
    friends: [],
    users: [],
    combine: [],
    modal: false,
    modalText: '',
    modalWarning: '',
  };

  componentDidMount() {
    firebase.auth().onAuthStateChanged(async _usr => {
      let friend = await firebase.firestore().collection('friends');
      friend = friend.where('users', 'array-contains', _usr.email);
      friend = friend.where('status', '==', false);
      let users = await firebase.firestore().collection('users');
      friend.onSnapshot(async res => {
        const friends = res.docs.map(_doc => _doc.data());
        await this.setState({
          email: _usr.email,
          friends: friends,
        });
      });
      users.onSnapshot(async res => {
        const users = res.docs.map(_doc => _doc.data());
        await this.setState({
          users: users,
        });
      });
    });
  }

  buildDocKey = () => {
    return [firebase.auth().currentUser.email, this.state.modalText]
      .sort()
      .join(':');
  };

  friendExists = async () => {
    const docKey = this.buildDocKey();
    const chat = await firebase
      .firestore()
      .collection('friends')
      .doc(docKey)
      .get();
    return chat.exists;
  };

  userExist = async () => {
    const usersSnapshot = await firebase
      .firestore()
      .collection('users')
      .get();
    const exists = usersSnapshot.docs
      .map(_doc => _doc.data().email)
      .includes(this.state.modalText);
    return exists;
  };

  addFriend = async () => {
    if (this.state.modalText !== this.state.email) {
      const userExist = await this.userExist();
      if (userExist) {
        const friendExists = await this.friendExists();
        friendExists
          ? this.setState({
              modalWarning: 'Anda sudah berteman!',
            })
          : this.reqFriends();
      } else {
        this.setState({
          modalWarning: 'User tidak di temukan!',
        });
      }
    } else {
      this.setState({
        modalWarning: 'Email tidak valid!',
      });
    }
  };

  reqFriends = () => {
    const docKey = this.buildDocKey();
    firebase
      .firestore()
      .collection('friends')
      .doc(docKey)
      .set({
        sender: this.state.email,
        email: this.state.modalText,
        status: false,
        users: [this.state.email, this.state.modalText],
      })
      .then(() =>
        this.setState({
          modal: false,
        }),
      );
  };

  createChat = (docKey, users) => {
    firebase
      .firestore()
      .collection('chats')
      .doc(docKey)
      .set({
        messages: [
          {
            message: "I'm accept your friend request!",
            sender: this.state.email,
          },
        ],
        users: users,
        receiverHasRead: 1,
      });
  };

  onConfirm = data => {
    const docKey = data.users.sort().join(':');
    firebase
      .firestore()
      .collection('friends')
      .doc(docKey)
      .update({
        status: true,
      })
      .then(() => {
        firebase
          .firestore()
          .collection('users')
          .doc(this.state.email)
          .update({
            friends: firebase.firestore.FieldValue.arrayUnion(data.sender),
          });
        firebase
          .firestore()
          .collection('users')
          .doc(data.sender)
          .update({
            friends: firebase.firestore.FieldValue.arrayUnion(this.state.email),
          });
        this.createChat(docKey, data.users);
      });
  };

  render() {
    // console.log(this.state.friends);
    // console.log('users', this.state.users);

    // let combine = this.state.friends.map((item, i) =>
    //   Object.assign({}, item, this.state.users[i]),
    // );

    // console.log('combine', combine);

    return (
      <>
        {this.state.friends.length > 0 ? (
          <Content>
            {this.state.friends.map((_friend, _index) => {
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
                      <Text>
                        {_friend.users.filter(
                          _friend => _friend !== this.state.email,
                        )}
                      </Text>
                      <Text note>Request is send, waiting Approval</Text>
                    </Body>
                    {_friend.email === this.state.email && (
                      <Right>
                        <Button
                          transparent
                          onPress={() => this.onConfirm(_friend)}>
                          <Icon active name="checkmark" />
                        </Button>
                      </Right>
                    )}
                  </ListItem>
                </List>
              );
            })}
          </Content>
        ) : null}
        <View style={{flex: 1}}>
          <Fab
            style={{backgroundColor: '#5067FF'}}
            position="bottomRight"
            onPress={() => this.setState({modal: true})}>
            <Icon name="ios-person-add" />
          </Fab>
        </View>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modal}>
          <Button transparent onPress={() => this.setState({modal: false})}>
            <Icon name="close" />
          </Button>
          <Content style={{padding: 50}}>
            <H3 style={{alignSelf: 'center', marginBottom: 10}}>ADD FAMILY</H3>
            {this.state.modalWarning !== '' && (
              <Text note style={{alignSelf: 'center', color: 'red'}}>
                {this.state.modalWarning}
              </Text>
            )}
            <Item rounded style={{marginVertical: 20}}>
              <Input
                placeholder="Input Email"
                style={{padding: 5}}
                onChangeText={text => this.setState({modalText: text})}
              />
            </Item>
            <Button rounded onPress={() => this.addFriend()}>
              <Text>Primary</Text>
            </Button>
          </Content>
        </Modal>
      </>
    );
  }
}

export default FamilyList;
