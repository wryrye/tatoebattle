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

    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    const { updateInfo } = this.props;

    $('#save').click(() => {
      if ($("#m").val() !== "") {
        let cookie = {
          username: $("#m").val(),
          master: $(".selected").attr('title'),
        }
        document.cookie = JSON.stringify(cookie);
        updateInfo(cookie)
        $('#exampleModalLong').modal('hide');

      } else {
        $("#m").addClass('mandatory');
      }

    });
    $('.master').click(function () {
      $(".master").removeClass('selected');
      $(this).addClass('selected');
    });
  }

  handleClick(id) {
    this.setState({
      selected: id
    });
  }

  render() {
    return (
      <div className="modal fade" id="exampleModalLong" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLongTitle" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLongTitle">注册</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div>请选择一个用户名：<input id="m" autoComplete="off" /></div>
              <div>请选择一个大师：</div>
              <div>
                {images.map(({ id, src, title, description }) => <img key={id} src={src} title={title} alt={description}
                  className={'master' + (this.state.selected === id ? " selected" : "")}
                  onClick={() => this.handleClick(id)} />)}
              </div>
            </div>
            <div className="modal-footer">
              <button id="save" type="button" className="btn btn-primary">保存</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Login);