import { httpApiUrl, wsApiUrl } from '../core/api';
import React, { Component } from 'react';
import { Provider } from './context';
import { getLogger } from "../core/utils";
import { AsyncStorage, NetInfo } from "react-native"

const log = getLogger('BusStorage');
var howMany = 2;
var start = -1 * howMany;
export class BusStorage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      busses: null,
      issue: null,
      token: null,
      emptyBack: false,
      emptyNext: false
    };

    const handle = (value) => {
      if (value.type === 'wifi') {
        this.uploadLocalToServer();
        alert('wifi');
      }
    }

    NetInfo.addEventListener('connectionChange', handle);
  }

  async componentDidMount() {
    log('componentDidMount');
    try {
      var tokenToAdd = await AsyncStorage.getItem('token');
      log(tokenToAdd)
      this.setState({ token: tokenToAdd, isLoading: false });
      //alert("token from store is: " + this.state.token);
      this.loadNext();
      this._interval2 = setInterval(() => {
        this.loadBusses()
      }, 2000)
      let a = await AsyncStorage.getItem('allBusses');
      log(JSON.parse(a));
    } catch (err) {
      log('eroare nebuna')
    }

    this.loadNext();
    // this.connectWs();
  }

  componentWillUnmount() {
    log('componentWillUnmount');
    // this.disconnectWs();
  }

  uploadLocalToServer = async () => {
    const localBusses = await AsyncStorage.getItem('localBus');
    const localBussesJson = JSON.parse(localBusses);
    if (localBussesJson != null) {
      for (let i = 0; i < localBussesJson.length; i++)
        this.addBus(localBussesJson[i].number, localBussesJson[i].route, localBussesJson[i].added);
    }
    await AsyncStorage.removeItem('localBus');
  }

  addBus = (number, route, added) => {
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

  loadNext = () => {
    start = start + howMany;
    this.setState({ isLoading: false, issue: null });
    NetInfo.isConnected.fetch().then(isConnected => {
      if (isConnected) {
        fetch(`${httpApiUrl}/api/v1/busses/bussesPaginated?start=${encodeURIComponent(start)}&howMany=${encodeURIComponent(howMany)}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': this.state.token
          }

        }).then(response => {
          log(response);
          if (JSON.parse(response._bodyText).length > 0) {
            this.setState({ isLoading: false, busses: JSON.parse(response._bodyText), emptyNext: false, emptyBack: false });
          }
          else {
            this.setState({ emptyNext: true, emptyBack: false });
          }
        }).catch(error => { })
      }
      else {
        this.loadNextLocal();  
      }
    })
  }

  loadNextLocal = async () => {
    const busses = [];   

    const allBusses = await AsyncStorage.getItem('allBusses');
    const allJson = JSON.parse(allBusses);

    for(let i=0;i<allJson.length;i++){
      busses.push(allJson[i]);
    }

    const localBusses = await AsyncStorage.getItem('localBus');
    const localBussesJson = JSON.parse(localBusses);

    if(localBussesJson!=null)
      for(let i=0;i<localBussesJson.length;i++){
        busses.push(localBussesJson[i]);  
      }

    //alert(moviesArray);
    const aa = JSON.stringify(busses);  
    const busses2 = JSON.parse(aa);

    /*for(let i=0;i<movies2.length;i++){
      if(i==0){
        alert(movies2[i]);     
      }
    }*/
    let newBusses = [];

    let end = start + howMany;
   
    //alert(end + " " + flowers2.length)
    if(end<=busses2.length) {   

      for(let i=start;i<end;i++) {
        let number = busses2[i].number; 
        let route = busses2[i].route;
        let added=busses2[i].added;
        newBusses.push({number,route,added});
      }
      
      //alert(newFlowers)
      this.setState({ isLoading: false,  busses: newBusses, emptyNext: false, emptyBack: false});
      //alert("inauntru");
    }
    else {     

      end = start + (busses2.length%howMany);
      for(let i=start;i<end;i++) {
        let number = busses2[i].number; 
        let route = busses2[i].route;
        let added=busses2[i].added;
        newBusses.push({number,route,added});
      }
      
    
      this.setState({ isLoading: false,  busses: newBusses, emptyNext: true, emptyBack: false});
    }

  }

  loadPreviousLocal = async () => {
  const busses = [];   

    const allBusses = await AsyncStorage.getItem('allBusses');
    const allJson = JSON.parse(allBusses);

    for(let i=0;i<allJson.length;i++){
      busses.push(allJson[i]);
    }

    const localBusses = await AsyncStorage.getItem('localBus');
    const localBussesJson = JSON.parse(localBusses);

    if(localBussesJson!=null)
      for(let i=0;i<localBussesJson.length;i++){
        busses.push(localBussesJson[i]);  
      }

    //alert(moviesArray);
    const aa = JSON.stringify(busses);  
    const busses2 = JSON.parse(aa); 
    let newBusses = [];

    let end = start + howMany;
  
    if(start>=0) {  

      for(let i=start;i<end;i++) {
        let number = busses2[i].number;
        let route = busses2[i].route;
        let added=busses2[i].added;
        newBusses.push({number,route,added});
      }
      
      if(start==0) {
        this.setState({ isLoading: false,  busses: newBusses, emptyNext: false, emptyBack: true});
      } else {
        this.setState({ isLoading: false,  busses: newBusses, emptyNext: false, emptyBack: false});
      }
    }
  }

  loadPrevious = () => {
    start = start - howMany;

    NetInfo.isConnected.fetch().then(isConnected => {
      if (isConnected) {
    this.setState({ isLoading: false, issue: null });
    fetch(`${httpApiUrl}/api/v1/busses/bussesPaginated?start=${encodeURIComponent(start)}&howMany=${encodeURIComponent(howMany)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.state.token
      }

    }).then(response => {
      if (start >= 0) {
        this.setState({ isLoading: false, busses: JSON.parse(response._bodyText), emptyNext: false, emptyBack: false });
      }
      else {
        this.setState({ emptyNext: false, emptyBack: true });
      }
    }).catch(error => this.setState({ isLoading: false, issue: error }))
  }
  else{
    this.loadPreviousLocal();
  }})

  }

  setAllBussesOnStorage = async (response) => {
    let busses = JSON.parse(response._bodyText);
    let newBusses = [];
    for (let i = 0; i < busses.length; i++) {
      let number = busses[i].number;
      let route = busses[i].route;
      let added = busses[i].added;
      newBusses.push({ number, route, added });
    }

    await AsyncStorage.setItem('allBusses', JSON.stringify(newBusses));
  }

  loadBusses = () => {
    this.setState({ isLoading: false, issue: null });
    fetch(`${httpApiUrl}/api/v1/busses`, {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.state.token
      }
    })
      .then(response => {
        this.setAllBussesOnStorage(response);
      })
      .catch(error => { })
  };

  render() {
    return (
      <Provider value={{ state: this.state, next: this.loadNext, previous: this.loadPrevious }}>

        {this.props.children}
      </Provider>
    );
  }
}
