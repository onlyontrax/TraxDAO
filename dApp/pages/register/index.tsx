/* eslint-disable camelcase */
import React from 'react';
import Loader from '@components/common/base/loader';
import { login, loginSocial, loginSuccess } from '@redux/auth/actions';
import { updateCurrentUser } from '@redux/user/actions';
import { authService, userService } from '@services/index';
import {
  Button, Col, Divider, Form, Image, Input, Layout, Row, message
} from 'antd';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import Router from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { ISettings, IUIConfig } from 'src/interfaces';
import { Auth } from 'src/crypto/nfid/Auth';
import styles from '../auth/index.module.scss';
import ExplorePage from '../index';

const Register: React.FC = () => {
  // @ts-ignore
  return <ExplorePage from="register" />;
};

export default Register;
