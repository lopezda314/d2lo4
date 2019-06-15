import React from 'react';
import './App.css';

interface State {
  value: any;
}

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <Gameboard />
      </header>
    </div>
  );
}

interface GameboardProps {
}

interface GameboardState {
  problems: number[][];
  solutions: string[];
  problem: number;
  currentNumber: number;
  currentOperation: string;
}

class Gameboard extends React.Component<GameboardProps, GameboardState> {
  constructor(props: GameboardProps) {
    super(props);
    this.state = {
      problems: [[1, 1, 1, 8]],
      solutions: ["(1+1+1)*8"],
      problem: 0,
      currentNumber: 0,
      currentOperation: ""
    };
  }

  loadProblems() {
    this.readTextFile("../solvables.txt", this.state.problems);
  }

  loadSolutions() {
    this.readTextFile("../solutions.txt", this.state.solutions);
  }


  readTextFile(file: string, state: GameboardState["problems"] | GameboardState["solutions"]) {
    const rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status === 0) {
                const textLines = rawFile.responseText.split(/\n/);
                if (state === this.state.solutions) {
                  this.setState({
                      solutions: textLines,
                      problem: Math.floor((Math.random() * textLines.length) + 1)
                  });
                }
                if (state === this.state.problems) {
                  this.setState({
                      problems: textLines.map((line) => {
                        return line.split(' ').map(Number);
                      }),
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
    const currentProblem = this.state.problems[this.state.problem];
    return (
      <div className="main">
        <div className="operationSymbolRow">
          <OperationButton operationSymbol={"+"} />
          <OperationButton operationSymbol={"-"} />
          <OperationButton operationSymbol={"x"} />
          <OperationButton operationSymbol={"÷"} />
        </div>
        <div className="topNumberSymbolRow">
          <NumberButton numberSymbol={currentProblem[0]}/>
        </div>
        <div className="middleNumberSymbolRow">
          <NumberButton numberSymbol={currentProblem[1]}/>
          <NumberButton numberSymbol={currentProblem[2]}/>
        </div>
        <div className="bottomNumberSymbolRow">
          <NumberButton numberSymbol={currentProblem[3]}/>
        </div>
        <div className="progress">
          {this.state.currentNumber}
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
