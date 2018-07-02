import React from 'react';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { createStackNavigator, createDrawerNavigator } from 'react-navigation';
import LoginScreen from './Screen/LoginScreen'
import ScoreScreen from './Screen/ScoreScreen'

export default class App extends React.Component {
  render() {
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
      headerTitle: "NTUSTapp",
      headerTitleStyle: {
        alignSelf: 'center',
      },
      headerLeft: (
        <Button
          clear
          icon={{
            name: 'bars',
            type: 'font-awesome',
            color: '#666666'
          }}
          title=""
          onPress={() => { navigation.toggleDrawer() }}
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