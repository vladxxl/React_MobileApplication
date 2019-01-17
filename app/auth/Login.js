import React, { Component } from 'react';
import { Text, View, TextInput, Button , StyleSheet} from 'react-native';

import WiggleBox from 'react-native-wiggle-box'

export class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {username: '', password: ''};
  }

  handleClick = () => {console.log("Hello")}

  render() {
    const styles = StyleSheet.create({
      boxContainer: {
          backgroundColor: "#3BD0F5",
          height: 100,
          width: 340,
          alignItems: "center",
          justifyContent: "center"
      }
    })
    return (
      <View>
        <Text style={{padding: 10, fontSize: 20}}>
          Username
        </Text>
        <TextInput
          style={{height: 40}}
          onChangeText={(username) => this.setState({username})}
        />
        <Text style={{padding: 10, fontSize: 20}}>
          Password
        </Text>
        <TextInput
          secureTextEntry={true}
          style={{height: 40}}
          onChangeText={(password) => this.setState({password})}
        />
        <Button
          onPress={() => this.props.onLogin(this.state.username,this.state.password)}
          title="Login"
        />
        <Button
        onPress={()=>this.props.onSignUp(this.state.username,this.state.password)}
        title="Sign up"
        />

        <View >
              <WiggleBox
              active={true}
              onPress={this.handleClick}
              handlePress={this.handleClick}
              boxStyle={styles.boxContainer}
              duration={300}
              >
              <Text >
                  Please consider to Sign Up before Log In!
              </Text>
          </WiggleBox>
      </View>
      </View>
    );
  }
}
