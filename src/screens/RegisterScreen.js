import React, {Component} from 'react';
import {
  Container,
  Header,
  Content,
  Form,
  Item,
  Input,
  Button,
  Text,
  Left,
  Body,
  Title,
  Icon,
  Right,
} from 'native-base';
import {StatusBar} from 'react-native';
import firebase from 'react-native-firebase';

export default class RegisterScreen extends Component {
  state = {
    name: '',
    email: '',
    password: '',
    signUpError: '',
  };

  handleSignUp = () => {
    firebase
      .auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(
        authRes => {
          const userObj = {
            name: this.state.name,
            email: authRes.user.email,
            friends: [],
          };
          firebase
            .firestore()
            .collection('users')
            .doc(this.state.email)
            .set(userObj)
            .then(
              () => {
                this.props.navigation.replace('HomeScreen');
              },
              dbError => {
                console.log(dbError);
                this.setState({signUpError: dbError.toString()});
              },
            );
        },
        authError => {
          this.setState({signupError: authError.toString()});
        },
      );
  };

  render() {
    return (
      <Container>
        <StatusBar translucent={false} />
        <Header
          androidStatusBarColor="#e91e63"
          style={{backgroundColor: '#e91e63'}}>
          <Left>
            <Button transparent onPress={() => this.props.navigation.goBack()}>
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body>
            <Title>Register</Title>
          </Body>
          <Right />
        </Header>
        <Content padder>
          <Form style={{paddingHorizontal: 20}}>
            <Item rounded style={{marginTop: 30}}>
              <Input
                placeholder="Name"
                style={{padding: 5}}
                onChangeText={name => this.setState({name})}
              />
            </Item>
            <Item rounded style={{marginTop: 30}}>
              <Input
                autoCompleteType="email"
                autoCapitalize="none"
                placeholder="Email"
                style={{padding: 5}}
                onChangeText={email => this.setState({email})}
              />
            </Item>
            <Item rounded style={{marginTop: 30}}>
              <Input
                secureTextEntry
                autoCapitalize="none"
                placeholder="Password"
                style={{padding: 5}}
                onChangeText={password => this.setState({password})}
              />
            </Item>
            <Button
              rounded
              style={{
                marginTop: 30,
                backgroundColor: '#2196f3',
                justifyContent: 'center',
                flex: 1,
              }}
              onPress={() => this.handleSignUp()}>
              <Text> Register </Text>
            </Button>
          </Form>
        </Content>
      </Container>
    );
  }
}
