import React from 'react';
import { AppRegistry, Platform } from 'react-native';
import { Button, Header } from 'react-native-elements';
import { createStackNavigator, createDrawerNavigator } from 'react-navigation';
import LoginScreen from './Screen/LoginScreen';
import ScoreScreen from './Screen/ScoreScreen';
import PastScoreScreen from './Screen/PastScoreScreen';
import EmptyClassroomScreen from './Screen/EmptyClassroomScreen';
import TimetableScreen from './Screen/TimetableScreen';

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
  },
  PastScore: {
    screen: PastScoreScreen,
    navigationOptions: {
      drawerLabel: "歷年成績",
    }
  },
  EmptyClassroom: {
    screen: EmptyClassroomScreen,
    navigationOptions: {
      drawerLabel: "空教室查詢",
    }
  },
  Timetable: {
    screen: TimetableScreen,
    navigationOptions: {
      drawerLabel: "個人課表",
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
          rightComponent={
            <Button
              clear
              icon={{
                name: 'person',
                color: '#fff'
              }}
              title=""
              onPress={() => { navigation.navigate('Login') }}
            />
          }
          // innerContainerStyles={{marginTop: Platform.OS === 'ios' ? 0 :  24}}
          // outerContainerStyles={{height: 70}}
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

AppRegistry.registerComponent('NTUSTappLite', () => App)



// Nav Arch:
// RootStack {
//   StackNav{
//     DrawerNav{
//       ScoreScreen,
//       PastScoreScreen
//     }
//   }
//   LoginScreen
// }