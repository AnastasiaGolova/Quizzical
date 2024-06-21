export default function Question({answers, selectAnswer, id, question, getButtonClass, disabledButton}) {
  const answerButtons = answers.map((answer) => {
    const indexOfAnswer = answers.indexOf(answer)
    return(
    <button
      className={`answer-button ${getButtonClass(id, answer)}`}
      key={indexOfAnswer}
      onClick={() => selectAnswer(id, answer)}
      disabled={disabledButton}
    >
      {answer}
    </button>)
});
  return (
    <div className="question-container">
      <h2 className="question-text">{question}</h2>
      <div className="answer-button-container">{answerButtons}</div>

      <hr></hr>
    </div>
  );
}
