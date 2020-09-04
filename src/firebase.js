import firebase from 'firebase/app';
import 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBAS4UoHxYL9_aBPepN6CpCXJu0Vu6jC6k",
    authDomain: "shopify-tech-challenge.firebaseapp.com",
    databaseURL: "https://shopify-tech-challenge.firebaseio.com",
    projectId: "shopify-tech-challenge",
    storageBucket: "shopify-tech-challenge.appspot.com",
    messagingSenderId: "923447189577",
    appId: "1:923447189577:web:c2a9c994cef5141cb59f98"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;
