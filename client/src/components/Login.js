import React from "react";
import './Login.css'
import $ from "jquery"
import { withRouter } from 'react-router-dom'
import images from '../Images';


class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      language: null,
      avatar: null,
      inputClass: null,
      imagesClass: null
    };

    this.handleSelect = this.handleSelect.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  handleSelect(e) {
    switch (e.target.tagName) {
      case 'INPUT':
        this.setState({ username: e.target.value });
        break
      case 'SELECT': 
        this.setState({ language: e.target.value });
        break;
      case 'IMG': 
        this.setState({ avatar: e.target.id });
        break;
    }
  }

  handleSave() {
    const { updateInfo } = this.props;
    const { username, language, avatar} = this.state;

    if (username === '') {
      this.setState({ inputClass: 'mandatory' });
    } else if (avatar === null) {
      this.setState({ imagesClass: 'mandatory' });
    } else {
      updateInfo({
        username: username,
        language: language,
        master: avatar,
      })
      $('#login').modal('hide');
    }
  }

  render() {
    return (
      <div className="modal fade" id="login" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLongTitle" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title" id="exampleModalLongTitle">Register</h3>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div>Choose username:&nbsp;<input autoComplete="off" onChange={this.handleSelect} className={this.state.inputClass}/></div><br/>
              <div>Select language to practice:&nbsp;
                <select defaultValue="default" onChange={this.handleSelect}>
                  <option value="default" disabled >Language</option>
                  <option value="cmn">Chinese</option>
                  <option value="spa">Spanish</option>
                </select>
              </div><br/>
              <div>Pick avatar:&nbsp;</div>
              <div className="row" className={this.state.imagesClass}>
                {
                  images.map(({ id, description, src }) =>
                    <span key={id} className={'col-3 icon' + (this.state.avatar === id ? " selected" : "")}>
                      <img id={id} src={src} title={description} alt={description} className='master' onClick={this.handleSelect} />
                    </span>
                  )
                }
              </div>
            </div>
            <div className="modal-footer">
              <button id="save" type="button" className="btn btn-primary" onClick={this.handleSave} >保存</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Login);