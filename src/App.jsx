import { useState, useEffect } from "react";
import "./App.css";
import Question from "./Question.jsx";
import { nanoid } from "nanoid";
import { decode } from "html-entities";

export default function App() {
  const [start, setStart] = useState(true);
  const [allData, setAllData] = useState([]);
  const [play, setPlay] = useState(true);
  const [displayedQuestions, setDisplayedQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [disabledButton, setDisabledButton] = useState([false]);
  const [numberOfCorrectAnswers, setNumberOfCorrectAnswers] = useState(0);
  // const [formData, setFormData] = useState({
  //   numOfQues: "",
  //   category: "",
  // });

  // console.log("Component rendered");
// in useEffect the first fetch is aborted. useEffect runs every time the play state changes
  useEffect(() => {
    // console.log("Effect ran");
    const controller = new AbortController();
    const signal = controller.signal;
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `https://opentdb.com/api.php?amount=5&category=17&difficulty=easy&type=multiple`,
          { signal }
        );
        const data = await res.json();
        setAllData(data.results);
      } catch (error) {
        console.error(`Download error: ${error.message}`);
        // ℹ️: The error name is "CanceledError" for Axios.
        if (error.name !== "AbortError") {
          console.error(`Different error: ${error.message}`);
          /* Logic for non-aborted error handling goes here. */
        }
      }
    };

    fetchUser();

    return () => controller.abort();
  }, [play]);

  // function handleChange(event) {
  //   console.log(event);
  //   const { name, value, type, checked } = event.target;
  //   setFormData((prevFormData) => {
  //     return {
  //       ...prevFormData,
  //       [name]: type === "checkbox" ? checked : value,
  //     };
  //   });
  // }

  // function that takes an array with incorrect answers and the answer, and returns a new array of all answers where the correct answer is inserted at random position to the array with incorrect answers
  function insertAnswerAtRandomPosition(incorrectAnswersArray, answer) {
    const randomIndex = Math.floor(
      Math.random() * (incorrectAnswersArray.length + 1)
    );
    const allAnswersArray = incorrectAnswersArray.toSpliced(
      randomIndex,
      0,
      answer
    );
    return allAnswersArray;
  }
  //this function takes an object that was fetched from the Trivia API https://opentdb.com/api_config.php, and creates and returns a new array of objects with the following properties: question, correctAnswer, allAnswers.
  function createDisplayedQuestions(obj) {
    const questionArray = [];
    
    for (let i = 0; i < 5; i++) {
      // take a question from an object of data, and decode HTML symbols in a string to readable symbols
      const ques = decode(obj[i].question);
      // take an array of incorrect answers, map over it to decode HTML symbols
      const incorrectAnswers = obj[i].incorrect_answers.map((ans) =>
        decode(ans)
      );
      // take the correct answer from the object and decode HTML symbols
      const correctAnswer = decode(obj[i].correct_answer);
      // create a new object with all answers. The correct answer is randomly inserted into the array of incorrect answers
      const allAnswers = insertAnswerAtRandomPosition(
        incorrectAnswers,
        correctAnswer
      );
      // fill questionArray with all information about questions and answers. So it's the array of objects.
      questionArray.push({
        question: ques,
        correctAnswer: correctAnswer,
        allAnswers: allAnswers,
        id: nanoid(),
      });
    }
    return questionArray;
  }

// this function undentifies the correct class for a button based on the user activity and correct/incorrect answer
  function getButtonClass(questionId, answer) {
    if (submitted) {
      for (let question of displayedQuestions) {
        if (question.id === questionId && answer === question.correctAnswer) {
          return "correct-answer-button";
        } else if (
          question.id === questionId &&
          selectedAnswers[questionId] === answer
        ) {
          return "wrong-answer-button";
        } else if (question.id === questionId) {
          return "unactive-answer-button";
        }
      }
    }
    return selectedAnswers[questionId] === answer
      ? "active-answer-button"
      : "answer-button";
  }
// functions calculate the number of correct questions after user select their answers
  function calculateNumberOfCorrectAnswers() {
    for (let question of displayedQuestions) {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        setNumberOfCorrectAnswers((prev) => prev + 1);
      }
    }
  }
// function that runs onClick button "Check answers". It disables button, runs function that calculate number of correct answers and signals that the submit happened
  function handleCheck() {
    setSubmitted(true);
    setDisabledButton(true);
    calculateNumberOfCorrectAnswers();
  }
// function that runs onCLick for the button "Start quiz". It changes start state and runs handlePlay function
  function handleStart() {
    setStart((prev) => !prev);
    handlePlay();
  }
// function that runs onClick for the button "Play again". It changes the play state (to run useEffect and fetch new questions). It creates new allData with new questions, it enables buttons, set submit state to false and set number of correct answers to 0
  function handlePlay() {
    setPlay((prev) => !prev);
    setDisplayedQuestions(createDisplayedQuestions(allData));
    setDisabledButton(false);
    setSubmitted(false);
    setNumberOfCorrectAnswers(0);
  }
// function that adds selected answer to selectedAnswers state
  function selectAnswer(questionId, answer) {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }
// create a variable that contains questions components
  const mapAllQuestions = displayedQuestions.map((q) => (
    <Question
      question={q.question}
      answers={q.allAnswers}
      correctAnswer={q.correctAnswer}
      key={q.id}
      selectedAnswers={selectedAnswers}
      selectAnswer={selectAnswer}
      id={q.id}
      getButtonClass={getButtonClass}
      disabledButton={disabledButton}
    />
  ));

  return (
    <>
      {start && (
        <div className="quizzical-container">
          <h1>Quizzical</h1>
          <p>Try you best and answer five questions about science and nature</p>
          {/* <form>
            <div className="select-number-of-questions">
              <label htmlFor="numOfQues">Select the number of questions:</label>
              <select
                id="numOfQues"
                value={formData.numOfQues}
                onChange={handleChange}
                name="numOfQues"
              >
                <option value="">-- Choose --</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select>
            </div>
            <div className="select-category">
              <label htmlFor="category">Select category:</label>
              <select
                id="category"
                value={formData.category}
                onChange={handleChange}
                name="category"
              >
                <option value="">-- Choose --</option>
                <option value="9">General Knowledge</option>
                <option value="17">Science & Nature</option>
                <option value="10">Books</option>
                <option value="11">Film</option>
                <option value="18">Science: Computers</option>
                <option value="19">Science: Mathematics</option>
                <option value="20">Mythology</option>
                <option value="21">Sports</option>
                <option value="22">Geography</option>
                <option value="23">History</option>
                <option value="25">Art</option>
                <option value="27">Geography</option>
              </select>
            </div>
          </form> */}
          <button onClick={handleStart}>Start quiz</button>
        </div>
      )}

      <div className="all-questions">{mapAllQuestions}</div>
      {!submitted && !start && (
        <button className="check-and-play-answers-button" onClick={handleCheck}>
          Check answers
        </button>
      )}

      {submitted && (
        <div className="play-container">
          <p className="score-text">
            You scored {numberOfCorrectAnswers}/5 correct{" "}
            {numberOfCorrectAnswers === 1 ? "answer" : "answers"}
          </p>
          <button
            className="check-and-play-answers-button"
            onClick={handlePlay}
          >
            Play again
          </button>
        </div>
      )}
    </>
  );
}
