import React from 'react';
import { ListItem, Card, Text } from 'react-native-elements'
import { View, Button, AsyncStorage, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import Snackbar from 'react-native-snackbar';
import cheerio from 'cheerio';
import Login from '../utils/funcLogin'
import isLogin from '../utils/checkLogin'

export default class PastScoreScreen extends React.Component {

  constructor() {
    super();
    this.state = {
      refreshing: false,
      login: null,
      stuAccountData: {},
      stuScore: { score: [], rank_list: {}, score_history: [] }
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

  async updateScore() {
    this.setState({ refreshing: true });
    const logined = await isLogin();
    let fetchScore;
    if (logined.status) {
      console.log("Logined!!")
      fetchScore = fetch('https://stu255.ntust.edu.tw/ntust_stu/Query_Score.aspx', {
        method: 'GET',
        mode: 'cors',
        credentials: "include",
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:55.0) Gecko/20100101 Firefox/55.0',
        }
      });
    }
    else {
      Snackbar.show({
        title: '登入逾時了，重新登入個',
        duration: Snackbar.LENGTH_LONG,
      });
      fetchScore = Login(
        this.state.stuAccountData,
        (__VIEWSTATE) => {
          return fetch('https://stu255.ntust.edu.tw/ntust_stu/Query_Score.aspx', {
            method: 'GET',
            mode: 'cors',
            credentials: "include",
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:55.0) Gecko/20100101 Firefox/55.0',
            }
          });
        },
        // Failed
        () => { console.log("Failed Q_Q"); }
      )
    }

    return fetchScore
      .then((result) => result.text())
      .then((html) => {
        let $ = cheerio.load(html, { decodeEntities: false });

        let stuScore = {
          score: [],
          rank_list: {},
          score_history: {}
        };

        // current score
        $('table#Datagrid4 tr').each((i, elem) => {
          let tr = $(elem).find('td').toArray();
          if (i)  // if not header row
            stuScore.score.push({
              id: $(tr[1]).text().trim(),
              name: $(tr[2]).text().trim(),
              credit: $(tr[3]).text().trim(),
              score: $(tr[4]).text().trim(),
              note: $(tr[5]).text().trim(),
              type: $(tr[6]).text().trim()
            })
        });

        // past score
        $('table#DataGrid1 tr').each((i, elem) => {
          let tr = $(elem).find('td').toArray();
          if (i) {  // if not header row
            if (!($(tr[1]).text().trim() in stuScore.score_history))
              stuScore.score_history[$(tr[1]).text().trim()] = [] // init new semester
            stuScore.score_history[$(tr[1]).text().trim()].push({
              id: $(tr[2]).text().trim(),
              name: $(tr[3]).text().trim(),
              credit: $(tr[4]).text().trim(),
              score: $(tr[5]).text().trim(),
              note: $(tr[6]).text().trim(),
              type: $(tr[7]).text().trim()
            })
          }
        });

        let ranks = $("#score_list").find('font').html().split('<br>');

        ranks.forEach((rankStr, i) => {
          // Exapmle: 105　學年度第　1　學期學期年級(系)排名為第　64  　名，學期平均成績為：3.49  
          let regex = new RegExp(/(.+)學年度第(.+)學期學期.+\((.+)\)排名為第(.+)名，學期平均成績為：(.+)/);
          let result = regex.exec(rankStr);
          if (result) {
            result = result.map((str) => str.trim());
            let semester = `${result[1]}${result[2]}`,
              rankType = result[3],
              rankN = result[4],
              GPA = result[5];

            if (!(semester in stuScore.rank_list))  // init rank object
              stuScore.rank_list[semester] = { gpa: GPA, ranks: [] }

            stuScore.rank_list[semester].ranks.push({
              rankType: rankType,
              rankN: rankN
            })
          }
        });

        this.setState({ stuScore: stuScore, refreshing: false });
        AsyncStorage.setItem(
          '@NTUSTapp:stuScore',
          JSON.stringify(stuScore)
        );
      });
  }

  render() {
    let renderContext;

    if (this.state.login === true) {
      var scoreList = [];
      for (semester in this.state.stuScore.rank_list) {
        // push a tab
        scoreList.push(
          <ScrollView
            tabLabel={`${semester.slice(0,-1)}-${semester.slice(-1,)}`}
            key={semester}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={() => this.updateScore()}
              />
            }
          >
            {/* semester GPA & rank overview */}
            <Card
              key={semester}
              containerStyle={{ marginBottom: 10 }}
            >
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', margin: 10 }}>
                <View>
                  <Text h4 style={{ textAlign: 'center', }}>
                    {this.state.stuScore.rank_list[semester].gpa}
                  </Text>
                  <Text style={{ textAlign: 'center', }}>GPA</Text>
                </View>
                {
                  // show all type of rank
                  this.state.stuScore.rank_list[semester].ranks
                    .map((r, i) => (
                      <View key={i}>
                        <Text h4 style={{ textAlign: 'center', }}>
                          {r.rankN} 名
                      </Text>
                        <Text style={{ textAlign: 'center', }}>{r.rankType}排</Text>
                      </View>
                    ))
                }
              </View>
            </Card>
            {/* semester GPA & rank overview */}
            {
              // list of subjects
              this.state.stuScore['score_history'][semester].map((l, i) => (
                <ListItem
                  key={i}
                  title={l.name}
                  subtitle={l.id + "・" + l.credit + " 學分"}
                  badge={{ value: l.score }}
                />
              ))
            }
          </ScrollView>
        );
      }

      renderContext = (
        Object.keys(this.state.stuScore['score_history']).length !== 0 ?
          (<ScrollableTabView
            renderTabBar={() => <DefaultTabBar backgroundColor='rgb(255, 255, 255)' />}
          >
            {scoreList}
          </ScrollableTabView>)
          :
          (<View
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={() => this.updateScore()}
              />
            }>
            <Card>
              <Text>往下拉一下，讓你的成績載入進來</Text>
            </Card>
          </View>)
      )
    } else if (this.state.login === false) {
      renderContext = (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>還沒登入 Q_Q</Text>
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

    return (renderContext);
  }
}