import React, { useState, useEffect } from 'react';
// import ReactGA from 'react-ga';
import '@tensorflow/tfjs-backend-cpu';
import * as toxicity from '@tensorflow-models/toxicity';
import socketIOClient from "socket.io-client";
import "./Toxicity.scss";

const socket = socketIOClient(window.location.protocol + "//" + window.location.hostname + ":8080");
let model;

const Chatbot = () => {
  const [ page, setPage ] = useState(4);
  const [ isToxic, setIsToxic ] = useState(true);
  const [text, setText ] = useState('');
  const [response, setResponse] = useState('Hello World!');
  const [conversation, setConversation] = useState([]);

  useEffect(() => {
    // ReactGA.initialize('UA-81850614-1');
    // ReactGA.pageview(window.location.pathname + window.location.search);

    // let checkSubmittedEmailInStorage = localStorage.getItem("submittedEmail");
    // if (checkSubmittedEmailInStorage) {
    //   setSubmittedEmail(true);
    // }
    // else {
    // }
    loadingModel();

    socket.on('response', function(response) {
      let new_data = addNewLine(response)
      let data = {"from": "server", "message": new_data};
      let newConversation = conversation;
      newConversation.push(data);
      setConversation(newConversation);
    
    })
  }, []);

  const loadingModel = async() => {
    const threshold = 0.9;
    model = await toxicity.load(threshold);
    console.log(model);
  }

  // const handleSubmitEmail = () => {
  //   setLoadFormTimes(loadFormTimes + 1);
  //   if (loadFormTimes > 0) {
  //     setTimeout( () => {
  //       setSubmittedEmail(true);
  //       localStorage.setItem('submittedEmail', true);
  //     }, 2000);
  //   }
  // }

const onKeyPress = (e) => {
  if(e.key === "Enter") {
    e.preventDefault();
    submit_text();
  }
}

const check = (e) => {
  const sentence = e.target.value;
  setText(sentence);
  
}

const checkToxicity = (text) => {
  model.classify([text]).then(predictions => {
    let match = predictions[6].results[0].match;
    setIsToxic(match);
    return match
  })
  
}

const submit_text = () => {

  if(text.replace(/\s/g, '').length === 0) return

  const checkIsToxic = checkToxicity(text);
  setIsToxic(checkIsToxic);
  if(checkIsToxic) return;

  let _text = addNewLine(text);
  socket.emit("submit_text", text);
  let data = {"from": "client", "message": _text};
  let newConversation = conversation;
  newConversation.push(data);
  setConversation(newConversation);

  setText('')
  document.getElementById("text").value = '';

  
}

const addNewLine = (t) => {
  let text_array = t.split(' ');
  for (let i=0; i<text_array.length; i++) {
    if (text_array[i].length > 12) {
      let tmp = text_array[i].split("");
      let new_array= [];
      
      while(tmp.length >= 12) {
        new_array.push(tmp.slice(0, 12).join(""));
        tmp.splice(0, 12);
      }
      new_array.push(tmp.join(""));
      text_array.splice(i, 1, ...new_array);
      
    }
    return text_array.join(" ");
  }
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

          <div className="conversation">
            {conversation.map((c, i) => {
              if(c.from === "client") {
                  return <div className="client" key={i}><div className="client-text"> {c.message} </div></div>
              } else {
                  return <div className="server" key={i}><div className="server-text"> {c.message} </div></div>
              }
            })}
          </div>

          <div className="message">
            { isToxic && (
              <button className="notpass">You cannot submit this.</button>
            )}
            { !isToxic && (
              <button className="pass">You can submit this.</button>
            )}
          </div>

          <div className="type-area">
            <div className= "send-message">
              <input id="text" onChange={check} onKeyPress={onKeyPress}/>
              <button className={isToxic ? "disabled": ""} onClick={isToxic ? null: submit_text}>Submit</button>
            </div>

          </div>

        </div>
      )} 
    </div>
  );
}

export default Chatbot;