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
      language: '',
      avatar: '',
      inputClass: '',
      selectClass: '',
      imagesClass: ''
    };

    this.handleSelect = this.handleSelect.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  componentDidMount() {
    // update from props on show
    $('#login').on('show.bs.modal', (e) => {
      if (this.props.userInfo != undefined) {
        this.setState({ ...this.props.userInfo })
      }
    });

    // reset validation on close
    $('#login').on('hidden.bs.modal', (e) => {
      this.setState({
        inputClass: '',
        selectClass: '',
        imagesClass: '',
      })
    });
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
      default:
    }
  }

  handleSave() {
    const { updateInfo } = this.props;
    const { username, language, avatar } = this.state;

    if (username === '') {
      this.setState({ inputClass: 'mandatory' });
    } else if (language === '') {
      this.setState({ selectClass: 'mandatory' });
    } else if (avatar === '') {
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
            <div className="modal-body" >
              <div className={this.state.inputClass}>Choose username:&nbsp;<input value={this.state.username} autoComplete="off" onChange={this.handleSelect} /></div><br />
              <div className={this.state.selectClass}>Select language to practice:&nbsp;
                <select value={this.state.language} onChange={this.handleSelect}>
                  <option value='' disabled >Language</option>
                  <option value="cmn">Chinese</option>
                  <option value="spa">Spanish</option>
                </select>
              </div><br />
              <div>Pick avatar:&nbsp;</div>
              <div className={'row ' + this.state.imagesClass}>
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