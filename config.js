import * as firebase from 'firebase';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/database';
import 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCz4Mps02oOse49Qqu3WloYs7VuK16BhdI',
  authDomain: 'famschat.firebaseapp.com',
  databaseURL: 'https://famschat.firebaseio.com',
  projectId: 'famschat',
  storageBucket: 'famschat.appspot.com',
  messagingSenderId: '312304824271',
  appId: '1:312304824271:web:b8d86daaa90034678e2cba',
};

const firebaseConf = !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();

export default firebaseConf;
