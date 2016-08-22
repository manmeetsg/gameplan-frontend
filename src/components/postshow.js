import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';
import { browserHistory } from 'react-router';
import moment from 'moment';

class PostShow extends Component {
  constructor(props) {
    super(props);

    // init component state here
    if (this.props.post) {
      this.state = {
        isEditing: false,
        title: this.props.post.title,
        description: this.props.post.description,
        comment: '',
      };
    } else {
      this.state = {
        isEditing: false,
        comment: '',
      };
    }

    this.onSubmit = this.onSubmit.bind(this);
    this.postComment = this.postComment.bind(this);

    this.onTitleChange = this.onTitleChange.bind(this);
    this.onDescriptionChange = this.onDescriptionChange.bind(this);
    this.onCommentChange = this.onCommentChange.bind(this);
  }

  componentWillMount() {
    this.props.fetchPost(this.props.params.id);
    this.props.getMe();
  }

  onSubmit(event) {
    event.preventDefault();

    this.setState({
      isEditing: false,
    });

    this.props.updatePost(
      this.props.params.id,
      {
        title: this.state.title,
        description: this.state.description,
      }
    );
  }

  onTitleChange(e) {
    this.setState({ title: e.target.value });
  }

  onDescriptionChange(e) {
    this.setState({ description: e.target.value });
  }

  onCommentChange(e) {
    this.setState({ comment: e.target.value });
  }

  postComment(event) {
    event.preventDefault();

    this.props.postComment(
      this.props.params.id,
      {
        text: this.state.comment,
      }
    );

    this.setState({
      comment: '',
    });
  }

  join() {
    if (this.props.me._id) {
      if (this.props.post.responders.map(responder => { return responder._id; }).indexOf(this.props.me._id) <= -1) {
        return (
          <button onClick={() => {
            const responders = this.props.post.responders.map(responder => { return responder._id; });
            responders.push(this.props.me._id);
            this.props.updatePost(
              this.props.params.id,
              {
                responders,
              }
            );
          }}>Join Post</button>
        );
      } else {
        return (
          <button onClick={() => {
            const responders = this.props.post.responders.map(responder => { return responder._id; }).filter(responder => { return (responder !== this.props.me._id); });
            this.props.updatePost(
              this.props.params.id,
              {
                responders,
              }
            );
          }}>Leave Post</button>
        );
      }
    }
  }

  chat() {
    if (this.props.post.responders.map(responder => { return responder._id; }).indexOf(this.props.me._id) > -1) {
      return (
        <div>
          <h2>Chat:</h2>
          <div className="chat" id="chat">
            {this.props.post.chat.map(message => {
              console.log(message);
              return (
                <div className="message" key={message._id}>
                  <span className="poster">{message.poster.name}</span>
                  {message.text}
                </div>
              );
            })}
          </div>
          <form onSubmit={this.postComment}>
            <input type="text" placeholder="Type anything..." onChange={this.onCommentChange} value={this.state.comment} />
            <button type="submit">Post</button>
          </form>
        </div>
      );
    }
  }

  render() {
    if (!this.props.authenticated) {
      browserHistory.push('/login');
    }

    if (!this.props.post) { // No set post (initially)
      return (
        <div className="viewpost">
          <h1>Loading...</h1>
        </div>
      );
    } else if (this.state.isEditing) {
      return (
        <div className="viewpost">
          <form onSubmit={this.onSubmit}>
            <label htmlFor="title">Title</label>
            <input type="text" placeholder="Copper Mines" name="title" onChange={this.onTitleChange} value={this.state.title} />
            <label htmlFor="description">Description</label>
            <textarea name="description" rows="3" placeholder="Have fun with others" onChange={this.onDescriptionChange} value={this.state.description} />
            <div className="center">
              <button type="submit">Save Post</button>
              <button className="cancel" onClick={() => {
                this.setState({
                  isEditing: false,
                });
              }}>Cancel</button>
            </div>
          </form>
        </div>
      );
    } else {
      return (
        <div className="viewpost">
          <div className="postheader">
            <h1>{this.props.post.title}</h1>
            <div>
              <button onClick={() => {
                this.setState({
                  isEditing: true,
                  title: this.props.post.title,
                  description: this.props.post.description,
                });
              }}>Edit Post</button>
            {this.join()}
            </div>
          </div>
          <h3>Author: {this.props.post.author.name}</h3>
          <h4>Members: {this.props.post.responders.map(responder => {
            return responder.name;
          }).join(', ')}</h4>
          <h4>Date: {moment(new Date(this.props.post.created_at)).format('MMMM Do')}</h4>
          <div className="postcontent">
            <p>{this.props.post.description}</p>
          </div>
          {this.chat()}
        </div>
      );
    }
  }
}

// connects particular parts of redux state to this components props
const mapStateToProps = (state) => (
  {
    authenticated: state.auth.authenticated,
    post: state.posts.currentPost,
    me: state.users.me,
  }
);


export default connect(mapStateToProps, actions)(PostShow);
