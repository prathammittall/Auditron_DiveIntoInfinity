import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        // If we have a Firebase user, create our user object
        const userObj = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        };
        setCurrentUser(userObj);
        // Store in localStorage as well
        localStorage.setItem("currentUser", JSON.stringify(userObj));
      } else {
        // Check localStorage as fallback
        const savedUser = localStorage.getItem("currentUser");
        if (savedUser) {
          try {
            setCurrentUser(JSON.parse(savedUser));
          } catch (error) {
            console.error("Error parsing saved user:", error);
          }
        } else {
          setCurrentUser(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, displayName) => {
    try {
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: displayName
      });

      // Create user object
      const userObj = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName,
        photoURL: userCredential.user.photoURL
      };

      // Save to localStorage
      localStorage.setItem("currentUser", JSON.stringify(userObj));
      setCurrentUser(userObj);

      return userCredential.user;
    } catch (error) {
      console.error("Error in signup:", error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Create user object
      const userObj = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL
      };

      // Save to localStorage
      localStorage.setItem("currentUser", JSON.stringify(userObj));
      setCurrentUser(userObj);

      return userCredential.user;
    } catch (error) {
      console.error("Error in login:", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Create user object
      const userObj = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      };

      // Save to localStorage
      localStorage.setItem("currentUser", JSON.stringify(userObj));
      setCurrentUser(userObj);

      return result.user;
    } catch (error) {
      console.error("Error in Google login:", error);
      throw error;
    }
  };

  const loginWithGithub = async () => {
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Create user object
      const userObj = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      };

      // Save to localStorage
      localStorage.setItem("currentUser", JSON.stringify(userObj));
      setCurrentUser(userObj);

      return result.user;
    } catch (error) {
      console.error("Error in GitHub login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Don't remove from localStorage to keep the UI state
      // localStorage.removeItem("currentUser");
      // Instead, just update Firebase auth state
      setCurrentUser(null);
    } catch (error) {
      console.error("Error in logout:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    loginWithGoogle,
    loginWithGithub,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
