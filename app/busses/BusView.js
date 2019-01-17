import React, { Component } from 'react';
import { Text,TextInput, View, StyleSheet,Button } from 'react-native';
export class BusView extends Component {
  constructor(props) {
    super(props);
    this.state = {number: '', route: ''};
  }

 

  render() {
    return (
      <View>
        <Text style={styles.listItem}>{this.props.bus.number}{this.props.bus.route}
        {this.props.bus.added}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  listItem: {
    margin: 11,
  }
});