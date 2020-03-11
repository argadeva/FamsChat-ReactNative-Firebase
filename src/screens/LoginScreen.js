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
} from 'native-base';
import {View, ImageBackground, StatusBar} from 'react-native';
import firebase from 'react-native-firebase';
import login from '../assets/login.png';

export default class LoginScreen extends Component {
  state = {
    email: '',
    password: '',
    errorMessage: null,
  };

  handleLogin = async () => {
    await firebase
      .auth()
      .signInWithEmailAndPassword(this.state.email, this.state.password)
      .then(() => {
        console.log('Success!');
      })
      .catch(error => {
        this.setState({errorMessage: error.toString()});
      });
  };

  render() {
    return (
      <>
        <StatusBar translucent backgroundColor="transparent" />
        <ImageBackground
          source={login}
          style={{
            width: '100%',
            height: '100%',
          }}>
          <Content style={{marginTop: 230}}>
            {this.state.errorMessage !== null && (
              <Text
                note
                style={{
                  textAlign: 'center',
                  color: '#e91e63',
                  paddingHorizontal: 20,
                }}>
                {this.state.errorMessage}
              </Text>
            )}
            <Form style={{paddingHorizontal: 30, marginTop: 20}}>
              <Item rounded>
                <Input
                  autoCompleteType="email"
                  autoCapitalize="none"
                  placeholder="Email"
                  style={{padding: 5}}
                  value={this.state.email}
                  onChangeText={email => this.setState({email})}
                />
              </Item>
              <Item rounded style={{marginTop: 30}}>
                <Input
                  autoCapitalize="none"
                  secureTextEntry
                  style={{padding: 5}}
                  placeholder="Password"
                  value={this.state.password}
                  onChangeText={password => this.setState({password})}
                />
              </Item>
              <Button
                rounded
                style={{
                  marginTop: 30,
                  backgroundColor: '#e91e63',
                  justifyContent: 'center',
                  flex: 1,
                }}
                onPress={() => this.handleLogin()}>
                <Text> Login </Text>
              </Button>
              <Button
                transparent
                style={{
                  marginTop: 30,
                  justifyContent: 'center',
                  flex: 1,
                }}
                onPress={() =>
                  this.props.navigation.navigate('RegisterScreen')
                }>
                <Text style={{color: '#2196f3'}}>Create Your Account</Text>
              </Button>
            </Form>
          </Content>
        </ImageBackground>
      </>
    );
  }
}
