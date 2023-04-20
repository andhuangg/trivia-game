import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Header from '../components/Header';
import './Game.css';
import { incrementScore } from '../redux/actions/action';
import calculateScore from '../utils/calculateScore';

const RANDOM_SORT = 0.5;
const TOKEN_EXPIRED = 3;

class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      questions: [],
      currentQuestionIndex: 0,
      selectedAnswer: null,
      timer: 30,
      allAnswers: [],
    };
  }

  componentDidMount() {
    this.fetchQuestions();
    this.handleTimer();
  }

  componentDidUpdate(_, prevState) {
    const { timer } = this.state;
    if (timer !== prevState.timer && prevState.timer !== 1) {
      this.handleTimer();
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  randomAnswers = () => {
    const { currentQuestionIndex, questions } = this.state;

    const question = questions[currentQuestionIndex];

    this.setState({
      allAnswers: [
        ...question.incorrect_answers,
        question.correct_answer,
      ].sort(() => Math.random() - RANDOM_SORT),
    });
  };

  handleTimer = () => {
    const ONE_SECOND_INTERVAL = 1000;

    this.timeout = setTimeout(() => {
      this.setState((prevState) => ({
        timer: prevState.timer - 1,
      }));
    }, ONE_SECOND_INTERVAL);
  };

  fetchQuestions = async () => {
    const { history } = this.props;

    const token = localStorage.getItem('token');
    const response = await fetch(
      `https://opentdb.com/api.php?amount=5&token=${token}`,
    );
    const data = await response.json();

    // Verifica se o token é inválido e redireciona para a tela de login se for
    if (data.response_code === TOKEN_EXPIRED) {
      localStorage.removeItem('token');
      history.push('/');
    } else {
      this.setState(({ questions: data.results }), () => this.randomAnswers());
    }
  };

  // Atualiza o state 'selectedAnswer' com a resposta clicada.
  handleAnswerClick = (answer) => {
    const { questions, currentQuestionIndex, timer } = this.state;
    const { dispatch } = this.props;
    this.setState({ selectedAnswer: answer });
    if (questions[currentQuestionIndex].correct_answer === answer) {
      const CURR_SCOR = calculateScore(questions[currentQuestionIndex].difficulty, timer);
      dispatch(incrementScore(CURR_SCOR));
    } else {
      console.log('vc errou');
    }
  };

  // Retorna a classe CSS para uma opção de resposta com base na selecionada.
  getAnswerClassName = (answer, correctAnswer) => {
    const { selectedAnswer } = this.state;

    if (!selectedAnswer) {
      return '';
    }
    return answer === correctAnswer ? 'green' : 'red';
  };

  render() {
    const { questions, allAnswers, timer, currentQuestionIndex } = this.state;

    if (questions.length === 0) {
      return <p>Carregando...</p>;
    }

    const answerClassName = (answer) => this
      .getAnswerClassName(answer, questions[currentQuestionIndex].correct_answer);

    return (
      <div>
        <Header />
        <section>
          <div data-testid="question-category">
            {
              questions[currentQuestionIndex].category
            }

          </div>
          <div data-testid="question-text">
            {
              questions[currentQuestionIndex].question
            }

          </div>
          {allAnswers.map((answer, index) => (
            <div key={ index } data-testid="answer-options">
              <button
                className={ answerClassName(answer) }
                onClick={ () => this.handleAnswerClick(answer) }
                disabled={ timer === 0 }
                data-testid={
                  answer === questions[currentQuestionIndex].correct_answer
                    ? 'correct-answer'
                    : `wrong-answer-${index}`
                }
              >
                {answer}
              </button>
            </div>
          ))}
        </section>
        <section>
          <h1>{timer !== 0 ? timer : 'O tempo acabou'}</h1>
        </section>
      </div>
    );
  }
}

Game.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,

};

export default connect()(Game);
