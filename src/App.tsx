import React from 'react';
import seedrandom from 'seedrandom'
import './App.css';

const random: () => number = seedrandom('1234');

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

interface GameboardProps {}

interface GameboardState {
  problems: number[][];
  solutions: string[];
  problem: number;
  originalProblem: number[];
  currentNumberIndex: number;
  currentOperation: string;
  disabled: any;
  currentRNG: any;
}

class Gameboard extends React.Component<GameboardProps, GameboardState> {
  constructor(props: GameboardProps) {
    super(props);
    this.state = {
      problems: [[1, 1, 1, 8]],
      solutions: ["(1+1+1)*8"],
      problem: 0,
      originalProblem: [],
      currentNumberIndex: -1,
      currentOperation: "",
      disabled: new Set(),
      currentRNG: random,
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
                  });
                }
                if (state === this.state.problems) {
                  const problemIndex = Math.floor((this.state.currentRNG() * textLines.length));
                  const problems = textLines.map((line) => {
                        return line.split(' ').map(Number);
                      });
                  this.setState({
                      problems: problems,
                      problem: problemIndex,
                      originalProblem: Array.from(problems[problemIndex]),
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

  clearProgress() {
    const oldProblems = this.state.problems;
    oldProblems[this.state.problem] = Array.from(this.state.originalProblem);
    this.setState({currentNumberIndex: -1, currentOperation: "", disabled: new Set(), problems: oldProblems});
  }

  skipProblem() {
    this.clearProgress();
    const nextProblem = Math.floor(this.state.currentRNG() * this.state.problems.length);
    this.setState({problem: nextProblem, originalProblem: Array.from(this.state.problems[nextProblem])});
  }

  showSolution() {
    alert(this.state.solutions[this.state.problem]);
  }

  handleNumberPress(index: number) {
    if (this.state.disabled.has(index)) {
      return;
    }
    if (this.state.currentNumberIndex >= 0 && this.state.currentNumberIndex === index) {
      return;
    }
    const buttonPressed = this.state.problems[this.state.problem][index];
    if (!this.state.currentOperation) {
      this.setState({currentNumberIndex: index});
      return;
    }
    const numberInMemory = this.state.problems[this.state.problem][this.state.currentNumberIndex]
    const disabled = new Set(this.state.disabled).add(this.state.currentNumberIndex);
    if (this.state.currentOperation === "+") {
      const problems = this.state.problems;
      problems[this.state.problem][index] = numberInMemory + buttonPressed;
      this.setState({problems: problems, currentOperation: "", disabled: disabled, currentNumberIndex: index});
      this.checkWin(disabled.size, numberInMemory + buttonPressed);
      return;
    }
    if (this.state.currentOperation === "-") {
      const problems = this.state.problems;
      problems[this.state.problem][index] = numberInMemory - buttonPressed;
      this.setState({problems: problems, currentOperation: "", disabled: disabled, currentNumberIndex: index});
      this.checkWin(disabled.size, numberInMemory - buttonPressed);
      return;
    }
    if (this.state.currentOperation === "x") {
      const problems = this.state.problems;
      problems[this.state.problem][index] = numberInMemory * buttonPressed;
      this.setState({problems: problems, currentOperation: "", disabled: disabled, currentNumberIndex: index});
      this.checkWin(disabled.size, numberInMemory * buttonPressed);
      return;
    }
    if (this.state.currentOperation === "÷") {
      if (buttonPressed === 0) {
        this.setState({currentOperation: "", currentNumberIndex: -1});
        return;
      }
      const quotient = numberInMemory / buttonPressed;
      // Only let whole numbers or numbers that end in through 1/4, 1/2, 3/4
      if (quotient !== Math.floor(quotient) && (quotient - Math.floor(quotient)) !== 0.25 && (quotient - Math.floor(quotient)) !== 0.5 && (quotient - Math.floor(quotient)) !== .75) {
        this.setState({currentOperation: "", currentNumberIndex: -1});
        return;
      }
      const problems = this.state.problems;
      problems[this.state.problem][index] = numberInMemory / buttonPressed;
      this.setState({problems: problems, currentOperation: "", disabled: disabled, currentNumberIndex: index});
      this.checkWin(disabled.size, numberInMemory / buttonPressed);
      return;
    }
  }

  checkWin(numbersDisabled: number, currentNumber: number) {
    if (numbersDisabled === 3 && currentNumber === 24) {
      alert("you win!");
      const nextProblem = Math.floor(this.state.currentRNG() * this.state.problems.length);
      this.setState({
        problem: nextProblem, 
        originalProblem: Array.from(this.state.problems[nextProblem])
        });
      this.clearProgress();
    }
  }

  handleOperationPress(buttonPressed: string) {
    if (this.state.currentNumberIndex < 0) {
      return;
    }
    this.setState({currentOperation: buttonPressed});
  }

  render() {
    const currentProblem = this.state.problems[this.state.problem];
    return (
      <div className="main">
        <div className="metaButtons">
          <button onTouchStart={() => {}} className="metaProblemButton" onClick={() => this.clearProgress()}>
            Clear
          </button>
          <button onTouchStart={() => {}} className="metaProblemButton" onClick={() => this.skipProblem()}>
            Skip
          </button>
          <button onTouchStart={() => {}} className="metaProblemButton" onClick={() => this.showSolution()}>
            Help
          </button>
        </div>
        <div className="operationSymbolRow">
          <OperationButton operationSymbol={"+"} onClick={() => this.handleOperationPress("+")} />
          <OperationButton operationSymbol={"-"} onClick={() => this.handleOperationPress("-")} />
          <OperationButton operationSymbol={"x"} onClick={() => this.handleOperationPress("x")} />
          <OperationButton operationSymbol={"÷"} onClick={() => this.handleOperationPress("÷")} />
        </div>
        <div className="topNumberSymbolRow">
          <NumberButton numberSymbol={currentProblem[0]} onClick={() => this.handleNumberPress(0)} disabled={this.state.disabled.has(0)} />
        </div>
        <div className="middleNumberSymbolRow">
          <NumberButton numberSymbol={currentProblem[1]} onClick={() => this.handleNumberPress(1)} disabled={this.state.disabled.has(1)} />
          <NumberButton numberSymbol={currentProblem[2]} onClick={() => this.handleNumberPress(2)} disabled={this.state.disabled.has(2)} />
        </div>
        <div className="bottomNumberSymbolRow">
          <NumberButton numberSymbol={currentProblem[3]} onClick={() => this.handleNumberPress(3)} disabled={this.state.disabled.has(3)} />
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
    <button onTouchStart={() => {}} onClick={this.props.onClick} className="operationSymbol">
      {this.props.operationSymbol}
    </button>
  )
 } 
}

interface NumberProps {
  numberSymbol: number;
  onClick: any;
  disabled: boolean;
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
    <button onTouchStart={() => {}} onClick={this.props.onClick} className={this.props.disabled ? "numberSymbolDisabled" : "numberSymbol"}>
      {this.props.numberSymbol}
    </button>
  )
 }
}

export default App;
