import React from 'react';
import './App.css';

interface State {
  value: any;
}

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <Gameboard numbers={[1,1,1,8]} />
      </header>
    </div>
  );
}

interface GameboardProps {
  numbers: number[];
}

interface GameboardState {
  problems: number[][];
  solutions: string[];
}

class Gameboard extends React.Component<GameboardProps, GameboardState> {
  constructor(props: GameboardProps) {
    super(props);
    this.state = {
      problems: [[1, 1, 1, 8]],
      solutions: ["(1+1+1)*8"]
    };
  }

  loadProblems() {
    this.readTextFile("../solvables.txt", this.state.problems);
  }

  loadSolutions() {
    this.readTextFile("../solutions.txt", this.state.solutions);
  }


  readTextFile(file: string, state: GameboardState["problems"] | GameboardState["solutions"]) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status === 0) {
                var allText = rawFile.responseText;
                if (state === this.state.solutions) {
                  this.setState({
                      problems: this.state.problems,
                      solutions: allText.split(/\n/)
                  });
                }
                if (state === this.state.problems) {
                  this.setState({
                      problems: allText.split(/\n/).map((line) => {
                        return line.split(' ').map(Number);
                      }),
                      solutions: this.state.solutions
                  });
                }
            }
        }
    };
    rawFile.send(null);
  }

  componentDidMount(){
    this.loadProblems();
    this.loadSolutions();
  }

  render() {
    return (
      <div className="main">
        <div className="operationSymbolRow">
          <OperationButton operationSymbol={"+"} />
          <OperationButton operationSymbol={"-"} />
          <OperationButton operationSymbol={"x"} />
          <OperationButton operationSymbol={"÷"} />
        </div>
        <div className="topNumberSymbolRow">
          <NumberButton numberSymbol={this.state.problems[this.state.problems.length -1][0]}/>
        </div>
        <div className="middleNumberSymbolRow">
          <NumberButton numberSymbol={this.state.problems[this.state.problems.length -1][1]}/>
          <NumberButton numberSymbol={this.state.problems[this.state.problems.length -1][2]}/>
        </div>
        <div className="bottomNumberSymbolRow">
          <NumberButton numberSymbol={this.state.problems[this.state.problems.length -1][3]}/>
        </div>
      </div>
    );
  }
}

interface OperationProps {
  operationSymbol: string;
}

class OperationButton extends React.Component<OperationProps, State> {
 constructor(props: OperationProps) {
  super(props);
  this.state = {
    value: null,
  }
 }

  handleButtonPress() {
    alert(this.props.operationSymbol);
  }

 render() {
  return (
    <button onClick={() => this.handleButtonPress()} className="operationSymbol">
      {this.props.operationSymbol}
    </button>
  )
 } 
}

interface NumberProps {
  numberSymbol: number;
}

class NumberButton extends React.Component<NumberProps, State> {
 constructor(props: NumberProps) {
  super(props);
  this.state = {
    value: null,
  }
 }

  handleButtonPress() {
    alert(this.props.numberSymbol);
  }

 render() {
  return (
    <button onClick={() => this.handleButtonPress()} className="numberSymbol">
      {this.props.numberSymbol}
    </button>
  )
 } 
}

export default App;
