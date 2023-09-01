import {initializeApp}  from "firebase/app";
import {getAuth} from "firebase/auth"
import {getFirestore, collection}  from "firebase/firestore";

const firebaseConfig = {

  apiKey: "AIzaSyCZTKhRkoe2WYLvJf-Si1xPyHOUI9MLZU8",
  authDomain: "evaluadoruam-b91db.firebaseapp.com",
  projectId: "evaluadoruam-b91db",
  storageBucket: "evaluadoruam-b91db.appspot.com",
  messagingSenderId: "555057396133",
  appId: "1:555057396133:web:8b6ac1fbc13553b982904c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const db = getFirestore(app);
const rubricasCollection = collection(db, 'rubricas');

async function getRubricas() {
  const querySnapshot = await getDocs(rubricasCollection);
  querySnapshot.forEach((doc) => {
    console.log(doc.id, ' => ', doc.data());
  });
}


export {db,auth,rubricasCollection,getRubricas};

