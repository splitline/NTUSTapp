import React from 'react';
import { Platform } from 'react-native';
import { Button, Header } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { createStackNavigator, createDrawerNavigator } from 'react-navigation';
import LoginScreen from './Screen/LoginScreen'
import ScoreScreen from './Screen/ScoreScreen'

export default class App extends React.Component {
  render() {
    // AsyncStorage.clear() 
    return <RootStack />;
  }
}

const DrawerNav = createDrawerNavigator({
  Score: {
    screen: ScoreScreen,
    navigationOptions: {
      drawerLabel: "成績查詢",
    }
  }
});


const StackNav = createStackNavigator({
  Main: {
    screen: DrawerNav,
    navigationOptions: ({ navigation }) => ({
      header: (
        <Header
          leftComponent={
            <Button
              clear
              icon={{
                name: 'menu',
                color: '#fff'
              }}
              title=""
              onPress={() => { navigation.toggleDrawer() }}
            />
          }
          centerComponent={{ text: 'NTUSTapp', style: { color: '#fff', fontSize: 18 } }}
          innerContainerStyles={{marginTop: Platform.OS === 'ios' ? 0 :  24}}
          outerContainerStyles={{height: 70}}
        />
      ),
    }),
  }
});

const RootStack = createStackNavigator(
  {
    Stack: {
      screen: StackNav,
    },
    Login: {
      screen: LoginScreen,
    }
  },
  {
    mode: 'modal',
    headerMode: 'none',
  }
);

// Nav Arch:
// RootStack {
//   StackNav{
//     DrawerNav{
//       ScoreScreen,
//     }
//   }
//   LoginScreen
// }