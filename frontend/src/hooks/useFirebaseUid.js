import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

const useFirebaseUid = () => {
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid); // Store Firebase UID
      } else {
        setUid(null); // User is not logged in
      }
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  return uid;
};

export default useFirebaseUid;
