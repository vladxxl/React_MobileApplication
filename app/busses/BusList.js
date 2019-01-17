import React, { Component } from 'react';
import { Text, View, TextInput, Button, AsyncStorage, NetInfo, Modal } from 'react-native';
import styles from '../core/styles';
import { getLogger, issueToText } from '../core/utils';
import { BusView } from "./BusView";
import { Consumer } from './context';
import email from 'react-native-email'
const log = getLogger('BusList');
import { httpApiUrl, wsApiUrl } from '../core/api';

import { PieChart } from 'react-native-svg-charts'

export class BusList extends Component {
  constructor(props) {
    super(props);
    this.state = { number: '', route: '', token: '',modalVisible: false }
    //log("astea sunt autobuzele: "+context.state.busses);
    log('constructor');
    this.array=[];
    this.array2=[];
    this.data=[];
    const handle=(value)=>{
      if(value.type==='wifi')
      {
        this.array=[];
        this.array2=[];
      }
    }
    NetInfo.addEventListener('connectionChange',handle);
    this.setAllLocal();
  }

  async componentDidMount() {
    log('componentDidMount buslist');
    try {
      var tokenToAdd = await AsyncStorage.getItem('token');
      log(tokenToAdd)
      this.setState({ token: tokenToAdd });
     // alert("token from store is: " + this.state.token)
    } catch (err) {
      log('eroare nebuna')
    }
  }

  addBus = () => {
    var number = this.state.number;
    var route = this.state.route;
    var added = false;

    const entity={
      key:route,
      amount:number
    }
    this.data.push(entity);

    NetInfo.isConnected.fetch().then(isConnected => {
      if (isConnected) {
        fetch(`${httpApiUrl}/api/v1/busses`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': this.state.token
          },
          body: JSON.stringify({ number, route, added })
        })
          .then(response => {
            log(response)
          })
          .catch(error => { })
      }
      else {
        this.saveLocalBus(number, route, added);
        this.saveAllBussesLocal(number,route,added);
      }
    })
  }

  saveLocalBus=async(number,route,added)=>{
    const bus={
      number:number,
      route:route,
      added:added
    }
    this.array.push(bus);
    await AsyncStorage.setItem('localBus',JSON.stringify(this.array));

  }

  setAllLocal=async()=>{
    const allBusses=await AsyncStorage.getItem('allBusses');
    //alert(allBusses);
    const allBussesJson=JSON.parse(allBusses);
    if(allBussesJson!=null)
      for(let i=0;i<allBussesJson.length;i++)
      {
        this.array2.push(allBussesJson[i]);
      }
  }

  saveAllBussesLocal=async(number,route,added)=>{
    const bus={
      number:number,
      route:route,
      added:added
    }
    this.array2.push(bus);
    await AsyncStorage.setItem('allBusses',JSON.stringify(this.array2));
    const localBus=await AsyncStorage.getItem('allBusses');
    const localBusJson=JSON.parse(localBus);
    alert(localBusJson);

  }

  handleEmail = () => {
    var number=this.state.number;
    var route=this.state.route
    const to = ['birsanvlad@gmail.com'] // string or array of email addresses
    email(to, {
        // Optional additional arguments
        subject: 'Produs', // string or array of email addresses
        body: 'Comanda plasata :' + new Date() + '\nDenumire produs: '+route+" ,Cantitate: "+number+".\nVa urma sa fiti contactat pentru detalii."+"\nComanda numarul: "+parseInt(Math.random()*10000)
    }).catch(console.error)
}

setModalVisible=(visible)=>{
  this.setState({modalVisible: visible});
}

  render() {
    const Labels = ({ slices, height, width }) => {
      return slices.map((slice, index) => {
          const { labelCentroid, pieCentroid, data } = slice;
          return (
              <Text
                  key={index}
                  x={pieCentroid[ 0 ]}
                  y={pieCentroid[ 1 ]}
                  fill={'white'}
                  textAnchor={'middle'}
                  alignmentBaseline={'middle'}
                  fontSize={24}
                  stroke={'black'}
                  strokeWidth={0.2}
              >
                  {data.key}{" "}{data.amount}
              </Text>
          )
      })
  }

    return (
      <Consumer>
        {(context) => (
          <View style={styles.content}>
            <Text>Number</Text>
            <TextInput style={{ height: 40 }}
              onChangeText={(number) => this.setState({ number })} />
            <Text>Product</Text>
            <TextInput style={{ height: 40 }}
              onChangeText={(route) => this.setState({ route })} />
            <Button
              onPress={this.addBus}
              title="Add"
            />
            <Button
              onPress={context.next}
              disabled={context.state.emptyNext}
              title="Next"
            />
            <Button
              onPress={context.previous}
              disabled={context.state.emptyBack}
              title="Previous"
            />
            <Button 
              onPress={this.handleEmail}
              title="Send command"
            />
            <Modal
              animationType="slide"
              transparent={false}
              visible={this.state.modalVisible}
              onRequestClose={() => {
                Alert.alert('Modal has been closed.');
              }}>
              <View style={{marginTop: 22}}>
                  <Text style={{margin: 10, fontWeight: "bold", fontSize: 20}}>Current chart:</Text>

                  <PieChart
                      style={{ height: 200 }}
                      valueAccessor={({ item }) => (item.key ,item.amount)}
                      data={this.data}
                      spacing={0}
                      outerRadius={'95%'}
                  >
                      <Labels/>
                  </PieChart>

                  <Button
                    onPress={() => {this.setModalVisible(!this.state.modalVisible);}}
                    title="OK"
                  />
              </View>
            </Modal>
            <Button 
              onPress={() => { this.setModalVisible(true);}}
              title="Display chart"
            />
            <Text style={{margin: 10, fontWeight: "bold", fontSize: 20}}>List:</Text>
            {context.state.busses && context.state.busses.map(bus => <BusView key={bus.number} bus={bus} />)}
          </View>

        )}
      </Consumer>
    )
  }
}
