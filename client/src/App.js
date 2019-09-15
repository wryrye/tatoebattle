import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import 'bootstrap';

import Lobby from './components/Lobby';

function App() {
  return (
    <Router>
      <div>
        {/* <Route path="/lobby" exact component={Lobby} /> */}
        {/* <Route path="/lobby/" component={Lobby} /> */}
        <Route path="/" component={Lobby} />
      </div>
    </Router>
  );
}

export default App;
