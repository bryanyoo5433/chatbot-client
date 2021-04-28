import React, { useState, useEffect } from 'react';
// import ReactGA from 'react-ga';

import * as toxicity from '@tensorflow-models/toxicity';
import socketIOClient from "socket.io-client";
import "./Toxicity.scss";

const socket = socketIOClient(window.location.protocol + "//" + window.location.hostname);
const Chatbot = () => {
  const [ page, setPage ] = useState(4);
  const [ isToxic, setIsToxic ] = useState(true);
  const [text, setText ] = useState('');
  const [response, setResponse] = useState('Hello World!');

  useEffect(() => {
    // ReactGA.initialize('UA-81850614-1');
    // ReactGA.pageview(window.location.pathname + window.location.search);

    // let checkSubmittedEmailInStorage = localStorage.getItem("submittedEmail");
    // if (checkSubmittedEmailInStorage) {
    //   setSubmittedEmail(true);
    // }
    // else {

    // }
  }, []);

  // const handleSubmitEmail = () => {
  //   setLoadFormTimes(loadFormTimes + 1);
  //   if (loadFormTimes > 0) {
  //     setTimeout( () => {
  //       setSubmittedEmail(true);
  //       localStorage.setItem('submittedEmail', true);
  //     }, 2000);
  //   }
  // }


const check = (e) => {
  const sentence = e.target.value;
  setText(sentence);
  const checkIsToxic = checkToxicity(sentence);
  setIsToxic(checkIsToxic);
}

const checkToxicity = (text) => {
  const threshold = 0.9;
  toxicity.load(threshold).then(model => {  
    model.classify([text]).then(predictions => {
      let match = predictions[6].results[0].match;
      setIsToxic(match);
      return match
    })
  })
}


const submit_text = () => {
  setPage(2);
  socket.emit("submit_text", text);
  socket.on('response', function(data) {
    console.log(data);
    setResponse(data);
    setPage(3);
  })
}


  return (
    <div className="toxicity-check">
      { page === 1 && (
        <div className="first-page">
          <h1 className="text-title">Type Anything Below!</h1>
          <div className="type-box" >
            <textarea id="text" rows="5" cols="50" onChange={check}></textarea>
          </div>
          <div className="submit">
            <button className={isToxic ? "disabled": ""} onClick={isToxic ? null: submit_text}>Submit</button>
          </div>
          <div className="message">
            { isToxic && (
              <button className="notpass">You cannot submit this.</button>
            )}
            { !isToxic && (
              <button className="pass">You can submit this.</button>
            )}
          </div>
        </div>
      )}
      {page === 2 && (
        <div className="second-page">
          <h1>Loading...</h1>
        </div>
      )}
      { page === 3 && (
        <div className="third-page">
          <div className="chat-response"> 
            <span className="chat-title">Chatbot:</span> &nbsp;
            <span>{response}</span>
          </div>
          <h1 className="text-title">Type Anything Below!</h1>
          <div className="type-box" >
            <textarea id="text" rows="5" cols="50" onChange={check}></textarea>
          </div>
          <div className="submit">
            <button className={isToxic ? "disabled": ""} onClick={isToxic ? null: submit_text}>Submit</button>
          </div>
          <div className="message">
            { isToxic && (
              <button className="notpass">You cannot submit this.</button>
            )}
            { !isToxic && (
              <button className="pass">You can submit this.</button>
            )}
          </div>
        </div>
      )}
      { page === 4 && (
        <div className="box">
          <div className="chat-response"> 
            <span className="chat-title">Chatbot:</span> &nbsp;
            <span>{response}</span>
          </div>
          <div className="message">
            { isToxic && (
              <button className="notpass">You cannot submit this.</button>
            )}
            { !isToxic && (
              <button className="pass">You can submit this.</button>
            )}
          </div>
          
          <input id="text" />
          
          <button className={isToxic ? "disabled": ""} onClick={isToxic ? null: submit_text}>Submit</button>
        </div>
      )} 
    </div>
  );
}

export default Chatbot;