import React from 'react';
import { List, ListItem, Card, Text, Divider } from 'react-native-elements'
import { View, Button, AsyncStorage, ScrollView, ActivityIndicator } from 'react-native';
import RefreshView from 'react-native-pull-to-refresh';

export default class PastScoreScreen extends React.Component {
  static navigationOptions = {
    drawerLabel: "歷年成績",
  };
  constructor() {
    super();
    this.state = {
      login: null,
      stuAccountData: {},
      stuScore: { score: [], rank_list: [], score_history: [] }
    };
  }

  readAccountData() {
    AsyncStorage.multiGet(['@NTUSTapp:StuAccountData', '@NTUSTapp:stuScore']).then(response => {
      if (response[0][1] != null && response[0][1] != '') {
        this.setState({ login: true, stuAccountData: JSON.parse(response[0][1]) });
        if (response[1][1] != null) {
          this.setState({ stuScore: JSON.parse(response[1][1]) });
        }
      } else {
        this.setState({ login: false, stuAccountData: {} });
      }
    });
  }

  componentWillMount() {
    this.readAccountData();
  }

  updateScore() {
    return fetch('https://ntuster.herokuapp.com/api/score/', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.state.stuAccountData),
    })
      .then((response) => {
        return response.json();
      })
      .catch((error) => {

      })
      .then((res) => {
        this.setState({ stuScore: res })
        AsyncStorage.setItem(
          '@NTUSTapp:stuScore',
          JSON.stringify(res)
        );
      });
  }

  render() {
    const gpList = {
      'A+': 4.3,
      'A': 4,
      'A-': 3.7,
      'B+': 3.3,
      'B': 3.0,
      'B-': 2.7,
      'C+': 2.3,
      'C': 2,
      'C-': 1.7,
      'D': 1,
      'E': 0,
      'X': 0
    }

    var renderContext;

    if (this.state.login === true) {
      // const nowSubjectNum = this.state.stuScore['score_history'].reduce((a, b) => a + (b['score_history'] in gpList), 0),
      //   totalSubjectNum = this.state.stuScore['score_history'].length,
      //   nowCredit = this.state.stuScore['score_history'].reduce((a, b) => a + (parseInt(b['credit']) * (b['score_history'] in gpList)), 0),
      //   totalCredit = this.state.stuScore['score_history'].reduce((a, b) => a + parseInt(b['credit']), 0),
      //   GPA = this.state.stuScore['score_history'].reduce((a, b) => a + (parseInt(b['credit']) * ((b['score_history'] in gpList) && gpList[b['score_history']])), 0) / nowCredit;
      var scoreList = [];
      for (semester in this.state.stuScore['score_history']) {
        scoreList.push(<Text key={semester} style={{ margin: 10 }}>{semester}</Text>)
        scoreList.push(
          this.state.stuScore['score_history'][semester].map((l, i) => (
            <ListItem
              key={i}
              title={l.name}
              subtitle={l.id + "・" + l.credit + " 學分"}
              badge={{ value: l.score }}
            />
          ))
        )
      }

      renderContext = (
        <RefreshView onRefresh={() => this.updateScore()}>
          {Object.keys(this.state.stuScore['score_history']).length !== 0 ?
            <ScrollView>
              {scoreList}
            </ScrollView>
            :
            (<Card>
              <Text>往下拉一下，讓你的成績載入進來</Text>
            </Card>)
          }
        </RefreshView>
      )
    } else if (this.state.login === false) {
      renderContext = (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>還沒登入 QQ</Text>
          <Button
            onPress={() => this.props.navigation.navigate('Login')}
            title="登入"
          />
        </View>
      )
    } else {
      renderContext = (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      )
    }

    return (
      renderContext
    );
  }
}