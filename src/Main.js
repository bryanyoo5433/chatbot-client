import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import Chatbot from './components/Chatbot/Toxicity';

const Main = (props) => {
  return (
    <div>
      <BrowserRouter>
        <Route exact path='/' component={Chatbot} />
      </BrowserRouter>
    </div>
  )
}

export default Main;
