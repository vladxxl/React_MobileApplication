import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AuthProvider } from './app/auth/AuthProvider';
import Busses from "./app/busses";

export default class App extends React.Component {
  render() {
    return (
      <AuthProvider>
        <Busses></Busses>
      </AuthProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
  },
});
