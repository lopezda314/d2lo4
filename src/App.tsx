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
  hasStartedProblem: boolean;
  disabled: any;
}

class Gameboard extends React.Component<GameboardProps, GameboardState> {
  constructor(props: GameboardProps) {
    super(props);
    this.state = {
      problems: [[1, 1, 1, 8]],
      solutions: ["(1+1+1)*8"],
      problem: 0,
      currentNumber: 0,
      currentOperation: "",
      hasStartedProblem: true,
      disabled: new Set(),
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

  handleNumberPress(index: number) {
    if (!this.state.hasStartedProblem) {
      this.setState({hasStartedProblem: true});
    }
    if (this.state.disabled.has(index)) {
      return;
    }
    this.setState({disabled: this.state.disabled.add(index)});
    const buttonPressed = this.state.problems[this.state.problem][index];
    if (!this.state.currentOperation) {
      this.setState({currentNumber: buttonPressed});
      return;
    }
    if (this.state.currentOperation === "+") {
      this.setState({currentNumber: buttonPressed + this.state.currentNumber, currentOperation: ""});
      return;
    }
    if (this.state.currentOperation === "-") {
      this.setState({currentNumber: this.state.currentNumber - buttonPressed, currentOperation: ""});
      return;
    }
    if (this.state.currentOperation === "x") {
      this.setState({currentNumber: buttonPressed * this.state.currentNumber, currentOperation: ""});
      return;
    }
    if (this.state.currentOperation === "÷") {
      if (buttonPressed === 0) {
        return;
      } 
      if (this.state.currentNumber / buttonPressed !== Math.floor(this.state.currentNumber / buttonPressed)) {
        return;
      }
      this.setState({currentNumber: this.state.currentNumber / buttonPressed, currentOperation: ""});
      return;
    }
  }

  handleOperationPress(buttonPressed: string) {
    if (!this.state.hasStartedProblem) {
      return;
    }
    this.setState({currentOperation: buttonPressed});
  }

  clearProgress() {
    this.setState({currentNumber: 0, currentOperation: "", disabled: new Set()});
  }

  render() {
    const currentProblem = this.state.problems[this.state.problem];
    return (
      <div className="main">
        <button className="clearProgress" onClick={() => this.clearProgress()}>
          C
        </button>
        <div className="operationSymbolRow">
          <OperationButton operationSymbol={"+"} onClick={() => this.handleOperationPress("+")} />
          <OperationButton operationSymbol={"-"} onClick={() => this.handleOperationPress("-")} />
          <OperationButton operationSymbol={"x"} onClick={() => this.handleOperationPress("x")} />
          <OperationButton operationSymbol={"÷"} onClick={() => this.handleOperationPress("÷")} />
        </div>
        <div className="topNumberSymbolRow">
          <NumberButton numberSymbol={currentProblem[0]} onClick={() => this.handleNumberPress(0)} />
        </div>
        <div className="middleNumberSymbolRow">
          <NumberButton numberSymbol={currentProblem[1]} onClick={() => this.handleNumberPress(1)} />
          <NumberButton numberSymbol={currentProblem[2]} onClick={() => this.handleNumberPress(2)} />
        </div>
        <div className="bottomNumberSymbolRow">
          <NumberButton numberSymbol={currentProblem[3]} onClick={() => this.handleNumberPress(3)} />
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
  onClick: any;
}

class OperationButton extends React.Component<OperationProps, State> {
 constructor(props: OperationProps) {
  super(props);
  this.state = {
    value: null,
  }
 }

 render() {
  return (
    <button onClick={this.props.onClick} className="operationSymbol">
      {this.props.operationSymbol}
    </button>
  )
 } 
}

interface NumberProps {
  numberSymbol: number;
  onClick: any;
}

class NumberButton extends React.Component<NumberProps, State> {
 constructor(props: NumberProps) {
  super(props);
  this.state = {
    value: null,
  }
 }

 render() {
  return (
    <button onClick={this.props.onClick} className="numberSymbol">
      {this.props.numberSymbol}
    </button>
  )
 } 
}

export default App;
