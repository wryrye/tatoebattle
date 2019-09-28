import React from "react";
import './Login.css'
import $ from "jquery"
import { withRouter } from 'react-router-dom'
import images from '../Images';


class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: null
    };

    this.inputRef = React.createRef();
    this.imagesRef = React.createRef();
  }

  handleSelect(id) {
    this.setState({
      selected: id
    });
  }

  handleSave() {
    const { updateInfo } = this.props;
    const input = this.inputRef.current;
    const images = this.imagesRef.current;


    if (input.value === "") {
      input.className = 'mandatory';
    } else if (this.state.selected === null) {
      images.className = 'mandatory';
    } else {
      updateInfo({
        username: input.value,
        master: images.children.item(this.state.selected).title
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
              <h5 className="modal-title" id="exampleModalLongTitle">Login</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div>Username：<input ref={this.inputRef} autoComplete="off" /></div>
              <div>Choose Master：</div>
              <div ref={this.imagesRef} className="row">
                {
                  images.map(({ id, src, title, description }) =>
                    <span key={id} title={title} className={'col-3 icon' + (this.state.selected === id ? " selected" : "")}>
                      <img src={src} alt={description} className='master' onClick={() => this.handleSelect(id)} />
                    </span>
                  )
                }
              </div>
            </div>
            <div className="modal-footer">
              <button id="save" type="button" className="btn btn-primary" onClick={() => this.handleSave()} >保存</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Login);