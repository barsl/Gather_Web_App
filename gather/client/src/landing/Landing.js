import React from 'react';
import classes from './Landing.module.css';
import image from '../assets/friendship.svg';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const Landing = () => {

  return (
    <div className={classes.Centered}>
      <div className={classes.HorizontalFlex}>
        <div className={classes.LeftSide}>
          <h1 className={classes.Logo}>gather</h1>
          <img src={image} className={classes.Image}></img>
        </div>
        <div className={classes.RightSide}>
        <h2>Making meetups easier.</h2>

        <Form className={classes.Form}>
          <Form.Group controlId="formEmail">
            <Form.Control type="email" placeholder="Email"/>
          </Form.Group>
          <Form.Group controlId="formPassword">
            <Form.Control type="password" placeholder="Password" />
          </Form.Group>

          <Button variant="primary" type="submit">
            Log in
          </Button>
          <a href="" className={classes.Link}>New user? Sign up!</a>

        </Form>

        


        </div>
      </div>
    </div>
  );

};

export default Landing;