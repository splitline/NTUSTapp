import React from 'react';
import { AppRegistry, Platform } from 'react-native';
import { Button, Header } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons'
import { createStackNavigator, createDrawerNavigator, } from 'react-navigation';

// Screens
import LoginScreen from './Screen/LoginScreen';
import ScoreScreen from './Screen/ScoreScreen';
import PastScoreScreen from './Screen/PastScoreScreen';
import EmptyClassroomScreen from './Screen/EmptyClassroomScreen';
import TimetableScreen from './Screen/TimetableScreen';
import AboutScreen from './Screen/AboutScreen';
import CourseTrackerScreen from './Screen/CourseTrackerScreen';

import DrawerComponent from './utils/DrawerComponent';

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
      drawerIcon: ({ tintColor }) => <Icon name="insert-chart" size={24} style={{ color: tintColor }} />
    }
  },
  PastScore: {
    screen: PastScoreScreen,
    navigationOptions: {
      drawerLabel: "歷年成績",
      drawerIcon: ({ tintColor }) => <Icon name="show-chart" size={24} style={{ color: tintColor }} />
    }
  },
  EmptyClassroom: {
    screen: EmptyClassroomScreen,
    navigationOptions: {
      drawerLabel: "空教室查詢",
      drawerIcon: ({ tintColor }) => <Icon name="room" size={24} style={{ color: tintColor }} />
    }
  },
  Timetable: {
    screen: TimetableScreen,
    navigationOptions: {
      drawerLabel: "個人課表",
      drawerIcon: ({ tintColor }) => <Icon name="event" size={24} style={{ color: tintColor }} />
    }
  },
  CourseTracker: {
    screen: CourseTrackerScreen,
    navigationOptions: {
      drawerLabel: "選課人數追蹤",
      drawerIcon: ({ tintColor }) => <Icon name="center-focus-weak" size={24} style={{ color: tintColor }} />
    }
  },
  About: {
    screen: AboutScreen,
    navigationOptions: {
      drawerLabel: "關於",
    }
  }
}, {
    contentComponent: props =>
      <DrawerComponent {...props} />
  });


const RootStack = createStackNavigator(
  {
    // Main
    Main: {
      screen: DrawerNav,
      navigationOptions: ({ navigation }) => ({
        // header start
        header: (
          <Header
            outerContainerStyles={{
              borderBottomWidth: 0,
              elevation: 5,
            }}
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
          />
        ),
        // header end
      }),
    },

    // Login
    Login: {
      screen: LoginScreen,
      navigationOptions: {
        header: null,
        gesturesEnabled: true,
      }
    }
  },
  {
    mode: 'modal'
  }
);

AppRegistry.registerComponent('NTUSTappLite', () => App)



// Nav Arch:
// RootStack {
//   StackNav{
//     DrawerNav{
//       ScoreScreen,
//       PastScoreScreen,
//       ...
//     }
//   }
//   LoginScreen
// }