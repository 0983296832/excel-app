/*
 * @description    
 * @since         Monday, 7 29th 2024, 22:34:59 pm
 * @author        Bình Lê <binhlv@getflycrm.com>
 * @copyright     Copyright (c) 2024, Getfly VN TECH.,JSC, Inc.
 * -----
 * Change Log: <press Ctrl + alt + c write changelog>
 */


import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyDd4vbdlBApyZM6N3pYBSz4MSr9aTlOh5s",
    authDomain: "excel-app-1cf04.firebaseapp.com",
    databaseURL: "https://excel-app-1cf04-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "excel-app-1cf04",
    storageBucket: "excel-app-1cf04.appspot.com",
    messagingSenderId: "395177936341",
    appId: "1:395177936341:web:6d3e450960487bf022295c",
    measurementId: "G-6ML1G92KXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export default app;